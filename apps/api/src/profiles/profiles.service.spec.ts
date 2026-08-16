import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ProfilesService, type ProfileOwner } from "./profiles.service";
import { PermissionService, type Principal } from "../permission/permission.service";
import type { PrismaService } from "../prisma/prisma.service";

function prismaDouble() {
  const profiles: any[] = [];
  return {
    profiles,
    freelancerProfile: {
      upsert: jest.fn(async ({ where, create, update }: any) => {
        const existing = profiles.find((p) => p.userId === where.userId);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        const p = { id: `pr${profiles.length + 1}`, updatedAt: new Date(), ...create };
        profiles.push(p);
        return p;
      }),
      findUnique: jest.fn(async ({ where }: any) => profiles.find((p) => p.userId === where.userId) ?? null),
      findMany: jest.fn(async ({ where }: any) => profiles.filter((p) => (where.isVisible ? p.isVisible : true))),
    },
  };
}

function makeService(db: ReturnType<typeof prismaDouble>) {
  return new ProfilesService(db as unknown as PrismaService, new PermissionService());
}

const OWNER_ID = "f1";

/** A verified freelancer's stored profile, contacts filled in. */
function seedVisibleProfile(db: ReturnType<typeof prismaDouble>) {
  db.profiles.push({
    id: "pr1",
    userId: OWNER_ID,
    displayName: "Marisol R.",
    category: "Home & Cleaning",
    headline: "Deep cleaning specialist",
    bio: "Ten years of experience.",
    skills: ["Deep cleaning", "Move-out"],
    hourlyRate: 28,
    isVisible: true,
    contactTelegram: "@marisol",
    contactDiscord: "marisol#1",
    contactWhatsapp: "+1555",
    updatedAt: new Date(),
  });
}

const client = (over: Partial<Principal> = {}): Principal => ({
  id: "c1", role: "client", status: "active", phoneVerified: true, idVerified: false, ...over,
});

const hasContacts = (p: any) =>
  "contactTelegram" in p || "contactDiscord" in p || "contactWhatsapp" in p;

describe("ProfilesService — contact gating (NFR-SEC-3)", () => {
  it("gives contact handles to a VERIFIED client", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const res: any = await makeService(db).getPublic(client({ idVerified: true }), OWNER_ID);
    expect(res.contactTelegram).toBe("@marisol");
    expect(hasContacts(res)).toBe(true);
  });

  it("HIDES contact handles from an UNVERIFIED client", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const res: any = await makeService(db).getPublic(client({ idVerified: false }), OWNER_ID);
    expect(hasContacts(res)).toBe(false);
    // the rest of the profile is still there
    expect(res.displayName).toBe("Marisol R.");
  });

  it("HIDES contact handles from an anonymous viewer", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const res: any = await makeService(db).getPublic(null, OWNER_ID);
    expect(hasContacts(res)).toBe(false);
  });

  // FR-R-3: freelancers never see each other's contacts, however verified.
  it("HIDES contact handles from another freelancer", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const otherFreelancer = client({ id: "f2", role: "freelancer", idVerified: true });
    const res: any = await makeService(db).getPublic(otherFreelancer, OWNER_ID);
    expect(hasContacts(res)).toBe(false);
  });

  it("HIDES contact handles from a banned client that would otherwise qualify", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const res: any = await makeService(db).getPublic(client({ idVerified: true, status: "banned" }), OWNER_ID);
    expect(hasContacts(res)).toBe(false);
  });
});

describe("ProfilesService — visibility", () => {
  it("404s a hidden (unverified) freelancer's public profile", async () => {
    const db = prismaDouble();
    db.profiles.push({ userId: OWNER_ID, displayName: "Hidden", category: "x", isVisible: false });
    await expect(makeService(db).getPublic(client({ idVerified: true }), OWNER_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("404s a freelancer with no profile at all", async () => {
    const db = prismaDouble();
    await expect(makeService(db).getPublic(null, "nobody")).rejects.toThrow(NotFoundException);
  });

  it("search returns only visible profiles and never contact handles", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    db.profiles.push({ userId: "f9", displayName: "Not yet verified", category: "x", isVisible: false, contactTelegram: "@x" });

    const results: any[] = await makeService(db).search({});
    expect(results).toHaveLength(1);
    expect(results[0].displayName).toBe("Marisol R.");
    expect(hasContacts(results[0])).toBe(false);
  });
});

describe("ProfilesService — upsert", () => {
  const freelancer = (over: Partial<ProfileOwner> = {}): ProfileOwner => ({
    id: OWNER_ID, role: "freelancer", status: "active", idVerified: false, ...over,
  });

  const dto = {
    displayName: "Marisol R.",
    category: "Home & Cleaning",
    contactTelegram: "@marisol",
  };

  it("saves a profile hidden while the freelancer is unverified", async () => {
    const db = prismaDouble();
    const p = await makeService(db).upsert(freelancer({ idVerified: false }), dto);
    expect(p.isVisible).toBe(false);
  });

  it("makes the profile visible once the freelancer is verified", async () => {
    const db = prismaDouble();
    const p = await makeService(db).upsert(freelancer({ idVerified: true }), dto);
    expect(p.isVisible).toBe(true);
  });

  it("does not let the user set visibility directly", async () => {
    const db = prismaDouble();
    // Even if a rogue field were sent, isVisible is derived from idVerified only.
    const p = await makeService(db).upsert(freelancer({ idVerified: false }), {
      ...dto,
      ...({ isVisible: true } as any),
    });
    expect(p.isVisible).toBe(false);
  });

  it("updates an existing profile rather than duplicating it", async () => {
    const db = prismaDouble();
    const svc = makeService(db);
    await svc.upsert(freelancer(), dto);
    await svc.upsert(freelancer(), { ...dto, displayName: "Marisol Rivera" });
    expect(db.profiles).toHaveLength(1);
    expect(db.profiles[0].displayName).toBe("Marisol Rivera");
  });

  it("refuses a client", async () => {
    const db = prismaDouble();
    await expect(makeService(db).upsert(freelancer({ role: "client" }), dto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("refuses a banned freelancer", async () => {
    const db = prismaDouble();
    await expect(makeService(db).upsert(freelancer({ status: "banned" }), dto)).rejects.toThrow(
      /suspended/i,
    );
  });
});
