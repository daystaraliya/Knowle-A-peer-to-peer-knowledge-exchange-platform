# Database Schema

The Knowle application uses MongoDB as its database, with Mongoose as the Object Data Modeling (ODM) library to define schemas and interact with the data. This document outlines the schema for the core collections.

### Overview

Each Mongoose model corresponds to a collection in the MongoDB database. Schemas define the structure of documents within that collection, including field types, validation, indexes, and default values. Indexes are crucial for query performance and are defined on fields that are frequently searched or sorted.

---

### User (`user.models.js`)

Stores information about registered users, their skills, progress, and settings.

```javascript
const userSchema = new Schema({
    username: { type: String, required: true, unique: true, ... },
    slug: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, ... },
    fullName: { type: String, required: true, ... },
    avatar: { type: String },
    bio: { type: String, default: '' },
    password: { type: String, required: true },
    topicsToTeach: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    topicsToLearn: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
    points: { type: Number, default: 0, index: true },
    averageRating: { type: Number, default: 0, index: true },
    numberOfRatings: { type: Number, default: 0 },
    reviewSummary: { ... },
    role: { type: String, enum: ['user', 'mentor', 'support', 'admin'], default: 'user' },
    accountStatus: { type: String, enum: ['active', 'warned', 'suspended', 'banned'], default: 'active' },
    premium: { ... }, // Stripe-related fields
    refreshToken: { type: String },
    ...
}, { timestamps: true });
```

| Field           | Type                                | Description                                                                 | Details                               |
| --------------- | ----------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| `username`      | String                              | The user's unique, public username.                                         | Required, unique, lowercase, indexed. |
| `slug`          | String                              | A URL-friendly, unique version of the user's name for public profiles.      | Required, unique, indexed.            |
| `email`         | String                              | The user's unique email address, used for login.                            | Required, unique, lowercase, indexed. |
| `password`      | String                              | The user's hashed password.                                                 | Required.                             |
| `topicsToTeach` | Array of ObjectIds                  | A list of topics the user is proficient in and can teach.                   | References `Topic`, indexed.          |
| `topicsToLearn` | Array of ObjectIds                  | A list of topics the user wants to learn.                                   | References `Topic`, indexed.          |
| `points`        | Number                              | Gamification points earned by the user.                                     | Indexed for leaderboard performance.  |
| `averageRating` | Number                              | The user's average teaching rating from completed exchanges.                | Indexed for leaderboard performance.  |
| `role`          | String                              | The user's role on the platform.                                            | Enum: `'user'`, `'mentor'`, `'support'`, `'admin'`. |
| `accountStatus` | String                              | The current status of the user's account. Managed by admins.                | Enum, default: `'active'`.            |
| `refreshToken`  | String                              | The JWT refresh token used to issue new access tokens.                      | Stored for session management.        |

---

### Topic (`topic.models.js`)

Stores information about the knowledge topics available on the platform.

```javascript
const topicSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String }
}, { timestamps: true });
```

---

### Exchange (`exchange.models.js`)

Represents a knowledge exchange session between two users.

```javascript
const exchangeSchema = new Schema({
    initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicToLearn: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    topicToTeach: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    status: { type: String, enum: ['pending', ...], default: 'pending' },
    initiatorRating: { type: Number, min: 1, max: 5 },
    receiverRating: { type: Number, min: 1, max: 5 },
    initiatorCompleted: { type: Boolean, default: false },
    receiverCompleted: { type: Boolean, default: false },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    ...
}, { timestamps: true });
```

| Field                | Type     | Description                                                         | Details                                |
| -------------------- | -------- | ------------------------------------------------------------------- | -------------------------------------- |
| `initiator`          | ObjectId | The user who sent the exchange request.                             | Required, references `User`.           |
| `receiver`           | ObjectId | The user who received the exchange request.                         | Required, references `User`.           |
| `status`             | String   | The current state of the exchange.                                  | Enum, default: `'pending'`.            |
| `initiatorCompleted` | Boolean  | `true` if the initiator has marked the exchange as complete.        | Part of the two-step completion flow.  |
| `receiverCompleted`  | Boolean  | `true` if the receiver has marked the exchange as complete.         | Part of the two-step completion flow.  |
| `project`            | ObjectId | A link to a collaborative project started after the exchange.       | Optional, references `Project`.        |

---

### Dispute (`dispute.models.js`)

Represents a dispute ticket filed by a user regarding an exchange.

```javascript
const disputeSchema = new Schema({
    relatedExchange: { type: Schema.Types.ObjectId, ref: 'Exchange', required: true, index: true },
    complainant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    respondent: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'under_review', 'resolved'], default: 'open' },
    resolution: { type: String }
}, { timestamps: true });
```

| Field             | Type     | Description                                                        | Details                  |
| ----------------- | -------- | ------------------------------------------------------------------ | ------------------------ |
| `relatedExchange` | ObjectId | The exchange this dispute is about.                                | Required, references `Exchange`. |
| `complainant`     | ObjectId | The user who filed the dispute.                                    | Required, references `User`. |
| `respondent`      | ObjectId | The other user involved in the dispute.                            | Required, references `User`. |
| `reason`          | String   | The structured reason for the dispute (e.g., "User didn't show up"). | Required.                |
| `description`     | String   | The complainant's detailed description of the issue.               | Required.                |
| `status`          | String   | The current status of the dispute ticket.                          | Enum, default: `'open'`. |
| `resolution`      | String   | The final resolution message from the support team.                | Optional.                |

---

### DisputeMessage (`dispute.models.js`)

Represents a single message within a dispute conversation thread.

```javascript
const disputeMessageSchema = new Schema({
    dispute: { type: Schema.Types.ObjectId, ref: 'Dispute', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    isSupportMessage: { type: Boolean, default: false }
}, { timestamps: true });
```

| Field                | Type     | Description                                                                  | Details                                      |
| -------------------- | -------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `dispute`            | ObjectId | The dispute this message belongs to.                                         | Required, references `Dispute`.              |
| `author`             | ObjectId | The user who wrote the message. Null for AI-generated or system messages.    | Optional, references `User`.                 |
| `isSupportMessage`   | Boolean  | `true` if the message is from support staff or an automated system (like AI). | Default: `false`. Differentiates message source. |

---

### PushSubscription (`pushSubscription.models.js`)

Stores the web push subscription object for a user, enabling server-sent notifications.

```javascript
const pushSubscriptionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    subscription: {
        endpoint: { type: String, required: true },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    }
}, { timestamps: true });
```

---

### Message (`message.models.js`)

Represents a single chat message within an exchange. Part of the **Communication Microservice**.

```javascript
const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    exchange: { type: Schema.Types.ObjectId, ref: 'Exchange', required: true }
}, { timestamps: true });
```

---

### Project (`project.models.js`)

Represents a collaborative project between two users, typically started after an exchange.

```javascript
const projectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    relatedExchange: { type: Schema.Types.ObjectId, ref: 'Exchange', required: true, unique: true }
}, { timestamps: true });
```

---

### Task (`task.models.js`)

A single task within a project, part of the Kanban board feature.

```javascript
const taskSchema = new Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```