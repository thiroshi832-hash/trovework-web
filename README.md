# Trovework

**A trust-first global freelance marketplace** · [trovework.com](https://trovework.com)

Trovework connects freelancers with clients. Its defining feature is trust: **every user who can
contact or be contacted is ID-verified** through Trovework's own verification engine.

Version 1 is free and processes no payments — clients and freelancers arrange payment privately.

## The core invariant

> Gated data — a freelancer's contact info, and the ability to chat — is released **only by the
> backend**, only after the server has confirmed the viewer is a verified client. The frontend
> hides things for UX; the backend guarantees them for security.

## Repository layout

```
trovework/
├─ apps/
│  └─ web/          Next.js 16 + TypeScript + Tailwind (frontend)
├─ docs/
│  └─ BUILD_PLAN.md Full build plan, data model, phases
└─ package.json     npm workspaces root
```

Planned: `apps/api` (NestJS) and `packages/shared` (types, permission enums, validation).

## Getting started

```bash
npm install
npm run dev
```

The web app runs at http://localhost:3000.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript *(planned)* |
| Database | PostgreSQL + Prisma *(planned)* |
| Real-time | Socket.IO *(planned)* |
| ID verification | In-house engine (face match + OCR + liveness) *(planned)* |
| Hosting | Self-hosted VPS + CI/CD |

## Build phases

1. **Foundation** — auth, role sign-up, phone verification, DB schema
2. **Profiles & posts** — profile editor, uploads, post CRUD
3. **Verification gate** — ID engine + permission enforcement *(core trust milestone)*
4. **Discovery** — search, filters, public profiles with gated contact info
5. **Chat** — real-time messaging between verified users
6. **Trust & moderation** — anti-leak scanner, 3-strike ban, admin panel, reviews
7. **Launch prep** — testing, security review, deploy, monitoring

See [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) for the full specification.

## Security note

Uploaded ID images and selfies are **never** committed to this repository and must be stored
encrypted, outside the public web root, on the server. `/storage/` and `/secured/` are gitignored.
