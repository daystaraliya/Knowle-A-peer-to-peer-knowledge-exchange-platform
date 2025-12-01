# Exchange API Endpoints

The Exchange API manages the process of finding matches and facilitating knowledge exchanges between users. All endpoints require authentication.

---

### GET /api/v1/exchanges/matches

Finds potential knowledge exchange partners for the authenticated user, ranked by an AI.

-   **Method:** `GET`
-   **URL:** `/api/v1/exchanges/matches`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Query Parameters:**
    -   `language` (optional, string): Filters matches by a spoken language (e.g., `?language=English`).
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "_id": "60d0fe4f5b3a3d001f8e4e2b",
          "fullName": "Jane Smith",
          "username": "janesmith",
          "avatar": "https://...",
          "matchReason": "Jane is an expert in React, which you want to learn, and is eager to learn about Node.js from you.",
          "topicsToTeach": [{ "_id": "...", "name": "React" }],
          "topicsToLearn": [{ "_id": "...", "name": "Node.js" }]
        }
      ],
      "message": "AI-powered matches retrieved successfully",
      "success": true
    }
    ```

---

### POST /api/v1/exchanges

This endpoint is part of the legacy flow and is now superseded by the Agreement system. See the Agreement API for the current implementation.

---

### GET /api/v1/exchanges/:exchangeId

Retrieves the details of a specific exchange. The user must be a participant.

-   **Method:** `GET`
-   **URL:** `/api/v1/exchanges/:exchangeId`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** None
-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2c",
        "status": "accepted",
        "initiator": { "fullName": "John Doe", "slug": "john-doe", "..." },
        "receiver": { "fullName": "Jane Smith", "slug": "jane-smith", "..." },
        "topicToLearn": { "name": "React" },
        "topicToTeach": { "name": "Node.js" }
      },
      "message": "Exchange details retrieved successfully",
      "success": true
    }
    ```

---

### PATCH /api/v1/exchanges/:exchangeId/status

Updates the status of an exchange. This endpoint is used for cancelling an exchange or for the legacy flow of accepting/rejecting (now handled by Agreements).

-   **Method:** `PATCH`
-   **URL:** `/api/v1/exchanges/:exchangeId/status`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "status": "cancelled"
    }
    ```
- **Valid Statuses:** `accepted`, `rejected`, `cancelled`. **Note:** The `completed` status is now handled exclusively by the `confirm-completion` endpoint as part of a two-step process.

-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2c",
        "status": "cancelled",
        "..." : "..."
      },
      "message": "Exchange has been cancelled.",
      "success": true
    }
    ```

---

### POST /api/v1/exchanges/:exchangeId/confirm-completion

Marks an `accepted` exchange as completed by the authenticated user. This is part of the two-step completion flow.

-   **Method:** `POST`
-   **URL:** `/api/v1/exchanges/:exchangeId/confirm-completion`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** None.
-   **Logic:**
    1.  The first participant to call this endpoint sets their corresponding boolean flag (`initiatorCompleted` or `receiverCompleted`) to `true`. The exchange status remains `accepted`.
    2.  When the second participant calls this endpoint, their flag is set to `true`.
    3.  Because both flags are now true, the server automatically updates the exchange `status` to `completed` and triggers all post-completion logic (e.g., awarding achievements).
-   **Success Response (200) after first confirmation:**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2c",
        "status": "accepted",
        "initiatorCompleted": true,
        "receiverCompleted": false,
        "..." : "..."
      },
      "message": "Completion confirmed successfully.",
      "success": true
    }
    ```
-   **Success Response (200) after second confirmation:**

    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "60d0fe4f5b3a3d001f8e4e2c",
        "status": "completed",
        "initiatorCompleted": true,
        "receiverCompleted": true,
        "..." : "..."
      },
      "message": "Completion confirmed successfully.",
      "success": true
    }
    ```
---

### POST /api/v1/exchanges/:exchangeId/review

Submits a rating and review for a completed exchange.

-   **Method:** `POST`
-   **URL:** `/api/v1/exchanges/:exchangeId/review`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:**

    ```json
    {
      "rating": 5,
      "review": "Jane was an excellent teacher. Very clear and patient."
    }
    ```

-   **Success Response (200):**

    ```json
    {
      "statusCode": 200,
      "data": { "...updated exchange object..." },
      "message": "Review submitted successfully.",
      "success": true
    }
    ```

---
### POST /api/v1/exchanges/:exchangeId/recordings

Uploads an audio recording for a session.

-   **Method:** `POST`
-   **URL:** `/api/v1/exchanges/:exchangeId/recordings`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** `multipart/form-data` with a single file field named `audio`.
-   **Success Response (201):** Confirms upload and transcription start.
    ```json
    {
        "statusCode": 201,
        "data": { "_id": "...", "url": "...", "status": "processing" },
        "message": "Recording uploaded and transcription started.",
        "success": true
    }
    ```

---
### GET /api/v1/exchanges/:exchangeId/recordings

Retrieves all recordings associated with an exchange.

-   **Method:** `GET`
-   **URL:** `/api/v1/exchanges/:exchangeId/recordings`
-   **Authentication:** Requires valid JWT token in cookie.
-   **Request Body:** None
-   **Success Response (200):**
    ```json
    {
        "statusCode": 200,
        "data": [
            { "_id": "...", "url": "...", "status": "completed", "createdAt": "..." }
        ],
        "message": "Recordings retrieved successfully.",
        "success": true
    }
    ```