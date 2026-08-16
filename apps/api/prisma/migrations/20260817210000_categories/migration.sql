-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- Seed the taxonomy (all fields, in-person trades first). Admins can edit these
-- afterwards; existing listings keep their category name regardless.
INSERT INTO "categories" ("id", "name", "slug", "sort_order", "is_active", "updated_at") VALUES
  (gen_random_uuid(), 'Home & Cleaning',       'home-cleaning',        0,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Repairs & Trades',      'repairs-trades',       1,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Moving & Delivery',     'moving-delivery',      2,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Gardening & Outdoor',   'gardening-outdoor',    3,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Care & Wellbeing',      'care-wellbeing',       4,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Beauty & Hair',         'beauty-hair',          5,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Tutoring & Lessons',    'tutoring-lessons',     6,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Cooking & Catering',    'cooking-catering',     7,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Events & Photography',  'events-photography',   8,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Driving & Transport',   'driving-transport',    9,  true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Design & Creative',     'design-creative',      10, true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Writing & Translation', 'writing-translation',  11, true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Web & Software',        'web-software',         12, true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Marketing',             'marketing',            13, true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Business & Admin',      'business-admin',       14, true, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Finance & Legal',       'finance-legal',        15, true, CURRENT_TIMESTAMP);
