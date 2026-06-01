# Parking Building Management System

A full-stack web application for managing parking buildings, parking slots, vehicle types, reservations, payments, parking sessions, feedbacks, pricing policies, and user roles.

This project is developed as a modern parking building management platform to help parking operators manage slot availability, vehicle flow, reservations, payments, and system users more efficiently.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Roles](#system-roles)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Backend Progress](#backend-progress)
- [Frontend Progress](#frontend-progress)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Roadmap](#roadmap)
- [Contributors](#contributors)
- [Project Status](#project-status)

---

## Overview

**Parking Building Management System** is a web-based application designed to support the daily operation of a multi-floor parking building.

The system helps manage:

- Vehicle types
- Parking zones and parking slots
- Slot status and availability
- Parking reservations
- Parking sessions
- Payment records
- User authentication
- Role-based access
- Feedback and issue reports
- Pricing policies and system configurations

The goal of this project is to reduce manual parking management errors, improve slot tracking, support revenue management, and provide a clear workflow for administrators, managers, staff, and drivers.

---

## Key Features

### Completed Features

- Backend setup with Node.js and Express.js
- Backend uses ES Module syntax
- PostgreSQL local database connection
- Prisma ORM integration
- Database schema design for core parking management modules
- JWT-based authentication
- Login API
- Get current authenticated user API
- Logout API
- Vehicle type API
- Parking slot API
- Reservation API
- Payment API
- Frontend setup with ReactJS, Vite, and Tailwind CSS
- Login page connected to backend API
- Token storage using Local Storage
- Admin vehicle type page connected to API
- Parking slot management page connected to API
- Reservation page connected to API
- Payment page connected to API
- Improved UI for parking slots and vehicle type management

### Current Development Focus

- Building admin and management dashboard pages
- Improving role-based UI rendering
- Expanding CRUD operations for management pages
- Enhancing parking slot, reservation, and payment workflows
- Preparing frontend pages for real database data

---

## Tech Stack

### Frontend

- ReactJS
- Vite
- Tailwind CSS
- React Router DOM
- JavaScript

### Backend

- Node.js
- Express.js
- ES Module
- Prisma ORM
- JWT Authentication
- bcryptjs
- CORS
- dotenv

### Database

- PostgreSQL
- Prisma Migration
- pgAdmin 4

### Development Tools

- Visual Studio Code
- Thunder Client / Postman
- Git & GitHub
- GitHub Issues
- GitHub Pull Requests

---

## System Roles

The current database supports the following roles:

| Role | Description |
|---|---|
| `ADMIN` | Manages system users, roles, configurations, and overall system data |
| `MANAGER` | Manages parking zones, parking slots, pricing policies, reports, and operations |
| `STAFF` | Handles vehicle entry, exit, reservations, payments, and daily parking activities |
| `USER` | Uses the system to view parking information, make reservations, and track parking sessions |

---

## Project Structure

```bash
Parking-Building-Management-System/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AdminVehiclesPage.jsx
│   │   │   ├── ParkingSlotsPage.jsx
│   │   │   ├── ReservationsPage.jsx
│   │   │   └── PaymentsPage.jsx
│   │   │
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## Database Design

The current PostgreSQL database includes the following main tables:

| Table | Description |
|---|---|
| `users` | Stores system users and authentication-related information |
| `vehicle_types` | Stores supported vehicle types such as car, motorbike, truck, etc. |
| `zones` | Stores parking building zones or floors |
| `parking_slots` | Stores parking slot information and slot status |
| `reservations` | Stores parking reservation records |
| `parking_sessions` | Stores vehicle entry and exit session data |
| `payments` | Stores payment information for reservations or parking sessions |
| `feedbacks` | Stores user feedback and issue reports |
| `pricing_policies` | Stores parking fee rules and pricing configuration |
| `system_configs` | Stores system-level configuration values |

---

## Backend Progress

The backend is currently running on:

```bash
http://localhost:5000
```

### Completed Backend APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticates user and returns JWT token |
| `GET` | `/api/auth/me` | Gets current authenticated user information |
| `POST` | `/api/auth/logout` | Logs out current user |
| `GET` | `/api/vehicle-types` | Gets all vehicle types |
| `GET` | `/api/parking-slots` | Gets all parking slots |
| `GET` | `/api/reservations` | Gets all reservations |
| `GET` | `/api/payments` | Gets all payment records |

---

## Frontend Progress

The frontend is currently running on:

```bash
http://localhost:5173
```

### Completed Frontend Pages

| Page | API Connected | Description |
|---|---|---|
| `LoginPage.jsx` | `POST /api/auth/login` | Login page with backend authentication |
| `AdminVehiclesPage.jsx` | `GET /api/vehicle-types` | Displays vehicle type data from database |
| `ParkingSlotsPage.jsx` | `GET /api/parking-slots` | Displays parking slot data from database |
| `ReservationsPage.jsx` | `GET /api/reservations` | Displays reservation data from database |
| `PaymentsPage.jsx` | `GET /api/payments` | Displays payment data from database |

### UI Improvements Completed

- Redesigned parking slot management page
- Improved parking slot status display
- Improved floor/zone display logic
- Redesigned admin vehicle type page
- Added suitable vehicle icons/SVGs for each vehicle type
- Fixed payment page display issues
- Connected frontend pages to real backend APIs

---

## API Endpoints

### Authentication

#### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response example:

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "fullName": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

#### Get Current User

```http
GET /api/auth/me
```

Headers:

```http
Authorization: Bearer jwt_token_here
```

#### Logout

```http
POST /api/auth/logout
```

---

### Vehicle Types

```http
GET /api/vehicle-types
```

Returns all vehicle types stored in the database.

---

### Parking Slots

```http
GET /api/parking-slots
```

Returns all parking slots with related zone and status information.

---

### Reservations

```http
GET /api/reservations
```

Returns all reservation records.

---

### Payments

```http
GET /api/payments
```

Returns all payment records.

---

## Authentication Flow

The current authentication flow works as follows:

1. User enters email and password on the login page.
2. Frontend sends login request to the backend.
3. Backend validates user credentials.
4. Backend returns a JWT token after successful login.
5. Frontend stores the token in Local Storage.
6. Frontend uses the token to access protected APIs.
7. Backend verifies the token through authentication middleware.
8. User can logout and remove the stored token.

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- pgAdmin 4
- Git

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Update your database connection string in `.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/parking_building_db"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start backend server:

```bash
npm run dev
```

Backend will run at:

```bash
http://localhost:5000
```

---

## Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend development server:

```bash
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

## Environment Variables

Backend `.env` example:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/parking_building_db"
JWT_SECRET="your_jwt_secret_key"
PORT=5000
```

---

## Development Workflow

This project follows a GitHub-based development workflow:

```bash
Create issue
→ Create feature branch
→ Develop feature
→ Commit changes
→ Push branch
→ Create pull request
→ Review
→ Merge into main
```

### Example Branch Naming

```bash
feature/connect-reservations-api
feature/connect-payments-api
feature/redesign-parking-slots-page
feature/auth-login-api
```

### Example Commit Messages

```bash
feat: connect reservations page to API
feat: connect payments page to API
feat: redesign parking slots page
fix: update payments page display
```

---

## Roadmap

### Backend

- [x] Setup Express server
- [x] Connect PostgreSQL database
- [x] Setup Prisma ORM
- [x] Create authentication APIs
- [x] Create vehicle type API
- [x] Create parking slot API
- [x] Create reservation API
- [x] Create payment API
- [ ] Add create/update/delete APIs for vehicle types
- [ ] Add create/update/delete APIs for parking slots
- [ ] Add parking entry session API
- [ ] Add parking exit session API
- [ ] Add fee calculation logic
- [ ] Add feedback and incident APIs
- [ ] Add report and analytics APIs
- [ ] Add role-based authorization middleware

### Frontend

- [x] Setup ReactJS with Vite
- [x] Setup Tailwind CSS
- [x] Build login page
- [x] Connect login page to backend
- [x] Connect vehicle type page to API
- [x] Connect parking slot page to API
- [x] Connect reservation page to API
- [x] Connect payment page to API
- [x] Improve parking slot UI
- [x] Improve admin vehicle UI
- [x] Fix payment page display
- [ ] Add dashboard statistics
- [ ] Add create/update/delete forms
- [ ] Add role-based sidebar/menu rendering
- [ ] Add parking entry and exit screens
- [ ] Add reservation management actions
- [ ] Add payment confirmation workflow
- [ ] Add report and analytics UI

---

## Contributors

This project is developed as part of a software engineering course project.

Main responsibilities include:

- Requirement analysis
- Database design
- Backend API development
- Frontend UI development
- Authentication flow
- API integration
- GitHub issue, branch, commit, push, and pull request workflow

---

## Project Status

The project is currently under active development.

Current stable progress:

- Authentication flow is working
- Backend connects successfully to PostgreSQL
- Prisma is used for database access
- Main read-only APIs are available
- Core management pages are connected to backend data
- Frontend and backend can run locally
