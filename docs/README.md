# Knowle: A Collaborative Knowledge Exchange Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![Version](https://img.shields.io/badge/version-1.0.0-informational)](https://github.com/)

## Share What You Know. Learn What You Don't.

Knowle is a full-stack web application designed to build a vibrant community around peer-to-peer learning. It provides a platform where individuals can connect to both teach skills they are proficient in and learn new ones from others. By leveraging AI for intelligent matchmaking, Knowle fosters a collaborative and gamified educational environment.

The project is built with a modern, scalable architecture designed for production. It features a responsive React client for a seamless user experience and a robust Node.js backend to handle real-time interactions, data processing, and secure authentication. Whether you're looking to master a new programming language, pick up a creative hobby, or share your own expertise, Knowle provides the tools to connect and grow.

## Key Features

-   **User Authentication:** Secure registration and login with JWT-based session management, including password recovery.
-   **Profile Management:** Customizable user profiles with bios, skill sets, achievements, and AI-generated review summaries.
-   **AI-Powered Matchmaking:** Intelligent system to connect users with the most compatible learning and teaching partners based on their skills and interests.
-   **Knowledge Exchange Workflow:** A structured process for users to propose agreements, which, upon acceptance, create a formal knowledge-sharing session.
-   **Two-Step Exchange Completion:** A mutual confirmation system ensures that both participants agree an exchange is complete before it's finalized, triggering achievements and stats updates.
-   **Dispute Resolution System:** An integrated system for users to report issues with exchanges, featuring an AI-powered initial response to provide immediate support and a dedicated chat for resolution.
-   **Real-time Communication:** Integrated chat and audio recording for seamless interaction between exchange partners, with AI-powered transcription.
-   **Gamification & Engagement:** Earn points and achievements for participation, and climb the global leaderboard.
-   **Community Hub:**
    -   **Forums:** Discuss topics, ask questions, and form study groups.
    -   **Events & Workshops:** Join or host live group sessions.
    -   **Knowledge Base:** A community-curated library of articles and resources.
    -   **Roadmap:** Suggest and vote on the next features for the platform.
-   **Collaborative Projects:** Start a project with a Kanban board after an exchange to apply newly acquired skills.
-   **Skill Trees & Assessments:** Follow visual learning paths and test your knowledge with AI-generated assessments.
-   **Mentorship & Premium Content:** Stripe integration allows mentors to offer paid sessions and premium content subscriptions.
-   **Internationalization (i18n):** Multi-language support for a global user base.
-   **Scalable Architecture:** Built with a microservices approach for key features (Communication, Admin/Support) and a Redis caching layer for high performance.

## Tech Stack

### Client-Side
-   **Framework/Library:** [React](https://reactjs.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **API Communication:** [Axios](https://axios-http.com/)
-   **State Management:** React Context API
-   **Real-time:** [Socket.IO Client](https://socket.io/)
-   **Internationalization:** [i18next](https://www.i18next.com/)

### Server-Side
-   **Runtime:** [Node.js](https://nodejs.org/)
-   **Framework:** [Express.js](https://expressjs.com/)
-   **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Caching:** [Redis](https://redis.io/)
-   **Process Management:** [PM2](https://pm2.keymetrics.io/) for clustering and horizontal scaling.
-   **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)
-   **AI Integration:** [Google Gemini API](https://ai.google.dev/)
-   **File Storage:** [Cloudinary](https://cloudinary.com/)
-   **Payments:** [Stripe](https://stripe.com/)
-   **Real-time:** [Socket.IO](https://socket.io/) in a dedicated microservice.
-   **Push Notifications:** [web-push](https://www.npmjs.com/package/web-push) for sending server-side push notifications.

## Getting Started

To get a local copy up and running, please refer to our detailed **[Local Development Guide](docs/setup/local_development.md)** for a complete walkthrough.

### Quick Start
1.  **Clone the Repository**
    ```sh
    git clone https://github.com/your-username/knowle.git
    cd knowle
    ```
2.  **Set up the Server**
    ```sh
    cd server
    cp .env.example .env 
    # Fill in your variables in the .env file
    npm install
    npm run dev
    ```
3.  **Set up the Client**
    ```sh
    cd ../client
    cp .env.example .env
    # Fill in your variables in the .env file
    npm install
    npm run dev
    ```
The client will be available at `http://localhost:3000` and the server at `http://localhost:8000`.