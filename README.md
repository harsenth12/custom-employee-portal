# Custom Employee Portal

A full-stack employee portal with JWT authentication, role-based access control (RBAC), PostgreSQL persistence, audit logging, and Zoho People integration.

## Features

- Role-based login for Super Admin, HR, Sales, Support, and Finance users
- Dashboard service visibility based on the signed-in user's role
- Backend enforcement of protected routes and role permissions
- Super Admin user and role management
- Audit log inspection for authentication and administrative actions
- Zoho OAuth authorization with a single backend service account
- Zoho People employee retrieval for Super Admin and HR users

## Project structure

```text
backend/     Express API, PostgreSQL setup, authentication, RBAC, and Zoho integration
frontend/    React and Vite client application
```

## Prerequisites

- Node.js 18 or newer
- PostgreSQL 14 or newer
- A Zoho OAuth client if Zoho People integration is required

## Environment configuration

1. Copy `backend/.env.example` to `backend/.env`.
2. Set the PostgreSQL connection values and a long random `JWT_SECRET`.
3. Set the Zoho OAuth values. Keep the client secret, refresh token, database password, and JWT secret private.

Important variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port, normally `5000` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection |
| `JWT_SECRET` | Secret used to sign portal JWTs |
| `JWT_EXPIRES_IN` | JWT lifetime, for example `8h` |
| `ZOHO_CLIENT_ID` | Zoho OAuth client ID |
| `ZOHO_CLIENT_SECRET` | Zoho OAuth client secret |
| `ZOHO_REDIRECT_URI` | Must be `http://localhost:5000/api/zoho/callback` for local development |
| `ZOHO_REFRESH_TOKEN` | Offline Zoho service-account refresh token |

The Zoho OAuth client must use the same redirect URI configured in `.env`. The access and refresh tokens are kept in the backend service and are never sent to the browser.

## Database setup

Create a PostgreSQL database named `employee_portal`, then initialize it from the backend directory:

```bash
cd backend
npm install
npm run db:init
npm run db:roles
npm run db:admin
```

The seed command creates the demo Super Admin:

```text
Email:    superadmin@portal.com
Password: Admin@123
```

Change this password before using the application outside a demo environment.

## Run locally

Open two terminals from the project root.

Backend terminal:

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:5000`. Check it with `GET /` or `GET /test-db`.

Frontend terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://127.0.0.1:5173`.

For a production frontend build:

```bash
cd frontend
npm run build
```

## Zoho setup

1. Create an OAuth client in the Zoho API Console.
2. Add `http://localhost:5000/api/zoho/callback` as an allowed redirect URI.
3. Put the client ID and client secret in `backend/.env`.
4. Start the backend and open `http://localhost:5000/api/zoho/login` while signed in to Zoho.
5. Approve the `ZOHOPEOPLE.forms.READ` scope.
6. Copy the returned refresh token into `ZOHO_REFRESH_TOKEN` and restart the backend.

The backend refreshes short-lived access tokens when needed. The browser only receives portal data and never receives Zoho credentials.

## Role access

| Role | Dashboard service | Backend Zoho access |
| --- | --- | --- |
| `SUPER_ADMIN` | All configured services | Users, roles, audit logs, and employees |
| `HR` | Zoho People | Employees |
| `SALES` | Zoho CRM | No employee endpoint |
| `SUPPORT` | Zoho Desk | No employee endpoint |
| `FINANCE` | Zoho Books | No employee endpoint |

The frontend filters the dashboard for usability, while backend middleware enforces authorization independently.

## Important API routes

- `POST /api/auth/login`
- `GET /api/zoho/services` (authenticated)
- `GET /api/zoho/employees` (Super Admin or HR)
- `GET|POST /api/users` (Super Admin)
- `PUT|DELETE /api/users/:id` (Super Admin)
- `GET|POST /api/roles` (Super Admin)
- `PUT /api/roles/:id/permissions` (Super Admin)
- `GET /api/audit` (Super Admin)

Protected routes require `Authorization: Bearer <portal-jwt>`.

## Recording script: 3 to 5 minutes

Use this sequence for the required screen recording. Keep the application and a code editor visible, and narrate the text in your own voice.

**0:00-0:35, overview and login**

Start at the login screen. Sign in as the Super Admin, then briefly sign out and sign in as HR and Sales using seeded or prepared demo accounts. Point out that the dashboard changes with the user's role.

**0:35-1:35, RBAC dashboard behavior**

Show all services for Super Admin, Zoho People for HR, and Zoho CRM for Sales. Attempt to use an unauthorized employee request or restricted admin view and show that the backend rejects it. Explain that UI filtering is supplemented by `authenticateToken` and `requireRole` middleware.

**1:35-2:35, Zoho integration code**

Open `backend/src/services/zohoService.js` and `backend/src/routes/zohoRoutes.js`. Explain the authorization-code exchange, refresh-token flow, in-memory access token, environment-based client credentials, and the retry after token expiry. Show that the browser receives employee data, not the Zoho token.

**2:35-3:45, admin capabilities**

Return to the Super Admin session. Create or edit a user, assign a role, open role permissions, and inspect audit logs. Mention that administrative routes are protected by the Super Admin role and actions are recorded.

**3:45-4:00, close**

Show the project tree and README briefly, then summarize that the portal combines authentication, server-side RBAC, audited administration, and a backend-only Zoho service account.

## Publishing checklist

- Do not commit `backend/.env`, real credentials, access tokens, or database dumps.
- Run `npm run lint` and `npm run build` from `frontend`.
- Test backend startup and database initialization with non-production credentials.
- Create a **public** GitHub repository without adding an extra README.
- Record the demo, review the video for visible secrets, and upload it using the submission method required by your course or project brief.

## Production hosting with Render

The repository includes `render.yaml` for deploying the API and Vite frontend as a Render Blueprint. To avoid a paid Render database, use a free external PostgreSQL database from Supabase or Neon.

1. In Render, select **New > Blueprint** and connect `harsenth12/custom-employee-portal`.
2. Create a free PostgreSQL project in Supabase or Neon and note its host, port, database name, user, and password.
3. Review the two free Render services and create the Blueprint.
4. Set these API environment variables in the backend service:
	- `FRONTEND_URL`: the deployed frontend URL
	- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`: the external PostgreSQL values
	- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN`
	- `ZOHO_REDIRECT_URI`: `https://<api-host>/api/zoho/callback`
5. Set `VITE_API_URL` in the frontend service to the deployed API URL, without a trailing `/api`.
6. Add the same `ZOHO_REDIRECT_URI` to the Zoho OAuth client configuration.
7. After the database is available, run these commands once from the backend service shell or a local terminal configured with the production database variables:

```bash
npm run db:init
npm run db:roles
npm run db:admin
```

Change the seeded Super Admin password immediately after the first login. Never commit production environment files or OAuth credentials.