-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "phone_challenges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_verifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "id_number" TEXT NOT NULL,
    "id_front_path" TEXT NOT NULL,
    "id_back_path" TEXT,
    "selfie_path" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "score" DECIMAL(5,4),
    "reviewed_by_id" UUID,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "id_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "phone_challenges_user_id_key" ON "phone_challenges"("user_id");

-- CreateIndex
CREATE INDEX "id_verifications_user_id_idx" ON "id_verifications"("user_id");

-- CreateIndex
CREATE INDEX "id_verifications_status_idx" ON "id_verifications"("status");

-- AddForeignKey
ALTER TABLE "phone_challenges" ADD CONSTRAINT "phone_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_verifications" ADD CONSTRAINT "id_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_verifications" ADD CONSTRAINT "id_verifications_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

