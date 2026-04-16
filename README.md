# SmartCareHub
Smart Healthcare Appointment & Telemedicine Microservices Platform

> **SLIIT Distributed Systems Project - Member 3**  
> Appointment Service + Payment Service + Booking UI

## 🏗️ Architecture

This project follows a **microservices architecture** using the MERN stack:

```
                    React Frontend (Vite) :3000
                           │
                    ┌──────▼──────┐
                    │ API Gateway  │ :5000
                    └──┬───────┬──┘
             ┌─────────▼─┐  ┌─▼──────────┐
             │Appointment │  │  Payment   │
             │  Service   │  │  Service   │
             │  :5001     │  │  :5002     │
             └─────┬──────┘  └─────┬──────┘
                   │               │
             ┌─────▼──────┐ ┌─────▼──────┐
             │ MongoDB     │ │ MongoDB     │
             │ appointments│ │ payments    │
             └─────────────┘ └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

### 1. Start MongoDB
Make sure MongoDB is running on `localhost:27017`

### 2. Start Backend Services
Open 3 separate terminals:

```bash
# Terminal 1 - Appointment Service
cd backend/appointment-service
npm run dev

# Terminal 2 - Payment Service
cd backend/payment-service
npm run dev

# Terminal 3 - API Gateway
cd backend/api-gateway
npm run dev
```

### 3. Start Frontend
```bash
cd frontend/patient-portal
npm install
npm start
```

### 4. Open Browser
Navigate to `http://localhost:3000`

## 📋 Features

### Appointment Service (Port 5001)
- ✅ Doctor browsing with specialty filters
- ✅ Real-time slot availability checking
- ✅ Double-booking prevention
- ✅ Appointment CRUD (Book, View, Modify, Cancel)
- ✅ Status tracking (pending → confirmed → completed)
- ✅ Admin: View all appointments, force-cancel

### Payment Service (Port 5002)
- ✅ PayHere payment gateway integration (Sandbox)
- ✅ Simulated payment processing for testing
- ✅ Payment lifecycle (pending → completed / refunded)
- ✅ Immutable transaction audit logs
- ✅ Admin: View all payments, process refunds

### API Gateway (Port 5000)
- ✅ Request proxying to microservices
- ✅ JWT authentication
- ✅ Rate limiting (100 req/15min)
- ✅ Mock auth endpoint for standalone testing

### Frontend (Port 3000)
- ✅ Premium responsive UI with animations
- ✅ Browse doctors by specialty
- ✅ Interactive time slot picker
- ✅ Step-by-step booking flow
- ✅ PayHere payment integration
- ✅ Payment history & receipts
- ✅ Admin dashboard with stats

## 🔗 Integration Points

### With Member 1 (Patient Service)
- Replace mock auth: `api-gateway/server.js` → `/api/auth/login`
- JWT format: `{ userId, role, name, email }` with shared secret
- Shared JWT Secret: `healthcare_microservices_shared_jwt_secret_2024_sliit`

### With Member 2 (Doctor Service)
- Replace mock doctors: `appointment-service/models/Doctor.js`
- Set `DOCTOR_SERVICE_URL` env variable
- Doctor schema fields are designed to match expected Doctor Service format

### With Member 4 (Notification Service)
- Emit events on: appointment booked, payment completed, appointment cancelled
- Event format documented in controllers

## 🧪 Testing

### Test Cards (PayHere Sandbox)
| Card Type | Number |
|-----------|--------|
| Visa | 4916 2175 0161 1292 |
| MasterCard | 5307 7321 2553 1191 |
| AMEX | 3467 8100 5510 225 |

CVV: Any 3 digits | Expiry: Any future date

### Quick Login
Use the demo login buttons on the login page:
- **Patient**: Full booking flow access
- **Doctor**: Appointment management
- **Admin**: Dashboard with all data

## 📁 Project Structure

```
├── backend/
│   ├── api-gateway/          # Entry point, proxying, auth
│   ├── appointment-service/  # Booking engine, doctor data
│   ├── patient-service/      # Main patient service
│   └── payment-service/      # PayHere integration, transactions
├── frontend/
│   └── patient-portal/       # Combined React frontend
└── README.md
```

## ⚙️ Environment Variables

Each service has its own `.env` file. Key shared config:
- `JWT_SECRET`: Must be identical across all services
- `MONGODB_URI`: Separate database per service
- `PAYHERE_*`: PayHere sandbox credentials

## 🐳 Docker Compose Deployment

You can build and run the entire application stack using Docker Compose.

### Prerequisites
- Docker installed
- Docker Compose installed

### Start the Application
Run the following command at the root of the project:
```bash
docker-compose up --build -d
```
*Wait a minute for the MongoDB container to initialize and backend services to connect.*

- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:5000`
- MongoDB: `localhost:27017`

### Stop the Application
```bash
docker-compose down
```

## ☸️ Kubernetes Deployment (Minikube)

You can also deploy the application locally using Minikube.

### Prerequisites
- Minikube installed
- kubectl installed

### 1. Start Minikube
```bash
minikube start
```

### 2. Apply Kubernetes Manifests
Navigate to the root directory and apply the manifests:
```bash
kubectl apply -f k8s/
```

### 3. Access the Services
To access the API Gateway or Frontend, you can use Minikube's service or tunnel command:

```bash
# Get the IP and Port for the Frontend LoadBalancer
minikube service frontend

# Get the IP and Port for the API Gateway LoadBalancer
minikube service api-gateway
```

If LoadBalancer stays in `<pending>` state, run in a separate terminal:
```bash
minikube tunnel
```
Now you can access the frontend at the external IP provided by `kubectl get svc frontend`.
