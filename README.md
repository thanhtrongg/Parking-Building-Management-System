# Parking Building Management System

Parking Building Management System is a full-stack web application for managing a multi-zone parking building. The system supports user reservations, live parking sessions, staff check-in/check-out workflows, payment tracking, feedback handling, pricing policies, parking slots, vehicle types, and role-based administration.

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

:hammer_and_wrench: Languages :
<div>
<img src="https://github.com/devicons/devicon/blob/master/icons/python/python-original.svg" title="Python" alt="Python" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" title="JavaScript" alt="JavaScript" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/html5/html5-original.svg" title="HTML" alt="HTML" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/css3/css3-original.svg" title="CSS" alt="CSS" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original-wordmark.svg" title="NodeJS" alt="NodeJS" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/react/react-original.svg" title="React" alt="React" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/electron/electron-original.svg" title="Electron" alt="Electron" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/materialui/materialui-original.svg" title="Material UI" alt="Material UI" width="40" height="40"/>&nbsp;
<img src="https://github.com/devicons/devicon/blob/master/icons/git/git-original-wordmark.svg" title="Git" alt="Git" width="40" height="40"/>
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
