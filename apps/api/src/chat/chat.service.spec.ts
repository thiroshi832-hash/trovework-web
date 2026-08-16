import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ChatService, type ChatActor } from "./chat.service";
import { PermissionService } from "../permission/permission.service";
import type { PrismaService } from "../prisma/prisma.service";

// Messages get timestamps 1s apart from this base, so ordering (and unread
// thresholds) are deterministic rather than at the mercy of real-clock ms.
const CLOCK_BASE = Date.UTC(2026, 7, 17, 12, 0, 0);

function prismaDouble() {
  const users: Record<string, any> = {};
  const conversations: any[] = [];
  const messages: any[] = [];
  let tick = 0;

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
        const c = {
          id: `c${conversations.length + 1}`,
          lastMessageAt: null,
          clientLastReadAt: null,
          freelancerLastReadAt: null,
          createdAt: new Date(),
          ...data,
        };
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
        const m = { id: `m${messages.length + 1}`, sentAt: new Date(CLOCK_BASE + tick++ * 1000), ...data };
        messages.push(m);
        return m;
      }),
      findMany: jest.fn(async ({ where }: any) => messages.filter((m) => m.conversationId === where.conversationId)),
      count: jest.fn(async ({ where }: any) =>
        messages.filter((m) => {
          if (m.conversationId !== where.conversationId) return false;
          if (where.senderId?.not && m.senderId === where.senderId.not) return false;
          if (where.sentAt?.gt && !(m.sentAt > where.sentAt.gt)) return false;
          return true;
        }).length,
      ),
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

describe("ChatService — unread counts", () => {
  async function seededConvo() {
    const db = prismaDouble();
    seedFreelancer(db);
    db.users["c1"] = { id: "c1", role: "client", status: "active" };
    const svc = makeService(db);
    const convo = await svc.start(verifiedClient, FREELANCER);
    return { db, svc, convo };
  }

  const freelancer: ChatActor = {
    id: FREELANCER, role: "freelancer", status: "active", idVerified: true, phoneVerified: true,
  };

  it("counts the other party's messages as unread when never opened", async () => {
    const { db, svc, convo } = await seededConvo();
    await svc.sendMessage(freelancer, convo.id, "hello?");
    await svc.sendMessage(freelancer, convo.id, "still there?");

    const list: any[] = await svc.listMine("c1");
    expect(list).toHaveLength(1);
    expect(list[0].unreadCount).toBe(2);
    // The sender's own messages are never unread to them.
    expect((await svc.listMine(FREELANCER))[0].unreadCount).toBe(0);
    expect(db).toBeDefined();
  });

  it("only counts messages sent after this user last read", async () => {
    const { db, svc, convo } = await seededConvo();
    await svc.sendMessage(freelancer, convo.id, "first"); // sentAt = base+0
    // Client reads at base+500 — between the two messages.
    db.conversations[0].clientLastReadAt = new Date(CLOCK_BASE + 500);
    await svc.sendMessage(freelancer, convo.id, "second"); // sentAt = base+1000

    const list: any[] = await svc.listMine("c1");
    expect(list[0].unreadCount).toBe(1);
  });

  it("markRead stamps the caller's own side of the thread", async () => {
    const { db, svc, convo } = await seededConvo();
    await svc.markRead("c1", convo.id);
    expect(db.conversations[0].clientLastReadAt).toBeInstanceOf(Date);
    expect(db.conversations[0].freelancerLastReadAt).toBeNull();

    await svc.markRead(FREELANCER, convo.id);
    expect(db.conversations[0].freelancerLastReadAt).toBeInstanceOf(Date);
  });

  it("won't mark a thread you're not part of (same 404)", async () => {
    const { svc, convo } = await seededConvo();
    await expect(svc.markRead("x9", convo.id)).rejects.toThrow(NotFoundException);
  });
});
