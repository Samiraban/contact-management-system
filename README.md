# Contact Management System

A JavaScript full-stack application with a React/Vite frontend, Express API, MongoDB database, and JWT-based administrator authentication.

## Requirements

- Node.js 20 or newer (LTS recommended)
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Configure the backend

Open `server/.env.example`, copy it to `server/.env`, and update the values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/contact_management_system
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1d
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
CLIENT_URL=http://localhost:5173
```

Use a strong, private `JWT_SECRET` and change the initial admin password before using the application. Do not commit `server/.env`.

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string and ensure your network access/IP allowlist permits your computer or server.

## 2. Install dependencies

From the project root:

```bash
npm install
```

## 3. Start the application

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

The server creates the administrator account from the `ADMIN_*` environment variables if that email does not already exist. It does not overwrite an existing administrator password.

## 4. Sign in

Use the email and password configured in `server/.env`.

## Production build

```bash
npm run build
npm start
```

The API runs on port 5000 by default. Deploy the frontend and API with the appropriate environment variables and configure the frontend API base URL if they are hosted on different domains.

## Features

- Administrator login with bcrypt password hashing and JWT authentication
- Protected dashboard and API routes
- Dashboard totals: all contacts, favourites, and unfavourites
- Add, view, edit, and delete contacts
- Mark contacts as favourite/unfavourite
- Search, pagination, and duplicate email/mobile prevention
- Server-side and client-side field validation
- Responsive admin layout and feedback messages

## Notes

- All contact fields are required except the favourite checkbox.
- Email addresses and mobile numbers are unique across contacts.
- Mobile numbers accept 7–15 digits, optionally prefixed with `+` and containing spaces, parentheses, or hyphens.
- The first administrator is seeded from environment variables. For security, change the password by updating the admin account through a future password-management feature or database administration; this starter intentionally does not expose public registration.
