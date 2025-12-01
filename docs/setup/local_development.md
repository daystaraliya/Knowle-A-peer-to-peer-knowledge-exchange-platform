# Local Development Guide

This guide provides step-by-step instructions for setting up and running the Knowle project on your local machine for development purposes.

### Prerequisites

Before you begin, ensure you have the following software installed on your system:

- **Node.js:** v18.x or later. ([Download](https://nodejs.org/))
- **npm:** v9.x or later (Comes with Node.js).
- **Git:** For cloning the repository. ([Download](https://git-scm.com/))
- **MongoDB:** A running instance of MongoDB. You can use a local installation or a cloud service like MongoDB Atlas. ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Redis:** A running instance of Redis for caching. ([Download](https://redis.io/))

### Step-by-Step Instructions

**1. Clone the Repository**

Open your terminal and clone the project repository from GitHub.

```bash
git clone https://github.com/your-username/knowle.git
cd knowle
```

**2. Configure Server Environment Variables**

Navigate to the `server` directory, create a `.env` file from the example, and fill it with your configuration details.

```bash
cd server
cp .env.example .env
```

Now, open the newly created `server/.env` file and add your environment-specific variables.

**`server/.env` (Example)**

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# MongoDB & Redis Connection
MONGODB_URI=mongodb://127.0.0.1:27017
REDIS_URL=redis://127.0.0.1:6379

# JWT Secrets - Use long, random strings for these
ACCESS_TOKEN_SECRET=your_super_secret_access_token
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini API Key
API_KEY=your_gemini_api_key

# Nodemailer Configuration
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...

# VAPID Keys for Web Push Notifications
# Generate these using `npx web-push generate-vapid-keys`
VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
```

**3. Install Main Server Dependencies and Run**

While still in the `server` directory, install the required npm packages and start the development server using PM2.

```bash
npm install
npm run dev
OR
pm2-dev start ecosystem.config.cjs
```

This will start the main API server, typically on port 8000. You can monitor it with `pm2 list`.

**4. Configure and Run the Communication Microservice**

Open a **new terminal tab/window**. The communication service handles real-time chat and notifications.

```bash
cd server/src/services/communicationService

# Copy the main server's .env file, as this service needs the same secrets
cp ../../../.env .

# Edit the .env file and change the PORT if needed (e.g., PORT=8001)
# The default is 8001.

npm install
npm run dev
```

The communication service should now be running on port 8001.

**5. Configure and Run the Admin & Support Microservice**

Open another **new terminal tab/window**. This service handles admin and support-level API requests.

```bash
cd admin-support-service

# Copy the main server's .env file
cp ../server/.env .

# Edit the .env file and change the PORT (e.g., PORT=8002)
# The default is 8002.

npm install
npm run dev
```

The admin & support service should now be running on port 8002.

**6. Configure Client Environment Variables**

In a new terminal, navigate to the `client` directory and create its `.env` file.

```bash
cd client
cp .env.example .env
```

Open the `client/.env` file and add the necessary variables, pointing to your running local services.

**`client/.env` (Example)**

```env
# The base URL of your main backend API server
VITE_API_BASE_URL=http://localhost:8000

# The base URL of your real-time communication microservice
VITE_COMMUNICATION_SERVICE_URL=http://localhost:8001

# The base URL of your admin & support microservice
VITE_ADMIN_API_BASE_URL=http://localhost:8002

# Your public Stripe key for Stripe.js
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Your public VAPID key for web push notifications
VITE_VAPID_PUBLIC_KEY=your_public_vapid_key
```

**7. Install Client Dependencies and Run**

While in the `client` directory, install the npm packages and start the Vite development server.

```bash
npm install
npm run dev
```

The client application should now be running and accessible at `http://localhost:3000`. You should have four processes running in separate terminals: the main server, the communication service, the admin service, and the client.
