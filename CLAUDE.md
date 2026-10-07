# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A car inspection reporting app ("TRUEEMIT", package name `elfa7s`), with an Arabic RTL UI. It is one Nuxt 2 (Vue 2) app served by a custom Express server, and it runs on the shop's own machine against MongoDB. Engineers fill in inspection forms, managers review cars, clients and statistics, and a printed/PDF report is produced for each car.

## Commands

- `npm run dev`: `nodemon server`. With `NODE_ENV=development` this builds Nuxt in-process and serves on port 3000.
- `npm run build`: `nuxt build` (production bundle).
- `npm start`: `node server`. In production it also opens the browser automatically.
- `install.bat`: the deployment script. It renames `.env.pro` to `.env`, runs install and build, runs `node remove.js` (which **deletes the source folders** `pages/`, `components/`, `.git`, etc.), then `start.bat`. Never run it in a dev checkout.

The repo has no test suite and no linter.

Required `.env` keys: `NODE_ENV`, `DB_URI`, `SECRET`.

The server binds to the first network interface's IPv4 address, not localhost. Axios `baseURL` is `http://<that IP>:3000/api` (see `nuxt.config.js`).

## Architecture

### Server (`server/`): everything is auto-loaded by directory scan
- `server/index.js` loads `models/`, then `middlewares/`, then `routes/`.
- `server/models/models/*.js`: every file registers a mongoose model (`Car`, the exclusive car model, `clients`, `Shop`, `Users`). Routes fetch models with `mongoose.model("Name")` instead of requiring them.
- `server/middlewares/middlewares/NN_*.js`: run in filename order. `05_nuxt.js` starts Nuxt, creates the HTTP server and attaches socket.io (`server/IO`).
- `server/routes/pages/<name>.js` is mounted at `/api/<name>`. Each file exports `(router, app) => router`.
- Auth: JWT via `@nuxtjs/auth-next` local strategy (`/api/users/login`, `/api/users/user`). Only `cars-exclusive.js` enforces roles server-side, using `attachUser` + `allow(...jobs)` from `server/utils/auth.js`. The other routes are open.
- `pdf.js` renders report HTML sent by the client into an A4 PDF with Puppeteer.
- `trueemit.js` handles licensing and self-update. `/isvalid` checks for the `secret` file and `Shop` expiry. `/update` downloads a branch zip from GitHub and reinstalls. Some endpoints (`remove_all`) wipe the working directory, so be careful when touching them.
- Uploaded files are served statically from `server/upload/`. Car images and computer PDFs are uploaded to the external API `https://trueemit-api.vercel.app` instead.

### Roles
`user.job` is one of `engineer`, `manager`, `exclusive`. Pages live under `pages/<job>/` and are guarded by the `middleware/<job>.js` files. The global router middleware is `valdation` (license check, with that spelling) + `auth`.

- **engineer / manager** work on shared `Car` documents (`/api/cars`).
- **exclusive** users are separate companies. Their cars (`/api/cars-exclusive`) are isolated per user. They have their own logo on the report and can sync reports to the external server (`components/print/ServerActions.vue`).
- The manager can open exclusive cars under `pages/manager/exclusive/`.

### Live drafts over socket.io
Cars being edited are kept **in server memory**, not in the DB, until saved (`server/IO/index.js`). Engineers share one `NormalCars` list, and each exclusive user has a private list keyed by user id in their own room. The `save-car` event makes the other clients refetch from the database.

### Shared form ↔ report field rules
The engineer form (`components/engineer/`) and the print report (`components/print/`, `pages/print/_id.vue`) are shared between roles. They decide which fields appear through two global mixins:
- `plugins/view-job.js` → `viewJob`: the job of the car *owner* as seen by the viewer. A manager viewing an exclusive car gets `"exclusive"`, and `?as=` overrides it. Use `viewJob` for field visibility and `$auth.user.job` for viewer permissions.
- `plugins/service-fields.js` → `SERVICES` (the Arabic service names stored in `car.service`), `hasField(field, car)` and `isService(...)`. Every per-service rule for showing or hiding a form or report field goes in the `rules` map here, so the form and the printed report stay in sync. Add a rule there instead of writing `v-if` checks on service names in components.

### Frontend conventions
- Components are auto-imported (`components: true`).
- Styling uses Tailwind plus SCSS in `assets/scss/`.
- Global alerts go through the `store/alert.js` Vuex module.
- Code comments and UI strings mix Arabic and English. Service names are compared as exact Arabic strings, so don't normalise them (for example, `أ` vs `ا`).
