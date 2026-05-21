# Parking Building Management System

A full-stack web application for managing parking buildings, parking slots, vehicles, entry/exit sessions, reservations, payments, and user roles.

This project is built as a modern parking management platform for multi-floor parking buildings, helping parking operators manage vehicle flow, slot availability, parking fees, staff activities, and system users more efficiently.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Roles](#system-roles)
- [Project Structure](#project-structure)
- [Backend Features](#backend-features)
- [Frontend Features](#frontend-features)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Test Accounts](#test-accounts)
- [Development Roadmap](#development-roadmap)
- [Screenshots](#screenshots)
- [Contributors](#contributors)

---

## Overview

**Parking Building Management System** is a web-based application designed to support parking building operations in urban areas.

The system helps manage:

- Parking buildings, floors, zones, and slots
- Vehicle types and vehicle information
- Vehicle entry and exit sessions
- Parking fee calculation
- Payments
- Reservations
- Incidents and issue reports
- Users, roles, and authentication

The goal of this project is to reduce manual errors, improve parking slot tracking, support revenue management, and provide a clear workflow for parking staff and facility managers.

---

## Key Features

### Completed

- Backend project setup with Node.js and Express.js
- PostgreSQL database connection
- User and role database design
- JWT-based authentication
- Login API
- Get current user API
- Frontend login page
- Frontend-to-backend login integration
- Token storage using Local Storage

### In Progress / Planned

- Dashboard data integration
- Parking slot management
- Vehicle entry management
- Vehicle exit management
- Parking fee calculation
- Payment management
- Reservation management
- Incident management
- Role-based UI rendering
- Report and analytics dashboard

---

## Tech Stack

### Frontend

- ReactJS
- Vite
- Tailwind CSS
- React Router DOM

### Backend

- Node.js
- Express.js
- PostgreSQL client: `pg`
- JWT authentication: `jsonwebtoken`
- Password hashing: `bcryptjs`
- CORS
- dotenv

### Database

- PostgreSQL
- pgAdmin 4

### Development Tools

- Visual Studio Code
- Thunder Client / Postman
- Git & GitHub
- dbdiagram.io for database design

---

## System Roles

The system supports four main user roles:

| Role | Description |
|---|---|
| `SYSTEM_ADMIN` | Manages system users, roles, and configurations |
| `FACILITY_MANAGER` | Manages parking building, slots, pricing, and reports |
| `PARKING_STAFF` | Handles vehicle entry, exit, payment, and incidents |
| `DRIVER` | Views parking information, reservations, and personal parking sessions |

---

## Project Structure

```bash
Parking-Building-Management-System/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── LoginPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── README.md
└── LICENSE
