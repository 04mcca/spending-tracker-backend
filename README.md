# Spending Tracker Backend

Minimal Node.js + Express backend using Supabase for storage.

Files:
- `server.js` - Express server with the API endpoints
- `.env.example` - example environment variables

Requirements:
- Node.js (16+)
- A Supabase project with a table named `expenses`:
  - columns: `id`, `amount`, `shop`, `category`, `payment_method`, `created_at`

Install dependencies:

```bash
cd spending-tracker-backend
npm install
```

Exact npm install command (if starting from parent folder):

```bash
npm install express cors dotenv @supabase/supabase-js
npm install --save-dev nodemon
```

Run locally (development):

```bash
# copy .env.example to .env and fill values
cp .env.example .env
# edit .env and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Run production (example):

```bash
# start the server
npm start
```

API examples (replace host/port as needed):

POST /api/expenses

curl example:

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount":4.5,"shop":"Greggs","category":"Food","paymentMethod":"Apple Pay"}'
```

GET /api/expenses

```bash
curl http://localhost:3000/api/expenses
```

Postman: create requests matching the above `POST` and `GET` endpoints and use `raw` JSON body for POST.

Where to put Supabase credentials:
- `SUPABASE_URL`: your project URL from the Supabase dashboard (Settings → API → Project URL). Put this in `.env` as `SUPABASE_URL`.
- `SUPABASE_SERVICE_ROLE_KEY`: the Service Role key from Supabase (Settings → API → Service Key). This key **must not** be exposed to clients; keep it in your server environment only. Put this in `.env` as `SUPABASE_SERVICE_ROLE_KEY`.

How to verify inserts:
1. After a successful POST, check the response JSON — it returns the inserted row.
2. Open the Supabase dashboard → Table Editor → `expenses` and verify the new row appears (created_at should be populated).
3. You can also query via Supabase SQL editor: `select * from expenses order by created_at desc limit 10;`.

Render deployment (quick guide)

1. Create a new Web Service on Render and connect your GitHub repository `04mcca/spending-tracker-backend`.
2. Branch: `main` (or your chosen branch).
3. Build Command: leave empty or use `npm install` (Render will install by default).
4. Start Command: `npm start`.
5. Environment Variables (set in Render dashboard -> Environment):
  - `SUPABASE_URL` = https://your-project.supabase.co
  - `SUPABASE_SERVICE_ROLE_KEY` = service_role_xxx
  - Optional: `FRONTEND_URL` = https://your-frontend.vercel.app

Important: never commit `SUPABASE_SERVICE_ROLE_KEY` to the repo. Use Render's environment settings.

Redeploys: Render auto-deploys on pushes to the connected branch. You can also trigger manual deploys from the Render dashboard.

Security and notes:
- Keep the Supabase service role key server-side only; do not expose it to clients.
- Configure `FRONTEND_URL` on the server and use it to restrict CORS.
- This setup is compatible with Render's free tier for small hobby projects.
# Spending Tracker Backend
