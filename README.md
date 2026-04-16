# SmartCareHub
Smart Healthcare Appointment & Telemedicine Microservices Platform

**SE3020 Distributed Systems | Group Project**

---

## 📌 Project Overview
SmartCareHub is a comprehensive microservices-based healthcare platform that simplifies hospital workflows and patient-doctor interactions.

**Key Features (Added in this version):**
- **Telemedicine Service**: Real-time video consultations and appointment management.
- **Notification Service**: Automated SMS and Email alerts for appointments and payments.
- **AI Symptom Service**: Intelligent symptom analysis using Google Gemini & Groq APIs.

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
    └─────────────┘└────────────┘└───────┘└─────────────┘└─────────────┘
           │             │           │           │             │
    ┌──────▼──────┐┌─────▼──────┐┌───▼───┐┌──────▼──────┐┌─────▼──────┐
    │Telemedicine ││Notification ││   AI    ││             ││             │
    │  Port 5004  ││  Port 5005  ││ Symptom ││             ││             │
    │             ││             ││ Port 5006││             ││             │
    └─────────────┘└─────────────┘└─────────┘└─────────────┘└─────────────┘
```

---

## 📋 Core Services & Features

### 1. Patient Portal Services
*   **Auth Service (Port 5001)**: Registration, login, and JWT-based authentication for all roles.
*   **Patient Service (Port 5002)**: Profile management, medical report uploads (Multer), and prescription history.
*   **AI Symptom Service (Port 5006)**: Analyzes user symptoms and recommends medical specialists.

### 2. Appointment & Payment Flow
*   **Appointment Service (Port 5003)**: Doctor browsing, real-time slot checking, and booking management.
*   **Payment Service (Port 5004)**: PayHere sandbox integration, transaction audit logs, and refund processing.
*   **Telemedicine Service (Port 5004 - Shared)**: Secure video consultations via browser.

### 3. Notification & Admin
*   **Notification Service (Port 5005)**: Integrated Twilio (SMS) and Nodemailer (Email) for real-time alerting.
*   **Doctor Management (Member 2)**: Handles verification, profile approval workflow, availability scheduling, and prescription issuance.

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose v2
- Node.js 18+
- MongoDB (Local or Atlas)
- Twilio & AI (Gemini/Groq) API Keys

### Running with Docker Compose
```bash
# Start all microservices
docker compose up --build -d
```

**Access Points:**
- **Web App**: http://localhost
- **API Gateway**: http://localhost:5000

---

## 🔑 Environment Variables

Each backend service required a `.env` file. Key variables include:
- `JWT_SECRET`: Shared secret for authentication.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`: For Notifications.
- `GEMINI_API_KEY`, `GROQ_API_KEY`: For AI Symptom Checker.

---

## 📁 Project Structure

```
SmartCareHub/
├── backend/
│   ├── ai-symptom-service/   # AI engine
│   ├── api-gateway/          # Auth proxy
│   ├── appointment-service/  # Booking service
│   ├── auth-service/         # Identity management
│   ├── doctor-service/       # Doctor profiles
│   ├── notification-service/ # Alerts (SMS/Email)
│   ├── patient-service/      # Patient records
│   ├── payment-service/      # Transaction processing
│   └── telemedicine-service/  # Video consultation engine
├── frontend/
│   ├── src/
│   │   ├── components/       # Unified UI
│   │   ├── pages/            # Role-based dashboards (Patient/Doctor/Admin)
│   │   └── services/         # API clients
│   └── Dockerfile
├── k8s/                       # Kubernetes manifests
├── docker-compose.yml
└── README.md
```
