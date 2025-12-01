# Reusable Components

The `src/components/` directory contains a collection of "dumb" or presentational components that are used throughout the application. These components are designed to be highly reusable, receiving all their data and behavior via props.

### Overview

The philosophy behind these components is to create a consistent UI and abstract common UI patterns. By centralizing these elements, we ensure a uniform look and feel across the application and make it easier to apply global style changes. They should not contain business logic or fetch data themselves.

---

### `Button.jsx`

A versatile button component with several visual styles.

-   **Description:** Renders a standard HTML `<button>` element with predefined styling based on the `variant` prop. It forwards any additional class names and accepts all standard button attributes.
-   **Props:**
    -   `children`: (ReactNode, required) The content to be displayed inside the button (e.g., text, an icon).
    -   `onClick`: (function) The callback function to execute when the button is clicked.
    -   `type`: (string, default: `'button'`) The button's type (e.g., `'button'`, `'submit'`).
    -   `variant`: (string, default: `'primary'`) The visual style of the button. Options include `'primary'`, `'secondary'`, and `'outline'`.
    -   `className`: (string) Additional CSS classes to be applied to the button.
-   **Example Usage:**

    ```jsx
    import Button from '../components/Button';

    const MyComponent = () => (
      <div>
        <Button onClick={() => alert('Clicked!')}>Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline" className="mt-4">Outline Button</Button>
      </div>
    );
    ```

---

### `Header.jsx`

The main navigation header for the application.

-   **Description:** Renders the responsive top navigation bar. It consumes the `AuthContext` to display different links and actions based on the user's authentication status and role (`user`, `support`, `admin`).
-   **Features:**
    -   **Conditional Links:** Shows links like "Dashboard" and "Profile" for authenticated users, and "Login"/"Sign Up" for guests. It also shows "Support" and "Admin" links based on user roles for elevated permissions.
    -   **Category-Based Navigation:** On desktop, groups related links (e.g., "Growth", "Community") into dropdown menus for a cleaner interface.
    -   **Responsive Mobile Drawer:** On smaller screens, it displays a hamburger menu icon that toggles a slide-out drawer containing all navigation links.
    -   **Global Components:** Integrates other reusable components like the `Notifications` bell and the `LanguageSwitcher`.
-   **Props:** None. It is a self-contained component.
-   **Example Usage:**

    ```jsx
    import Header from '../components/Header';

    const App = () => (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main>{/* Page content */}</main>
      </div>
    );
    ```

---

### `Footer.jsx`

The main footer for the application.

-   **Description:** Renders the footer section at the bottom of every page. It includes a copyright notice and links to static pages like "About" and "Privacy Policy".
-   **Props:** None.
-   **Example Usage:**

    ```jsx
    import Footer from '../components/Footer';

    const App = () => (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{/* Page content */}</main>
        <Footer />
      </div>
    );
    ```

---

### `ToggleSwitch.jsx`

A reusable switch component for boolean settings.

-   **Description:** Renders an accessible, animated toggle switch, commonly used in forms and settings pages.
-   **Props:**
    -   `label`: (string) The text label to display next to the switch.
    -   `checked`: (boolean) The current state of the switch (on or off).
    -   `onChange`: (function) The callback function to execute when the switch is toggled.
-   **Example Usage:**
    ```jsx
    const [isEnabled, setIsEnabled] = useState(false);
    
    <ToggleSwitch
      label="Enable Notifications"
      checked={isEnabled}
      onChange={() => setIsEnabled(!isEnabled)}
    />
    ```