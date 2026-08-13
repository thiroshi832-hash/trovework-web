# Trovework V1 — Build Plan

**A trust-first global freelance marketplace · trovework.com**
Status: proposed (for review) · Target: Version 1 (MVP) · Owner: Hiroshi Tanaka
Source of truth: `Trovework_Requirements_Document.docx` (SRS) + `Trovework_Development_Document.docx` (build spec)

---

## 1. The one invariant

Every design decision below serves a single guarantee:

> **Gated data — a freelancer's contact info, and the ability to chat — is released only by the backend, only after the server has confirmed the viewer is a verified client. The frontend never decides this; it only hides things for UX.**

If we get this wrong, the product's entire "trust" promise is a lie. So the permission gate is built **first** (as a skeleton in Phase 1), tested hardest (Phase 7), and every feature is layered on top of it — never around it.

The mapped requirements: FR-R-5, FR-V-6, NFR-SEC-3, and the permission matrix in §4.

---

## 2. Decisions locked for this plan

| Decision | Choice | Rationale |
|---|---|---|
| Backend framework | **NestJS** + TypeScript | Guards + modules + DI express the permission matrix as first-class, testable units. |
| ID verification | **Real pipeline + manual-review fallback** | Face-embedding match + OCR + threshold behind a pluggable `VerificationProvider`; admin review for borderline/failed cases. The gate is real from Phase 3. |
| Repo layout | **Monorepo** | Shared permission enums, DTOs, and validation live in one `packages/shared` — front and back cannot drift. |
| Frontend | Next.js + TypeScript + Tailwind | SEO for public profiles; same language as backend. |
| Database | PostgreSQL + Prisma | Typed schema, migrations, indexed filter columns. |
| Search | Postgres full-text (V1) | Upgrade to Meilisearch/Elasticsearch when volume grows. |
| Real-time chat | Socket.IO | Authenticated at connect + per-conversation authorization. |
| File storage | Own server, foldered by location + user | ID/selfie in a secured, non-public, encrypted dir. |
| SMS | Twilio Verify | One-time codes to block bots. |
| Auth | JWT (access + refresh) + bcrypt | Verification state carried in claims + re-checked against DB on gated actions. |
| Hosting | **Self-hosted VPS + CI/CD** | Docker Compose on a VPS; CI/CD pipeline for build+deploy. Own-server storage (ID images stay on our box) fits this directly. |

---

## 3. Architecture (three-tier + specialist modules)

```
Browser (Next.js)  ──HTTPS──▶  API (NestJS REST)  ──▶  PostgreSQL (Prisma)
        │                            │
        │  WebSocket (Socket.IO)     ├──▶  Verification engine (in-house module)
        └────────────────────────────┤          face-match · OCR · liveness · manual review
                                      ├──▶  File storage (own server, foldered)
                                      └──▶  Twilio Verify (SMS OTP)
```

- **Client** — public profiles, search, dashboards, chat UI. Hides gated data for UX only.
- **API** — accounts, profiles, posts, search, moderation, chat-token issuance. **Enforces every permission rule.**
- **Database** — users, profiles, posts, messages, verification status, violations, reviews.
- **Real-time layer** — Socket.IO server; authorizes each socket against conversation membership + verification.
- **Verification engine** — in-house module; returns `verified` only when face match **AND** info match pass; routes borderline cases to manual review.
- **File storage** — resumes/photos public-ish; **ID card + selfie in secured, encrypted, non-public folder.**

**Golden rule (restated):** permission checks run on the backend. Always.

---

## 4. Roles & permission matrix

Two roles chosen at sign-up. The API enforces this on **every** request:

| User type | See posts & normal info | See contact info | Chat |
|---|---|---|---|
| Unverified client | ✅ | ❌ | ❌ |
| Verified client | ✅ | ✅ | ✅ |
| Freelancer (viewing others) | ✅ | ❌ | ❌ |

- Freelancer profile is **hidden** (`is_visible = false`) until ID verification passes.
- Client must ID-verify to see contact info / open chat. Browses freely before that.
- Clients **cannot post jobs** — a verified client requests work directly via chat (freelancer-led model).
- No conversation may exist between two freelancers.

**Implementation:** a NestJS `@Verified()` guard + `@Role()` guard, plus a single `PermissionService.canViewContact(viewer, freelancer)` / `canStartChat(...)` used by both REST controllers and the socket gateway — one source of truth, unit-tested in isolation.

---

## 5. Data model (PostgreSQL via Prisma)

All tables carry `created_at` / `updated_at`. Types indicative.

**users** — `id`(uuid PK), `email`(unique), `password_hash`(bcrypt), `role`(enum client|freelancer), `phone`(E.164), `phone_verified`(bool), `id_verified`(bool), `id_card_path`, `selfie_path`, `id_match_score`(numeric), `status`(enum active|banned|pending), `strike_count`(int, default 0).

**freelancer_profiles** — `id`, `user_id`(FK), `display_name`, `headline`, `bio`, `category_id`(FK), `skills`(text[]/join), `hourly_rate`, `resume_path`, `is_visible`(bool — true only when `id_verified`), `contact_telegram` / `_discord` / `_whatsapp` (**GATED**).

**posts** — `id`, `freelancer_id`(FK), `title`, `description`(scanned on save), `category_id`(FK), `price_from`, `status`(enum active|blocked|draft).

**categories** — `id`, `name`, `parent_id`.
**conversations** — `id`, `client_id`, `freelancer_id`.
**messages** — `id`, `conversation_id`, `sender_id`, `body`, `sent_at`.
**violations** — `id`, `user_id`, `post_id`, `detected_text`, `created_at`.
**reviews** — `id`, `from_user`, `to_user`, `rating`, `comment`.

**Indexing (NFR-PERF-1):** index every filter column — `category_id`, `skills`, `price_from`, review aggregates, and the FTS vector on posts.

---

## 6. The two highest-risk modules

### 6.1 ID verification engine (in-house)

Input: ID card image + selfie + typed info (name, DOB, ID number).

1. **Face match** — face-embedding model compares selfie ↔ ID face photo → similarity score.
2. **Info match** — OCR (Tesseract or a text-detection model) reads the card; compare extracted name/DOB/ID# to typed info.
3. **Liveness / anti-spoofing** on the selfie (defeat printed photo / screen / deepfake).
4. **Result** — `id_verified = true` only when **both** pass. Freelancers → `is_visible = true` automatically. Clients → contact/chat unlocked.
5. **Fallback** — borderline scores or repeated failures route to **admin manual review** (FR-V-9). Real users are never silently rejected.

**Design for change:** everything above sits behind a `VerificationProvider` interface. The MVP implementation is real (open face model + Tesseract + tuned threshold); it can later be swapped or augmented without touching the gate. Thresholds are config, not code.

**Honest risk (from the dev doc):** global ID layouts vary; forgery and spoofing are real. Mitigations baked in: liveness, carefully tuned face threshold, and the manual-review path as a permanent safety net.

### 6.2 Contact-info scanner + 3-strike ban

Runs **server-side** on every post create/edit. Flags: phone numbers, emails, URLs, `@usernames`, and messaging-app keywords (telegram/whatsapp/discord/line/wechat/signal/skype + common misspellings).

- On match → block post (`status = blocked`), log `violation` with the detected text.
- `handleStrike`: increment `strike_count`; 1st/2nd → warn; 3rd → `status = banned`.
- **Show the user the triggering text** (FR-M-5) so honest mistakes (e.g. a price `10,000`, a portfolio link) are fixable; count a strike only when contact intent is clear.

This is the most-tested unit in the codebase (§9).

---

## 7. File storage layout

```
/storage/
  {country}/{state-or-province}/
    {username}_{userId}/          ← userId in the name; names collide, ids don't
      resume/
      photos/                     ← profile & portfolio (servable)
  /secured/                       ← OUTSIDE public web root, encrypted, access-restricted
    {userId}/id/                  ← ID card image + selfie  (NEVER a public URL)
```

Maps to FR-F-1/2/3, NFR-SEC-2, and the §10 security posture.

---

## 8. Build phases & task breakdown

Each phase produces a testable slice. The permission gate skeleton exists from Phase 1.

**Phase 1 — Foundation**
Monorepo (`apps/web`, `apps/api`, `packages/shared`); Prisma schema + first migration for all core tables; email/password signup with role choice; JWT (access+refresh) + bcrypt; Twilio phone verification; `@Verified()`/`@Role()` guard skeleton + `PermissionService` stub.

**Phase 2 — Profiles & posts**
Profile editor (name, headline, bio, category, skills, rate); resume + photo upload into the foldered storage; post CRUD; categories. Profiles default `is_visible = false`.

**Phase 3 — Verification gate** *(core trust milestone)*
`VerificationProvider` interface + real implementation (face match + OCR + liveness + threshold); `/verify/id/submit`; secured ID/selfie storage; flip `is_visible` (freelancer) and contact/chat unlock (client); admin manual-review queue.

**Phase 4 — Discovery**
Postgres full-text search + indexed filters (category, skill, price, rating); verified-only results (FR-S-3); public profile page with **server-gated** contact fields.

**Phase 5 — Chat**
Socket.IO gateway; conversation creation only for verified clients; block freelancer↔freelancer; inbox + real-time thread UI; `PermissionService` reused at the socket layer.

**Phase 6 — Trust & moderation**
Contact-info scanner + 3-strike ban wired into post save; admin panel (violations, banned users, flagged posts, borderline verifications); reviews feeding search sort.

**Phase 7 — Launch prep**
Test suites (below); security review of the gate (direct-API bypass attempts); rate limiting; responsive polish; deploy (Vercel front + Render/Railway/AWS back); automated DB backups; monitoring.

---

## 9. Testing & QA (highest-risk-first)

- **Unit** — the permission matrix (`PermissionService`) and the contact-info scanner. These get exhaustive tables of cases, including the false-positive guards (`10,000`, legit links).
- **Verification** — matching selfie+info passes; mismatch fails; result correctly flips freelancer visibility and client chat access; borderline routes to review.
- **Security (gate bypass)** — confirm an unverified client or a freelancer **cannot** retrieve another user's contact info by calling the API directly, and cannot open a socket to a conversation they're not in.
- **E2E** — the core journey: sign up → build profile → verify → appear in search → get contacted → chat.

---

## 10. Security & data protection

- **ID images are the crown jewels.** Encrypted at rest, outside the public web root, access restricted to the fewest systems/people, with a defined retention/deletion policy (NFR-PRI-3). A breach here is the worst case — highest priority.
- **GDPR + regional law** — collect only what verification needs; state purpose; support deletion requests (NFR-PRI-1/2).
- **Transport/storage** — HTTPS everywhere; bcrypt passwords; sensitive fields encrypted at rest; DB access restricted.
- **Server-side gate** — gated contact info never leaves the API unless the viewer is a confirmed verified client (NFR-SEC-3).
- **Rate limiting** — throttle sign-ups, messages, searches (NFR-SEC-4) against spam/scraping.
- **Payment expectation** — V1 clearly states Trovework verifies identity but does **not** handle or guarantee payment (off-platform).

---

## 11. Explicitly out of scope for V1

On-platform payments/escrow · commissions/subscriptions/paid placement · client-posted jobs · native mobile apps · non-English localization at launch (text structured for later translation).

---

## 12. Open questions / risks to confirm before Phase 3

1. **ID engine models** — which face-embedding model + liveness approach are acceptable given the global-audience accuracy risk? This drives real effort and legal exposure.
2. ~~Hosting target~~ — **DECIDED: self-hosted VPS + CI/CD.** Deploy via Docker Compose; secured file-storage dir lives on the VPS outside the web root.
3. **Data-protection scope** — which regions at launch? Determines the retention/deletion and consent specifics.
4. **Twilio account** — confirmed as the SMS provider (the dev doc left the cell blank but implies it elsewhere).

---

*Recommended first action after sign-off: scaffold Phase 1 — monorepo, Prisma schema, auth + phone verification, and the permission-guard skeleton — so the gate exists before any feature leans on it.*
