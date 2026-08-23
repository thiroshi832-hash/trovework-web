-- One row per unique visitor per day, for daily and all-time visitor totals.
-- No personal data — just a random visitor id (from a cookie) and the date.
CREATE TABLE "visits" (
    "id" UUID NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "visits_visitor_id_day_key" ON "visits"("visitor_id", "day");
CREATE INDEX "visits_day_idx" ON "visits"("day");
