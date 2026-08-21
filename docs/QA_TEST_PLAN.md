# Trovework — Release QA Test Plan

Manual end-to-end acceptance checklist for the Trovework marketplace — every
user-facing flow and every trust-and-safety control, grouped by area and
prioritised. Check items off as you go.

- **P0** = must pass to ship (core + trust/safety)
- **P1** = important
- **P2** = edge / polish

## Before you start — set these up

- **Accounts:** a fresh unused email (for signup), one **Freelancer**, one **Client**, and one **Admin** (an admin is any account whose email is in the server's `ADMIN_EMAILS`; an admin email can't also be a freelancer/client — use separate emails).
- **Assets:** a clear photo of an ID document, a matching selfie, a non-matching selfie, a non-image file (e.g. `.pdf`), and an image over 8 MB.
- **Two devices/browsers** side by side (for realtime chat), plus a browser whose language you can change (for localization).
- **Feature flags** (server `.env`):
  - `GOOGLE_CLIENT_ID` — Google sign-in
  - `SMTP_USER` — password-reset email
  - `ID_VERIFY_ENGINE=auto` — automated ID engine (default `manual`)
  - `SMS_DEV_LOG=true` — log phone codes instead of texting (dev, no seven.io)
  - `SEVEN_API_KEY` — real SMS provider (production)

---

## AUTH — Registration & Login

- [ ] **AUTH-01 (P0)** Register as a Client: fill every field, tick the terms box, submit. → *Account is created and you land on the client dashboard; the header shows your name.*
- [ ] **AUTH-02 (P0)** Register as a Freelancer. → *Account created; you land on the freelancer dashboard.*
- [ ] **AUTH-03 (P1)** Tick the terms box but leave fields blank, then click Create account. → *Button is enabled by the checkbox; clicking shows a "fill in the required fields" alert plus per-field errors — it does not silently do nothing.*
- [ ] **AUTH-04 (P1)** Change the Country field on the register form. → *State/Province is disabled until a country is chosen, then offers that country's options.*
- [ ] **AUTH-05 (P1)** Enter a weak password (short, or letters-only) and a non-matching confirmation. → *Inline errors: min 8 chars with a letter and a number; confirmation must match.*
- [ ] **AUTH-06 (P1)** Register with an email that already has an account. → *Error on the email field: an account already exists.*
- [ ] **AUTH-07 (P0)** Log in with correct credentials. → *Redirected to your dashboard; header reflects the logged-in user.*
- [ ] **AUTH-08 (P1)** Log in with a wrong password, then with an email that has no account. → *Both give the SAME generic "email or password is incorrect" — no hint which emails exist.*
- [ ] **AUTH-09 (P1)** Attempt to log in to a banned account. → *Login refused with a "suspended" message.*
- [ ] **AUTH-10 (P0)** Log out from the account menu. → *Session cleared; header shows Login/Register again.*
- [ ] **AUTH-11 (P1)** Log in, then refresh the page and open a new tab. → *You stay logged in across refresh and tabs.*
- [ ] **AUTH-12 (P0)** *(new)* Log in, wait ~15+ minutes (past the access-token lifetime), then click a nav link or refresh a protected page. → *You stay logged in — the session refreshes silently; you are NOT bounced to /login.*

## ROUTE — Route protection

- [ ] **ROUTE-01 (P0)** While logged out, visit `/dashboard`, `/profile/edit`, `/inbox`, `/admin`, `/verify/id`, `/posts/new`, `/freelancers`, and a `/freelancers/[slug]` URL directly. → *Each redirects to `/login` (with a `?next` back to the page).*
- [ ] **ROUTE-02 (P1)** Get redirected to login from a protected page, then log in. → *You land on the page you originally requested, not a generic home.*
- [ ] **ROUTE-03 (P1)** Log in, then clear the session cookie and navigate within a protected area. → *The page detects the dead session and sends you to login.*

## GOOG — Google sign-in *(requires `GOOGLE_CLIENT_ID`)*

- [ ] **GOOG-01 (P0)** Click "Continue with Google" as a brand-new Google user. → *After Google, you're taken to `/complete-signup` to choose a role + location; then the account is created and you land on the matching dashboard.*
- [ ] **GOOG-02 (P1)** Use "Continue with Google" with an email that already has a password account. → *Google is linked to that existing account and you're logged in — no duplicate account.*
- [ ] **GOOG-03 (P1)** Sign in with Google again as a returning user. → *Straight to your dashboard — no `/complete-signup`, no 404.*
- [ ] **GOOG-04 (P1)** Start Google sign-in and click Cancel on Google's screen (or use bad credentials). → *You return to `/login` with a friendly "Google sign-in didn't complete" banner — not a raw 500.*
- [ ] **GOOG-05 (P1)** Sign in with Google using an email listed in `ADMIN_EMAILS`. → *Account becomes an admin and lands on `/admin`.*

## PWD — Password reset

- [ ] **PWD-01 (P0)** Use "Forgot password?" with a real account's email. → *Neutral "check your email" screen; a reset link is delivered (by email if SMTP is set, otherwise printed in the API logs).*
- [ ] **PWD-02 (P1)** Use "Forgot password?" with an unknown email. → *Same neutral response — no hint whether the address exists.*
- [ ] **PWD-03 (P1)** Open a valid reset link and set a new password. → *Password changes; you can log in with the new one.*
- [ ] **PWD-04 (P1)** Reuse a reset link, or tamper with the token. → *"This link isn't valid" with a prompt to request a new one.*
- [ ] **PWD-05 (P1)** Open a reset link that was already used, or wait past its expiry. → *"This link isn't valid".*
- [ ] **PWD-06 (P2)** Submit "Forgot password?" many times rapidly. → *Rate-limited (HTTP 429 / "too many attempts").*

## PHONE — Phone verification

> Behaviour depends on config: with no provider, phone verification is **optional** and the page shows a "not required — verify identity instead" skip. With `SMS_DEV_LOG=true` (dev) or `SEVEN_API_KEY` (prod) it is **required** and works.

- [ ] **PHONE-01 (P0)** With a provider configured, request a phone code, read it (SMS or `[dev]` API log), and confirm. → *Phone shows as verified on your account.*
- [ ] **PHONE-02 (P1)** Enter a wrong code. → *Error shown; the attempt is counted.*
- [ ] **PHONE-03 (P1)** Request a code, wait past its expiry, then confirm it. → *Rejected as expired; you must request a new code.*
- [ ] **PHONE-04 (P2)** Enter a wrong code several times. → *Locked out after the attempt limit; request a new code.*
- [ ] **PHONE-05 (P0)** *(new)* With **no** provider linked, open `/verify/phone`. → *Shows "Phone verification isn't required" with a "Verify my identity" button — no dead Send Code form.*
- [ ] **PHONE-06 (P1)** *(new)* With no provider, try to publish a post with only ID verified (no phone). → *Publishing is allowed — phone isn't gating.*

## IDV — ID verification

- [ ] **IDV-01 (P0)** Submit an ID image + selfie + name/DOB/ID number (manual mode). → *Status becomes "in review"; you are NOT auto-verified.*
- [ ] **IDV-02 (P1)** Submit with the ID or the selfie missing. → *Validation error — both are required.*
- [ ] **IDV-03 (P1)** Upload a non-image file, or an image over 8 MB. → *Rejected cleanly (wrong type → 400; too large → 413 "too large"), not a 500.*
- [ ] **IDV-04 (P0)** After an admin approves the submission, re-check the account. → *Account is verified; a freelancer's profile becomes visible in search; a client gains contact + chat access.*
- [ ] **IDV-05 (P1)** *(auto engine)* Submit a matching selfie + ID with the name on the document. → *Auto-approved; the result screen says "You're verified".*
- [ ] **IDV-06 (P1)** *(auto engine)* Submit a selfie of a clearly different person. → *Auto-rejected; the result screen says "We couldn't verify you" (not "pending").*
- [ ] **IDV-07 (P1)** *(auto engine)* Submit a blurry photo with no detectable face. → *You're told to retake the photo and try again (retryable) — NOT parked in the manual queue.*
- [ ] **IDV-08 (P1)** *(auto engine)* Force an engine error (models unavailable). → *Routed to manual review with a neutral "in review" — never blocked or auto-approved on failure.*
- [ ] **IDV-09 (P0)** *(new)* On the selfie step, confirm the camera preview shows a live video feed, and there is **no** file-upload option for the selfie. → *Selfie is camera-only; the live feed renders.*
- [ ] **IDV-10 (P1)** *(new, auto)* Submit the ID photo itself as the "selfie" (identical image). → *Rejected as a spoof ("take a live selfie").*
- [ ] **IDV-11 (P1)** *(new, auto)* Submit with a DOB/ID number that doesn't match the document's MRZ. → *You're told the details didn't match and can correct and resubmit (retryable).*

## PROF — Freelancer profile

- [ ] **PROF-01 (P0)** As a freelancer, build a profile (headline, bio, skills, rate, category, availability, contact handles incl. **LinkedIn**); save. → *Profile saves and reloads with the values.*
- [ ] **PROF-02 (P1)** As a client or admin, open `/profile/edit`. → *Redirected to your own dashboard (client/admin) — NOT the marketing landing page.*
- [ ] **PROF-03 (P1)** Before ID verification, search for your freelancer profile; verify; search again. → *Hidden from search/public until verified; appears afterwards.*
- [ ] **PROF-04 (P1)** Save the profile, then rename your display name and save again. → *The public URL slug is assigned once and stays stable across edits.*
- [ ] **PROF-05 (P1)** Upload a profile photo (JPEG/PNG/WebP). → *Photo shows on the profile and is served from `/uploads`.*
- [ ] **PROF-06 (P1)** Try uploading a non-image or an oversized photo. → *Rejected with a clear message.*

## POST — Service posts & contact scanner

- [ ] **POST-01 (P0)** Create a clean post and Save as draft (before verifying). → *Draft saves; publishing is not required yet.*
- [ ] **POST-02 (P0)** Try to Publish a post before the required verifications are complete. → *Publish is blocked with a prompt to verify.*
- [ ] **POST-03 (P0)** Publish a post containing a phone number, email, URL, @handle, or messaging-app name (try `viber`, `snapchat`, `kakaotalk`). → *Post is blocked, a strike is recorded, and the exact detected text is shown — the editor preview flags the same terms as the server.*
- [ ] **POST-04 (P0)** Trigger a 3rd contact-info violation on one account. → *Strikes 1 & 2 warn; the 3rd suspends the account.*
- [ ] **POST-05 (P1)** Edit a blocked post to remove the flagged text and publish. → *It publishes and the blocked reason clears.*
- [ ] **POST-06 (P1)** Open `/posts/[id]/edit` for a post that isn't yours. → *404 — not found.*
- [ ] **POST-07 (P1)** Delete one of your own posts. → *It's removed from your dashboard.*
- [ ] **POST-08 (P1)** Publish a clean post, then view your public profile. → *The active post appears under your services.*

## SRCH — Browse & search

- [ ] **SRCH-01 (P0)** While logged out, open `/freelancers`. → *Redirected to login (browsing requires an account).*
- [ ] **SRCH-02 (P1)** Filter by category, skill, price range, rating, and availability; change the sort order (styled dropdowns). → *Results update correctly for each filter and sort.*
- [ ] **SRCH-03 (P1)** Confirm which freelancers appear. → *Only ID-verified (visible) freelancers are listed.*
- [ ] **SRCH-04 (P0)** Open a freelancer's public profile. → *Shows services, reviews, rating, and a "Request to Chat" button.*
- [ ] **SRCH-05 (P0)** View a profile as (a) anonymous/unverified, (b) another freelancer, (c) a verified client. → *Contact handles are hidden for (a) and (b); shown only to the verified client (c) — enforced server-side.*
- [ ] **SRCH-06 (P2)** *(new)* On Browse, confirm every freelancer card is the **same height** regardless of blurb length or skill count.

## CHAT — Chat & inbox

- [ ] **CHAT-01 (P0)** As a verified client, click "Request to Chat" on a freelancer. → *A conversation is created and the inbox opens to it.*
- [ ] **CHAT-02 (P0)** As an unverified client, click "Request to Chat". → *Blocked with a prompt to verify your identity.*
- [ ] **CHAT-03 (P1)** As a freelancer, try to start a chat with another freelancer. → *Not allowed (client↔freelancer only).*
- [ ] **CHAT-04 (P0)** With two browsers in the same conversation, send a message from one. → *It appears in the other in real time.*
- [ ] **CHAT-05 (P1)** Receive a message in a thread you don't have open, then open it. → *Unread badge increments, then clears when you open the thread.*
- [ ] **CHAT-06 (P1)** Click a "Request to Chat" that deep-links (`?c=…`) from a profile. → *The inbox opens directly to that conversation.*
- [ ] **CHAT-07 (P1)** As a non-participant, try to read or post to someone else's conversation. → *Blocked (404 / forbidden) on both REST and socket.*
- [ ] **CHAT-08 (P2)** Disconnect the socket (offline briefly) and send a message. → *It still sends via the REST fallback.*

## REV — Reviews

- [ ] **REV-01 (P1)** Leave a rating + comment for someone you've had a conversation with. → *Review is saved and shows on their profile.*
- [ ] **REV-02 (P1)** Try to review someone you've never messaged, and try to review yourself. → *Both are refused.*
- [ ] **REV-03 (P1)** Review the same person twice. → *The second submission updates the first — no duplicate.*
- [ ] **REV-04 (P1)** Check a reviewed freelancer in search. → *Average rating + count show on the profile and influence the search sort order.*

## ADMIN — Admin panel *(admin = email in `ADMIN_EMAILS`)*

- [ ] **ADMIN-01 (P0)** Open `/admin` as a non-admin, then as an admin. → *Non-admin can't load the data (403 / blocked); admin sees the moderation panel.*
- [ ] **ADMIN-02 (P0)** In the ID review queue, approve one submission and reject another. → *Approve → the user is verified and their profile visible; reject → stays unverified.*
- [ ] **ADMIN-03 (P1)** Inspect a review-queue row as an admin. → *Date of birth and ID number are shown decrypted for review.*
- [ ] **ADMIN-04 (P1)** In Categories, add a category, hide (deactivate) one, and delete one. → *Changes save; the public category list reflects only active ones.*
- [ ] **ADMIN-05 (P1)** In Banned users, reinstate a suspended account. → *Account becomes active again and its strike count resets to 0.*
- [ ] **ADMIN-06 (P2)** Open the Violations and Blocked posts tabs. → *They render as read-only audit lists.*
- [ ] **ADMIN-07 (P0)** *(new)* In the ID review queue, confirm each submission shows the **ID front, back (if present), and selfie** images. → *Images render; each can be opened full-size and downloaded.*
- [ ] **ADMIN-08 (P1)** *(new)* On the Users tab, search by name/email and filter by status. → *List filters correctly; results paginate.*
- [ ] **ADMIN-09 (P1)** *(new)* Suspend an active user, then reinstate them. → *Status flips to suspended and back; reinstate clears strikes.*
- [ ] **ADMIN-10 (P1)** *(new)* Reset a user's strikes from the Users tab. → *Strike count returns to 0 without changing status.*
- [ ] **ADMIN-11 (P1)** *(new)* Open a user's detail; view + download their ID/selfie and profile photo. → *Images load and download; raw file paths are never exposed.*
- [ ] **ADMIN-12 (P0)** *(new)* Try to delete/suspend your own admin account or another admin. → *Refused; only non-admin accounts can be deleted/suspended.*
- [ ] **ADMIN-13 (P1)** *(new)* Delete a (non-admin) test user. → *User and all their data are removed; they no longer appear or can log in.*
- [ ] **ADMIN-14 (P2)** *(new)* Confirm every tab (ID review, Users, Categories, Violations, Blocked posts, Banned users) paginates with Prev/Next and an "x of N" readout.

## I18N — Localization

- [ ] **I18N-01 (P1)** Set the browser language to Spanish, French, German, Portuguese, Chinese, or Japanese and reload. → *The header nav and account menu render in that language.*
- [ ] **I18N-02 (P1)** Set the browser language to Arabic and reload. → *The interface flips to right-to-left (`dir=rtl`).*
- [ ] **I18N-03 (P1)** Set the browser to an unsupported language (e.g. Korean). → *Falls back to English.*
- [ ] **I18N-04 (P2)** Open `/terms` and `/privacy` in any non-English locale. → *They remain in English by design.*

## MKTG — Landing, Safety & Blog *(new)*

- [ ] **MKTG-01 (P0)** Click "Safety & Trust" in the header and mobile nav. → *Opens the `/safety` page (no 404).*
- [ ] **MKTG-02 (P1)** Read the landing hero and stats. → *No fabricated numbers/testimonials; states "Every member is verified", "Verified members", etc.*
- [ ] **MKTG-03 (P1)** Check the footer links. → *Every link goes to a real page (Browse, How It Works, Safety, Blog, Register, Login, Terms, Privacy) — none are dead `#`.*
- [ ] **MKTG-04 (P1)** View the "Featured Freelancers" section. → *Shows real verified freelancers; the whole section is hidden when there are none.*
- [ ] **MKTG-05 (P1)** Open a blog card from the landing and from `/blog`. → *Each opens a real article at `/blog/[slug]` that reads fully.*

## LEGAL — Legal pages

- [ ] **LEGAL-01 (P2)** Open `/terms` and `/privacy`, and the links from the register consent checkbox. → *Both render full documents and the consent links resolve to them.*

## NFR — Security & cross-cutting

- [ ] **NFR-01 (P0)** Visit `http://trovework.com` and `http://www.trovework.com`. → *Redirect to https and to the apex domain.*
- [ ] **NFR-02 (P1)** After login, inspect cookies and run `document.cookie` in the console. → *Auth cookies are HttpOnly + Secure; the access token is NOT readable from JavaScript.*
- [ ] **NFR-03 (P1)** Rapidly repeat login / register / forgot-password. → *Rate-limited with a "too many attempts" (429).*
- [ ] **NFR-04 (P1)** Use the app on mobile, tablet, and desktop widths. → *Header, dashboards, inbox and forms are usable and laid out correctly at each size.*
- [ ] **NFR-05 (P2)** Visit an unknown URL, and trigger an API/network error. → *A friendly 404 / error state — not a blank page or crash.*
- [ ] **NFR-06 (P2)** Try to open an uploaded ID image by guessing its URL. → *Secured ID images are not publicly reachable; only `/uploads` profile photos are served. Admin image access requires an admin session.*
- [ ] **NFR-07 (P1)** *(new)* Confirm the API sends security headers (HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy`).

---

*Legend: P0 = must pass to ship · P1 = important · P2 = edge/polish. Cases marked (new) cover functionality added after the original 85-case plan.*
