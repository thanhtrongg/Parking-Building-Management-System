<div align="center">
  <h1>Parking Building Management System</h1>
  <hr />
  <h3>Smart full-stack parking operations for reservations, live sessions, payments, feedback, and role-based management.</h3>
  <p>
    Manage multi-zone parking buildings with confirmed reservations, real check-in/check-out sessions, automatic fee calculation, printable receipts, and separate user/system workflows.
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Express" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
  <p>
    <a href="#getting-started">Quick Start</a>
    &nbsp;•&nbsp;
    <a href="#core-features">Features</a>
    &nbsp;•&nbsp;
    <a href="#main-api-groups">API</a>
    &nbsp;•&nbsp;
    <a href="#project-structure">Structure</a>
  </p>
</div>

## Project Overview

The application is designed around two main workspaces:

- **User workspace**: customers can book parking slots, track active parking sessions, view completed sessions, manage booking history, submit feedback, and update account settings.
- **System workspace**: administrators, managers, and staff can manage reservations, check vehicles in and out, monitor sessions, handle payments, manage slots/zones/vehicle types/pricing policies, and review feedback.

The latest parking flow uses confirmed reservations by default. Payment is handled when a parking session ends, not when the user books a slot.

## Core Features

### Authentication and Roles

- JWT-based login and protected API access
- User registration
- Role-based route protection
- Separate user and system layouts
- Admin, manager, staff, and user workflows

### User Features

- Book parking slots by vehicle type and time range
- Reservations are automatically confirmed
- View booking history
- Track active parking sessions after staff check-in
- View completed parking sessions after checkout and payment
- See actual assigned slot if staff moves the vehicle to another available slot
- Submit feedback for bookings/sessions
- Manage account settings

### System Features

- Dashboard overview for parking activity
- Reservation management
- Real check-in flow that creates parking sessions
- Checkout flow that calculates parking fees and records payment
- Parking slot management
- Parking session management
- Payment management with detail modal and printable receipts
- Vehicle type management
- Zone management
- Pricing policy management
- User management
- Feedback review and reply workflow

## Parking Session Flow

1. User books a parking slot.
2. Reservation is created as `CONFIRMED`.
3. Staff checks in the vehicle when the customer arrives.
4. A real parking session starts at the actual check-in time.
5. If the reserved slot is occupied, staff can assign another available slot.
6. Parking fee is calculated from actual check-in time to checkout time.
7. Staff checks out the vehicle and records payment.
8. Parking session becomes `COMPLETED`.
9. Related reservation becomes `COMPLETED`.
10. The occupied slot becomes `AVAILABLE` again.

## Languages and Tools

:hammer_and_wrench: Languages and tools used in this project:
<div>
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" title="JavaScript" alt="JavaScript" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" title="HTML5" alt="HTML5" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" title="CSS3" alt="CSS3" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" title="Node.js" alt="Node.js" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" title="Express.js" alt="Express.js" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" title="React" alt="React" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" title="Vite" alt="Vite" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" title="Tailwind CSS" alt="Tailwind CSS" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/threejs/threejs-original.svg" title="Three.js" alt="Three.js" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/prisma/prisma-original.svg" title="Prisma" alt="Prisma" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" title="PostgreSQL" alt="PostgreSQL" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/npm/npm-original-wordmark.svg" title="npm" alt="npm" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" title="Git" alt="Git" width="44" height="44"/>
</div>

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- Three.js / React Three Fiber

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- CORS
- dotenv

### Database Models

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
|   |   |-- services/
|   |   `-- server.js
|   |-- package.json
|   `-- package-lock.json
|-- frontend/
|   |-- public/
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
|-- LICENSE
`-- README.md
```

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/parking_management"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="1d"
PORT=5000

SEPAY_BANK_CODE=""
SEPAY_ACCOUNT_NUMBER=""
SEPAY_ACCOUNT_NAME=""
SEPAY_WEBHOOK_API_KEY=""
```

Create `frontend/.env`:

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

Backend default URL:

```text
http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

### Production Build

```bash
cd frontend
npm run build
```

## Main API Groups

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/auth/logout` | Logout current user |

### Reservations

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/reservations` | List reservations |
| `GET` | `/api/reservations/:id` | Get reservation detail |
| `POST` | `/api/reservations` | Create confirmed reservation |
| `PUT` | `/api/reservations/:id` | Update reservation |
| `DELETE` | `/api/reservations/:id` | Cancel reservation |

### Parking Sessions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/parking-sessions` | List parking sessions |
| `GET` | `/api/parking-sessions/:id` | Get session detail |
| `POST` | `/api/parking-sessions/check-in` | Check in vehicle and start session |
| `PUT` | `/api/parking-sessions/:id/checkout` | Checkout vehicle and create payment |

### User Parking Sessions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user/parking-sessions` | List current user's active/completed sessions |

### Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/payments` | List payments |
| `POST` | `/api/payments/sepay/webhook` | Receive SePay webhook |
| `GET` | `/api/payments/sepay/:paymentCode/status` | Get SePay payment status |
| `POST` | `/api/payments/sepay/sandbox/simulate` | Simulate SePay payment in local testing |

### Other API Groups

- `/api/parking-slots`
- `/api/vehicle-types`
- `/api/zones`
- `/api/pricing-policies`
- `/api/users`
- `/api/feedbacks`
- `/api/user/feedbacks`

## Frontend Pages

### Public and Auth

- Landing page
- Login page
- Sign up page

### User

- Dashboard
- Book slot
- Booking history
- Parking sessions
- Feedback
- Settings

### System

- Dashboard
- Parking slots
- Parking sessions
- Reservations
- Payments
- Vehicles
- Zones
- Pricing policies
- Users
- Feedbacks

## Development Notes

- Reservation status now starts as `CONFIRMED`.
- Payment status can still use `PENDING`, because payment and reservation states are separate.
- Parking fee is calculated from actual `entry_time` to `exit_time`.
- `assigned_slot_id` is used when staff assigns a different real slot from the originally reserved slot.
- Frontend API calls are centralized in `frontend/src/services/api.js`.
- Backend route registration starts in `backend/src/server.js`.
- Prisma models are defined in `backend/prisma/schema.prisma`.

## License

This project is licensed under the terms included in the `LICENSE` file.
