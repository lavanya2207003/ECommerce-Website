# LayaStore — Project Guide & Git Sync Workflow

## Project Structure

Monorepo with two apps, run together from the root:

- `backend/` — Express + MongoDB (Mongoose) API on port 5000 (`server.js`)
- `react-app/` — React 18 + Vite 5 + Tailwind CSS frontend on port 5173

## Commands

```powershell
# Run both backend + frontend (from repo root)
npm run dev

# Verify the frontend compiles
cd react-app; npx vite build

# Backend only
cd backend; npm run dev
```

- Backend API: http://localhost:5000/api/products (health check endpoint)
- Frontend: http://localhost:5173/shop
- MongoDB: local service `MongoDB`, database `laya_store` (URI in `backend/.env`)

## Architecture Notes

- Product data flows: `ShopPage (CatalogPages.jsx)` → `ProductContext.jsx` →
  `services/productAPI.js` → Vite proxy / direct to `localhost:5000` →
  `routes/productRoutes.js` → MongoDB.
- `ProductContext.jsx` has an offline fallback to `src/data.js` so the shop is
  never empty if the backend is down. Do not remove this behavior.
- Admin panel uses `/api/admin/*` routes with JWT auth
  (`middleware/auth.js`). Keep Admin and Shop on the same product source.
- Never commit `.env` files (they hold Mongo URI, Razorpay, Cloudinary,
  JWT secrets). `.gitignore` already excludes them.

## Git Workflow (MANDATORY for every code change)

1. Before changes: `git status`
2. Make the requested code changes normally.
3. After changes: `git status` to see modified files.
4. Review: `git diff` — do not commit unrelated changes.
5. Test when appropriate (`npm run dev`, or `npx vite build` in react-app).
6. Stage ONLY relevant files: `git add <files>` — never stage secrets,
   `node_modules/`, or `dist/`.
7. One meaningful commit per logical change:
   `git commit -m "<what changed>"`
8. Push: `git push origin main`
9. Verify: `git status` must show "nothing to commit, working tree clean"
   and branch up to date with `origin/main`.

If multiple related changes are requested in one task, test all of them and
ship ONE commit.

## Git Rules (never break these)

- Branch is always `main`. No new branches/repos unless explicitly requested.
- NEVER force push, `git reset --hard`, rewrite history, or overwrite remote.
- If a merge conflict occurs: STOP and explain it. Do not resolve by force.
- If GitHub auth fails: STOP and tell the user what authentication is needed.
- Do NOT push broken/untested code.
- Do NOT modify files just to create a commit.

## Report Format (after every completed change)

1. What was changed
2. Files changed
3. Whether the application was tested
4. Commit message
5. Whether the push to GitHub succeeded
6. Final Git status
