# Dispute API Endpoints

The Dispute API provides endpoints for users to manage and resolve issues related to their knowledge exchanges. It is the primary interface for the platform's resolution center. All endpoints require authentication.

---

### POST /api/v1/disputes

Files a new dispute ticket for a completed or ongoing exchange.

-   **Method:** `POST`
-   **URL:** `/api/v1/disputes`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "exchangeId": "60d0fe4f5b3a3d001f8e4e2c",
      "reason": "User didn't show up",
      "description": "I waited for 30 minutes in the video call but the other user never joined the session."
    }
    ```

-   **Success Response (201):** Returns the newly created dispute object. The system also automatically adds an initial AI-generated message to the dispute thread to provide immediate feedback.

    ```json
    {
      "statusCode": 201,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2d",
        "relatedExchange": "60d0fe4f5b3a3d001f8e4e2c",
        "complainant": "currentUserId",
        "respondent": "otherUserId",
        "reason": "User didn't show up",
        "status": "open",
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      "message": "Dispute filed successfully. Our team will review it shortly.",
      "success": true
    }
    ```
-   **Error Response (409):** If a dispute for this exchange already exists.

---

### GET /api/v1/disputes

Retrieves a list of all disputes the authenticated user is involved in, either as the complainant or the respondent.

-   **Method:** `GET`
-   **URL:** `/api/v1/disputes`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "_id": "60d0fe4f5b3a3d001f8e4e2d",
          "status": "open",
          "reason": "User didn't show up",
          "complainant": { "fullName": "John Doe" },
          "respondent": { "fullName": "Jane Smith" },
          "createdAt": "2023-01-01T00:00:00.000Z"
        }
      ],
      "message": "User disputes retrieved successfully.",
      "success": true
    }
    ```

---

### GET /api/v1/disputes/:disputeId

Retrieves the full details of a single dispute, including its message history.

-   **Method:** `GET`
-   **URL:** `/api/v1/disputes/:disputeId`
-   **Authentication:** Requires valid JWT token in cookie. User must be a participant.
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {
        "dispute": {
          "_id": "60d0fe4f5b3a3d001f8e4e2d",
          "status": "open",
          "..." : "..."
        },
        "messages": [
          {
            "_id": "...",
            "content": "Thank you for your report. Our team is looking into it...",
            "isSupportMessage": true,
            "createdAt": "..."
          },
          {
            "_id": "...",
            "author": { "_id": "...", "fullName": "John Doe", "avatar": "..." },
            "content": "Here is a screenshot of the empty call.",
            "isSupportMessage": false,
            "createdAt": "..."
          }
        ]
      },
      "message": "Dispute details and messages retrieved.",
      "success": true
    }
    ```

---

### POST /api/v1/disputes/:disputeId/messages

Posts a new message to the dispute conversation thread.

-   **Method:** `POST`
-   **URL:** `/api/v1/disputes/:disputeId/messages`
-   **Authentication:** Requires valid JWT token in cookie. User must be a participant.
-   **Request Body:**

    ```json
    {
      "content": "I have uploaded the evidence you requested."
    }
    ```
-   **Success Response (201):**

    ```json
    {
      "statusCode": 201,
      "data": {
        "_id": "...",
        "author": { "_id": "currentUserId", "fullName": "John Doe", "avatar": "..." },
        "content": "I have uploaded the evidence you requested.",
        "isSupportMessage": false,
        "createdAt": "..."
      },
      "message": "Message posted successfully.",
      "success": true
    }
    ```
-   **Error Response (400):** If the dispute is already resolved.