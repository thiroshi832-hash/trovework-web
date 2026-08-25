-- When a user's identity verification last flipped on, for the "verified today"
-- metric and the verifications-over-time graph.
ALTER TABLE "users" ADD COLUMN "verified_at" TIMESTAMP(3);

-- One row per successful login (registration counts as a first login), so the
-- dashboard can show daily active users — lastLoginAt only holds the latest.
CREATE TABLE "login_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_events_created_at_idx" ON "login_events"("created_at");
CREATE INDEX "login_events_user_id_idx" ON "login_events"("user_id");

ALTER TABLE "login_events"
    ADD CONSTRAINT "login_events_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
