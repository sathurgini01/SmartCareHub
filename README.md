
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

# SmartCareHub - Deployment Guide

SE3020 Distributed Systems  
Group: SE-51  
Contributor: Nithusika Srikantha  
Email: nithusika476@gmail.com

## Project Overview

SmartCareHub is a microservices-based healthcare platform built to support digital hospital workflows through a shared frontend and backend services.

This repository currently includes:

- Doctor Service - handles doctor registration, profile management, availability, appointments, and prescriptions
- Patient Service - contains patient-related backend work
- Frontend (React) - shared user interface for doctor and admin workflows
- Kubernetes manifests - deployment files for doctor-service and MongoDB

## Architecture Overview

The system follows a microservices architecture:

```text
User -> React Frontend -> Backend Services
```

Core flow in this module:

- Frontend -> Doctor Service for doctor and admin operations
- Doctor Service -> MongoDB for data persistence
- Kubernetes -> orchestrates doctor-service and MongoDB containers

All services communicate using REST APIs.

## Technologies Used

- Node.js
- Express.js
- React
- MongoDB
- Docker
- Kubernetes
- Mongoose

## Prerequisites

Make sure the following are installed:

- Node.js v18+
- npm
- Docker Desktop
- Kubernetes enabled in Docker Desktop
- kubectl
- Git
- MongoDB local instance or MongoDB through Docker/Kubernetes

## Required Environment Variables

### Doctor Service

Create a `.env` file in `backend/doctor-service/`:

```env
NODE_ENV=production
PORT=5002
MONGO_URI=mongodb://localhost:27017/doctor_service_db
JWT_SECRET=change_this_super_secret_key
JWT_EXPIRES_IN=1d
APPOINTMENT_SERVICE_MODE=mock

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

Create a `.env` file in `frontend/` if needed:

```env
REACT_APP_DOCTOR_API_URL=http://localhost:5002/api
```

## Manual Deployment

### Step 1 - Clone Repository

```powershell
git clone https://github.com/sathurgini01/SmartCareHub.git
cd SmartCareHub
```

### Step 2 - Install Dependencies

```powershell
cd backend\doctor-service
npm install

cd ..\..\frontend
npm install
```

### Step 3 - Start MongoDB

Use either:

- local MongoDB
- MongoDB Atlas
- Docker/Kubernetes MongoDB

### Step 4 - Run Doctor Service

```powershell
cd backend\doctor-service
npm start
```

Doctor service:

```text
http://localhost:5002/api
```

### Step 5 - Run Frontend

```powershell
cd frontend
npm start
```

Frontend:

```text
http://localhost:3000
```

## Docker Deployment

### Step 1 - Build Image

```powershell
cd C:\Users\nithu\Desktop\SmartCareHub
docker build -t doctor-service:latest .\backend\doctor-service
```

### Step 2 - Run with Docker Compose

```powershell
cd backend\doctor-service
docker compose up --build
```

### Step 3 - Verify Containers

```powershell
docker ps
```

## Kubernetes Deployment

This project was verified using Kubernetes enabled in Docker Desktop.

### Step 1 - Check Kubernetes

```powershell
kubectl version --client
kubectl cluster-info
kubectl get nodes
```

Expected:

- cluster should be available
- node should be `Ready`

### Step 2 - Build the Doctor Service Image

```powershell
cd C:\Users\nithu\Desktop\SmartCareHub
docker build -t doctor-service:latest .\backend\doctor-service
```

### Step 3 - Apply Kubernetes Manifests

```powershell
kubectl apply -f k8s\
```

This deploys:

- doctor-service configmap
- doctor-service secret
- doctor-service deployment
- doctor-service service
- mongo deployment
- mongo service

### Step 4 - Check Resources

```powershell
kubectl get pods
kubectl get svc
```

Healthy expected result:

- doctor-service pods -> `1/1 Running`
- mongo pod -> `1/1 Running`

### Step 5 - Access the Service

```powershell
kubectl port-forward service/doctor-service 5002:80
```

Then open:

```text
http://localhost:5002/health
```

Expected response:

```json
{"success":true,"message":"doctor-service is healthy"}
```

## API Endpoints

### Doctor Authentication

- `POST /api/doctors/register`
- `POST /api/doctors/login`

### Doctor Profile

- `GET /api/doctors/:id`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`

### Availability

- `POST /api/availability`
- `GET /api/availability/:doctorId`
- `PUT /api/availability/:id`
- `DELETE /api/availability/:id`

### Appointments

- `GET /api/appointments/doctor/:id`

### Prescriptions

- `POST /api/prescriptions`
- `PUT /api/prescriptions/:id`
- `DELETE /api/prescriptions/:id`
- `GET /api/prescriptions/:doctorId`

### Admin Doctor Management

- `PUT /api/admin/doctors/approve/:id`
- `PUT /api/admin/doctors/reject/:id`
- `GET /api/admin/doctors`

## Module Features

This module focuses on doctor and admin functionality:

- doctor registration and login
- admin login flow
- doctor profile management
- doctor availability scheduling
- appointment request handling
- prescription CRUD
- admin doctor approval and rejection
- React dashboard UI for doctor and admin flows

## Port Summary

| Service | Port |
|---|---|
| Frontend | 3000 |
| Doctor Service | 5002 |
| MongoDB | 27017 |

## Deployment Evidence

### Docker Deployment Evidence

![Docker Deployment](./screenshot/docker.png)

Figure 1: Docker containers running successfully using `docker ps`.

### Kubernetes Deployment Evidence

![Kubernetes Deployment](./screenshot/kubernet.png)

Figure 2: Kubernetes pods and services running successfully in Docker Desktop Kubernetes.

### Health Endpoint Evidence

![Doctor Service Health Check](./screenshot/healthcheck.png)

Figure 3: Doctor service health endpoint responding successfully through `kubectl port-forward`.

## Troubleshooting

### Issue: ErrImagePull or ImagePullBackOff

Build the image locally first:

```powershell
docker build -t doctor-service:latest .\backend\doctor-service
```

### Issue: CrashLoopBackOff

Check logs:

```powershell
kubectl logs deployment/doctor-service
kubectl logs deployment/mongo
```

Restart deployment:

```powershell
kubectl rollout restart deployment doctor-service
```

### Issue: MongoDB connection error

- verify `MONGO_URI`
- ensure MongoDB is running
- ensure `mongo-service` exists in Kubernetes

### Issue: Service not reachable

- keep `kubectl port-forward` running
- verify pod status with `kubectl get pods`
- test `http://localhost:5002/health`

## Repository

GitHub: https://github.com/sathurgini01/SmartCareHub.git

## Contact

For issues or academic demonstration support:  
Nithusika Srikantha  
nithusika476@gmail.com

