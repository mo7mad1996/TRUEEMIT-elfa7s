# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## What this is

A car inspection reporting app ("TRUEEMIT", package name `elfa7s`), with an Arabic RTL UI. It is one
Nuxt 2 (Vue 2) app served by a custom Express server and MongoDB. Inspection-center details are
loaded from TRUEEMIT's branch API at startup. Engineers fill in inspection forms, managers review
cars, clients and statistics, and a printed/PDF report is produced for each car.

## Commands

- `npm run dev`: `nodemon server`. With `NODE_ENV=development` this builds Nuxt in-process and
  serves on port 3000.
- `npm run build`: `nuxt build` (production bundle).
- `npm start`: `node server`.
- `install.bat`: the deployment script. It renames `.env.pro` to `.env`, runs install and build,
  runs `node remove.js` (which **deletes the source folders** `pages/`, `components/`, `.git`,
  etc.), then `start.bat`. Never run it in a dev checkout.

The repo has no test suite and no linter. Copy `.env.example` to `.env` and set `NODE_ENV`, `DB_URI`,
`SECRET`, `SHOP_BRANCH`, and `INITIAL_ADMIN_PASSWORD` (the last is required when a valid branch has
no manager user).

`nuxt.config.js` picks the machine's real LAN IPv4 (`pickLanIP()` — skips loopback, `169.254.*`
APIPA link-local and virtual adapters like `vEthernet`/WSL/VirtualBox) for LAN-oriented UI links.
Browser API requests use the current origin; server-side API requests use loopback. The HTTP server
listens on all interfaces and does not launch a local browser.

## Architecture

### Server (`server/`): everything is auto-loaded by directory scan

- `server/index.js` loads models, then awaits middleware/database setup, loads the branch inspection
  center and ensures a manager exists, mounts routes, and finally starts Nuxt.
- `server/models/models/*.js`: every file registers a mongoose model (`Car`, the exclusive car
  model, `clients`, `Users`). Shop details are not stored in MongoDB; they come from the remote
  inspection-center API.
- `server/middlewares/middlewares/NN_*.js`: run in filename order, except `05_nuxt.js`, which starts
  after API routes are mounted. It creates the HTTP server and attaches socket.io (`server/IO`).
- `server/routes/pages/<name>.js` is mounted at `/api/<name>`. Each file exports
  `(router, app) => router`.
- Auth: JWT via `@nuxtjs/auth-next` local strategy (`/api/users/login`, `/api/users/user`). Only
  `cars-exclusive.js` enforces roles server-side, using `attachUser` + `allow(...jobs)` from
  `server/utils/auth.js`. The other routes are open.
- The car **list** endpoints `GET /api/cars` and `GET /api/cars-exclusive` are paginated and
  filterable: they return `{ data, total, page, pages, limit }` (not a bare array), built from
  `server/utils/carQuery.js` (`buildCarFilter` + `parsePaging`). Query params: `page`, `limit`,
  `search`, `status` (`paid`/`deferred`), `payment`, `service`, `start`/`end` (date range).
  `limit=all` skips paging and returns the whole (filtered) collection. The four car-list pages
  (`pages/{engineer,manager}/cars`, `pages/exclusive/cars`, `pages/manager/exclusive/_id`) fetch
  with `limit=all`, read `res.data`, then filter and paginate on the client. `/cars/:id`,
  `/last/:days` and `/special` still return their own shapes.
- `pdf.js` renders report HTML sent by the client into an A4 PDF with Puppeteer.
- `server/utils/inspectionCenter.js` loads
  `https://trueemit.dev/api/inspection-centers/by-branch/{SHOP_BRANCH}` at startup. A missing
  branch is handled by `/not-ready`; a returned shop with no
  manager causes creation of `user_id=admin` using `INITIAL_ADMIN_PASSWORD`. Shop data is cached
  in memory only. `GET /api/trueemit/shop` serves that cache to the frontend.
- Uploaded files (car images, videos, logos, computer PDFs) are stored locally: the frontend posts
  them to `/api/upload` (`server/routes/pages/upload.js`, open route, formidable), which saves them
  under `server/upload/` and returns a root-relative `{ url }` (e.g. `/abc.jpg`) — no host is baked
  in, so the browser resolves it against the current origin and the PDF render against the
  `<base href>` it injects (`layouts/print.vue`). They are served statically from `server/upload/`
  by `06_global_dirs.js`. The external API `https://trueemit-api.vercel.app` is used only for the
  optional exclusive "attach report to server" sync (`components/print/ServerActions.vue`), not for
  file storage.

### Roles

`user.job` is one of `engineer`, `manager`, `exclusive`. Pages live under `pages/<job>/` and are
guarded by the `middleware/<job>.js` files. The global router middleware is `shop-status` + `auth`. When no branch shop is available, all pages
except `/not-ready` redirect to the not-ready page.

- **engineer / manager** work on shared `Car` documents (`/api/cars`).
- **exclusive** users are separate companies. Their cars (`/api/cars-exclusive`) are isolated per
  user. They have their own logo on the report and can sync reports to the external server
  (`components/print/ServerActions.vue`).
- The manager can open exclusive cars under `pages/manager/exclusive/`.

### Live drafts over socket.io

Cars being edited are kept **in server memory**, not in the DB, until saved (`server/IO/index.js`).
Engineers share one `NormalCars` list, and each exclusive user has a private list keyed by user id
in their own room. The `save-car` event makes the other clients refetch from the database.

### Shared form ↔ report field rules

The engineer form (`components/engineer/`) and the print report (`components/print/`,
`pages/print/_id.vue`) are shared between roles. They decide which fields appear through two global
mixins:

- `plugins/view-job.js` → `viewJob`: the job of the car _owner_ as seen by the viewer. A manager
  viewing an exclusive car gets `"exclusive"`, and `?as=` overrides it. Use `viewJob` for field
  visibility and `$auth.user.job` for viewer permissions.
- `plugins/service-fields.js` → `SERVICES` (the Arabic service names stored in `car.service`),
  `hasField(field, car)` and `isService(...)`. Every per-service rule for showing or hiding a form
  or report field goes in the `rules` map here, so the form and the printed report stay in sync. Add
  a rule there instead of writing `v-if` checks on service names in components.

### Frontend conventions

- Components are auto-imported (`components: true`).
- Styling uses Tailwind plus SCSS in `assets/scss/`.
- Global alerts go through the `store/alert.js` Vuex module.
- Code comments and UI strings mix Arabic and English. Service names are compared as exact Arabic
  strings, so don't normalise them (for example, `أ` vs `ا`).
