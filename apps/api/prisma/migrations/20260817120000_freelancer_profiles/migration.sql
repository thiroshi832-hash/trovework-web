-- CreateTable
CREATE TABLE "freelancer_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "category" TEXT NOT NULL,
    "skills" TEXT[],
    "hourly_rate" DECIMAL(12,2),
    "resume_path" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT false,
    "contact_telegram" TEXT,
    "contact_discord" TEXT,
    "contact_whatsapp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_profiles_user_id_key" ON "freelancer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "freelancer_profiles_is_visible_idx" ON "freelancer_profiles"("is_visible");

-- CreateIndex
CREATE INDEX "freelancer_profiles_category_idx" ON "freelancer_profiles"("category");

-- AddForeignKey
ALTER TABLE "freelancer_profiles" ADD CONSTRAINT "freelancer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

