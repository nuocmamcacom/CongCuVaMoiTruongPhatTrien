# Project Context & Architecture Memory

> **Role:** This file serves as the Single Source of Truth for the project's architecture, business rules, and technical decisions. AI Agents should read this first to understand the system context.

## 1. System Overview

- **Project Name:** Voting & Form System (BE)
- **Core Stack:** Node.js (Express), MongoDB (Mongoose), Socket.IO.
- **Authentication:** JWT (JsonWebToken), Passport.js (Google OAuth strategies).
- **Pattern:** MVC (Model-View-Controller) / Layered Architecture (Route -> Middleware -> Controller -> Service/Model).

## 2. Directory Structure & Rules

```text
src/
├── config/         # DB connection, passport config
├── controllers/    # Business logic (INPUT: req, OUTPUT: res/json)
├── middleware/     # Interceptors & Validation
│   ├── auth.js             # JWT verification
│   ├── authValidation.js   # Auth schemas (Login, Register)
│   ├── pollValidation.js   # Poll schemas (Create, Vote)
│   ├── formValidation.js   # Form schemas (Structure, Response)
│   ├── validateId.js       # Centralized MongoDB ObjectId validation
│   └── checkCreator.js     # Permission checks (Owner verification)
├── models/         # Mongoose Schemas (Data Layer)
├── routes/         # Endpoint definitions (Mapping URLs to Controllers)
├── services/       # Complex business logic, 3rd party integrations (Socket, Excel)
└── app.js          # App entry point
```
* **Rule #1:** Routes MUST NOT contain business logic. They should only route to Controllers.
* **Rule #2:** Controllers handle HTTP requests. Heavy computations or reusable logic should be delegated to `services/`.
* **Rule #3:** All responses must follow a consistent JSON format: `{ success: boolean, message?: string, data?: any }`.

## 3. Modules (Feature Specifications)

### 3.1. Authentication & Users (`auth`, `users`)
* **Key Files:** `authController.js`, `userController.js`, `authValidation.js`, `models/User.js`
* **Auth Flow:**
    * **Register/Login:** Validated by `authValidation.js`, returns a JWT token.
    * **Google OAuth:** Uses Passport strategy, callbacks redirect to Frontend with token.
* **User Logic:**
    * Users cannot delete themselves (soft delete only via `is_active` flag).
    * Search function allows finding users by username, email, or full name.

### 3.2. Polling System (`polls`)
* **Key Files:** `pollController.js`, `pollValidation.js`, `models/Poll.js`, `models/Vote.js`
* **Logic:**
    * **Creation:** Supports single/multiple choice, anonymous settings. Validated by `pollValidation.js`.
    * **Voting:**
        * Checks: `is_active`, `end_time`, `participants` (if private).
        * **Real-time:** Broadcasts new results via Socket.IO (`broadcastPollUpdate`) immediately after a vote.
    * **Data Structure:** Options are stored within the Poll document; Votes are stored in a separate collection (`Vote`) referencing Poll and Option.
    * **Export:** Creator can export results to Excel.

### 3.3. Form & Survey System (`forms`)
* **Key Files:** `formController.js`, `formValidation.js`, `models/FormTemplate.js`, `models/FormResponse.js`
* **Logic:**
    * **Structure:** A `FormTemplate` contains an array of questions. Questions have `uuid` generated IDs.
    * **Submission:** Answers are validated against `is_required` flags in the template using `formValidation.js`.
    * **Real-time:** Broadcasts submission count updates.
    * **Export:** Uses `ExcelJS` to flatten nested JSON answers into rows/columns.

## 4. Technical Constraints & Decisions
* **Socket.IO:** Used for real-time updates on Poll Results and Form Submission counts.
* **Middleware Strategy:**
    * `validateId.js`: Handles all `req.params.id` checks (MongoDB ObjectId format).
    * `*Validation.js`: Handles `req.body` checks using Joi schemas.
* **Excel Export:** Handled on the Backend using `exceljs` or custom service, returned as a buffer stream.
* **Validation:** Input validation is handled via middleware (`middleware/*Validation.js`) before reaching controllers.
* **CORS:** Configured in `app.js` to allow specific origins (Frontend localhost/production URL).

## 5. Development Guidelines for AI Agents
When asked to implement a new feature:

1.  **Check existing modules:** Is there a similar pattern? (e.g., if adding "Quiz", look at "Forms").
2.  **Define Schema:** Create the Mongoose model first.
3.  **Create Validation:** Add Joi schemas in a new `*Validation.js` file or extend existing ones.
4.  **Create Controller:** Implement logic using Services if needed.
5.  **Define Routes:** Map endpoints.
6.  **Update Context:** Add the new module to Section 3 of this file.
```
