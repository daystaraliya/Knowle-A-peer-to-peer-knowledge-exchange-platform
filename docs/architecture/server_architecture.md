# Server-Side Architecture

The Knowle server is built with Node.js and the Express.js framework, following a modular and layered architecture that has been adapted for scalability. This design promotes separation of concerns, making the API maintainable, testable, and ready for high-concurrency environments.

### Overview

The server's primary responsibility is to provide a RESTful API for the client application. It handles user authentication, business logic, and database interactions. The structure is organized by feature, with a clear and logical flow for handling incoming HTTP requests. A key architectural decision is the decoupling of real-time communication into a separate microservice.

**Request Flow (Main API):**

An incoming request from the client follows this path:

1.  **`index.js`**: The main entry point that initializes the Express app, connects to the database and Redis, and starts the HTTP server.
2.  **`app.js`**: The central Express application file where all middleware is configured and API routes are mounted.
3.  **Middleware:** The request passes through global middleware (CORS, cookie-parser, JSON body parser).
4.  **`src/routes/`**: The request is directed to the appropriate router based on its URL (e.g., `/api/v1/users` is handled by `user.routes.js`).
5.  **`auth.middleware.js`**: For protected endpoints, this middleware validates the user's JWT from cookies.
6.  **`src/controllers/`**: The router calls the corresponding controller function, which contains the core business logic for the request.
7.  **`src/services/`**: For complex or asynchronous tasks (like AI analysis), the controller may delegate work to a service module.
8.  **`src/utils/cache.js`**: The controller first checks the Redis cache for data before querying the database to improve performance.
9.  **`src/models/`**: If data is not cached, the controller interacts with Mongoose models to perform CRUD (Create, Read, Update, Delete) operations on the MongoDB database.
10. **Response:** The controller sends a structured JSON response back to the client using the `ApiResponse` utility, and caches the result in Redis for future requests.

### Core Modules

-   **`src/db/index.js`**: Contains the logic for establishing and managing the connection to the MongoDB database using Mongoose. It's configured to support replica sets for production scalability.
-   **`src/routes/`**: Defines the API endpoints. Each file (e.g., `user.routes.js`) creates an Express router and maps specific HTTP methods and URL paths to controller functions.
-   **`src/controllers/`**: Holds the business logic. Controllers extract data from the request, perform validation, interact with the cache and database, and formulate the final response. They are wrapped with `asyncHandler` for robust error handling.
-   **`src/models/`**: Defines the data structure using Mongoose schemas. Each model file corresponds to a collection in MongoDB and includes schema definitions, indexes, pre-save hooks (e.g., for password hashing), and instance methods.
-   **`src/utils/`**: A collection of reusable helper modules and classes.
    -   `asyncHandler.js`: A wrapper for route handlers to catch errors in asynchronous operations.
    -   `ApiError.js` & `ApiResponse.js`: Custom classes for standardizing error and success responses.
    -   `cloudinary.js`: A utility for uploading files to the Cloudinary service.
    -   `cache.js`: A module that abstracts Redis caching logic (`get`, `set`, `del`).
    -   `gemini.js`: A service layer for interacting with the Google Gemini API.
-   **`src/middlewares/`**: Contains custom middleware functions. The most important is `auth.middleware.js`, which validates the user's JWT to protect authenticated routes.
-   **`src/services/`**: Contains decoupled business logic, especially for background tasks or interactions with external APIs.
    -   `communicationService/`: A standalone microservice for handling all real-time WebSocket communication via Socket.IO. It runs as a separate Node.js process.
    -   `reviewAnalysis.service.js`: A service to trigger AI-powered analysis of user reviews asynchronously.

### Scalability and Performance
-   **Horizontal Scaling:** The application is configured to run in a cluster using **PM2** (`ecosystem.config.js`), allowing it to utilize all available CPU cores and handle a higher load.
-   **Microservices:** Real-time chat and notifications are offloaded to the `communicationService`, which can be scaled independently of the main stateless API. This is crucial for handling thousands of concurrent WebSocket connections.
-   **Caching:** A **Redis** caching layer is implemented to reduce database load and decrease API latency for frequently accessed data, such as user profiles.