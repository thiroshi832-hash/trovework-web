-- Per-visit context for the admin visitor-history view: the IP and user agent
-- seen on the first hit of the day, plus lazily-filled IP intelligence
-- (datacentre/VPS and VPN/proxy flags) cached after the first admin view.
ALTER TABLE "visits"
    ADD COLUMN "ip" TEXT,
    ADD COLUMN "user_agent" TEXT,
    ADD COLUMN "ip_country" TEXT,
    ADD COLUMN "ip_hosting" BOOLEAN,
    ADD COLUMN "ip_proxy" BOOLEAN,
    ADD COLUMN "classified_at" TIMESTAMP(3);

CREATE INDEX "visits_created_at_idx" ON "visits"("created_at");
