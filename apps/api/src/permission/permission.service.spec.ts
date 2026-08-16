import { PermissionService, type Principal } from "./permission.service";

const user = (over: Partial<Principal> = {}): Principal => ({
  id: "u1",
  role: "client",
  status: "active",
  phoneVerified: false,
  idVerified: false,
  ...over,
});

describe("PermissionService", () => {
  const perms = new PermissionService();
  const FREELANCER_ID = "f1";

  describe("canViewContactInfo", () => {
    it("denies an anonymous viewer", () => {
      expect(perms.canViewContactInfo(null, FREELANCER_ID)).toBe(false);
    });

    it("denies an unverified client", () => {
      expect(perms.canViewContactInfo(user({ idVerified: false }), FREELANCER_ID)).toBe(false);
    });

    it("allows a verified client", () => {
      expect(perms.canViewContactInfo(user({ idVerified: true }), FREELANCER_ID)).toBe(true);
    });

    // FR-R-3: freelancers never see each other's contacts, verified or not.
    it("denies a freelancer viewing another freelancer, even when verified", () => {
      const viewer = user({ id: "f2", role: "freelancer", idVerified: true });
      expect(perms.canViewContactInfo(viewer, FREELANCER_ID)).toBe(false);
    });

    it("allows a freelancer to see their own contacts", () => {
      const viewer = user({ id: FREELANCER_ID, role: "freelancer" });
      expect(perms.canViewContactInfo(viewer, FREELANCER_ID)).toBe(true);
    });

    it("denies a banned client that would otherwise qualify", () => {
      const viewer = user({ idVerified: true, status: "banned" });
      expect(perms.canViewContactInfo(viewer, FREELANCER_ID)).toBe(false);
    });
  });

  describe("canStartChat", () => {
    it("allows a verified client to message a freelancer", () => {
      expect(perms.canStartChat(user({ idVerified: true }), "freelancer")).toBe(true);
    });

    it("denies an unverified client", () => {
      expect(perms.canStartChat(user(), "freelancer")).toBe(false);
    });

    // FR-C-2: no conversation may exist between two freelancers.
    it("denies freelancer to freelancer", () => {
      const viewer = user({ role: "freelancer", idVerified: true });
      expect(perms.canStartChat(viewer, "freelancer")).toBe(false);
    });

    it("denies a client messaging another client", () => {
      expect(perms.canStartChat(user({ idVerified: true }), "client")).toBe(false);
    });

    it("denies a pending account", () => {
      expect(perms.canStartChat(user({ idVerified: true, status: "pending" }), "freelancer")).toBe(false);
    });
  });

  describe("canPublish", () => {
    const freelancer = (over: Partial<Principal> = {}) =>
      user({ role: "freelancer", ...over });

    it("requires both phone and ID", () => {
      expect(perms.canPublish(freelancer({ phoneVerified: true, idVerified: true }))).toBe(true);
    });

    it("denies with phone only", () => {
      expect(perms.canPublish(freelancer({ phoneVerified: true }))).toBe(false);
    });

    it("denies with ID only", () => {
      expect(perms.canPublish(freelancer({ idVerified: true }))).toBe(false);
    });

    it("denies a client, however verified", () => {
      expect(perms.canPublish(user({ phoneVerified: true, idVerified: true }))).toBe(false);
    });

    it("denies a banned freelancer with both", () => {
      const u = freelancer({ phoneVerified: true, idVerified: true, status: "banned" });
      expect(perms.canPublish(u)).toBe(false);
    });
  });

  describe("isProfileVisible", () => {
    it("is visible only once ID verification passes", () => {
      expect(perms.isProfileVisible(user({ role: "freelancer", idVerified: true }))).toBe(true);
      expect(perms.isProfileVisible(user({ role: "freelancer", idVerified: false }))).toBe(false);
    });

    it("hides a banned freelancer", () => {
      const u = user({ role: "freelancer", idVerified: true, status: "banned" });
      expect(perms.isProfileVisible(u)).toBe(false);
    });
  });
});
