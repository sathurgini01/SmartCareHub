========================================================
SmartCareHub – Deployment Guide
SE3020 Distributed Systems | Group SE-51
Member 4: Sathurgini Kalanantharasan (IT23534704)
Services: Telemedicine | Notification | AI Symptom
========================================================

OVERVIEW
--------
This guide covers the steps to deploy the three microservices
and the React frontend developed by Member 4.

  Backend Services:
    - Telemedicine Service   → port 5004
    - Notification Service   → port 5005
    - AI Symptom Service     → port 5006

  Frontend (React):          → port 3000

========================================================
PREREQUISITES
========================================================

Required Software:
  - Node.js (v18 or later)
  - npm (v9 or later)
  - Docker Desktop (v20.10 or later)
  - MongoDB (local or Atlas cloud)
  - Git

For Kubernetes Deployment:
  - Minikube (v1.30 or later)
  - kubectl (v1.27 or later)

Required API Keys/Services:
  - MongoDB URI (local or MongoDB Atlas)
  - JWT Secret (for authentication)
  - Twilio Account SID, Auth Token, Phone Number (for SMS)
  - Email credentials (for email notifications)
  - Gemini API Key (for AI symptom analysis)
  - Groq API Key (for AI symptom analysis)

========================================================
PART 1 – MANUAL DEPLOYMENT (Node.js)
========================================================

STEP 1 – Clone the repository
  git clone https://github.com/sathurgini01/SmartCareHub.git
  cd SmartCareHub

STEP 2 – Install dependencies for each service

  # Backend Services
  cd backend/telemedicine-service
  npm install

  cd ../notification-service
  npm install

  cd ../ai-symptom-service
  npm install

  # Frontend
  cd ../../frontend
  npm install

STEP 3 – Configure environment variables

  Create .env files for each backend service:

  backend/telemedicine-service/.env:
    PORT=5004
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    NODE_ENV=production

  backend/notification-service/.env:
    PORT=5005
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    TWILIO_ACCOUNT_SID=your_twilio_sid
    TWILIO_AUTH_TOKEN=your_twilio_token
    TWILIO_PHONE_NUMBER=your_twilio_number
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_app_password
    NODE_ENV=production

  backend/ai-symptom-service/.env:
    PORT=5006
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    GROQ_API_KEY=your_groq_api_key
    NODE_ENV=production

  frontend/.env:
    REACT_APP_API_URL=http://localhost:5004
    REACT_APP_TELEMEDICINE_URL=http://localhost:5004
    REACT_APP_NOTIFICATION_URL=http://localhost:5005
    REACT_APP_AI_SYMPTOM_URL=http://localhost:5006

STEP 4 – Start MongoDB
  # If using local MongoDB
  mongod

  # Or use MongoDB Atlas cloud connection in .env files

STEP 5 – Start Backend Services

  # Terminal 1 - Telemedicine Service
  cd backend/telemedicine-service
  npm start

  # Terminal 2 - Notification Service
  cd backend/notification-service
  npm start

  # Terminal 3 - AI Symptom Service
  cd backend/ai-symptom-service
  npm start

STEP 6 – Start Frontend
  cd frontend
  npm start

  Frontend will be available at: http://localhost:3000

STEP 7 – Verify services are running
  http://localhost:5004/health   → Telemedicine Service
  http://localhost:5005/health   → Notification Service
  http://localhost:5006/health   → AI Symptom Service

========================================================
PART 2 – DOCKER (Containerised Deployment)
========================================================

PREREQUISITES
  - Docker Desktop installed and running
  - Docker version 20.10 or later

STEP 1 – Clone the repository
  git clone https://github.com/sathurgini01/SmartCareHub.git
  cd SmartCareHub

STEP 2 – Build Docker images for each service

  docker build -t telemedicine-service:latest \
    backend/telemedicine-service/

  docker build -t notification-service:latest \
    backend/notification-service/

  docker build -t ai-symptom-service:latest \
    backend/ai-symptom-service/

  # For frontend (create Dockerfile first in frontend folder)
  docker build -t smartcarehub-frontend:latest frontend/

STEP 3 – Run the containers

  docker run -d \
    -p 5004:5004 \
    -e PORT=5004 \
    -e MONGO_URI=<your-mongodb-uri> \
    -e JWT_SECRET=<your-jwt-secret> \
    --name telemedicine-service \
    telemedicine-service:latest

  docker run -d \
    -p 5005:5005 \
    -e PORT=5005 \
    -e MONGO_URI=<your-mongodb-uri> \
    -e JWT_SECRET=<your-jwt-secret> \
    -e TWILIO_ACCOUNT_SID=<your-twilio-sid> \
    -e TWILIO_AUTH_TOKEN=<your-twilio-token> \
    -e TWILIO_PHONE_NUMBER=<your-twilio-number> \
    -e EMAIL_USER=<your-email> \
    -e EMAIL_PASS=<your-email-password> \
    --name notification-service \
    notification-service:latest

  docker run -d \
    -p 5006:5006 \
    -e PORT=5006 \
    -e MONGO_URI=<your-mongodb-uri> \
    -e JWT_SECRET=<your-jwt-secret> \
    -e GEMINI_API_KEY=<your-gemini-api-key> \
    -e GROQ_API_KEY=<your-groq-api-key> \
    --name ai-symptom-service \
    ai-symptom-service:latest

  docker run -d \
    -p 3000:3000 \
    -e REACT_APP_API_URL=http://localhost:5004 \
    -e REACT_APP_TELEMEDICINE_URL=http://localhost:5004 \
    -e REACT_APP_NOTIFICATION_URL=http://localhost:5005 \
    -e REACT_APP_AI_SYMPTOM_URL=http://localhost:5006 \
    --name smartcarehub-frontend \
    smartcarehub-frontend:latest

STEP 4 – Verify containers are running
  docker ps

  Health check endpoints:
    http://localhost:5004/health   → Telemedicine Service
    http://localhost:5005/health   → Notification Service
    http://localhost:5006/health   → AI Symptom Service
    http://localhost:3000         → Frontend

STEP 5 – Stop and remove containers (when done)
  docker stop telemedicine-service notification-service ai-symptom-service smartcarehub-frontend
  docker rm telemedicine-service notification-service ai-symptom-service smartcarehub-frontend

========================================================
PART 3 – DOCKER COMPOSE (All-in-One)
========================================================

Create a docker-compose.yml in SmartCareHub root:

  version: '3.8'
  services:
    telemedicine-service:
      build: ./backend/telemedicine-service
      ports:
        - "5004:5004"
      environment:
        - PORT=5004
        - MONGO_URI=mongodb://mongo:27017/telemedicine
        - JWT_SECRET=your_jwt_secret
        - NODE_ENV=production
      depends_on:
        - mongo

    notification-service:
      build: ./backend/notification-service
      ports:
        - "5005:5005"
      environment:
        - PORT=5005
        - MONGO_URI=mongodb://mongo:27017/notification
        - JWT_SECRET=your_jwt_secret
        - TWILIO_ACCOUNT_SID=your_twilio_sid
        - TWILIO_AUTH_TOKEN=your_twilio_token
        - TWILIO_PHONE_NUMBER=your_twilio_number
        - EMAIL_USER=your_email
        - EMAIL_PASS=your_email_password
        - NODE_ENV=production
      depends_on:
        - mongo

    ai-symptom-service:
      build: ./backend/ai-symptom-service
      ports:
        - "5006:5006"
      environment:
        - PORT=5006
        - MONGO_URI=mongodb://mongo:27017/aisymptom
        - JWT_SECRET=your_jwt_secret
        - GEMINI_API_KEY=your_gemini_api_key
        - GROQ_API_KEY=your_groq_api_key
        - NODE_ENV=production
      depends_on:
        - mongo

    frontend:
      build: ./frontend
      ports:
        - "3000:3000"
      environment:
        - REACT_APP_API_URL=http://localhost:5004
        - REACT_APP_TELEMEDICINE_URL=http://localhost:5004
        - REACT_APP_NOTIFICATION_URL=http://localhost:5005
        - REACT_APP_AI_SYMPTOM_URL=http://localhost:5006

    mongo:
      image: mongo:latest
      ports:
        - "27017:27017"
      volumes:
        - mongo-data:/data/db

  volumes:
    mongo-data:

To run:
  docker-compose up --build

To stop:
  docker-compose down

========================================================
PART 4 – KUBERNETES (k8s with Minikube)
========================================================

PREREQUISITES
  - Docker Desktop installed and running
  - Minikube installed (v1.30 or later)
  - kubectl installed (v1.27 or later)

NOTE: The k8s YAML files use imagePullPolicy: Never, so
Docker images must be built inside Minikube's own Docker
daemon (not your local machine's Docker).

STEP 1 – Start Minikube
  minikube start

STEP 2 – Point Docker CLI to Minikube's Docker daemon
  eval $(minikube docker-env)

STEP 3 – Build Docker images inside Minikube
  (Run from the SmartCareHub root directory)

  docker build -t telemedicine-service:latest \
    backend/telemedicine-service/

  docker build -t notification-service:latest \
    backend/notification-service/

  docker build -t ai-symptom-service:latest \
    backend/ai-symptom-service/

  # Build frontend (you need to create a Dockerfile in frontend folder)
  docker build -t smartcarehub-frontend:latest frontend/

STEP 4 – Apply the Kubernetes deployment files
  kubectl apply -f k8s/telemedicine-deployment.yaml
  kubectl apply -f k8s/notification-deployment.yaml
  kubectl apply -f k8s/ai-symptom-deployment.yaml

STEP 5 – Verify pods and services are running
  kubectl get pods
  kubectl get services

  Expected NodePorts:
    telemedicine-service  → NodePort 30004
    notification-service  → NodePort 30005
    ai-symptom-service    → NodePort 30006

STEP 6 – Access the services
  minikube service telemedicine-service --url
  minikube service notification-service --url
  minikube service ai-symptom-service --url

  Or get the Minikube IP and access directly:
    minikube ip
    http://<minikube-ip>:30004/health
    http://<minikube-ip>:30005/health
    http://<minikube-ip>:30006/health

STEP 7 – Teardown (when done)
  kubectl delete -f k8s/telemedicine-deployment.yaml
  kubectl delete -f k8s/notification-deployment.yaml
  kubectl delete -f k8s/ai-symptom-deployment.yaml
  minikube stop

========================================================
ENVIRONMENT VARIABLES REFERENCE
========================================================

Telemedicine Service (Port 5004):
  - PORT: Service port (default: 5004)
  - MONGO_URI: MongoDB connection string
  - JWT_SECRET: Secret for JWT token signing
  - NODE_ENV: Environment (production/development)

Notification Service (Port 5005):
  - PORT: Service port (default: 5005)
  - MONGO_URI: MongoDB connection string
  - JWT_SECRET: Secret for JWT token signing
  - TWILIO_ACCOUNT_SID: Twilio Account SID
  - TWILIO_AUTH_TOKEN: Twilio Auth Token
  - TWILIO_PHONE_NUMBER: Twilio Phone Number
  - EMAIL_USER: Gmail address for sending emails
  - EMAIL_PASS: Gmail App Password
  - NODE_ENV: Environment (production/development)

AI Symptom Service (Port 5006):
  - PORT: Service port (default: 5006)
  - MONGO_URI: MongoDB connection string
  - JWT_SECRET: Secret for JWT token signing
  - GEMINI_API_KEY: Google Gemini API Key
  - GROQ_API_KEY: Groq API Key
  - NODE_ENV: Environment (production/development)

Frontend (Port 3000):
  - REACT_APP_API_URL: Backend API base URL
  - REACT_APP_TELEMEDICINE_URL: Telemedicine service URL
  - REACT_APP_NOTIFICATION_URL: Notification service URL
  - REACT_APP_AI_SYMPTOM_URL: AI Symptom service URL

========================================================
PORT REFERENCE SUMMARY
========================================================

  Service                   Docker Port   K8s NodePort
  ──────────────────────────────────────────────────────
  Telemedicine Service      5004          30004
  Notification Service      5005          30005
  AI Symptom Service        5006          30006
  Frontend (React)          3000          30000
  MongoDB                   27017         27017

========================================================
TROUBLESHOOTING
========================================================

1. Connection refused errors:
   - Check if MongoDB is running
   - Verify MONGO_URI is correct
   - Check firewall settings

2. Container not starting:
   - Check Docker logs: docker logs <container-name>
   - Verify all environment variables are set
   - Check port conflicts: lsof -i :<port>

3. Frontend API calls failing:
   - Verify REACT_APP_*_URL environment variables
   - Check backend services are running
   - Check CORS settings in backend

4. Kubernetes pod issues:
   - Check pod logs: kubectl logs <pod-name>
   - Check pod status: kubectl describe pod <pod-name>
   - Verify images exist: docker images

========================================================
REPOSITORY
========================================================
  GitHub: https://github.com/sathurgini01/SmartCareHub.git

  For issues or questions, contact: sathurgini@student.uwu.ac.lk

========================================================