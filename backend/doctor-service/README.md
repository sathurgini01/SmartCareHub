# Doctor Service

## Run locally

1. Copy environment file:
   - `cp .env.example .env` (or create `.env` manually on Windows)
2. Install dependencies:
   - `npm install`
3. Start dev server:
   - `npm run dev`

## API base

- `http://localhost:5002/api`

## Main endpoints

- Auth:
  - `POST /api/doctors/register`
  - `POST /api/doctors/login`
- Doctor profile:
  - `GET /api/doctors/:id`
  - `PUT /api/doctors/:id`
  - `DELETE /api/doctors/:id`
- Availability:
  - `POST /api/availability`
  - `GET /api/availability/:doctorId`
  - `PUT /api/availability/:id`
  - `DELETE /api/availability/:id`
- Appointments:
  - `GET /api/appointments/doctor/:id`
- Prescriptions:
  - `POST /api/prescriptions`
  - `PUT /api/prescriptions/:id`
  - `DELETE /api/prescriptions/:id`
  - `GET /api/prescriptions/:doctorId`
- Admin:
  - `PUT /api/admin/doctors/approve/:id`
  - `PUT /api/admin/doctors/reject/:id`
  - `GET /api/admin/doctors`

## Docker

- `docker compose up --build`

## Kubernetes

- Apply all manifests from `../k8s/`.
- This folder now includes:
  - `mongo-deployment.yaml`
  - `mongo-service.yaml`
  - doctor-service config, secret, deployment, and service manifests
