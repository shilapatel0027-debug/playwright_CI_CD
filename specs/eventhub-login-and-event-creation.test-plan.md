# EventHub Login and Event Creation Test Plan

## Application Overview

Test the EventHub sign-in flow and authenticated event creation. Exploration confirmed the login page has Email and Password inputs, a Sign In button, and a Register link. Submitting blank values shows “Enter a valid email” and “Password must be at least 6 characters”; invalid credentials show “Invalid email or password.” The registration screen was inspected but no account was created. The published API docs list required create-event fields as title, category, venue, city, eventDate, price, and totalSeats; description and imageUrl are optional, and the docs state availableSeats is initialized from totalSeats. The authenticated event-management UI could not be reached without user credentials, so event-form navigation and exact UI validation messages must be confirmed during execution. Use a valid sandbox account, isolated test data, unique event titles, and clean up created events where supported.

## Test Scenarios

### 1. Login

**Seed:** `tests/seed.spec.ts`

#### 1.1. Shows validation when required login fields are empty

**File:** `tests/login/required-field-validation.spec.ts`

**Steps:**
  1. Open https://eventhub.rahulshettyacademy.com/login and leave both Email and Password blank.
    - expect: The sign-in form is visible with Email, Password, and Sign In controls.
  2. Click Sign In.
    - expect: The form stays on the login page.
    - expect: Email validation displays “Enter a valid email”.
    - expect: Password validation displays “Password must be at least 6 characters”.
    - expect: No authenticated session is created.

#### 1.2. Rejects malformed email and short password before authentication

**File:** `tests/login/invalid-input-validation.spec.ts`

**Steps:**
  1. Enter a malformed email address and a password shorter than six characters.
    - expect: The values remain editable in their respective inputs.
  2. Click Sign In.
    - expect: Client-side validation identifies the invalid email and too-short password.
    - expect: The login request is not accepted and the user remains on the login page.

#### 1.3. Displays a generic error for invalid credentials

**File:** `tests/login/invalid-credentials.spec.ts`

**Steps:**
  1. Enter a syntactically valid but unregistered sandbox email and a password of at least six characters.
    - expect: The form accepts the values for submission.
  2. Click Sign In.
    - expect: An “Invalid email or password” message is displayed.
    - expect: The user remains on the login page and is not authenticated.

#### 1.4. Signs in with valid sandbox credentials

**File:** `tests/login/successful-login.spec.ts`

**Steps:**
  1. Enter valid credentials for an existing sandbox account and click Sign In.
    - expect: Authentication succeeds and the application navigates to its authenticated landing page.
  2. Inspect the authenticated page and refresh it.
    - expect: Authenticated navigation and event-management entry points are available.
    - expect: The session remains valid after refresh.

### 2. Event Creation

**Seed:** `tests/seed.spec.ts`

#### 2.1. Creates an event with valid required and optional data

**File:** `tests/events/create-event-happy-path.spec.ts`

**Steps:**
  1. Sign in with a valid sandbox account, open the event-management area, and choose the create-event action.
    - expect: The event creation form is available to the authenticated user.
  2. Enter a unique title, category, venue, city, a future event date, a valid price, and a positive total seat count; also enter optional description and image URL values if those controls are present.
    - expect: All entered values are accepted by the form.
  3. Submit the event.
    - expect: A success confirmation is shown and the created event is returned or displayed.
    - expect: The event has the submitted field values; availableSeats is initialized to totalSeats per the API documentation.
  4. Open the event list or event details and locate the new event by its unique title.
    - expect: The new event persists and its details match the submitted values.

#### 2.2. Requires all documented event fields

**File:** `tests/events/create-event-required-fields.spec.ts`

**Steps:**
  1. Sign in and open the event creation form.
    - expect: The create-event form is available.
  2. Run separate submissions omitting one required field at a time: title, category, venue, city, eventDate, price, or totalSeats.
    - expect: Each incomplete submission is prevented or rejected with a clear validation response.
    - expect: No incomplete event is created or added to the event list.

#### 2.3. Rejects invalid event date and numeric values

**File:** `tests/events/create-event-invalid-values.spec.ts`

**Steps:**
  1. Enter otherwise valid event data but use an invalid or past event date, then submit.
    - expect: The date is rejected with a clear validation error and no event is created.
  2. Repeat with an invalid price and with an invalid totalSeats value, including non-positive values where the form permits them.
    - expect: Invalid numeric values are rejected with a clear validation response.
    - expect: No invalid event is created.

#### 2.4. Prevents event creation without authentication

**File:** `tests/events/create-event-authorization.spec.ts`

**Steps:**
  1. Start a fresh unauthenticated session and navigate directly to the event-creation entry point or attempt the documented event-create action.
    - expect: The application requires sign-in or the create request is rejected as unauthorized.
    - expect: No event is created.
