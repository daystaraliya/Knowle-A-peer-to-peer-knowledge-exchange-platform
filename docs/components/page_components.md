# Page Components

The `src/pages/` directory contains the main "view" components for the application. Each subdirectory corresponds to a major feature or section of the site, and its components are responsible for orchestrating the UI for that section.

### Overview

Page components are considered "smart" components. Their primary roles are:

-   Serving as the entry point for a specific URL route (as defined in `App.jsx`).
-   Managing page-specific state using hooks like `useState` and `useEffect`.
-   Fetching data from the API by calling functions from the `src/api` directory.
-   Composing smaller, reusable components from `src/components/` to build the final view.
-   Handling user interactions and business logic relevant to that page.

---

### `auth/`

This directory contains all components related to user authentication.

-   **`Login.jsx`:** Renders the login form. It manages form state (email, password), handles form submission by calling the `login` API, manages loading and error states, and redirects the user upon successful authentication.
-   **`Register.jsx`:** Renders the registration form. It handles user input for new account details and calls the `register` API.
-   **`ForgotPassword.jsx`:** Renders a form for users to enter their email to receive a password reset link.
-   **`ResetPassword.jsx`:** Renders the form for a user to enter and confirm their new password, using the token from the URL.
-   **`index.js`:** A barrel file that exports all auth components for cleaner imports elsewhere.

---

### `dashboard/`

This directory contains components for the user's main dashboard.

-   **`DashboardPage.jsx`:** The main container for the personal dashboard. It fetches all of the user's `agreements` and `exchanges` to provide a comprehensive overview of their activities. The dashboard displays key stats and organizes information into actionable lists for incoming agreement proposals, active exchanges, and completed exchanges.
-   **`TeacherDashboardPage.jsx`:** A dedicated analytics page for users who have taught sessions. It fetches and displays metrics like average rating, unique students, and most popular topics taught.
-   **`DashboardCard.jsx`:** A reusable card component specific to the dashboard, used to display key statistics in a visually appealing way.

---

### `profile/`

This directory handles the viewing and editing of user profiles.

-   **`ProfilePage.jsx`:** Displays the authenticated user's own profile. It gets data from the `AuthContext` and presents the user's bio, skills, achievements, and AI-generated review summary.
-   **`EditProfile.jsx`:** Renders a form that allows the user to update their profile information, including their name, bio, avatar, skills, and privacy settings. It calls the relevant API functions to save changes.
-   **`PublicProfilePage.jsx`:** Displays a public-facing version of a user's profile. It fetches data based on the `slug` URL parameter. The information shown is subject to the user's privacy settings. It also includes sections for mentor offerings if the user is a mentor.

---

### `home/`

Components for the application's landing page.

-   **`HomePage.jsx`:** The main component for the `/` route. It primarily composes other sections of the landing page.
-   **`LandingSection.jsx`:** The "hero" section of the homepage, containing the main value proposition, headline, and call-to-action buttons.

---

### `exchange/`

Components related to the knowledge exchange workflow.

-   **`FindMatchesPage.jsx`:** Displays a list of AI-powered potential exchange partners. It handles the logic for fetching matches and sending exchange requests via the `AgreementProposalModal`.
-   **`ExchangeDetailsPage.jsx`:** Shows the detailed view of a single exchange, including participants, topics, status, and the real-time session tools (chat, recording). It allows participants to confirm the completion of the exchange as part of the two-step workflow. It also provides an entry point to the dispute resolution system.
-   **`RecordingDetailsPage.jsx`:** Displays a specific audio recording and its AI-generated transcript, with search functionality.

---

### `disputes/`

Components for the dispute resolution system.

-   **`CreateDisputePage.jsx`:** Renders a form for a user to file a dispute against an exchange, including a reason and detailed description.
-   **`DisputeDetailsPage.jsx`:** The main "resolution center" view. It displays the dispute details and a chat interface where the user, the other party, and support staff can communicate. It also shows the initial AI-generated response.