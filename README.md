# SmartCareHub
Smart Healthcare Appointment & Telemedicine Microservices Platform

**SE3020 Distributed Systems | Group Project**

---

## 🏗️ Architecture Overview

The system follows a microservices architecture using the MERN stack (MongoDB, Express, React, Node.js), orchestrated with Docker and Kubernetes.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          React Frontend (Port 80)                       │
│           Unified Dashboard for Patients, Doctors, and Admins           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │    API Gateway      │ Port 5000
                          │ (Proxy & Rate Limit)│
                          └──────────┬──────────┘
                                     │
           ┌─────────────┬───────────┼───────────┬─────────────┐
    ┌──────▼──────┐┌─────▼──────┐┌───▼───┐┌──────▼──────┐┌─────▼──────┐
    │Auth Service ││Patient Svc ││Doctor ││Appointment  ││Payment Svc │
    │ Port 5001   ││ Port 5002  ││ Service││ Port 5003   ││ Port 5004  │
    └──────┬──────┘└─────┬──────┘└───┬───┘└──────┬──────┘└─────┬──────┘
           │             │           │           │             │
    ┌──────▼──────┐┌─────▼──────┐┌───▼───┐┌──────▼──────┐┌─────▼──────┐
    │   auth-db   ││ patient-db ││doctor ││appointment- ││ payment-db │
    │ (MongoDB)   ││ (MongoDB)  ││  db   ││    db       ││ (MongoDB)  │
    └─────────────┘└────────────┘└───────┘└─────────────┘└────────────┘
```

All services communicate over a shared Docker bridge network (`smartcare-net`).

---

## 📋 Core Services & Features

### 1. Patient Portal Services
*   **Auth Service (Port 5001)**: Registration, login, and JWT-based authentication for all roles.
*   **Patient Service (Port 5002)**: Profile management, medical report uploads (Multer), and prescription history.
*   **Frontend (Port 80)**: Unified React application serving distinct dashboards for Patients, Doctors, and Admins.

### 2. Appointment & Payment Flow (Member 3)
*   **Appointment Service (Port 5003)**: Doctor browsing, real-time slot checking, and booking management.
*   **Payment Service (Port 5004)**: PayHere sandbox integration, transaction audit logs, and refund processing.
*   **API Gateway (Port 5000)**: Entry point for the appointment/payment flow with JWT verification and rate limiting.

### 3. Doctor Management (Member 2)
*   **Doctor Service (Port 5002 - Shared/Integrated)**: Handles verification, profile approval workflow, availability scheduling, and prescription issuance.

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose v2
- Node.js 18+ (for local development)
- MongoDB running locally (if not using Docker)

### Running with Docker Compose
Run the following command at the root of the project:

```bash
# Build and start all services in the background
docker compose up --build -d
```

**Access Points:**
- **Web App**: http://localhost
- **API Gateway**: http://localhost:5000

### Local Development (Manual)
Each service can be run independently using `npm run dev` in its respective directory.

---

## 🧪 Testing

### Test Cards (PayHere Sandbox)
| Card Type | Number |
|-----------|--------|
| Visa | 4916 2175 0161 1292 |
| MasterCard | 5307 7321 2553 1191 |
| AMEX | 3467 8100 5510 225 |

---

## 📁 Project Structure

```
SmartCareHub/
├── backend/
│   ├── api-gateway/          # Auth proxy & Rate limiting
│   ├── appointment-service/  # Booking engine
│   ├── auth-service/         # JWT Auth & User management
│   ├── doctor-service/       # Doctor profiles & availability
│   ├── patient-service/      # Patient records & reports
│   └── payment-service/      # PayHere integration
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # Unified Auth providers
│   │   ├── pages/            # Role-based dashboards
│   │   └── services/         # API clients
│   └── Dockerfile
├── k8s/                       # Kubernetes manifests
├── docker-compose.yml
└── README.md
```

---

## ☸️ Kubernetes Deployment

Manifests are located in the `k8s/` directory.

```bash
# Apply namespaces and all resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

| Service | Port |
|---------|------|
| Frontend | 80 |
| API Gateway | 5000 |
| Backend Services | 5001 - 5004 |

