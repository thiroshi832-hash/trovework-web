# Trovework — VPS Deployment & CI/CD

Target: **Ubuntu 24.04**, IP `172.86.122.212`, domain `trovework.com` / `www.trovework.com`.

> **You run every command in this guide yourself.** All secrets — the VPS password, SSH private
> keys, GitHub tokens — stay with you. Never paste them into a chat, an issue, or a commit.

Architecture: nginx (host) terminates TLS on 443 and reverse-proxies to two containers, both
bound to `127.0.0.1` and unreachable from the internet. Postgres publishes no port at all — only
the api container can reach it, over the compose network.

```
                            ┌─▶ /api/…  ──▶ 127.0.0.1:4000 ──▶ trovework-api ──▶ trovework-db
Internet ──443──▶ nginx ────┤                                                   (no published port)
             (host, TLS)    └─▶ everything else ──▶ 127.0.0.1:3000 ──▶ trovework-web
```

---

## Step 0 — Confirm DNS points at the VPS

Run locally. Both must return `172.86.122.212`:

```bash
dig +short trovework.com A; dig +short www.trovework.com A
```

If they don't, fix the A records at your DNS provider before continuing — **certbot will fail
without working DNS.** Propagation can take up to an hour.

| Type | Name | Value |
|---|---|---|
| A | `@` | `172.86.122.212` |
| A | `www` | `172.86.122.212` |

---

## Step 1 — Create a deploy user (stop using root)

SSH in as root once:

```bash
ssh root@172.86.122.212
```

Then, on the VPS:

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
chown -R deploy:deploy /home/deploy/.ssh
```

> **`--disabled-password` means `deploy` cannot use `sudo`** — sudo asks for the account's own
> password, and there isn't one. That is fine for CI (the Deploy workflow uses `docker compose`
> via the `docker` group, never sudo) but it bites you the first time you try an admin command
> over SSH. Give the account a sudo password now, while you are still root:
>
> ```bash
> passwd deploy
> ```
>
> This does **not** re-open SSH password login — `sshd` keeps `PasswordAuthentication no` from
> Step 3, so SSH stays key-only. The password only unlocks `sudo` and the provider console. If you
> skip this and later get locked out of sudo, your provider's **web console** (root) is the way
> back in.

---

## Step 2 — Create the CI deploy key

> **On Windows, use absolute paths.** The commands below use `~`, which cmd.exe does not expand —
> you get *"No such file or directory"* **before SSH even connects**. See
> [Windows: use absolute paths](#windows-use-absolute-paths) below and use those forms instead.
>
> | Shell | Home shorthand | `~` works? |
> |---|---|---|
> | Git Bash | `~` | yes |
> | cmd.exe | `%USERPROFILE%` | no |
> | PowerShell | `$env:USERPROFILE` | yes |

**On your local machine** (not the VPS), generate a keypair used only by GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions-trovework" -f ~/.ssh/trovework_deploy -N ""
```

Now install the **public** key on the VPS. Note that `ssh-copy-id deploy@...` will **not** work
here: the `deploy` account was created with `--disabled-password`, so there is no password to
authenticate with. Install the key through `root` instead — run this from your local machine:

```bash
ssh root@172.86.122.212 "mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh" < ~/.ssh/trovework_deploy.pub
```

Verify key-only login works **before** locking passwords out in Step 3:

```bash
ssh -i ~/.ssh/trovework_deploy deploy@172.86.122.212 "echo OK"
```

If that prints `OK`, continue. If it prompts for a password, the key is not installed — the
prompt can never succeed, so re-run the install command above rather than guessing a password.

### Windows: use absolute paths

Skip home-directory shorthand entirely — an absolute path works in every shell:

```
ssh-keygen -t ed25519 -C "github-actions-trovework" -f C:\Users\<you>\.ssh\trovework_deploy -N ""
ssh -i C:\Users\<you>\.ssh\trovework_deploy deploy@172.86.122.212 "echo OK"
```

To install the public key, avoid the `<` redirect too — embed the key inline so no shell has to
resolve a path. Get the key text with `ssh-keygen -y -f <path-to-private-key>`, then:

```
ssh root@172.86.122.212 "mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && echo 'ssh-ed25519 AAAA...your-key... github-actions-trovework' >> /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh"
```

On Windows the private key also needs its ACL restricted, or OpenSSH refuses to use it:

```
icacls C:\Users\<you>\.ssh\trovework_deploy /inheritance:r
icacls C:\Users\<you>\.ssh\trovework_deploy /grant:r "%USERNAME%:(R)"
```

---

## Step 3 — Harden SSH

On the VPS, edit `/etc/ssh/sshd_config`:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Apply:

```bash
sudo systemctl restart ssh
```

> Keep your current root session open until you've confirmed `deploy` login works — otherwise a
> typo locks you out.

Once this is applied, **password login stops working entirely** — that is the point. From here on
the only way in is the key:

```bash
ssh -i ~/.ssh/trovework_deploy deploy@172.86.122.212
```

Worth an alias in `~/.ssh/config` so it is one word:

```bash
printf 'Host trovework
  HostName 172.86.122.212
  User deploy
  IdentityFile ~/.ssh/trovework_deploy
' >> ~/.ssh/config
# then simply:  ssh trovework
```

### Keep a second way in

That one key file is now the only route to the server. If it is lost, no password and no root
login can rescue you. Close that risk two ways:

1. **Find your VPS provider's web console / VNC** before you need it. It bypasses SSH entirely and
   is the real recovery path.
2. **Add a personal key separate from the CI key.** `trovework_deploy` lives in GitHub Actions
   secrets; if it ever has to be rotated you do not want that to cut off your own access too.

   ```bash
   ssh-keygen -t ed25519 -C "personal" -f ~/.ssh/trovework_personal -N ""
   ssh trovework "cat >> ~/.ssh/authorized_keys" < ~/.ssh/trovework_personal.pub
   ```

Firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

Note that **port 3000 is deliberately not opened.** The container binds to localhost; nginx is the
only public entry point.

---

## Step 4 — Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker deploy
```

Log out and back in for the group to take effect, then confirm:

```bash
docker compose version
```

---

## Step 5 — Clone the repository

> **Run these — and every later git command on this repo — as the `deploy` user, not root.** CI
> logs in as `deploy`. If root runs `git pull`, the new objects are written root-owned and the next
> CI deploy fails with *"insufficient permission for adding an object to .git/objects"*. If your
> prompt reads `root@...`, switch first with `su - deploy`. Better still: after the first manual
> clone, never pull by hand — let the Deploy workflow do it.

```bash
sudo mkdir -p /srv/trovework
sudo chown deploy:deploy /srv/trovework
git clone https://github.com/thiroshi832-hash/trovework-web.git /srv/trovework
cd /srv/trovework && git checkout master
```

If you already cloned or built as root, fix the ownership before the first CI deploy:

```bash
sudo chown -R deploy:deploy /srv/trovework
sudo usermod -aG docker deploy
```

(`/srv/trovework-data` does not exist yet — Step 6 creates it and sets its ownership there.)

**If the repo is private**, generate a read-only key on the VPS and add it as a GitHub
*deploy key* (Settings → Deploy keys → Add, read-only):

```bash
ssh-keygen -t ed25519 -C "vps-trovework" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub          # paste this into GitHub
```

Then clone via SSH instead: `git clone git@github.com:thiroshi832-hash/trovework-web.git /srv/trovework`

---

## Step 6 — Create the secured storage directories

These hold user uploads. **ID images and selfies live outside the web root, permissions `700`** —
this satisfies FR-F-3 and NFR-SEC-2.

```bash
sudo mkdir -p /srv/trovework-data/storage    # resumes, portfolio photos (servable)
sudo mkdir -p /srv/trovework-data/secured    # ID cards + selfies — NEVER public
sudo chown -R deploy:deploy /srv/trovework-data
sudo chmod 755 /srv/trovework-data/storage
sudo chmod 700 /srv/trovework-data/secured
```

Both paths are gitignored and must never be committed or served by nginx.

---

## Step 7 — Create the stack secrets

`docker-compose.yml` refuses to start without these — that is deliberate, so a deployment can
never silently come up with a default password. Create `/srv/trovework/.env` **on the VPS only**;
it is gitignored and must never be committed.

```bash
cd /srv/trovework
cat > .env <<EOF
POSTGRES_USER=trovework
POSTGRES_DB=trovework
POSTGRES_PASSWORD=$(openssl rand -hex 32)
JWT_ACCESS_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
WEB_ORIGIN=https://trovework.com
EOF
chmod 600 .env
```

> **Create this as the `deploy` user, not root.** With `chmod 600` the file is readable only by
> its owner, and CI logs in as `deploy` — a root-owned `.env` makes the automated deploy fail with
> `POSTGRES_PASSWORD not set` even though the file is right there. If you already made it as root:
>
> ```bash
> sudo chown deploy:deploy /srv/trovework/.env
> ```

The two JWT secrets must differ. Rotating either one invalidates every existing session, which
is exactly what you want if you suspect a leak.

> **The database password uses `-hex`, not `-base64`, on purpose.** It is embedded in
> `DATABASE_URL`, and base64 can emit `/`, `+` and `=`. A `/` ends the authority part of a URL, so
> `postgresql://user:pa/ss@db:5432/...` leaves no parsable port and Prisma dies at boot with
> `P1013: invalid port number in database URL`. Hex is 0-9a-f only — equally strong at 256 bits,
> and URL-safe by construction. The JWT secrets are plain env values, never parsed as a URL, so
> base64 is fine for those.
>
> If you already created the volume with a base64 password, the password inside Postgres and the
> one in `.env` are now different — Postgres only reads `POSTGRES_PASSWORD` when it first
> initialises its data directory. Before there is any real data, the quickest fix is to discard the
> volume and start again:
>
> ```bash
> sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 32)|" .env
> docker compose down -v      # -v drops the database volume. Harmless now; destroys data later.
> docker compose up -d --build
> ```
>
> Once the platform holds real accounts, use `ALTER USER` inside psql instead — never `down -v`.

---

## Step 8 — First build

```bash
cd /srv/trovework
docker compose up -d --build            # db, api, web
docker compose ps                       # all three should be healthy/running
```

Create the database tables. The first deploy needs this once; afterwards CI runs it on
every deploy:

```bash
docker compose exec api npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

Check both services answer:

```bash
curl -I http://127.0.0.1:3000                 # web  -> HTTP/1.1 200 OK
curl -i  http://127.0.0.1:4000/api/auth/me    # api  -> HTTP/1.1 401 (no session yet, which is correct)
```

A 401 from `/api/auth/me` is the healthy answer: the route exists and the guard is refusing an
unauthenticated request.

> **If the build fails with `Cannot find module '…linux-x64-musl.node'`** (lightningcss,
> `@tailwindcss/oxide`, or `@next/swc`), the committed `package-lock.json` is missing Linux
> native binaries. npm prunes the lockfile to the platform it was generated on, so a lockfile
> written on Windows or macOS breaks the Linux Docker build.
>
> Regenerate it **with `node_modules` absent** — that is what makes npm resolve every platform:
>
> ```bash
> # in a scratch copy holding only package.json + apps/web/package.json
> npm install --package-lock-only --os=linux --cpu=x64 --libc=glibc
> ```
>
> Verify before committing — all three must appear:
>
> ```bash
> grep -c "lightningcss-linux-x64-musl\|oxide-linux-x64-musl\|swc-linux-x64-musl" package-lock.json
> ```

---

## Step 9 — nginx + TLS

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo mkdir -p /var/www/certbot

sudo cp /srv/trovework/deploy/nginx/trovework.conf /etc/nginx/sites-available/trovework.conf
sudo ln -sf /etc/nginx/sites-available/trovework.conf /etc/nginx/sites-enabled/trovework.conf
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl reload nginx
```

Now issue the certificate (this rewrites the config to add HTTPS):

```bash
sudo certbot --nginx -d trovework.com -d www.trovework.com
```

Choose **redirect** when prompted. Confirm auto-renewal works:

```bash
sudo certbot renew --dry-run
```

Finally, uncomment the HSTS line in `/etc/nginx/sites-available/trovework.conf` and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Visit **https://trovework.com** — the landing page should load with a valid certificate.

---

## Step 10 — Add GitHub Actions secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|---|---|
| `VPS_HOST` | `172.86.122.212` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Contents of `~/.ssh/trovework_deploy` — the **private** key |
| `VPS_PORT` | `22` (optional) |

For `VPS_SSH_KEY`, paste the **entire** file including the
`-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines.

> **Run this on your local machine, not on the VPS.** Only the *public* half of the key was ever
> copied to the server; the private half stays with you. Running it inside an SSH session prints
> `No such file or directory`, because it is not there — and should never be.

```bash
# Git Bash
cat ~/.ssh/trovework_deploy

# cmd.exe or PowerShell
type C:\Users\<you>\.ssh\trovework_deploy
```

> This is the one secret GitHub needs. It is encrypted at rest and never printed in logs. It grants
> SSH access to the `deploy` user only — not root — which is why Step 3 matters.
>
> It goes into the GitHub secret box and nowhere else: not onto the VPS, not into a chat window,
> not into the repo. Anyone holding it can log into your server as `deploy`.

---

## Step 11 — Verify the pipeline

Push any commit to `master`. In the **Actions** tab:

1. **CI** runs — installs, lints, builds.
2. **Deploy** runs on CI success — SSHes in, pulls, rebuilds, restarts, then curls the site.

Trigger manually any time via **Actions → Deploy → Run workflow**.

---

## Operations

```bash
docker compose logs -f web              # tail app logs
docker compose restart web              # restart
docker compose up -d --build web        # manual redeploy
sudo tail -f /var/log/nginx/error.log   # nginx errors
sudo systemctl status nginx
```

Per-service logs:

```bash
docker compose logs -f api            # NestJS
docker compose logs -f db             # Postgres
docker compose exec db psql -U trovework -d trovework   # a SQL prompt
```

**Rollback** to a previous commit:

```bash
cd /srv/trovework
git log --oneline -10
git reset --hard <commit-sha>
docker compose up -d --build api web
```

Rolling back **code** is safe. Rolling back a **migration** is not — a deploy that added a
column leaves it behind, and older code that does not know about it still runs fine, but a
destructive migration cannot be undone by resetting git. Take a dump before any migration that
drops or renames:

```bash
docker compose exec db pg_dump -U trovework trovework > ~/trovework-$(date +%F).sql
```

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| `502 Bad Gateway` on the site | web container down — `docker compose ps`, then `logs -f web` |
| `502` only on `/api/…` | api container down — `docker compose logs -f api` |
| api exits at boot with a config error | `.env` missing or incomplete (Step 7). Compose fails loudly by design rather than defaulting a password |
| api logs `Can't reach database server` | db not healthy yet — `docker compose ps`, `logs -f db` |
| Login works, then every request is 401 | Cookies not reaching the API. Check nginx passes `/api/` through and that the site is on HTTPS: the cookies are `Secure` outside development |
| api restarts with `P1013 invalid port number` | A `/`, `+` or `=` in `POSTGRES_PASSWORD` breaking `DATABASE_URL`. Regenerate with `openssl rand -hex 32` (see Step 7) |
| api logs `password authentication failed` | `.env` password no longer matches the one baked into the db volume on first init |
| `relation "users" does not exist` | Migrations never ran — `docker compose run --rm api npx prisma migrate deploy --schema apps/api/prisma/schema.prisma` |
| certbot fails | DNS not pointing at the VPS yet (Step 0), or port 80 blocked |
| Deploy action fails auth | `VPS_SSH_KEY` missing header/footer lines, or public key not in `~deploy/.ssh/authorized_keys` |
| `detected dubious ownership in repository` | Repo cloned as root; CI runs as `deploy`. Fix with `sudo chown -R deploy:deploy /srv/trovework` |
| CI: `insufficient permission for adding an object to .git/objects` | Someone ran `git pull` on the box as root, writing root-owned objects CI cannot overwrite. `sudo chown -R deploy:deploy /srv/trovework`, and pull as `deploy` from now on (or let CI do it) |
| `permission denied` on the docker socket | `deploy` not in the `docker` group — `sudo usermod -aG docker deploy`, then reconnect |
| Site loads over HTTP but not HTTPS | certbot didn't inject the 443 block — re-run Step 9 |

---

## Security checklist

- [ ] Root SSH login disabled, password auth disabled
- [ ] `ufw` active — only 22, 80, 443 open (**not** 3000, **not** 4000, **not** 5432)
- [ ] Both containers run as non-root (`nextjs` / `nestjs`, set in their Dockerfiles)
- [ ] Postgres publishes no port — reachable only from the api container
- [ ] `/srv/trovework/.env` is `chmod 600`, with a random DB password and two *different* JWT secrets
- [ ] `/srv/trovework-data/secured` is `700` and outside the web root
- [ ] TLS live with auto-renewal verified — the auth cookies are `Secure`, so HTTP alone breaks login
- [ ] HSTS enabled after TLS confirmed
- [ ] No `.env` file or private key ever committed
- [ ] A database dump exists before any destructive migration

Enable unattended security updates:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```
