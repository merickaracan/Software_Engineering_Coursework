# NoteBuddy

A full-stack note-sharing platform for students. Create, organise, and share notes by module, discover content from peers, and track engagement via a leaderboard.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Installation

Install all dependencies for the root, backend, and frontend in one command:

```bash
npm run install
```

---

## Running the Development Server

From the project root:

```bash
npm run dev
```

This starts both the backend (port **3000**) and frontend (port **5173**) concurrently. Open the **frontend link** printed in the terminal (e.g. `http://localhost:5173`) in your browser.

---

## Database Configuration

By default the app uses a **local SQLite database** — no setup required.

To switch to the **cloud MySQL database (Aiven)**:

1. Ensure the Aiven cloud database is running and accessible.
2. Open `backend/database/db.js` and set:
   ```js
   const localConnection = false;
   ```
3. Create a `backend/.env` file with the following variables:
   ```env
   DB_HOST=<your-aiven-host>
   DB_PORT=<your-aiven-port>
   DB_USER=<your-db-user>
   DB_PASS=<your-db-password>
   DB_NAME=<your-db-name>
   JWT_SECRET=<your-jwt-secret>
   CLIENT_URL=http://localhost:5173
   ```
4. Place the Aiven SSL certificate at `backend/database/ca.pem`.

To switch back to local SQLite, set `localConnection = true` in `db.js`.

---

## Environment Variables

| Variable     | Description                          | Required for cloud only |
|--------------|--------------------------------------|-------------------------|
| `DB_HOST`    | Aiven MySQL host                     | Yes                     |
| `DB_PORT`    | Aiven MySQL port                     | Yes                     |
| `DB_USER`    | Database username                    | Yes                     |
| `DB_PASS`    | Database password                    | Yes                     |
| `DB_NAME`    | Database name                        | Yes                     |
| `JWT_SECRET` | Secret key for signing JWT tokens    | Yes                     |
| `CLIENT_URL` | Frontend origin (for CORS)           | No (defaults to `http://localhost:5173`) |

---

## Testing

Run tests for both frontend and backend concurrently:

```bash
npm run test
```

Run tests in a specific workspace only:

```bash
# Backend (Jest)
npm run test --prefix backend

# Frontend (Vitest)
npm run test --prefix frontend
```

---

## Coverage Reports

Generate coverage reports for both frontend and backend:

```bash
npm run test:coverage
```

Open the generated HTML coverage reports in your browser (Windows):

```bash
npm run coverage:open
```

Coverage report locations:
- **Backend:** `backend/coverage/lcov-report/index.html`
- **Frontend:** `frontend/coverage/index.html`

> On macOS/Linux, open these files manually or replace `start` with `open` (macOS) or `xdg-open` (Linux) in the `coverage:open` script in the root `package.json`.

---

## Project Structure

```
/
├── package.json          # Root scripts (dev, test, coverage)
├── backend/
│   ├── index.js          # Server entry point (port 3000)
│   ├── app.js            # Express app & route mounting
│   ├── database/
│   │   ├── db.js         # Database selector (local vs cloud)
│   │   └── dbLocal.js    # SQLite connection
│   ├── middleware/
│   │   └── requireAuth.js
│   ├── routes/           # auth, notes, users, suggestions, files
│   ├── services/
│   │   └── userService.js
│   └── __tests__/        # Jest test suites
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx        # Root component & routing
    │   ├── pages/         # Login, Register, Dashboard, Notes, etc.
    │   ├── components/    # Shared UI components
    │   ├── api/           # Fetch helpers (auth, notes, users, suggestions)
    │   └── __tests__/     # Vitest test suites
    └── public/
```

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, TypeScript, Vite, Ant Design  |
| Backend   | Node.js, Express 5                      |
| Database  | SQLite (local) / MySQL via Aiven (cloud)|
| Auth      | JWT (HTTP-only cookies)                 |
| Testing   | Vitest (frontend), Jest (backend)       |
