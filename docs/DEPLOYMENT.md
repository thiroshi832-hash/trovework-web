# Trovework — VPS Deployment & CI/CD

Target: **Ubuntu 24.04**, IP `172.86.122.122`, domain `trovework.com` / `www.trovework.com`.

> **You run every command in this guide yourself.** All secrets — the VPS password, SSH private
> keys, GitHub tokens — stay with you. Never paste them into a chat, an issue, or a commit.

Architecture: nginx (host) terminates TLS on 443 and reverse-proxies to the Next.js container,
which is bound to `127.0.0.1:3000` and unreachable from the internet.

```
Internet ──443──▶ nginx (host, TLS) ──▶ 127.0.0.1:3000 ──▶ trovework-web container
```

---

## Step 0 — Confirm DNS points at the VPS

Run locally. Both must return `172.86.122.122`:

```bash
dig +short trovework.com A; dig +short www.trovework.com A
```

If they don't, fix the A records at your DNS provider before continuing — **certbot will fail
without working DNS.** Propagation can take up to an hour.

| Type | Name | Value |
|---|---|---|
| A | `@` | `172.86.122.122` |
| A | `www` | `172.86.122.122` |

---

## Step 1 — Create a deploy user (stop using root)

SSH in as root once:

```bash
ssh root@172.86.122.122
```

Then, on the VPS:

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
chown -R deploy:deploy /home/deploy/.ssh
```

---

## Step 2 — Create the CI deploy key

**On your local machine** (not the VPS), generate a keypair used only by GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions-trovework" -f ~/.ssh/trovework_deploy -N ""
```

Copy the **public** key to the VPS:

```bash
ssh-copy-id -i ~/.ssh/trovework_deploy.pub deploy@172.86.122.122
```

Verify key-only login works before locking passwords out:

```bash
ssh -i ~/.ssh/trovework_deploy deploy@172.86.122.122 "echo OK"
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

```bash
sudo mkdir -p /srv/trovework
sudo chown deploy:deploy /srv/trovework
git clone https://github.com/thiroshi832-hash/trovework-web.git /srv/trovework
cd /srv/trovework && git checkout master
```

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

## Step 7 — First build

```bash
cd /srv/trovework
docker compose up -d --build web
docker compose ps
curl -I http://127.0.0.1:3000        # expect HTTP/1.1 200 OK
```

---

## Step 8 — nginx + TLS

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

## Step 9 — Add GitHub Actions secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|---|---|
| `VPS_HOST` | `172.86.122.122` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Contents of `~/.ssh/trovework_deploy` — the **private** key |
| `VPS_PORT` | `22` (optional) |

For `VPS_SSH_KEY`, paste the **entire** file including the
`-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines:

```bash
cat ~/.ssh/trovework_deploy
```

> This is the one secret GitHub needs. It is encrypted at rest and never printed in logs. It grants
> SSH access to the `deploy` user only — not root — which is why Step 3 matters.

---

## Step 10 — Verify the pipeline

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

**Rollback** to a previous commit:

```bash
cd /srv/trovework
git log --oneline -10
git reset --hard <commit-sha>
docker compose up -d --build web
```

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| `502 Bad Gateway` | Container down — `docker compose ps`, then `logs -f web` |
| certbot fails | DNS not pointing at the VPS yet (Step 0), or port 80 blocked |
| Deploy action fails auth | `VPS_SSH_KEY` missing header/footer lines, or public key not in `~deploy/.ssh/authorized_keys` |
| Site loads over HTTP but not HTTPS | certbot didn't inject the 443 block — re-run Step 8 |

---

## Security checklist

- [ ] Root SSH login disabled, password auth disabled
- [ ] `ufw` active — only 22, 80, 443 open (**not** 3000)
- [ ] Container runs as non-root (`nextjs` user, set in the Dockerfile)
- [ ] `/srv/trovework-data/secured` is `700` and outside the web root
- [ ] TLS live with auto-renewal verified
- [ ] HSTS enabled after TLS confirmed
- [ ] No `.env` file or private key ever committed

Enable unattended security updates:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```
