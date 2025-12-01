# Production Deployment Guide

This document provides a high-level overview of the steps required to build and deploy the Knowle application to a production environment. The specific commands and configurations may vary depending on your chosen hosting provider, but this guide focuses on a modern, container-based approach suitable for scalability.

### Overview

Deploying a full-stack MERN application with a microservices architecture involves several key parts:

1.  **Deploying the Main Node.js Backend:** The main API server needs to run in a scalable Node.js environment.
2.  **Deploying the Communication Microservice:** The real-time service must be deployed separately to allow for independent scaling.
3.  **Deploying the Admin & Support Microservice:** The service for elevated user roles also needs to be deployed independently.
4.  **Building and Deploying the React Frontend:** The client application needs to be built into static files (HTML, CSS, JS) and served by a static hosting service or a web server.
5.  **Provisioning Production Services:** Setting up a production-grade database (MongoDB) and cache (Redis).

### Build Process

**Client Application**

Before deploying the client, you need to create a production-ready build. Navigate to the `client` directory and run the build script:

```bash
cd client
npm run build
```

This command will create a `dist` directory in the `client` folder. This directory contains the optimized, minified static assets that should be deployed.

**Server Applications**

The backend services do not have a traditional "build" step. You will deploy their source code directly to your production environment, which will then be run inside a container using Node.js.

### Deployment Steps (Example: Google Cloud Run)

Here is a conceptual guide for deploying to a platform like Google Cloud Run, which is excellent for containerized applications.

**1. Containerize the Applications**

-   Create a `Dockerfile` for the main API server (`server/Dockerfile`). This file will define the steps to create a Docker image containing the Node.js application and its dependencies. It should copy the main server code, run `npm install`, and specify the start command (`npm start`).
-   Create a separate `Dockerfile` for the communication microservice (`server/src/services/communicationService/Dockerfile`).
-   Create a separate `Dockerfile` for the admin & support microservice (`admin-support-service/Dockerfile`).
-   Create a `Dockerfile` for the client (`client/Dockerfile`). This can use a multi-stage build: one stage to build the static assets with `npm run build`, and a final, lightweight stage (e.g., using `nginx`) to serve the contents of the `dist` folder.

**2. Set Up Production Database & Cache**

-   Use a managed database service like **MongoDB Atlas**. Create a new cluster, configure firewall rules to allow connections from your deployment service, and obtain the production database connection string (`MONGODB_URI`).
-   Use a managed caching service like **Redis Enterprise Cloud** or **Google Cloud Memorystore**. Obtain the production Redis connection string (`REDIS_URL`).

**3. Configure Environment Variables**

-   In your hosting provider's dashboard (e.g., Google Cloud Run service settings), securely store all the environment variables defined in your `.env` files for each service.
-   **Crucially, do not commit your `.env` files to version control.**
-   For the client, `VITE_API_BASE_URL`, `VITE_COMMUNICATION_SERVICE_URL`, and `VITE_ADMIN_API_BASE_URL` must be set to the public URLs of your deployed backend services.
-   For all backend services, `CORS_ORIGIN` must be set to the public URL of your deployed frontend service.

**4. Build and Push Docker Images**

-   Use a container registry service like Google Container Registry (GCR) or Docker Hub.
-   Build your client, server, communication service, and admin service Docker images.
-   Push the images to your container registry.

```bash
# Example commands
# Build and push main server
docker build -t gcr.io/your-project/knowle-server -f server/Dockerfile .
docker push gcr.io/your-project/knowle-server

# Build and push communication service
docker build -t gcr.io/your-project/knowle-comms -f server/src/services/communicationService/Dockerfile .
docker push gcr.io/your-project/knowle-comms

# Build and push admin service
docker build -t gcr.io/your-project/knowle-admin -f admin-support-service/Dockerfile .
docker push gcr.io/your-project/knowle-admin

# Build and push client
docker build -t gcr.io/your-project/knowle-client -f client/Dockerfile .
docker push gcr.io/your-project/knowle-client
```

**5. Deploy to Cloud Run**

-   Create four new services in Cloud Run: `knowle-server`, `knowle-communication-service`, `knowle-admin-service`, and `knowle-client`.
-   When creating each service, select the corresponding container image you pushed to the registry.
-   Configure the environment variables for each service as defined in step 3.
-   Set appropriate CPU, memory, and auto-scaling rules for each service. The communication service might need different settings from the main API depending on usage.
-   Deploy the services.

Once deployed, you will have public URLs for your frontend and backend services, and the application will be live and ready to scale.