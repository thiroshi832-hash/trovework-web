-- Sign-in provenance for admin oversight: the IP a user registered from, and
-- the IP + time of their most recent login. Classified (VPS/VPN/proxy) on demand.
ALTER TABLE "users"
    ADD COLUMN "signup_ip" TEXT,
    ADD COLUMN "last_login_ip" TEXT,
    ADD COLUMN "last_login_at" TIMESTAMP(3);
