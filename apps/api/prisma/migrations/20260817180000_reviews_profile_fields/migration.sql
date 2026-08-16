-- AlterTable
-- slug is added nullable, backfilled with a unique value for any existing rows,
-- then made NOT NULL — so this migration is safe whether the table is empty or
-- already holds profiles (a plain ADD COLUMN ... NOT NULL would fail on the latter).
ALTER TABLE "freelancer_profiles" ADD COLUMN "availability" TEXT;
ALTER TABLE "freelancer_profiles" ADD COLUMN "photo_path" TEXT;
ALTER TABLE "freelancer_profiles" ADD COLUMN "slug" TEXT;
UPDATE "freelancer_profiles"
  SET "slug" = 'freelancer-' || left(replace("id"::text, '-', ''), 12)
  WHERE "slug" IS NULL;
ALTER TABLE "freelancer_profiles" ALTER COLUMN "slug" SET NOT NULL;

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "from_id" UUID NOT NULL,
    "to_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_to_id_idx" ON "reviews"("to_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_from_id_to_id_key" ON "reviews"("from_id", "to_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_profiles_slug_key" ON "freelancer_profiles"("slug");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

