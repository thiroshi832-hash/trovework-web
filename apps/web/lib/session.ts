/**
 * Stand-in for the signed-in user until auth exists (BUILD_PLAN phase 1).
 *
 * Every screen that needs "the current user" reads it from here, so when real
 * sessions arrive there is one place to swap rather than a scatter of
 * FREELANCERS[0] references.
 */

import { FREELANCERS } from "@/lib/freelancers";

export const CURRENT_FREELANCER = FREELANCERS[0];

export const CURRENT_CLIENT = {
  name: "Sarah J.",
  photo: "/avatars/sarah-j.jpg",
  /** Both flags are what the API would return; the UI only ever reads them. */
  phoneVerified: true,
  idVerified: false,
};

/**
 * Verification state of the signed-in freelancer. idVerified is read off the
 * profile record rather than repeated here — otherwise the dashboard could say
 * "hidden" while the browse page lists them.
 */
export const FREELANCER_VERIFICATION = {
  phoneVerified: true,
  idVerified: CURRENT_FREELANCER.idVerified,
  /** users.strike_count — three blocks the account (FR-M-4). */
  strikes: 1,
};
