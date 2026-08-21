-- Denormalised review aggregate on the freelancer profile, so search can filter
-- and sort by rating in one paginated query. Backfilled from existing reviews.
ALTER TABLE "freelancer_profiles"
    ADD COLUMN "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    ADD COLUMN "rating_count" INTEGER NOT NULL DEFAULT 0;

UPDATE "freelancer_profiles" fp
SET "rating_avg" = COALESCE(agg.avg, 0),
    "rating_count" = COALESCE(agg.cnt, 0)
FROM (
    SELECT "to_id", ROUND(AVG("rating")::numeric, 2) AS avg, COUNT(*) AS cnt
    FROM "reviews"
    GROUP BY "to_id"
) agg
WHERE fp."user_id" = agg."to_id";

CREATE INDEX "freelancer_profiles_rating_avg_idx" ON "freelancer_profiles" ("rating_avg");
