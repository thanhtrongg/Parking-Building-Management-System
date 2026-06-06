# Parking Building Management System

A full-stack parking building management system for managing users, parking zones, parking slots, reservations, parking sessions, payments, vehicle types, pricing policies, and role-based workflows.

The current `main` branch uses:

- Backend: Node.js, Express.js, Prisma ORM, PostgreSQL
- Frontend: React, Vite, Tailwind CSS
- Authentication: JWT with role-based access control

There is no Java backend in `main`.

## Features

### Authentication

- Login with JWT authentication
- Sign up for user accounts
- Remember me support with longer token lifetime
- Current-user lookup via protected API
- Protected frontend routes
- Role-based backend middleware

### User Features

- User dashboard connected to real API data
- View reservation summary
- Book an available parking slot
- Search available slots by vehicle type and reservation time
- Create reservation from available slots
- View booking history on a separate page
- User settings page

### Admin and System Features

- System dashboard connected to API data
- Parking slot management
- Parking session management
- Reservation management
- Payment management
- Vehicle type management
- Zone management
- Pricing policy management
- User management

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- Three.js / React Three Fiber for visual landing page elements

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- CORS
- dotenv

### Database

The Prisma schema currently includes:

- `users`
- `vehicle_types`
- `zones`
- `parking_slots`
- `reservations`
- `parking_sessions`
- `payments`
- `feedbacks`
- `pricing_policies`
- `system_configs`

## Project Structure

```text
Parking-Building-Management-System/
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- migrations/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   `-- server.js
|   |-- package.json
|   `-- package-lock.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |   |-- auth/
|   |   |   |-- public/
|   |   |   |-- system/
|   |   |   `-- user/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- package-lock.json
|-- .gitignore
|-- LICENSE
`-- README.md
```

## Main API Groups

Backend base URL:

```text
http://localhost:5000
```

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Login and return JWT |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/auth/logout` | Logout current user |

### Parking Slots

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/parking-slots` | List parking slots |
| `GET` | `/api/parking-slots/available-for-reservation` | List available slots for booking |
| `POST` | `/api/parking-slots` | Create parking slot |
| `PUT` | `/api/parking-slots/:id` | Update parking slot |
| `DELETE` | `/api/parking-slots/:id` | Delete parking slot |

### Reservations

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/reservations` | List reservations |
| `GET` | `/api/reservations/:id` | Get reservation detail |
| `POST` | `/api/reservations` | Create reservation |
| `PUT` | `/api/reservations/:id` | Update reservation |
| `DELETE` | `/api/reservations/:id` | Delete reservation |

### Parking Sessions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/parking-sessions` | List parking sessions |
| `GET` | `/api/parking-sessions/:id` | Get parking session detail |
| `POST` | `/api/parking-sessions/check-in` | Check in a vehicle |
| `PUT` | `/api/parking-sessions/:id/checkout` | Check out a vehicle |

### Other API Groups

- `/api/vehicle-types`
- `/api/zones`
- `/api/pricing-policies`
- `/api/payments`
- `/api/users`
- `/api/test-db`

## Frontend Pages

Frontend dev URL:

```text
http://localhost:5173
```

### Public and Auth

- Public landing page
- Login page
- Sign up page

### User

- User dashboard
- Book slot page
- Booking history page
- Settings page

### System

- Dashboard
- Parking slots
- Parking sessions
- Reservations
- Payments
- Vehicle types
- Zones
- Pricing policies
- Users

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/parking_management"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="1d"
PORT=5000
```

Create or update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

Test database connection:

```text
GET http://localhost:5000/api/test-db
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend should run at:

```text
http://localhost:5173
```

### Production Build

```bash
cd frontend
npm run build
```

## Development Notes

- `main` is currently the Node.js backend branch.
- Java backend files should not be committed to `main`.
- Frontend API calls are centralized in `frontend/src/services/api.js`.
- Backend route registration starts from `backend/src/server.js`.
- Prisma database models are defined in `backend/prisma/schema.prisma`.

## Commit Style

Use short conventional commit messages:

```bash
feat: add user reservation flow
fix: update parking slot display
docs: refresh project readme
```

## Project Status

The project is under active development. Core authentication, user booking flow, admin/system pages, and main API integrations are in place. CRUD and role-based workflows continue to be expanded as the project evolves.
