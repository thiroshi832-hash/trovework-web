import { Injectable } from "@nestjs/common";

/**
 * The single source of truth for the permission matrix.
 *
 * Every REST controller and the chat gateway ask this service — nothing
 * re-implements the rules locally. The frontend hides things for UX; these
 * methods are what actually decide.
 *
 *   | viewer                      | posts & normal info | contact info | chat |
 *   | unverified client           | yes                 | no           | no   |
 *   | verified client             | yes                 | yes          | yes  |
 *   | freelancer viewing another  | yes                 | no           | no   |
 */

export type Role = "client" | "freelancer" | "admin";
export type AccountStatus = "active" | "banned" | "pending";

/** The subset of a user this service needs. Keeps it trivially unit-testable. */
export interface Principal {
  id: string;
  role: Role;
  status: AccountStatus;
  phoneVerified: boolean;
  idVerified: boolean;
}

@Injectable()
export class PermissionService {
  /** A banned or pending account can do nothing gated, whatever its flags say. */
  private active(user: Principal | null): user is Principal {
    return !!user && user.status === "active";
  }

  /**
   * Contact details (Telegram/Discord/WhatsApp) are released only to a
   * verified client. Freelancers never see another freelancer's contacts,
   * however verified they are (FR-R-3).
   */
  canViewContactInfo(viewer: Principal | null, freelancerId: string): boolean {
    if (!this.active(viewer)) return false;
    if (viewer.id === freelancerId) return true; // your own profile
    if (viewer.role === "admin") return true;
    return viewer.role === "client" && viewer.idVerified;
  }

  /**
   * Chat is client → freelancer only. No conversation may exist between two
   * freelancers (FR-C-2), and the client must be ID-verified (FR-C-3).
   */
  canStartChat(viewer: Principal | null, targetRole: Role): boolean {
    if (!this.active(viewer)) return false;
    if (viewer.role !== "client") return false;
    if (targetRole !== "freelancer") return false;
    return viewer.idVerified;
  }

  /**
   * Publishing a profile or a post requires both checks (amended FR-A-3):
   * phone proves a reachable human, ID proves who they are.
   */
  canPublish(viewer: Principal | null): boolean {
    if (!this.active(viewer)) return false;
    if (viewer.role !== "freelancer") return false;
    return viewer.phoneVerified && viewer.idVerified;
  }

  /**
   * A freelancer profile is listed in search only once ID verification has
   * passed (FR-V-5). This mirrors the `is_visible` column the API maintains.
   */
  isProfileVisible(owner: Principal): boolean {
    return owner.status === "active" && owner.role === "freelancer" && owner.idVerified;
  }
}
