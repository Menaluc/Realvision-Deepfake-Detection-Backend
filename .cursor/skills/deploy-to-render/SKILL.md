---
name: deploy-to-render
description: >-
  Render deployment, readiness checks, verification, and troubleshooting for the
  realvision-backend repository (Express demo API with mock inference). Use when
  deploying to Render, reviewing deployment config, or debugging deploy/runtime
  issues for this repo only.
---

# Deploy realvision-backend to Render

## 1. When to use this skill

Use when the user or task involves:

- Deploying this repository to [Render](https://render.com/)
- Verifying the service is Render-ready (build/start, `PORT`, health checks)
- Debugging deploy failures, crashes, or wrong URLs after deploy
- Deciding what **not** to change for deployment (guardrails)

Do **not** use this skill to invent architecture: follow only what exists in this repo.

## 2. What this project is (as of this repo)

- **Small Node.js backend demo**, not a full production ML platform.
- **Express** (`express` ^5.2.1) with **Multer** for video uploads.
- **Mock inference only**: `src/services/inference.service.js` returns randomized demo JSON (`prediction` as `real`/`fake`, confidence in a demo range). No Python process or ML runtime is required for the app to work.
- **Static demo UI** from `public/` (`GET /` serves `public/index.html`; `GET /demo` also serves the same static tree under `/demo`).
- **No database** in the codebase.
- **No Docker** files in the repo root (no `Dockerfile` to rely on unless the user adds one later).

## 3. Deployment-relevant structure (actual paths)

Relevant layout for Render:

```text
package.json              # scripts: start, dev
package-lock.json         # lockfile present
src/
  server.js               # HTTP server entry (listens on config.port)
  app.js                  # Express app: routes, static, error middleware
  config/index.js         # port, upload limits, uploads directory
  routes/predict.routes.js
  controllers/predict.controller.js
  services/inference.service.js
  middleware/error.middleware.js
  utils/file.utils.js
public/                   # frontend assets for /
uploads/                  # runtime upload dir (gitignored); ephemeral on Render
```

Ignore for **runtime** deployment needs (not required to serve the app): `images/`, `RealVision Backend API - Demo.html`, `RealVision Backend API - Demo_files/`.

## 4. Files to inspect for Render readiness

| File | Why |
|------|-----|
| `package.json` | Must expose **`start`**: `"node src/server.js"`. Dependencies: `express`, `multer`. |
| `src/config/index.js` | **`port`**: must use `process.env.PORT` (Render sets this). |
| `src/server.js` | Binds `http.createServer(app)` to `config.port`. |
| `src/app.js` | Routes and static files; confirm no missing paths for production. |
| `.gitignore` | `node_modules/`, `uploads/`, `.env` — expect fresh `npm install` on Render; uploads are not persisted by default. |

Do **not** assume extra services or env files unless the user adds them.

## 5. Build / start expectations (Render)

- **Root directory**: repository root (single `package.json` — not a monorepo).
- **Service type**: Render **Web Service**.
- **Deploy flow**: connect GitHub repo, set Build Command and Start Command, then Render auto-deploys on push.
- **Build Command**: `npm install` (or leave default if Render detects Node and installs from `package-lock.json`).
- **Start Command**: `npm start` → `node src/server.js` (preferred over custom commands unless the user overrides intentionally).
- **No custom build step** is defined in `package.json` beyond install; no compile step.

If the user changes `start`, keep it aligned with `main` / actual entry: **`src/server.js`**.

## 6. Runtime expectations

- The process must **listen on `process.env.PORT`** (wired via `src/config/index.js`). Default local fallback is `3000`.
- **Ephemeral filesystem**: `uploads/` is used for temporary Multer storage; Render disk is not durable across restarts/redeploys. The demo **deletes** the file after handling (`unlinkQuietly` in `src/utils/file.utils.js`). Do not assume persistent user files without external storage.
- **Request size**: uploads capped at **50 MB** (`config.maxFileSize`). Larger uploads will fail with Multer / route behavior as today.
- **Endpoints** (for smoke tests):
  - `GET /` — HTML demo
  - `GET /api/health` — JSON: `{ "message": "RealVision API running" }`
  - `POST /api/predict` — multipart field **`video`**, video MIME types only

## 7. Environment variables

**Required for Render:** none beyond what Render provides (**`PORT`** is set automatically).

**Optional / future** (not referenced in current code unless added later): any custom vars should be documented in README if introduced. Current `src/config/index.js` only uses:

- `PORT` — via `process.env.PORT || 3000`

Do **not** tell the user to set `PYTHON_PATH` or ML-related vars for the **current** mock inference.

## 8. Deployment verification checklist

After deploy:

1. Open the Render **public URL** + `/api/health` → expect **200** and JSON message above.
2. Open `/` → demo page loads (static + Express).
3. From the UI or `curl`, **`POST /api/predict`** with a small video → **200** and `prediction` / `confidence` fields (mock values in demo range).
4. Confirm logs show **no crash** on boot (e.g. “Server running on ...” with Render’s injected port).
5. If the service is on a free tier, account for **cold starts/sleep** after inactivity before first response.
6. Remember: **uploads are temporary**; do not expect files to remain on disk.

## 9. Troubleshooting (common, repo-specific)

| Symptom | Likely cause | What to check |
|---------|----------------|---------------|
| App exits immediately / “listening” wrong port | Not binding to `PORT` | `src/config/index.js` and `src/server.js` |
| 404 on `/` | Wrong service root or static path | `src/app.js`, `public/index.html` exists |
| Health works, predict fails | Wrong field name or non-video | Field must be **`video`**; MIME must start with `video/` |
| 413 / “File is too large” | Multer limit | `config.maxFileSize` (50 MB) |
| “Cannot GET …” for API | Wrong path | API is under **`/api/...`** (e.g. `/api/predict`, `/api/health`) |
| Build fails | Missing lockfile or Node version | `package-lock.json`, Render Node version settings |
| First request is slow / timeout after idle | Free tier cold start | Wait for spin-up, then retry `/api/health` |

## 10. Guardrails — do not over-change deployment

Unless the user explicitly asks:

- **Do not** add a database, Redis, auth, or background workers “for Render.”
- **Do not** add Docker, docker-compose, or split into multiple Render services by default.
- **Do not** assume Python or GPU; inference in **`src/services/inference.service.js`** is mock-only in Node unless the user adds a real ML stack.
- **Do not** redesign folders or add repositories/models “for deploy.”
- **Do not** commit production secrets; `.env` is gitignored — use Render **Environment Variables** if needed later.
- Prefer **minimal** changes: correct `PORT`, reliable `start`, and accurate health/upload tests.

This skill reflects **only** the current **realvision-backend** repository: a **single Express service** with **mock inference** and a **static demo frontend**.
