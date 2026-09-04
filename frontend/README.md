# Custom Employee Portal

React frontend for the Custom Employee Portal. It uses custom JWT authentication and displays Zoho services according to the signed-in user's role.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The backend must be running at `http://localhost:5000`.

## Roles

- `SUPER_ADMIN`: all portal features and services
- `HR`: Zoho People
- `SALES`: Zoho CRM
- `SUPPORT`: Zoho Desk
- `FINANCE`: Zoho Books

Services are filtered in the dashboard and protected again by the backend API.
