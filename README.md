# 💼 Custom Portfolio CMS & Admin Developer Console

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

An elite, full-stack Content Management System (CMS) and highly interactive developer portfolio showcase. This platform features a high-performance **Node.js & Express REST API** backend paired with a fluid, modern **React 19 + Vite + Tailwind CSS** client application, unified into a single full-stack container running on Port 3000.

Designed for professional developers and enterprise software engineers, this system replaces static JSON profiles and hardcoded pages with a robust, secure administrative console featuring cryptographically signed sessions, granular CRUD operations, database persistence, and system-wide custom styling.

---

## 🎨 Live Demo Preview

*   **Development Instance**: [Vite + Express Live Sandbox](https://ais-dev-7kdbqdtdk2uzadil46mstk-490441282507.asia-southeast1.run.app)
*   **Production Deployment**: [Shared Application Release](https://ais-pre-7kdbqdtdk2uzadil46mstk-490441282507.asia-southeast1.run.app)

---

## 🏗️ Folder Structure Blueprint

```
.
├── .github/                      # CI/CD GitHub pipelines and workflows
│   └── workflows/ci.yml          # Automated Quality & Build testing workflow
├── backend/                      # [Alternative] Spring Boot 3 Java Maven backend
├── docs/                         # Extensive developer reference books
│   ├── API_DOCUMENTATION.md      # REST API specifications and headers
│   ├── PROJECT_DOCUMENTATION.md  # Comprehensive setup & architecture document
│   └── RECRUITER_GUIDE.md        # Specialized interactive demo checklist
├── src/                          # React Client Frontend Source
│   ├── components/               # UI View Components & CMS Modals
│   │   ├── admin/                # Specialized Admin panels (CRUDs, Security, Log)
│   │   ├── ThreeDHero.tsx        # Responsive WebGL 3D canvas engine
│   │   ├── PortfolioFrontend.tsx # Beautiful, high-contrast dark public view
│   │   └── AdminDashboard.tsx    # Management hub workspace container
│   ├── data/                     # Data stores
│   │   ├── cmsMockData.ts        # Default seed objects
│   │   └── db.json               # Local JSON document database file
│   ├── App.tsx                   # Central router & main entry point
│   ├── types.ts                  # Shared TypeScript structures
│   └── index.css                 # Global styles and Tailwind v4 definitions
├── server.ts                     # Production unified Express server
├── .env.example                  # Environmental variables schema
├── package.json                  # Workspace dependencies & scripts
└── tsconfig.json                 # Compiler instructions
```

---

## ✨ Features Checklist

### 🔒 Enterprise-Grade Security
*   **JWT Token Architecture**: Uses cryptographically signed HS512 short-lived JSON Web Tokens paired with a database-stored rotating refresh token mechanism for session security.
*   **Active Account Protection**: Features built-in failed-attempt tracking, automatic login rate limiting, and temporary account lockout.
*   **Comprehensive Audit Trails**: Real-time logging of administrative CRUD operations, login details, browser versions, operating systems, and location telemetry.

### 📊 Full CRUD Modals & Management Panels
*   **Interactive Bento Grid Projects**: Easily create, update, and delete showcase items. Toggle visibility, feature status, and drag to reorder display weights dynamically.
*   **Categorized Technical Skills**: Edit proficiencies across groupings (Frontend, Backend, Devops, etc.) with real-time UI previews.
*   **Scholastic & Professional Timelines**: Log GPAs, educational milestones, corporate career dates, and descriptions.
*   **Resume Center & Document Manager**: Supports PDF file uploads, historical document archiving, active resume toggling, and file serving.
*   **Zero-Dependency Analytics**: Tracking page-view sessions, geo-locations, and click impressions on contact forms or external buttons without cookies.

---

## 💻 Tech Stack Specification

*   **Frontend**: React 19, Vite 6, Tailwind CSS v4, Three.js, React Three Fiber, Framer Motion, Recharts
*   **Backend**: Node.js v22 LTS, Express 4.x, JSON Web Tokens, BCrypt.js, Nodemailer
*   **Database**: Document JSON model with synchronous thread-safe filesystem reads/writes (`src/data/db.json`)
*   **CI/CD**: GitHub Actions, ESLint, TypeScript Type Checks

---

## ⚙️ Environment Variables Template

Create a `.env` file in the root directory and map the variables following this schema:

```env
# Server Port (Defaults to port 3000)
PORT=3000

# Security Token Salt Phrase
JWT_SECRET=super-secure-cryptographic-salt-phrase-2026

# Administrator Email (Fallback Seeding User)
EMAIL=chandrumohan550@gmail.com

# Administrator Secure Password
APP_PASSWORD=your-secure-plain-password

# Optional SMTP Configuration (Resume notification emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

---

## 🚀 Installation & Running Locally

### 📋 Prerequisites
*   **Node.js**: `v18.0.0` or higher
*   **NPM**: `v9.0.0` or higher

### Local Development Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/alex-dev/portfolio-cms.git
    cd portfolio-cms
    ```
2.  **Install Base Workspace Dependencies**:
    ```bash
    npm install
    ```
3.  **Prepare local configurations**:
    ```bash
    cp .env.example .env
    ```
    *(Open `.env` and fill in your desired password and email keys).*
4.  **Launch Concurrent Dev Environment**:
    ```bash
    npm run dev
    ```
    *This boots up the Express API server and links Vite's frontend assets on port `3000` (http://localhost:3000) with hot-module reloading enabled.*

---

## ☁️ Production Deployment

### Production Compilation
We build both the frontend assets and backend server into highly compressed, optimized bundles for maximum runtime velocity.

```bash
npm run build
```
This single command executes two actions:
1.  **Frontend Build**: Compiles React 19 static client files into the `/dist` directory.
2.  **Backend Bundle**: Compiles TypeScript backend `server.ts` into a self-contained CommonJS file `/dist/server.cjs` with sourcemaps using `esbuild`.

### Container Run Start
To start the production server:
```bash
npm run start
```
*This runs the bundled Express server at Port 3000, which handles API routes and automatically serves production React assets static files.*

---

## 🔮 Future Architecture Enhancements

*   **Relational Database Migrate**: Native PostgreSQL configuration hooks for Cloud SQL or Supabase.
*   **Multi-factor Authentication (2FA)**: Support for Google Authenticator TOTP tokens.
*   **Media Cloud Uploads**: Link uploads directly to Cloudinary or AWS S3 buckets to reduce server space.

---

## 👥 Authors & Maintainers

*   **Chandru Mohan** - Lead Full-Stack Architect & Principal Software Engineer - [GitHub Profile](https://github.com/chandru-mohan)

---

## 📄 License

This project is open-source and licensed under the **MIT License**. See `LICENSE` for details.
