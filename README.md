<div align="center">
  <h1>ParkMaster Building System</h1>
  <p><strong>Smart parking operations, from reservation to checkout.</strong></p>
  <p>
    A full-stack parking building management platform with live slot availability,
    QR check-in, parking sessions, SePay payments, role-based dashboards, and a
    Gemini-powered assistant.
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
    <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js and Express 5" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Gemini-3.1_Flash--Lite-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" alt="Gemini 3.1 Flash-Lite" />
    <img src="https://img.shields.io/badge/QR-Check--in-17140F?style=flat-square" alt="QR Check-in" />
    <img src="https://img.shields.io/badge/Payment-SePay-00A651?style=flat-square" alt="SePay" />
    <img src="https://img.shields.io/badge/Theme-Light_%2F_Dark-D7B46A?style=flat-square" alt="Light and Dark Theme" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
  </p>

  <p>
    <a href="#main-features"><strong>Features</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="#quick-start"><strong>Quick Start</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="#environment-variable-reference"><strong>Environment</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="#database-commands"><strong>Database</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="#troubleshooting"><strong>Troubleshooting</strong></a>
  </p>
</div>

---

## Main Features

- Public landing page with live parking availability and pricing
- Shared light/dark theme across landing, authentication, and dashboards
- JWT authentication with `ADMIN`, `MANAGER`, `STAFF`, and `USER` roles
- Automatic slot availability refresh while users change booking options
- Reservation QR codes containing the reservation and license plate
- Staff QR/manual check-in and parking session management
- Checkout, fee calculation, payment records, and SePay QR payments
- Parking slot, zone, vehicle type, pricing, user, and feedback management
- Gemini AI assistant available from the landing page through authenticated pages

## AI Assistant

The ParkMaster Assistant uses `gemini-3.1-flash-lite` by default. It can:

- Explain parking prices
- Estimate parking fees by vehicle type and duration
- Check a parking slot when the user provides its exact code
- Show a user's own recent reservations and sessions after login
- Show an operational summary to authorized system roles

Database information is retrieved by the backend and filtered by role before it
is sent to Gemini. The model does not receive unrestricted database access. If
Gemini is unavailable or the API quota is exceeded, the assistant uses a local
fallback for core lookup features.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite 5, Tailwind CSS, React Router, Framer Motion, Three.js |
| Backend | Node.js, Express 5, Prisma ORM |
| Database | PostgreSQL |
| Authentication | JWT, bcryptjs |
| AI | Google Gemini API |
| Payment | SePay QR and webhook integration |

## Prerequisites

Install these tools before starting:

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer
- Git
- Optional: PostgreSQL `psql` command-line tool for importing sample data

Verify the main tools:

```bash
node -v
npm -v
psql --version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/thanhtrongg/Parking-Building-Management-System.git
cd Parking-Building-Management-System
```

### 2. Create the PostgreSQL Database

Using `psql`:

```sql
CREATE DATABASE parking_management;
```

Or create a database named `parking_management` using pgAdmin.

The migration creates the required `uuid-ossp` extension. The PostgreSQL user in
`DATABASE_URL` must have permission to create extensions and database objects.

### 3. Configure Backend Environment Variables

Create `backend/.env` from the example file.

PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

Bash:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d

DATABASE_URL="postgresql://postgres:your_password@localhost:5432/parking_management?schema=public"

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite

SEPAY_BANK_CODE=
SEPAY_ACCOUNT_NUMBER=
SEPAY_ACCOUNT_NAME=
SEPAY_WEBHOOK_API_KEY=
```

See [Environment Variable Reference](#environment-variable-reference) for
detailed instructions.

### 4. Configure Frontend Environment Variables

Create `frontend/.env`:

PowerShell:

```powershell
Copy-Item frontend\frontend.env.example frontend\.env
```

Bash:

```bash
cp frontend/frontend.env.example frontend/.env
```

Default content:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Install Dependencies and Prepare the Database

Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
node src/seedUser.js
```

The seed command creates the default administrator:

```text
Email: admin@gmail.com
Password: 123456
```

Frontend:

```bash
cd ../frontend
npm install
```

### 6. Run the Application

Open two terminals.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Database test: `http://localhost:5000/api/test-db`

## Environment Variable Reference

### Backend: `backend/.env`

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Backend HTTP port. Defaults to `5000`. |
| `DATABASE_URL` | Yes | `postgresql://postgres:password@localhost:5432/parking_management?schema=public` | Prisma/PostgreSQL connection string. |
| `JWT_SECRET` | Yes | A long random string | Signs login tokens and reservation QR tokens. Never commit this value. |
| `JWT_EXPIRES_IN` | No | `1d` | Default login token lifetime. Remember-me sessions use 30 days. |
| `GEMINI_API_KEY` | Recommended | Google AI Studio key | Enables natural-language AI responses. Core assistant lookups still have a local fallback without it. |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-lite` | Gemini model API ID. |
| `SEPAY_BANK_CODE` | Only for SePay | `MBBank` | Bank code used to generate SePay QR images. |
| `SEPAY_ACCOUNT_NUMBER` | Only for SePay | `0123456789` | Bank account that receives payments. |
| `SEPAY_ACCOUNT_NAME` | No | `PARKMASTER` | Account name displayed with payment information. |
| `SEPAY_WEBHOOK_API_KEY` | Recommended for SePay | Secret from SePay | Validates incoming SePay webhook requests. |

#### PostgreSQL Passwords with Special Characters

Percent-encode special characters inside `DATABASE_URL`.

Examples:

| Character | Encoded value |
| --- | --- |
| `@` | `%40` |
| `#` | `%23` |
| `/` | `%2F` |
| `:` | `%3A` |
| `%` | `%25` |

For password `Abcd1234@`, use:

```env
DATABASE_URL="postgresql://postgres:Abcd1234%40@localhost:5432/parking_management?schema=public"
```

#### Gemini Setup

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create or select a Google Cloud project.
3. Create an API key.
4. Add it only to `backend/.env`:

```env
GEMINI_API_KEY=your-private-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

5. Restart the backend whenever `.env` changes.

The key must never be added to `backend/.env.example`, frontend files, commits,
screenshots, or group messages.

To confirm Gemini is active, ask the chatbox a question. A successful backend
response uses:

```json
{
  "source": "gemini"
}
```

When Gemini cannot be called, the response uses `"source": "local"`.

#### SePay Setup

For real SePay integration:

1. Configure the receiving bank account in SePay.
2. Put the bank code, account number, and account name in `backend/.env`.
3. Create a SePay webhook pointing to:

```text
https://your-public-backend/api/payments/sepay/webhook
```

4. Configure the same API key in SePay and `SEPAY_WEBHOOK_API_KEY`.

SePay cannot call a localhost webhook directly. For local testing, system roles
can use the existing sandbox simulation endpoint:

```text
POST /api/payments/sepay/sandbox/simulate
```

### Frontend: `frontend/.env`

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | Recommended | `http://localhost:5000` | Base URL of the backend API. |

For deployment, set this to the public backend URL:

```env
VITE_API_URL=https://api.example.com
```

Vite embeds `VITE_*` variables into the frontend build. Never place secrets,
private API keys, database passwords, or JWT secrets in frontend environment
variables.

## Database Commands

Generate the Prisma client:

```bash
cd backend
npx prisma generate
```

Apply committed migrations:

```bash
npx prisma migrate deploy
```

Create a migration while developing schema changes:

```bash
npx prisma migrate dev --name describe_your_change
```

Open Prisma Studio:

```bash
npx prisma studio
```

### Optional Sample Data

`backend/parking_management_data.sql` contains data for local demonstrations.
It truncates existing application tables before importing, so do not run it on
a database containing important data.

PowerShell:

```powershell
psql -U postgres -d parking_management -f backend\parking_management_data.sql
```

Bash:

```bash
psql -U postgres -d parking_management -f backend/parking_management_data.sql
```

Run migrations before importing the sample data.

## Useful Commands

Backend:

```bash
cd backend
npm run dev
npm start
npx prisma generate
npx prisma migrate deploy
node src/seedUser.js
```

Frontend:

```bash
cd frontend
npm run dev
npm run lint
npm run build
npm run preview
```

## Main Application Flows

### Reservation and QR Check-in

1. A user selects a vehicle type, date, time, slot, and license plate.
2. Available slots refresh automatically when booking choices change.
3. The reservation is confirmed and its QR code stores reservation details and
   the license plate.
4. Staff scans the QR code or checks the reservation manually.
5. Check-in creates a parking session and fills the correct license plate.

### Parking Session and Checkout

1. Staff manages active sessions on the Parking Sessions page.
2. The session detail displays the license plate, slot, customer, and pricing.
3. Checkout calculates the fee from actual entry time to exit time.
4. Payment is recorded and the slot becomes available again.

## Main API Groups

| Group | Base path |
| --- | --- |
| Authentication | `/api/auth` |
| AI Assistant | `/api/assistant` |
| Public landing data | `/api/public` |
| Reservations | `/api/reservations`, `/api/user/reservations` |
| Parking slots | `/api/parking-slots` |
| Parking sessions | `/api/parking-sessions`, `/api/user/parking-sessions` |
| Payments and SePay | `/api/payments` |
| Pricing policies | `/api/pricing-policies` |
| Vehicle types | `/api/vehicle-types` |
| Zones | `/api/zones` |
| Feedback | `/api/feedbacks`, `/api/user/feedbacks` |
| Users | `/api/users` |

## Project Structure

```text
Parking-Building-Management-System/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- App.jsx
|   |-- frontend.env.example
|   `-- package.json
`-- README.md
```

## Troubleshooting

### Backend cannot connect to PostgreSQL

- Confirm PostgreSQL is running.
- Confirm the database exists.
- Verify username, password, port, and database name in `DATABASE_URL`.
- Percent-encode special characters in the password.
- Test with `http://localhost:5000/api/test-db`.

### Prisma migration cannot create `uuid-ossp`

Connect using a PostgreSQL role with extension privileges, then run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Run `npx prisma migrate deploy` again.

### AI chat always uses local responses

- Confirm `GEMINI_API_KEY` exists in `backend/.env`.
- Confirm `GEMINI_MODEL=gemini-3.1-flash-lite`.
- Restart the backend after editing `.env`.
- Check API quota and model access in Google AI Studio.

### Frontend cannot reach the backend

- Confirm the backend is running on port `5000`.
- Confirm `frontend/.env` contains the correct `VITE_API_URL`.
- Restart Vite after changing `frontend/.env`.

### Port is already in use

Change backend `PORT` and update frontend `VITE_API_URL` to the same port.

## Security Notes

- `.env` files are ignored by Git and must remain private.
- Rotate any key immediately if it appears in Git history or a public message.
- Use a long random `JWT_SECRET` outside local development.
- Configure `SEPAY_WEBHOOK_API_KEY` before exposing the webhook publicly.
- Do not use the default administrator password in production.

## License

This project is licensed under the terms included in [LICENSE](LICENSE).
