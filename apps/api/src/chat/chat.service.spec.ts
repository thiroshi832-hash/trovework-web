import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ChatService, type ChatActor } from "./chat.service";
import { PermissionService } from "../permission/permission.service";
import type { PrismaService } from "../prisma/prisma.service";

function prismaDouble() {
  const users: Record<string, any> = {};
  const conversations: any[] = [];
  const messages: any[] = [];

  const db: any = {
    users,
    conversations,
    messages,
    user: {
      findUnique: jest.fn(async ({ where }: any) => users[where.id] ?? null),
    },
    conversation: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.id) return conversations.find((c) => c.id === where.id) ?? null;
        const { clientId, freelancerId } = where.clientId_freelancerId;
        return conversations.find((c) => c.clientId === clientId && c.freelancerId === freelancerId) ?? null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const c = { id: `c${conversations.length + 1}`, lastMessageAt: null, createdAt: new Date(), ...data };
        conversations.push(c);
        return c;
      }),
      findMany: jest.fn(async ({ where }: any) =>
        conversations.filter((c) => c.clientId === where.OR[0].clientId || c.freelancerId === where.OR[1].freelancerId),
      ),
      update: jest.fn(async ({ where, data }: any) => {
        const c = conversations.find((x) => x.id === where.id);
        Object.assign(c, data);
        return c;
      }),
    },
    message: {
      create: jest.fn(async ({ data }: any) => {
        const m = { id: `m${messages.length + 1}`, sentAt: new Date(), ...data };
        messages.push(m);
        return m;
      }),
      findMany: jest.fn(async ({ where }: any) => messages.filter((m) => m.conversationId === where.conversationId)),
    },
    $transaction: jest.fn(async (arg: any) => (typeof arg === "function" ? arg(db) : Promise.all(arg))),
  };
  return db;
}

const makeService = (db: ReturnType<typeof prismaDouble>) =>
  new ChatService(db as unknown as PrismaService, new PermissionService());

const verifiedClient: ChatActor = {
  id: "c1", role: "client", status: "active", idVerified: true, phoneVerified: true,
};
const FREELANCER = "f1";

function seedFreelancer(db: ReturnType<typeof prismaDouble>, id = FREELANCER) {
  db.users[id] = { id, role: "freelancer", status: "active" };
}

describe("ChatService — start (the enforcement point)", () => {
  it("lets a verified client open a chat with a freelancer", async () => {
    const db = prismaDouble();
    seedFreelancer(db);
    const convo = await makeService(db).start(verifiedClient, FREELANCER);
    expect(convo.clientId).toBe("c1");
    expect(convo.freelancerId).toBe(FREELANCER);
  });

  it("refuses an UNVERIFIED client (FR-C-3)", async () => {
    const db = prismaDouble();
    seedFreelancer(db);
    const unverified = { ...verifiedClient, idVerified: false };
    await expect(makeService(db).start(unverified, FREELANCER)).rejects.toThrow(ForbiddenException);
  });

  // FR-C-2: no conversation may exist between two freelancers.
  it("refuses a freelancer trying to message another freelancer", async () => {
    const db = prismaDouble();
    seedFreelancer(db);
    const freelancerViewer: ChatActor = { ...verifiedClient, id: "f2", role: "freelancer" };
    await expect(makeService(db).start(freelancerViewer, FREELANCER)).rejects.toThrow(ForbiddenException);
  });

  it("won't open a chat with a client (only freelancers are targets)", async () => {
    const db = prismaDouble();
    db.users["c2"] = { id: "c2", role: "client", status: "active" };
    await expect(makeService(db).start(verifiedClient, "c2")).rejects.toThrow(NotFoundException);
  });

  it("won't open a chat with yourself", async () => {
    const db = prismaDouble();
    db.users["c1"] = { id: "c1", role: "freelancer", status: "active" };
    // even if the id resolves to a freelancer, self-messaging is refused
    await expect(makeService(db).start(verifiedClient, "c1")).rejects.toThrow(/yourself/i);
  });

  it("404s an unknown or inactive freelancer", async () => {
    const db = prismaDouble();
    db.users[FREELANCER] = { id: FREELANCER, role: "freelancer", status: "banned" };
    await expect(makeService(db).start(verifiedClient, FREELANCER)).rejects.toThrow(NotFoundException);
  });

  it("is idempotent — reopening returns the same thread", async () => {
    const db = prismaDouble();
    seedFreelancer(db);
    const svc = makeService(db);
    const first = await svc.start(verifiedClient, FREELANCER);
    const second = await svc.start(verifiedClient, FREELANCER);
    expect(second.id).toBe(first.id);
    expect(db.conversations).toHaveLength(1);
  });
});

describe("ChatService — messages", () => {
  async function seededConvo() {
    const db = prismaDouble();
    seedFreelancer(db);
    db.users["c1"] = { id: "c1", role: "client", status: "active" };
    const svc = makeService(db);
    const convo = await svc.start(verifiedClient, FREELANCER);
    return { db, svc, convo };
  }

  it("lets a participant send, and stamps the conversation", async () => {
    const { svc, convo, db } = await seededConvo();
    const msg = await svc.sendMessage(verifiedClient, convo.id, "Hi, are you free next week?");
    expect(msg.body).toContain("free next week");
    expect(db.conversations[0].lastMessageAt).not.toBeNull();
  });

  it("lets the freelancer reply", async () => {
    const { svc, convo } = await seededConvo();
    const freelancer: ChatActor = { id: FREELANCER, role: "freelancer", status: "active", idVerified: true, phoneVerified: true };
    const msg = await svc.sendMessage(freelancer, convo.id, "Yes, Tuesday works.");
    expect(msg.senderId).toBe(FREELANCER);
  });

  it("refuses a non-participant (same 404 as missing)", async () => {
    const { svc, convo } = await seededConvo();
    const outsider: ChatActor = { id: "x9", role: "client", status: "active", idVerified: true, phoneVerified: true };
    await expect(svc.sendMessage(outsider, convo.id, "let me in")).rejects.toThrow(NotFoundException);
  });

  it("refuses a banned participant", async () => {
    const { svc, convo } = await seededConvo();
    const banned = { ...verifiedClient, status: "banned" as const };
    await expect(svc.sendMessage(banned, convo.id, "hello?")).rejects.toThrow(/suspended/i);
  });

  it("returns history in order, only to a participant", async () => {
    const { svc, convo } = await seededConvo();
    await svc.sendMessage(verifiedClient, convo.id, "one");
    await svc.sendMessage(verifiedClient, convo.id, "two");
    const history = await svc.getMessages("c1", convo.id);
    expect(history.map((m) => m.body)).toEqual(["one", "two"]);

    await expect(svc.getMessages("x9", convo.id)).rejects.toThrow(NotFoundException);
  });
});
