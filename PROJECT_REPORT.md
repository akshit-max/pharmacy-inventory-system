# PharmaSys – Project Check & Fix Report

**Date:** 16 Oct 2026  **Branch:** `main` (pulled latest – already up to date at `5abb0e1`)

## 1. Summary

| | Before | After |
| --- | --- | --- |
| Backend API test (49 checks, fresh database) | **1 / 41 passed** – no account could be created | **49 / 49 passed** |
| Browser walkthrough (26 checks, real Edge browser) | not possible (no login) | **26 / 26 passed, 0 runtime errors** |
| Frontend lint (`npm run lint`) | 11 problems | **0 problems** |
| Frontend build (`npm run build`) | passes | passes |

**Verdict:** The project was **not complete** – a fresh install could not sign up, so nothing else was reachable, and
purchases/sales crashed on a normal local MongoDB. All modules now work end to end:
Signup/Login → Users → Suppliers → Medicines → Purchases → Inventory → Sales (FEFO billing) → Dashboard,
Expiry Risks, Smart Reorder, Audit Trail.

Testing was done on a throw-away in-memory MongoDB, **not** on the database in `backend/.env`.

## 2. Critical bugs fixed (app could not be used)

| # | Problem | Fix |
| --- | --- | --- |
| 1 | `models/user.js` called `next()` in the password hook. Mongoose 9 no longer passes `next`, so **every signup failed** ("next is not a function"). | Hook rewritten as a plain `async` function. |
| 2 | Purchases and sales used MongoDB **transactions**, which crash on a normal local MongoDB ("only allowed on a replica set"). | Removed transactions. Code now **validates every item first, then saves** – easier to read and works on any MongoDB. A failed sale never changes stock (tested). |
| 3 | No way to create an Admin from the app (signup always made a Cashier; `setup-admin` needed Postman). No way to create Pharmacists at all. | **First signup becomes Admin.** New Admin-only **Users page** + API to create users, change roles, delete users. |
| 4 | Cashier logged in → sent to Dashboard → 403 → page **crashed to a blank screen**. | Each role is sent to a page it can use; Dashboard shows an error message instead of crashing. |

## 3. Other bugs fixed

**Backend**
- `batchController`: `res.satus(...)` typos (crash); `/api/batches/medicine/:id` and `/api/inventory/medicine/:id` were wired to the wrong functions (returned everything).
- `/api/dashboard` had **no login check** – anyone could read revenue.
- Login was case-sensitive on email (`Asha@x.com` failed).
- Medicine search crashed on special characters like `(`; invalid IDs returned 500 instead of 400; validation errors on update returned 500.
- Deleting a medicine with stock, or a supplier with purchases, left broken "Unknown medicine" records → now blocked with a clear message.
- Purchases accepted text/negative quantities and duplicate invoice numbers (returned 500) → proper 400 messages.
- Dashboard "low stock" ignored medicines with no stock at all; Inventory summary counted expired stock as available.
- Typos: `ADJUSMENT` → `ADJUSTMENT`, `refernceId` → `referenceId`, "lenght", "Unitis", "failde".
- `npm start` used nodemon (dev tool, breaks deployment) → `npm start` = node, `npm run dev` = nodemon.
- Unknown API routes / bad JSON now return a clear JSON message.

**Frontend**
- Navbar showed every page to every role → links now filtered by role; Login/Sign up shown when logged out; no longer wraps at laptop widths.
- Pages now enforce roles (e.g. Cashier opening `/dashboard` sees "no permission" instead of a broken page).
- Footer linked to 5 pages that don't exist (`/reports`, `/help`, …) → fixed links, removed fake newsletter form; branding unified to "PharmaSys".
- Home page was locked behind login while showing a Login button → now a public landing page.
- Added a 404 page.
- **Purchases:** added **Purchase History** (was missing); expired stock can no longer be entered; Pharmacists see history only.
- **Sales:** shows **stock available and price** while billing, blocks adding more than in stock, shows **estimated total** before completing.
- **Medicines:** delete errors are now shown; Edit/Delete hidden for Cashiers. Form now has **Safety Stock** and **Supplier Lead Time** (used by Smart Reorder, previously not editable).
- **Suppliers:** edit sent internal fields (`_id`, timestamps) and caused React warnings → fixed; buttons hidden for non-Admins.
- **Inventory:** rewritten from 2,000-character one-line JSX into normal readable code.
- All pages: consistent, simple data-loading pattern (fixes the 10 lint errors); page title "frontend" → "PharmaSys".
- About page claimed "ACID transactions / Atlas replica set" → updated to match the real code.

## 4. Files

- **New:** `frontend/src/pages/Users.jsx`, `frontend/src/pages/NotFound.jsx`, `frontend/src/utils/auth.js` (small login/role helpers)
- **Changed:** 19 backend files, 18 frontend files, `README.md` (setup steps + roles table)
- **Removed API:** `POST /api/auth/setup-admin` (replaced by "first signup = Admin")

## 5. How to run & demo

```bash
cd backend  && npm install && npm run dev      # needs backend/.env (PORT, MONGO_URI, JWT_SECRET)
cd frontend && npm install && npm run dev      # http://localhost:5173
```

1. **Sign up** – first account is the **Admin**.
2. **Suppliers** → add one. **Medicines** → add one.
3. **Purchases** → buy stock (batch, expiry, prices). Inventory updates automatically.
4. **Users** → create a Cashier. Log in as Cashier → **Sales** → bill a customer (receipt shows FEFO pricing).
5. Back as Admin: **Dashboard**, **Expiry Risks**, **Smart Reorder**, **Audit Trail**.

## 6. Notes / not changed

- If your existing database already has users, the "first signup = Admin" rule won't apply – use an existing Admin account.
- Batch edit/create APIs exist in the backend but have no page (stock is added through Purchases, which is the normal workflow).
- No automated test files were added to the repo; the test scripts used for this report were run separately.
- Changes are **not committed** yet.
