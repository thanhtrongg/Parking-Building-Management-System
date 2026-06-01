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
