# SmartCareHub

SmartCareHub is a shared healthcare project built for doctor, admin, and patient workflows. The current repository includes a React frontend, a doctor management microservice, a patient-service folder, and Kubernetes manifests for the doctor-service stack.

## Project Structure

```text
SmartCareHub/
├── frontend/                 # Shared Create React App frontend
├── backend/
│   ├── doctor-service/       # Doctor management microservice
│   ├── patient-service/      # Patient-related backend work
│   └── k8s/                  # Kubernetes manifests
└── README.md
```

## Main Modules

- Shared frontend for doctor and admin dashboards
- Doctor management service
- Doctor profile CRUD
- Availability management
- Appointment request handling
- Prescription management
- Admin verification for doctor registrations
- Kubernetes setup for doctor-service and MongoDB

## Tech Stack

- Frontend: React, React Router, Axios, Create React App
- Backend: Node.js, Express, MongoDB, Mongoose
- Containerization: Docker
- Orchestration: Kubernetes

## Frontend Setup

Path: [frontend](C:/Users/nithu/Desktop/SmartCareHub/frontend)

### Install dependencies

```powershell
cd C:\Users\nithu\Desktop\SmartCareHub\frontend
npm install
```

### Run development server

```powershell
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

### Build frontend

```powershell
npm run build
```

## Doctor Service Setup

Path: [backend/doctor-service](C:/Users/nithu/Desktop/SmartCareHub/backend/doctor-service)

### Install dependencies

```powershell
cd C:\Users\nithu\Desktop\SmartCareHub\backend\doctor-service
npm install
```

### Run locally

Create a `.env` file in `backend/doctor-service` with values like:

```env
NODE_ENV=production
PORT=5002
MONGO_URI=mongodb://localhost:27017/doctor_service_db
JWT_SECRET=change_this_super_secret_key
JWT_EXPIRES_IN=1d
APPOINTMENT_SERVICE_MODE=mock
```

Then run:

```powershell
npm start
```

Doctor service base URL:

```text
http://localhost:5002/api
```

### Main Doctor Service Endpoints

- `POST /api/doctors/register`
- `POST /api/doctors/login`
- `GET /api/doctors/:id`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`
- `POST /api/availability`
- `GET /api/availability/:doctorId`
- `PUT /api/availability/:id`
- `DELETE /api/availability/:id`
- `GET /api/appointments/doctor/:id`
- `POST /api/prescriptions`
- `PUT /api/prescriptions/:id`
- `DELETE /api/prescriptions/:id`
- `GET /api/prescriptions/:doctorId`
- `PUT /api/admin/doctors/approve/:id`
- `PUT /api/admin/doctors/reject/:id`
- `GET /api/admin/doctors`

## Docker

Build the doctor-service image:

```powershell
cd C:\Users\nithu\Desktop\SmartCareHub
docker build -t doctor-service:latest .\backend\doctor-service
```

## Kubernetes

Path: [backend/k8s](C:/Users/nithu/Desktop/SmartCareHub/backend/k8s)

The Kubernetes folder includes:

- `doctor-service-configmap.yaml`
- `doctor-service-secret.yaml`
- `doctor-service-deployment.yaml`
- `doctor-service-service.yaml`
- `mongo-deployment.yaml`
- `mongo-service.yaml`

### Apply manifests

```powershell
cd C:\Users\nithu\Desktop\SmartCareHub
kubectl apply -f backend\k8s\
```

### Check resources

```powershell
kubectl get pods
kubectl get svc
```

### Watch pod startup

```powershell
kubectl get pods -w
```

### Port forward doctor-service

```powershell
kubectl port-forward service/doctor-service 5002:80
```

Then test:

```text
http://localhost:5002/health
```

## Current Notes

- The frontend is a single shared app, not separate doctor/admin apps.
- The doctor-service Kubernetes setup now includes MongoDB manifests required by `MONGO_URI`.
- Some frontend areas use mock service behavior where backend endpoints are not fully connected yet.
- `patient-service` exists in the repository but is not yet documented in detail here.

## Troubleshooting

### ErrImagePull or ImagePullBackOff

Build the image locally first:

```powershell
docker build -t doctor-service:latest .\backend\doctor-service
```

### Pod Running but 0/1 Ready

Check logs:

```powershell
kubectl logs deployment/doctor-service
kubectl logs deployment/mongo
```

### Restart deployment

```powershell
kubectl rollout restart deployment doctor-service
```

## Contributors

This project is being developed as a group healthcare platform project with shared frontend and backend modules.
