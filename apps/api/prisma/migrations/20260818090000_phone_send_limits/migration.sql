-- Rate-limiting state for verification SMS. Existing rows are backfilled with
-- the current timestamp and a zero count, which is the same position a fresh
-- challenge starts from — nobody is locked out by the upgrade.
ALTER TABLE "phone_challenges"
    ADD COLUMN "last_sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "send_count" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "window_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
