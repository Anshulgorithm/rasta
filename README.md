# Rasta — Himachal Trek Tracker

A trek-discovery and booking platform for Himachal Pradesh: tourists browse trails by
season and reserve a spot; local guides list and manage their own treks; admins approve
guide applications and oversee the platform.

## Stack

React + Vite + Tailwind CSS, React Router, lucide-react icons. JavaScript only, `@/`
import alias for everything under `src/`.

## Data layer

`src/api/base44Client.js` exposes a `base44` client shaped exactly like the spec's
backend-as-a-service SDK (`base44.entities.<Name>.list/filter/get/create/update/delete`,
`base44.auth.isAuthenticated/me/updateMe/login/register/logout`). Every page and
component talks only to this client — never to storage directly — so it's a one-file
swap to point the app at a real backend later.

For this build, that client is backed by a small local mock (`entityFactory.js`,
`auth.js`, `localStore.js`) that persists to the browser's `localStorage`, seeded on
first load with 8 districts and 14 treks (`seed.js`). Everything — accounts, listings,
bookings — is fully functional in the browser without any external service.

## Roles

- **Tourist** (default on signup) — browse, filter, reserve.
- **Guide** — apply from the Guide Dashboard as a tourist; an admin approves the
  request, which flips `role` to `guide`. Guides then get full CRUD on their own treks
  (scoped by `created_by_id`).
- **Admin** — promote a user to `admin` directly in the browser console for local
  testing:
  ```js
  const users = JSON.parse(localStorage.getItem('rasta_User'));
  users[0].role = 'admin';
  localStorage.setItem('rasta_User', JSON.stringify(users));
  // then refresh, after logging in as that account
  ```

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build to dist/
npm run preview   # serve the production build locally
```

## Project structure

See the build brief for the full file-by-file rationale. Short version:
`src/api` = data layer, `src/lib` = shared config (seasons), `src/hooks` = `useUser`,
`src/components` = reusable UI, `src/pages` = one file per route, `base44/entities` =
entity schema docs for the intended backend.

## What's deferred (v1 scope)

Real payment gateway, premium/verified badges, native mobile app, reviews & ratings,
Hindi localization, real-time slot availability — all intentionally out of scope per
the original brief.
