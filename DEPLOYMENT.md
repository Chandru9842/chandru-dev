# 🚀 Full-Stack Portfolio CMS Deployment Guide (Vercel)

This project is now completely optimized for **1-Click Full-Stack Deployment on [Vercel](https://vercel.com/)** using **Node.js (TypeScript) + React (Vite)**.

You do **NOT** need to configure Java, Maven, Docker, or external backend hosting like Render. Both the frontend and backend APIs run seamlessly on Vercel.

---

## 📁 Architecture Overview

* 🌐 **Frontend**: React 19 + Vite + Tailwind CSS v4 + Three.js
* ⚙️ **Backend APIs**: Express 4 (Node.js / TypeScript) running as Serverless Functions via [`api/index.ts`](file:///c:/debug/api/index.ts)
* 🗄️ **Data Storage**: JSON-backed fast CMS store with automatic seeding and in-memory/temporary fallbacks for serverless environments.
* 🔒 **Security**: JWT Authentication, BCrypt Password Hashing, CORS handling, and strict input validation.

---

## 🚀 Step-by-Step Vercel Deployment

### Step 1: Push Changes to GitHub
Ensure all recent changes in this repository are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure full-stack Node.js backend for Vercel deployment"
git push origin main
```

---

### Step 2: Import into Vercel

1. Log in to your **[Vercel Dashboard](https://vercel.com/)**.
2. Click **Add New...** $\to$ **Project**.
3. Select and import your GitHub repository (`chandru-dev`).
4. Configure Project Settings:
   * **Framework Preset**: `Vite` (automatically detected)
   * **Root Directory**: `./` (leave as root)
   * **Build Command**: `npm run build` (or leave default `vite build`)
   * **Output Directory**: `dist` (automatically detected)

---

### Step 3: Configure Environment Variables (Optional)

In the **Environment Variables** section on Vercel, you can optionally configure:
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `JWT_SECRET` | Secret key used for signing JWT auth tokens | `your-secret-key-32-chars-minimum` |
| `EMAIL` | Admin contact email | `chandrumohan550@gmail.com` |
| `APP_PASSWORD` / `SMTP_*` | SMTP credentials for automated contact notifications | *(Optional)* |

---

### Step 4: Click Deploy!

Click the **Deploy** button. Vercel will:
1. Automatically build your React frontend static assets (`dist/`).
2. Automatically compile your serverless backend endpoints from [`api/index.ts`](file:///c:/debug/api/index.ts).
3. Provide you with a live production URL (e.g., `https://chandru-dev.vercel.app`).

---

## 🔍 Verification & Health Check

Once deployed, you can verify your live deployment:
* **Frontend**: `https://<your-project>.vercel.app/`
* **Admin Dashboard**: `https://<your-project>.vercel.app/admin`
* **API Health Check**: `https://<your-project>.vercel.app/api/health`
* **API Projects**: `https://<your-project>.vercel.app/api/projects`

---

## 💻 Local Development

To run the full-stack application locally on your machine:
```bash
npm install
npm run dev
```
The server will start at: `http://localhost:3000`
