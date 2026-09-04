# Custom Employee Portal API

Express API for portal authentication, RBAC, audit logging, PostgreSQL persistence, and Zoho People integration.

## Requirements

- Node.js 18+
- PostgreSQL 14+
- Zoho account with an OAuth client created in the Zoho API Console

## Setup

1. Create a PostgreSQL database named `employee_portal`.
2. Copy `.env.example` to `.env` and set the database, JWT, and Zoho values. Never commit `.env`.
3. Install dependencies and initialize the database:

```bash
npm install
npm run db:init
npm run db:roles
npm run db:admin
```

The demo Super Admin is `superadmin@portal.com` / `Admin@123`. Change this password before non-demo use.

## Start

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Health check: `GET /`.

## Zoho OAuth

Set the Zoho OAuth redirect URI to exactly `http://localhost:5000/api/zoho/callback`. While signed into Zoho, open `http://localhost:5000/api/zoho/login`, approve the People read scope, and return to the portal. The backend refreshes the service token and does not send it to the browser.

## API surface

- `POST /api/auth/login`
- `GET /api/dashboard/stats` (authenticated)
- `GET|POST /api/users` (Super Admin)
- `PUT|DELETE /api/users/:id` (Super Admin)
- `GET|POST /api/roles` (Super Admin)
- `GET /api/roles/permissions` (Super Admin)
- `PUT /api/roles/:id/permissions` (Super Admin)
- `GET /api/audit` (Super Admin)
- `GET /api/zoho/employees` (Super Admin or HR)

Protected routes require `Authorization: Bearer <portal-jwt>`. JWTs expire according to `JWT_EXPIRES_IN`; login and administrative actions are written to `audit_logs`.
