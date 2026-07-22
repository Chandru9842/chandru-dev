# 📘 Portfolio CMS — Comprehensive Project Documentation

Welcome to the official developer documentation for the **Custom Portfolio CMS**. This document serves as a complete, production-ready, technical blueprint describing the application design, deployment topology, structural folder layout, and operational processes.

---

## 🗺️ 1. Project Overview & Product Vision

The **Custom Portfolio CMS** is an enterprise-grade, full-stack CMS and developer portfolio showcase. It replaces traditional static HTML layouts, JSON-based profiles, or complex, heavy third-party systems.

The platform includes two tightly integrated core spaces:
1.  **Public Portfolio Canvas**: A highly interactive, beautiful, fast, single-screen portfolio featuring immersive 3D canvas rendering (Procedural Planet Earth, Holographic Laptop, and Spiral Particle Galaxy), dynamic bento grid layouts, responsive timelines, and lightweight entrance transitions.
2.  **Administrative CMS Dashboard**: A secure, private operations console enabling complete CRUD capabilities over all content modules, real-time zero-dependency visitor telemetry, fine-grained access control settings, auditable operation logs, and security parameters modifications.

---

## 🏗️ 2. High-Level System Architecture

The application is deployed as a consolidated, lightweight, full-stack container on a managed container hosting platform (e.g., Cloud Run or Render). It features a reverse-proxied dual setup where the Node.js/Express server is the primary runner.

```
                      +-----------------------------------------+
                      |           Client Web Browser            |
                      +--------------------+--------------------+
                                           |
                         Static Assets     |    JSON API Requests
                         & CSS Styles      |    (e.g., /api/projects)
                                           v
                      +--------------------+--------------------+
                      |            Reverse Proxy Layer          |
                      |    (Port 3000 Ingress Routing Engine)   |
                      +--------------------+--------------------+
                                           |
                                           | Matches path routes
                                           v
                +--------------------------+--------------------------+
                |                    Node.js Runtime                  |
                |                                                     |
                |   +--------------------------+                      |
                |   |   React Single-Page App  |                      |
                |   |   (Vite-Optimized Bundle)|                      |
                |   +--------------------------+                      |
                |                                                     |
                |                 ^                                   |
                |                 | Serves static                     |
                |                 v assets & fallback                 |
                |                                                     |
                |   +--------------------------+                      |
                |   |      Express REST API    |                      |
                |   |  (Route Controllers Task)|                      |
                |   +--------------------+-----+                      |
                +------------------------|----------------------------+
                                         |
                                         | File System Sync Read/Write
                                         v
                      +--------------------+--------------------+
                      |         Local JSON File database        |
                      |   (Persisted at src/data/db.json)       |
                      +-----------------------------------------+
```

### ☕ Alternative Split-Architecture Setup
For high-scale multi-user production systems, the workspace supports migrating the backend to a **Java 21 / Spring Boot 3.x REST API** (included under `/backend`) connected to a **MySQL 8.0** cluster. Both client and server run as decoupled components linked via CORS parameters.

---

## 📂 3. Repository Folder Structure

```
.
├── .github/                      # GitHub configurations & automated workflows
│   ├── ISSUE_TEMPLATE/           # Standardized GitHub issue trackers
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── pull_request_template.md  # Standardized pull request reviews
│   └── workflows/
│       └── ci.yml                # CI/CD GitHub Actions build verification
├── backend/                      # Production-ready Spring Boot 3 Java API Backend
│   ├── src/                      # Java Maven source directory
│   ├── pom.xml                   # Maven dependencies and build parameters
│   └── Dockerfile                # Multi-stage Docker builder for Java JRE
├── docs/                         # Developer resource manuals and guides
│   ├── API_DOCUMENTATION.md      # REST API endpoints reference manual
│   ├── RECRUITER_GUIDE.md        # Comprehensive recruiter walkthrough
│   └── PROJECT_DOCUMENTATION.md  # [This File] Main project documentation
├── src/                          # Main React + Vite Frontend Client source
│   ├── components/               # Reusable view components
│   │   ├── admin/                # Admin CMS pages (Analytics, CRUDs, etc.)
│   │   ├── SkillMediaRenderer.tsx # Interactive vector asset and SVG renderer
│   │   ├── ThreeDHero.tsx        # High-performance 3D canvas scene
│   │   ├── PortfolioFrontend.tsx # High-contrast public user interface
│   │   └── AdminDashboard.tsx    # Administrative framework page
│   ├── data/                     # Data stores and schemas
│   │   ├── cmsMockData.ts        # Database default seeding files
│   │   └── db.json               # Local JSON file database persistence
│   ├── App.tsx                   # Main React Application entry and router
│   ├── index.css                 # Global CSS stylesheet including Tailwind v4
│   ├── main.tsx                  # Client DOM bootstrap entry
│   └── types.ts                  # Shared TypeScript models and interfaces
├── .env.example                  # Environment configuration template
├── .gitignore                    # Artifacts and secret exclusion configuration
├── index.html                    # Root browser document entry
├── package.json                  # Node.js workspace dependencies and run scripts
├── server.ts                     # Full-stack Node.js Express server
└── tsconfig.json                 # TypeScript compiler configuration parameters
```

---

## 💻 4. Comprehensive Technology Stack

### Client Frontend
*   **Core UI Library**: React 19.0 (Hooks, Functional components, strict type structures)
*   **Build Utility**: Vite 6.x (Hot module replacement, blazing-fast bundling, lightning tree-shaking)
*   **Styling Engine**: Tailwind CSS v4.0 (Utilizes high-speed `@import` compilation, pure atomic classes)
*   **3D Render Pipeline**: Three.js + React Three Fiber + React Three Drei (Optimized particle arrays, custom geometries, reduced-motion controls, and WebGL buffers)
*   **Animation**: Framer Motion (Declarative state-driven interactive layouts and spring transitions)
*   **Data Visualization**: Recharts (Customized administrative bento analytics charting)
*   **Icon Library**: Lucide React (Clean, scalable SVGs)

### Server Backend & APIs
*   **Server Runtime**: Node.js v22 LTS or Bun
*   **Server Engine**: Express 4.x (Highly-efficient RESTful router, middleware compression, JSON payload limits)
*   **Security & Encryption**: JSON Web Tokens (HS512), BCrypt.js (Password hashing), IP Rate Limiting (Brute-force lockout prevention)
*   **Document Processor**: Nodemailer (Transactional mail notifications dispatcher)

---

## 🗄️ 5. Database Schema & Data Models

The local database uses a structured document-based **JSON model** located at `src/data/db.json`. It maps directly to relational databases should you scale up.

### Core Entity Definitions (JSON Scheme)

```typescript
// Shared Types & Entities (Ref: src/types.ts)

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;      // Base64 document or remote URL
  demoUrl: string;
  githubUrl: string;
  tags: string;          // Comma-separated list
  displayOrder: number;
  isVisible: boolean;
  featured: boolean;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  passwordHash: string;  // Salted cryptographically
  role: "ROLE_ADMIN";
  otpEnabled: boolean;
  lockUntil: string | null;
  failedAttempts: number;
  lastLogin: string | null;
}

interface AuditLog {
  id: number;
  action: string;        // e.g., "LOGIN_SUCCESS", "PROJECT_MUTATED"
  email: string;
  success: boolean;
  ip: string;
  userAgent: string;
  details: string;
  createdAt: string;
}
```

---

## 🚀 6. Complete Local Installation & Configuration

### Prerequisites
*   **Node.js**: `v18.0.0` or higher
*   **NPM**: `v9.0.0` or higher

### Step-by-Step Launch Procedure

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Chandru9842/chandru-dev
    cd portfolio-cms
    ```
2.  **Install Base Workspace Dependencies**:
    ```bash
    npm install
    ```
3.  **Prepare Environment Variables**:
    Generate a `.env` file at the root using the variables listed in `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Populate the variables:
    ```env
    JWT_SECRET=super-cryptographically-secure-salt-phrase-2026
    EMAIL=chandrumohan550@gmail.com
    APP_PASSWORD=your-secure-plain-password
    ```
4.  **Launch Dev Server**:
    ```bash
    npm run dev
    ```
    *This runs the Express backend and the Vite dev server on port 3000 concurrently using `tsx`.*

---

## ☁️ 7. Production Deployment Guidelines

### Server Deployment (Cloud Run / VPS / Heroku)
The production bundle builds both frontend static elements and backend server binaries together.

1.  **Trigger Build Command**:
    ```bash
    npm run build
    ```
    This script compiles the static React portfolio into the `/dist` directory, then bundles the TypeScript backend server (`server.ts`) into a single, highly-optimized, self-contained CommonJS file at `/dist/server.cjs` using `esbuild`.
2.  **Launch Command**:
    ```bash
    npm run start
    ```
    This runs the server using standard `node dist/server.cjs` at port 3000. It serves static client files automatically in production mode.

---

## 🛟 8. FAQ & Troubleshooting Guide

### Q1: Why do I see a blank page or infinite loading spinner on startup?
*   **Reason**: Node dependencies are missing or the database file `src/data/db.json` has corrupt syntax.
*   **Fix**: Run `npm install` to update, and delete `src/data/db.json` to trigger automatic seed file recreation.

### Q2: How do I change the default admin credentials?
*   **Reason**: The backend automatically seeds a default user on boot.
*   **Fix**: Update the `APP_PASSWORD` and `EMAIL` variables in your `.env` file before booting the application. Alternatively, change them directly inside the Profile settings panel inside the admin console.

### Q3: Why is my 3D Canvas lagging?
*   **Reason**: Your device might lack hardware acceleration or prefers battery saving.
*   **Fix**: The portfolio is built with native media listeners checking for `prefers-reduced-motion`. Enabling "Reduced Motion" in your operating system settings will automatically disable heavy WebGL computations, replacing them with fast, static high-definition assets.

---

## 👥 9. Developer Contribution Standards

To ensure clean code quality:
1.  **Lint Checklist**: Run `npm run lint` before committing to make sure there are no syntax errors or unused imports.
2.  **Conventional Commits**: Format your commits precisely:
    *   `feat: add active user-session tracking analytics`
    *   `fix: resolve memory leak in 3D WebGL renderer`
3.  **Code Styling**: Always prefer Tailwind CSS atomic layouts over manual style definitions. Group component types inside `src/components/admin` where applicable.
