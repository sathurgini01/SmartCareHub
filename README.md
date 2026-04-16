# SmartCareHub

Smart Healthcare Appointment & Telemedicine Microservices Platform

> **SE3020 Distributed Systems** — M Sanjeevan : Patient Auth Service + Patient Service + Frontend

---

## Overview

SmartCareHub is a microservices-based healthcare platform. This repository covers the **Patient Auth Service**, **Patient Service**, and the **React Patient Portal** — the components owned by Member 1.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│              Patient Portal — Port 80               │
└──────────────┬───────────────────┬──────────────────┘
               │                   │
    ┌──────────▼──────┐   ┌────────▼─────────┐
    │  Auth Service   │   │  Patient Service  │
    │   Port 5001     │   │    Port 5002      │
    └──────────┬──────┘   └────────┬──────────┘
               │                   │
    ┌──────────▼──────┐   ┌────────▼──────────┐
    │   auth-db       │   │   patient-db       │
    │  (MongoDB 7.0)  │   │  (MongoDB 7.0)     │
    └─────────────────┘   └────────────────────┘
```

All services communicate over a shared Docker bridge network (`smartcare-net`).

---

## Services

### Auth Service (`backend/auth-service`) — Port 5001

Handles user registration, login, and JWT-based authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Bearer token | Get current user info |
| GET | `/api/auth/admin/users` | Admin | List all users |
| PATCH | `/api/auth/admin/users/:id/suspend` | Admin | Suspend a user |
| DELETE | `/api/auth/admin/users/:id` | Admin | Delete a user |

**User roles:** `patient` · `doctor` · `admin`

**Tech stack:** Node.js · Express 5 · MongoDB (Mongoose) · bcryptjs · JWT

---

### Patient Service (`backend/patient-service`) — Port 5002

Manages patient profiles, medical reports, prescriptions, and appointment stubs.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/patients/` | — | Health check |
| POST | `/api/patients/create-profile` | patient | Create patient profile |
| GET | `/api/patients/me` | patient | Get own profile |
| PUT | `/api/patients/me` | patient | Update own profile |
| DELETE | `/api/patients/me` | patient | Delete own account |
| POST | `/api/patients/upload-report` | patient | Upload a medical report (multipart) |
| GET | `/api/patients/reports` | patient | Get own medical reports |
| GET | `/api/patients/prescriptions` | patient | Get own prescriptions |
| GET | `/api/patients/appointments` | patient | Get own appointments (stub) |
| GET | `/api/patients/medical-history` | patient | Get full medical history |
| GET | `/api/patients/admin/all` | admin | List all patients |
| PATCH | `/api/patients/admin/suspend/:id` | admin | Suspend a patient |
| DELETE | `/api/patients/admin/delete/:id` | admin | Delete a patient |

**Tech stack:** Node.js · Express 5 · MongoDB (Mongoose) · Multer (file uploads) · JWT

---

### Frontend (`frontend`) — Port 80

React single-page app served by Nginx. Proxies API calls to the backend services.

**Pages:** Home · Register · Login · Dashboard · Profile · Upload Report · Prescriptions · Appointments · Not Found

**Tech stack:** React 19 · React Router 6 · Axios · react-scripts (CRA)

---

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose v2
- Node.js 18+ (for local development without Docker)

---

## Running with Docker Compose

```bash
# Clone the repo and enter the directory
git clone <repo-url>
cd SmartCareHub

# (Optional) set a custom JWT secret
export JWT_SECRET=your_secret_here

# Build and start all services
docker compose up --build

# Stop services
docker compose down
```

The app will be available at **http://localhost**.

---

## Local Development (without Docker)

### Auth Service

```bash
cd backend/auth-service
cp .env.example .env      # create and fill in your .env
npm install
npm run dev               # nodemon on port 5001
```

### Patient Service

```bash
cd backend/patient-service
cp .env.example .env
npm install
npm run dev               # nodemon on port 5002
```

### Frontend

```bash
cd frontend
npm install
npm start                 # CRA dev server on port 3000
```

> The frontend dev server proxies `/api/auth` → `http://localhost:5001` and `/api/patients` → `http://localhost:5002` via `src/setupProxy.js`.

---

## Environment Variables

### Auth Service

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Service port |
| `MONGO_URI` | — | MongoDB connection string |
| `JWT_SECRET` | `SmartCareHub_JWT_Secret_2026` | JWT signing secret |
| `NODE_ENV` | `development` | Runtime environment |

### Patient Service

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5002` | Service port |
| `MONGO_URI` | — | MongoDB connection string |
| `JWT_SECRET` | `SmartCareHub_JWT_Secret_2026` | Must match Auth Service |
| `NODE_ENV` | `development` | Runtime environment |

---

## Kubernetes Deployment

Kubernetes manifests are in the `k8s/` directory.

```bash
# Apply namespace first, then all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

Key manifests:

| File | Resource |
|------|----------|
| `namespace.yaml` | Namespace |
| `configmap.yaml` | Shared config |
| `secret.yaml` | Secrets (JWT, etc.) |
| `auth-db.yaml` | Auth MongoDB StatefulSet |
| `auth-deployment.yaml` | Auth Service Deployment |
| `auth-service.yaml` | Auth Service ClusterIP |
| `patient-db.yaml` | Patient MongoDB StatefulSet |
| `patient-deployment.yaml` | Patient Service Deployment |
| `patient-service.yaml` | Patient Service ClusterIP |
| `frontend-deployment.yaml` | Frontend Deployment |
| `frontend-service.yaml` | Frontend Service |
| `ingress.yaml` | Ingress controller rules |
| `hpa.yaml` | Horizontal Pod Autoscaler |

---

## Project Structure

```
SmartCareHub/
├── backend/
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── controllers/   # authController.js
│   │   │   ├── middleware/    # authMiddleware.js
│   │   │   ├── models/        # User.js
│   │   │   └── routes/        # authRoutes.js
│   │   ├── Dockerfile
│   │   └── package.json
│   └── patient-service/
│       ├── src/
│       │   ├── controllers/   # patientController.js
│       │   ├── middleware/    # authMiddleware.js, uploadMiddleware.js
│       │   ├── models/        # Patient.js
│       │   ├── routes/        # patientRoutes.js
│       │   └── uploads/       # Uploaded medical reports (volume-mounted)
│       ├── Dockerfile
│       └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/               # authApi.js, patientApi.js, axios.js
│   │   ├── components/        # Layout, Navbar, Sidebar, ProtectedRoute, etc.
│   │   ├── context/           # Auth context providers
│   │   ├── pages/             # Login, Register, Dashboard, Profile, etc.
│   │   └── setupProxy.js      # CRA dev proxy config
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/                       # Kubernetes manifests
├── docker-compose.yml
└── README.md
```
