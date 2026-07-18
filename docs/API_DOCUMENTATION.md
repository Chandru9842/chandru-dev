# 🔌 Custom Portfolio CMS — Full REST API Documentation

This document provides exhaustive specifications for every RESTful API endpoint exposed by the Express backend (`server.ts`) in the **Custom Portfolio CMS**. All administrative operations are secured using short-lived cryptographically signed **JSON Web Tokens (JWT)**.

---

## 🔑 Authentication Headers & Security Rules

### Admin Authorized Requests
All protected endpoints require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_access_token>
```
*Missing, invalid, or expired tokens will receive a `401 Unauthorized` or `403 Forbidden` response.*

### Rate Limiting
Administrative auth endpoints are protected by an IP-based rate limiter:
*   **Window**: 1 Minute
*   **Max Login Requests**: 15 requests per window
*   *Rate exceeded responses return `429 Too Many Requests`.*

---

## 🗺️ API Endpoint Map

| Category | Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | Public (Rate-Limited) | Authenticates credentials and issues JWT / Refresh token |
| **Auth** | `/api/auth/refresh` | `POST` | Public | Re-generates expired JWT using a valid Refresh token |
| **Auth** | `/api/auth/logout` | `POST` | Public | Terminates session and invalidates Refresh token |
| **Auth** | `/api/auth/verify` | `GET` | Public | Validates active JWT integrity and returns payload |
| **Auth** | `/api/auth/audit-logs` | `GET` | `ROLE_ADMIN` | Fetches low-level login audit trail |
| **Auth** | `/api/auth/change-password` | `POST` | `ROLE_ADMIN` | Updates logged-in admin password |
| **Auth** | `/api/auth/reset-password` | `POST` | Public | Dispatches password reset simulator token |
| **Auth** | `/api/auth/login-config` | `GET` | Public | Retreives login constraints before auth form loading |
| **Portfolio**| `/api/portfolio-combined`| `GET` | Public | Combined cache-friendly data payload for portfolio |
| **Profile**| `/api/profile` | `GET` | Public | Retreives public founder profile details |
| **Profile**| `/api/profile` | `PUT` | `ROLE_ADMIN` | Updates founder profile and security parameters |
| **Security** | `/api/settings/security` | `GET` | `ROLE_ADMIN` | Retreives global security constraints parameters |
| **Security** | `/api/settings/security` | `PUT` | `ROLE_ADMIN` | Updates security settings (max login attempts, etc.) |
| **Security** | `/api/settings/security/login-history`| `GET`| `ROLE_ADMIN` | Fetches timeline login history |
| **Security** | `/api/settings/security/login-history/clear`| `POST`| `ROLE_ADMIN` | Permanently deletes authentication history log |
| **Audit** | `/api/activity-history` | `GET` | `ROLE_ADMIN` | Real-time auditable stream of founder operations |
| **Audit** | `/api/activity-history/clear` | `POST` | `ROLE_ADMIN` | Purges all operational logs |
| **Audit** | `/api/activity-history/archive` | `POST` | `ROLE_ADMIN` | Saves logs to local operational archive |
| **Projects** | `/api/projects` | `GET` | Public | Lists all project portfolio entities |
| **Projects** | `/api/projects` | `POST` | `ROLE_ADMIN` | Persists a new project entry |
| **Projects** | `/api/projects/:id` | `PUT` | `ROLE_ADMIN` | Modifies properties of selected project |
| **Projects** | `/api/projects/:id` | `DELETE` | `ROLE_ADMIN` | Deletes a project record |
| **Projects** | `/api/projects/order` | `PATCH` | `ROLE_ADMIN` | Reorders list hierarchy with batch payloads |
| **Skills** | `/api/skills` | `GET` | Public | Fetches entire skills taxonomy grouped |
| **Skills** | `/api/skills` | `POST` | `ROLE_ADMIN` | Registers a new technical capability |
| **Skills** | `/api/skills/:id` | `PUT` | `ROLE_ADMIN` | Updates skill proficiencies or categories |
| **Skills** | `/api/skills/:id` | `DELETE` | `ROLE_ADMIN` | Purges a skill entry |
| **Skills** | `/api/skills/order` | `PATCH` | `ROLE_ADMIN` | Reorders skills display priority weight |
| **Certificates**| `/api/certificates` | `GET` | Public | Fetches verified certificates |
| **Certificates**| `/api/certificates` | `POST` | `ROLE_ADMIN` | Adds a newly achieved certificate |
| **Certificates**| `/api/certificates/:id`| `PUT` | `ROLE_ADMIN` | Modifies certification record details |
| **Certificates**| `/api/certificates/:id`| `DELETE` | `ROLE_ADMIN` | Purges a certification from registry |
| **Experience** | `/api/experiences` | `GET` | Public | Fetches professional employment history |
| **Experience** | `/api/experiences` | `POST` | `ROLE_ADMIN` | Adds an employment period log |
| **Experience** | `/api/experiences/:id`| `PUT` | `ROLE_ADMIN` | Updates an employment record |
| **Experience** | `/api/experiences/:id`| `DELETE` | `ROLE_ADMIN` | Purges an employment history record |
| **Education** | `/api/education` | `GET` | Public | Fetches scholastic credentials list |
| **Education** | `/api/education` | `POST` | `ROLE_ADMIN` | Adds a new educational milestone |
| **Education** | `/api/education/:id` | `PUT` | `ROLE_ADMIN` | Updates collegiate parameters |
| **Education** | `/api/education/:id` | `DELETE` | `ROLE_ADMIN` | Deletes an education record |
| **Achievements**| `/api/achievements` | `GET` | Public | Lists honors and accomplishments |
| **Achievements**| `/api/achievements` | `POST` | `ROLE_ADMIN` | Persists a new honor milestone |
| **Achievements**| `/api/achievements/:id`| `PUT` | `ROLE_ADMIN` | Updates honors details |
| **Achievements**| `/api/achievements/:id`| `DELETE` | `ROLE_ADMIN` | Deletes an achievement record |
| **Resumes** | `/api/resumes` | `GET` | `ROLE_ADMIN` | Fetches active and archived CV records |
| **Resumes** | `/api/resumes` | `POST` | `ROLE_ADMIN` | Uploads and persists new PDF documents |
| **Resumes** | `/api/resumes/:id` | `PUT` | `ROLE_ADMIN` | Sets metadata or toggles primary active status |
| **Resumes** | `/api/resumes/:id` | `DELETE` | `ROLE_ADMIN` | Deletes a resume document from cache |
| **Resumes** | `/api/resume/:id/file` | `GET` | Public | Streams raw resume PDF file binary data |
| **Messages** | `/api/messages` | `POST` | Public | Submits a new portfolio contact message |
| **Messages** | `/api/messages` | `GET` | `ROLE_ADMIN` | Fetches administrative contact center inbox |
| **Messages** | `/api/messages/:id/read`| `PATCH` | `ROLE_ADMIN` | Toggles message read/unread metadata state |
| **Messages** | `/api/messages/:id` | `DELETE` | `ROLE_ADMIN` | Permanently deletes a message thread |
| **Analytics** | `/api/analytics` | `GET` | `ROLE_ADMIN` | Fetches Visitor views and IP geolocation metadata |
| **Analytics** | `/api/analytics/track`| `POST` | Public | Tracks client view session properties |
| **Analytics** | `/api/analytics/click`| `POST` | Public | Logs outbound link client click telemetry |
| **Analytics** | `/api/analytics/clear`| `POST` | `ROLE_ADMIN` | Deletes all tracked visitor stats logs |
| **Theme** | `/api/settings/theme` | `GET` | Public | Fetches global aesthetic CSS styling parameters |
| **Theme** | `/api/settings/theme` | `PUT` | `ROLE_ADMIN` | Performs dynamic layout overrides globally |
| **Footer** | `/api/settings/footer` | `GET` | Public | Fetches copyright texts and layouts |
| **Footer** | `/api/settings/footer` | `PUT` | `ROLE_ADMIN` | Modifies footer information globally |
| **Social** | `/api/social-links` | `GET` | Public | Fetches developer contact links |
| **Social** | `/api/social-links` | `PUT` | `ROLE_ADMIN` | Reconfigures outbound link values |

---

## 🔒 Category Detailed Specifications

### 1. Authentication Endpoints

#### `POST /api/auth/login`
Authenticates administrative credentials and issues JWT token alongside standard refresh structures.

*   **Authentication Required**: None
*   **Request Body**:
    ```json
    {
      "usernameOrEmail": "chandru",
      "password": "9655384140",
      "rememberMe": true,
      "deviceId": "chrome-mac-uuid-hash-value"
    }
    ```
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
      "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "name": "Chandru Mohan",
        "email": "chandrumohan550@gmail.com",
        "role": "ROLE_ADMIN",
        "username": "chandru"
      }
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` — Missing or empty fields.
    *   `401 Unauthorized` — Invalid password or nonexistent username.
    *   `403 Forbidden` — Account deactivated, insufficient roles, or locked due to maximum login limits exceeded.
    *   `429 Too Many Requests` — Rate limit exceeded.

---

#### `POST /api/auth/refresh`
Regenerates an expired JWT token using a valid cryptographically signed refresh token.

*   **Authentication Required**: None
*   **Request Body**:
    ```json
    {
      "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Error Responses**:
    *   `401 Unauthorized` — Invalid or expired refresh token.

---

### 💼 2. Content Portfolio (Combined Payload)

#### `GET /api/portfolio-combined`
Returns a unified, high-performance payload compiling the entire database state. Recommended on startup to prevent client waterfalling fetch requests. Leverages server-side JSON caching.

*   **Authentication Required**: None
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "profile": {},
      "projects": [],
      "skills": [],
      "certificates": [],
      "experiences": [],
      "education": [],
      "achievements": [],
      "analytics": {
        "pageViews": 1420,
        "uniqueVisitors": 389,
        "clickEvents": []
      },
      "socialLinks": [],
      "footerSocialLinks": [],
      "activeResume": {},
      "theme": {},
      "settings": {},
      "footer": {},
      "technologies": [],
      "codingProfiles": []
    }
    ```

---

### 📊 3. Analytics Tracking Endpoints

#### `POST /api/analytics/track`
Logs real-time user session visitor characteristics anonymously.

*   **Authentication Required**: None
*   **Request Body**:
    ```json
    {
      "path": "/projects",
      "referrer": "https://github.com/",
      "country": "India",
      "city": "Bengaluru"
    }
    ```
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "status": "success",
      "message": "Visitor analytics captured successfully"
    }
    ```

---

#### `POST /api/analytics/click`
Logs interaction clicks on dynamic buttons, contact methods, and resume documents.

*   **Authentication Required**: None
*   **Request Body**:
    ```json
    {
      "nodeId": "btn_download_cv_header",
      "clientLabel": "Download CV Button"
    }
    ```
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "status": "success",
      "message": "Click impression tracked"
    }
    ```

---

### 🛠️ 4. Project Resource Operations

#### `POST /api/projects`
Registers a new project entity.

*   **Authentication Required**: JWT (`ROLE_ADMIN`)
*   **Request Body**:
    ```json
    {
      "title": "Quantum Devops Suite",
      "description": "High performance Kubernetes control dashboard.",
      "imageUrl": "data:image/png;base64,iVBORw0KGgo...",
      "demoUrl": "https://quantum-suite.alex.dev",
      "githubUrl": "https://github.com/alex-dev/quantum",
      "tags": "React, TypeScript, Go, Kubernetes",
      "featured": true,
      "isVisible": true
    }
    ```
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "id": 14,
      "title": "Quantum Devops Suite",
      "description": "High performance Kubernetes control dashboard.",
      "imageUrl": "data:image/png;base64,iVBORw0KGgo...",
      "demoUrl": "https://quantum-suite.alex.dev",
      "githubUrl": "https://github.com/alex-dev/quantum",
      "tags": "React, TypeScript, Go, Kubernetes",
      "displayOrder": 1,
      "featured": true,
      "isVisible": true,
      "createdAt": "2026-07-18T06:30:00.000Z"
    }
    ```

---

#### `PATCH /api/projects/order`
Updates sorting order display weight coefficients in a single batch operation.

*   **Authentication Required**: JWT (`ROLE_ADMIN`)
*   **Request Body**:
    ```json
    {
      "orderedIds": [14, 12, 1, 5, 8]
    }
    ```
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Projects order weights shifted successfully."
    }
    ```

---

### 📬 5. Client Mail Contact Center

#### `POST /api/messages`
Saves message threads submitted from the user's web contact form.

*   **Authentication Required**: None
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "janedoe@company.com",
      "subject": "System Design Consultant Request",
      "message": "Hi, we love your portfolio. We are looking for a remote full-stack architect."
    }
    ```
*   **Success Response (Status: `200 OK`)**:
    ```json
    {
      "id": 124,
      "name": "Jane Doe",
      "email": "janedoe@company.com",
      "subject": "System Design Consultant Request",
      "message": "Hi, we love your portfolio. We are looking for a remote full-stack architect.",
      "isRead": false,
      "createdAt": "2026-07-18T06:34:00.000Z"
    }
    ```

---

## 🛟 Common HTTP Error Codes Summary

| Code | Status Phrase | Common Trigger Cause |
| :--- | :--- | :--- |
| **`400`** | **Bad Request** | Required parameter payload omitted, parsing failure, or syntax issue. |
| **`401`** | **Unauthorized** | Missing, malformed, or expired Bearer Token in auth header. |
| **`403`** | **Forbidden** | Valid token but lacks required admin role, or credentials verification failed. |
| **`404`** | **Not Found** | Specified entity database primary key or server resource directory missing. |
| **`429`** | **Too Many Requests** | Exceeded IP rate limit constraints (Login route). |
| **`500`** | **Internal Error** | Unhandled filesystem permission exceptions or structural backend failures. |
