-- A LinkedIn handle/URL, added as another gated contact field on freelancer
-- profiles. Nullable, so existing rows are unaffected. Like the other contact
-- handles it is released only to verified clients (enforced in the service).
ALTER TABLE "freelancer_profiles" ADD COLUMN "contact_linkedin" TEXT;
