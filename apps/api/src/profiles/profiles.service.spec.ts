import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ProfilesService, type ProfileOwner } from "./profiles.service";
import { PermissionService, type Principal } from "../permission/permission.service";
import type { ReviewsService } from "../reviews/reviews.service";
import type { PrismaService } from "../prisma/prisma.service";

function prismaDouble() {
  const profiles: any[] = [];
  return {
    profiles,
    freelancerProfile: {
      findUnique: jest.fn(async ({ where }: any) =>
        profiles.find((p) => (where.slug ? p.slug === where.slug : p.userId === where.userId)) ?? null,
      ),
      create: jest.fn(async ({ data }: any) => {
        const p = { id: `pr${profiles.length + 1}`, updatedAt: new Date(), ...data };
        profiles.push(p);
        return p;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const p = profiles.find((x) => x.userId === where.userId);
        Object.assign(p, data, { updatedAt: new Date() });
        return p;
      }),
      findMany: jest.fn(async ({ where }: any) => profiles.filter((p) => (where.isVisible ? p.isVisible : true))),
    },
  };
}

/** Reviews aren't under test here — a stub that reports no ratings. */
const noReviews = {
  aggregateFor: jest.fn(async () => new Map()),
  listFor: jest.fn(async () => []),
} as unknown as ReviewsService;

function makeService(db: ReturnType<typeof prismaDouble>, reviews: ReviewsService = noReviews) {
  return new ProfilesService(db as unknown as PrismaService, new PermissionService(), reviews);
}

const OWNER_ID = "f1";
const SLUG = "marisol-r";

function seedVisibleProfile(db: ReturnType<typeof prismaDouble>) {
  db.profiles.push({
    id: "pr1",
    userId: OWNER_ID,
    slug: SLUG,
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
    const res: any = await makeService(db).getPublicBySlug(client({ idVerified: true }), SLUG);
    expect(res.contactTelegram).toBe("@marisol");
  });

  it("HIDES contact handles from an UNVERIFIED client", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const res: any = await makeService(db).getPublicBySlug(client({ idVerified: false }), SLUG);
    expect(hasContacts(res)).toBe(false);
    expect(res.displayName).toBe("Marisol R.");
  });

  it("HIDES contact handles from an anonymous viewer", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const res: any = await makeService(db).getPublicBySlug(null, SLUG);
    expect(hasContacts(res)).toBe(false);
  });

  it("HIDES contact handles from another freelancer (FR-R-3)", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const otherFreelancer = client({ id: "f2", role: "freelancer", idVerified: true });
    const res: any = await makeService(db).getPublicBySlug(otherFreelancer, SLUG);
    expect(hasContacts(res)).toBe(false);
  });

  it("HIDES contact handles from a banned client that would otherwise qualify", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const res: any = await makeService(db).getPublicBySlug(client({ idVerified: true, status: "banned" }), SLUG);
    expect(hasContacts(res)).toBe(false);
  });

  it("attaches the public rating aggregate", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    const reviews = {
      aggregateFor: jest.fn(async () => new Map([[OWNER_ID, { average: 4.8, count: 12 }]])),
      listFor: jest.fn(async () => [{ id: "r1", rating: 5 }]),
    } as unknown as ReviewsService;
    const res: any = await makeService(db, reviews).getPublicBySlug(null, SLUG);
    expect(res.rating).toBe(4.8);
    expect(res.reviewCount).toBe(12);
    expect(res.reviews).toHaveLength(1);
  });
});

describe("ProfilesService — visibility", () => {
  it("404s a hidden freelancer", async () => {
    const db = prismaDouble();
    db.profiles.push({ userId: OWNER_ID, slug: "hidden", displayName: "Hidden", category: "x", isVisible: false });
    await expect(makeService(db).getPublicBySlug(client({ idVerified: true }), "hidden")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("404s an unknown slug", async () => {
    const db = prismaDouble();
    await expect(makeService(db).getPublicBySlug(null, "nobody")).rejects.toThrow(NotFoundException);
  });

  it("search returns only visible profiles and never contact handles", async () => {
    const db = prismaDouble();
    seedVisibleProfile(db);
    db.profiles.push({ userId: "f9", slug: "hidden", displayName: "Not verified", category: "x", isVisible: false, contactTelegram: "@x", updatedAt: new Date() });

    const results: any[] = await makeService(db).search({});
    expect(results).toHaveLength(1);
    expect(results[0].displayName).toBe("Marisol R.");
    expect(hasContacts(results[0])).toBe(false);
    expect(results[0]).toHaveProperty("rating");
  });
});

describe("ProfilesService — upsert", () => {
  const freelancer = (over: Partial<ProfileOwner> = {}): ProfileOwner => ({
    id: OWNER_ID, role: "freelancer", status: "active", idVerified: false, ...over,
  });
  const dto = { displayName: "Marisol R.", category: "Home & Cleaning", contactTelegram: "@marisol" };

  it("assigns a slug on first save", async () => {
    const db = prismaDouble();
    const p = await makeService(db).upsert(freelancer(), dto);
    expect(p.slug).toBe("marisol-r");
  });

  it("keeps the same slug on later edits", async () => {
    const db = prismaDouble();
    const svc = makeService(db);
    await svc.upsert(freelancer(), dto);
    const again = await svc.upsert(freelancer(), { ...dto, displayName: "Marisol Rivera" });
    expect(again.slug).toBe("marisol-r"); // unchanged despite the new name
    expect(db.profiles).toHaveLength(1);
  });

  it("makes a slug unique when the base is taken", async () => {
    const db = prismaDouble();
    db.profiles.push({ userId: "other", slug: "marisol-r", displayName: "Marisol R.", category: "x" });
    const p = await makeService(db).upsert(freelancer(), dto);
    expect(p.slug).toBe("marisol-r-2");
  });

  it("stays hidden while unverified, visible once verified", async () => {
    const db = prismaDouble();
    expect((await makeService(db).upsert(freelancer({ idVerified: false }), dto)).isVisible).toBe(false);
  });

  it("becomes visible for a verified freelancer", async () => {
    const db = prismaDouble();
    expect((await makeService(db).upsert(freelancer({ idVerified: true }), dto)).isVisible).toBe(true);
  });

  it("refuses a client", async () => {
    const db = prismaDouble();
    await expect(makeService(db).upsert(freelancer({ role: "client" }), dto)).rejects.toThrow(ForbiddenException);
  });

  it("refuses a banned freelancer", async () => {
    const db = prismaDouble();
    await expect(makeService(db).upsert(freelancer({ status: "banned" }), dto)).rejects.toThrow(/suspended/i);
  });
});
