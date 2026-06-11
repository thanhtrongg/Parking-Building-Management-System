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
    <img src="https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=java&logoColor=white" alt="Java" />
    <img src="https://img.shields.io/badge/Spring_Boot-3.4.1-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
  <p>
    <a href="#getting-started">Quick Start</a>
    &nbsp;•&nbsp;
    <a href="#core-features">Features</a>
    &nbsp;•&nbsp;
    <a href="#main-api-groups">API</a>
    &nbsp;•&nbsp;
    <a href="#setup--run">Setup</a>
    &nbsp;•&nbsp;
    <a href="#available-scripts">Scripts</a>
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
- Role-based route protection (Admin, Manager, Staff, Driver)
- Separate user and system layouts

### Parking Session Flow

1. User books a parking slot.
2. Reservation is created as `CONFIRMED`.
3. Staff checks in the vehicle when the customer arrives.
4. A real parking session starts at the actual check-in time.
5. If the reserved slot is occupied, staff can assign another available slot.
6. Parking fee is calculated from actual check-in time to checkout time.
7. Staff checks out the vehicle and records payment.
8. Parking session and related reservation become `COMPLETED`.
9. The occupied slot becomes `AVAILABLE` again.

## Languages and Tools

:hammer_and_wrench: Languages and tools used in this project:
<div>
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" title="Java" alt="Java" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" title="Spring Boot" alt="Spring Boot" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" title="PostgreSQL" alt="PostgreSQL" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" title="React" alt="React" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" title="Vite" alt="Vite" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" title="Tailwind CSS" alt="Tailwind CSS" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/threejs/threejs-original.svg" title="Three.js" alt="Three.js" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" title="Docker" alt="Docker" width="44" height="44"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/maven/maven-original.svg" title="Maven" alt="Maven" width="44" height="44"/>
</div>

## Tech Stack

### Backend
- Java 17, Spring Boot 3.4.1
- Spring Data JPA, Hibernate
- Spring Security, JWT
- PostgreSQL
- Flyway (Database Migrations)
- SpringDoc OpenAPI (Swagger)

### Frontend
- React 19, Vite 5
- Tailwind CSS
- Framer Motion, Three.js

## Project Structure

```text
Parking-Building-Management-System/
|-- java-backend/
|   |-- src/main/java/com/parking/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- entity/
|   |   |-- repository/
|   |   `-- service/
|   |-- src/main/resources/
|   |   `-- db/migration/
|   |-- Dockerfile
|   `-- pom.xml
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- routes/
|   |   `-- services/
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- package.json
|-- docker-compose.yml
|-- LICENSE
`-- README.md
```

## Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **Docker & Docker Compose**
- **Maven/mvnd**

### Environment Variables

**Backend (`java-backend`):**
| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `DB_URL` | PostgreSQL URL | `jdbc:postgresql://localhost:5432/parking_db` |
| `JWT_SECRET` | JWT Secret | (Required) |
| `VNPAY_TMN_CODE`| VNPay Code | `2QRY7YW8` |

**Frontend (`frontend`):**
Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Setup & Run

#### Option 1: Full Docker Deployment (Root Orchestrator)
Starts the database, Spring Boot backend, and React frontend all together in Docker.
```bash
docker compose up --build -d
```

#### Option 2: Backend & DB Docker Deployment
Starts both the database and the backend application in Docker.
```bash
cd java-backend && docker compose up -d
```

#### Option 3: Local Development (Hybrid)
Starts only the database in Docker and runs the application locally for faster iteration.
1. **Start Database**:
   ```bash
   cd java-backend && docker compose up -d db
   ```
2. **Run Backend**:
   ```bash
   cd java-backend && mvnd spring-boot:run
   ```

3. **Run Frontend**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

### Test Accounts (Local Development)

When starting the application with the `dev` profile, the database is automatically seeded with the following test accounts (all passwords are `123456`):

| Role | Email | Full Name | Phone |
|------|-------|-----------|-------|
| **Admin** | `admin@gmail.com` | Admin | `0911234567` |
| **Manager** | `manager@gmail.com` | Manager | `0917654321` |
| **Staff** | `staff@gmail.com` | Staff | `0918888888` |
| **Driver** | `driver@gmail.com` | Driver | `0919999999` |

### Seeding & Mock Data Diversity

The seeder initializes a rich dataset simulating real-world parking operations:
* **Slot States**: Generates 35+ slots across floors, including `MAINTENANCE` and `LOCKED` slot statuses alongside `AVAILABLE`, `OCCUPIED`, and `RESERVED`.
* **Operations**: Seeds 17 diverse parking sessions including:
  * Active & Completed sessions for cars, motorbikes, and bicycles.
  * Lost ticket sessions.
  * Exception sessions containing `REFUNDED` payments.
* **Reservations**: Covers all reservation statuses (`PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `USED`).
* **Feedbacks**: Includes multiple driver feedback categories (`Service`, `Payment`, `Parking Slot`, `Safety`, `System Bug`) with different statuses (`OPEN`, `IN_PROGRESS`, `RESOLVED`).
* **Payments**: Normalizes status mappings (e.g. `PAID` / `SUCCESS`) and supports methods like `CASH`, `TRANSFER`, and `EWALLET`.

## Available Scripts

| Service | Command | Description |
|---------|---------|-------------|
| Backend | `mvnd clean package` | Build JAR |
| Backend | `mvnd test` | Run tests |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run lint` | Lint code |


## Main API Groups

API documentation is available via Swagger at `http://localhost:8080/api/v1/swagger-ui.html` when the backend is running.

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset token |
| `POST` | `/api/v1/auth/reset-password` | Reset password using token |

### System Management
- `/api/v1/admin/users`: User management
- `/api/v1/slots`: Parking slot management
- `/api/v1/zones`: Zone management
- `/api/v1/pricing`: Pricing policy management
- `/api/v1/reservations`: Global reservation management

### Parking Operations
- `/api/v1/sessions/check-in`: Start parking session
- `/api/v1/sessions/checkout`: Complete session and pay
- `/api/v1/sessions/active`: Monitor active vehicles

## Testing Password Reset Flow

For local development/testing, the password reset flow can be tested using the following steps:

1. **Request a Password Reset**:
   ```bash
   curl -i -X POST http://localhost:8080/api/v1/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "driver@gmail.com"}'
   ```

2. **Retrieve the Token from logs**:
   - If running the backend locally:
     Look at the terminal log output of the running server, or run:
     ```bash
     grep "NOTIFICATION" java-backend.log
     ```
   - If running the backend in Docker:
     ```bash
     docker logs parking-app 2>&1 | grep "NOTIFICATION"
     ```
   *Example output:*
   `[NOTIFICATION] Password reset request — to=driver@gmail.com, token=1f6942e1-3ad1-4aac-9edf-95d95c827518, ...`

3. **Reset Password**:
   ```bash
   curl -i -X POST http://localhost:8080/api/v1/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token": "YOUR_TOKEN_HERE", "newPassword": "newsecurepwd123"}'
   ```

4. **Verify Login with new password**:
   ```bash
   curl -i -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "driver@gmail.com", "password": "newsecurepwd123"}'
   ```

## License
This project is licensed under the terms included in the `LICENSE` file.

