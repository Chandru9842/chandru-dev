# 🚀 Portfolio CMS Deployment Guide (Vercel & Render)

This guide provides step-by-step instructions for deploying your professional full-stack Portfolio CMS application:
* 🌐 **Frontend (React/Vite)**: Deployed on **Vercel**
* ⚙️ **Backend (Spring Boot)**: Deployed on **Render** (via Docker)
* 🗄️ **Database (MySQL)**: Hosted on a cloud provider of your choice (e.g., Aiven, TiDB Cloud, or Clever Cloud)

---

## 📁 Deployment Files Created

We have pre-configured and created the following deployment assets in your workspace:
1. `backend/pom.xml`: Standard production Maven POM file containing all Spring Boot & Security dependencies (JWT, JPA, Validation, Lombok, MySQL).
2. `backend/src/main/java/com/portfolio/cms/PortfolioApplication.java`: The main entry-point class for Spring Boot.
3. `backend/src/main/resources/application.properties`: Configuration mapping the database parameters, JWT keys, and file sizes dynamically to environment variables.
4. `backend/src/main/java/com/portfolio/cms/config/WebConfig.java`: Enables global CORS mapping to allow your Vercel frontend to safely communicate with your Render backend.
5. `backend/Dockerfile`: High-performance multi-stage Docker build file that builds your Java 21 Spring Boot app cleanly and creates a lightweight JRE runner.
6. `vercel.json`: Redirects and rewrites configuration. This routes `/api/*` requests on Vercel straight to your Render backend cleanly **without needing to rewrite any fetch paths in your React code!**

---

## Step 1: Set Up Your MySQL Database

Since Render's free managed database tier is PostgreSQL, we highly recommend hosting your **MySQL** database on a reliable free cloud provider:
* **Option A: Aiven.io (Recommended)** — Offers a fully-managed MySQL database on a free tier.
* **Option B: TiDB Cloud / TiDB Serverless** — Offers a free, highly-scalable MySQL-compatible relational database.
* **Option C: Clever Cloud** — Offers free shared MySQL databases out-of-the-box.

### 📝 Save Your Credentials:
Once created, note down:
1. **Host**: e.g., `mysql-instance-xxxx.aivencloud.com`
2. **Port**: e.g., `12345` or `3306`
3. **Database Name**: e.g., `portfolio_cms`
4. **Username**: e.g., `admin` or `root`
5. **Password**: Your database password.

---

## Step 2: Deploy Backend on Render

Render will automatically build and run your Spring Boot application using the pre-configured `backend/Dockerfile`.

1. Go to **[Render.com](https://render.com/)** and log in.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub / GitLab repository.
4. Configure the Web Service settings:
   * **Name**: `portfolio-backend`
   * **Region**: Choose the closest region (e.g., Oregon, Frankfurt, Singapore).
   * **Root Directory**: `backend` *(CRITICAL: Tell Render to look inside the backend folder)*
   * **Language**: `Docker` *(Render will automatically build your app using `backend/Dockerfile`)*
5. Scroll down to the **Environment Variables** section and add:
   * `PORT`: `8080` (or leave empty; Render defaults to exposing standard web ports)
   * `SPRING_DATASOURCE_URL`: `jdbc:mysql://<YOUR_DATABASE_HOST>:<PORT>/<DATABASE_NAME>?useSSL=true&requireSSL=false&serverTimezone=UTC`
   * `SPRING_DATASOURCE_USERNAME`: `<YOUR_DATABASE_USER>`
   * `SPRING_DATASOURCE_PASSWORD`: `<YOUR_DATABASE_PASSWORD>`
   * `SPRING_JPA_DDL_AUTO`: `update` (Hibernate will automatically construct the tables upon startup!)
   * `JWT_SECRET`: Generate a secure 64-character hex string (e.g., `dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3Ryb25nLWtleS1mb3ItcG9ydGZvbGlvLWNtcw==`)
   * `JWT_EXPIRATION_MS`: `3600000` (1 hour)
6. Click **Deploy Web Service**.

Once deployed, Render will provide a public URL like:
👉 `https://portfolio-backend-xxxx.onrender.com`

---

## Step 3: Configure Vercel API Rewrites

To make the React frontend on Vercel point directly to your live Render backend, open `/vercel.json` in your local project and update the destination URL:

1. Open `/vercel.json`.
2. Locate the first rewrite rule:
   ```json
   {
     "source": "/api/:path*",
     "destination": "https://portfolio-backend-render.onrender.com/api/:path*"
   }
   ```
3. Change `https://portfolio-backend-render.onrender.com` to your **actual Render Web Service URL** (from Step 2).
4. Save and commit this change.

*This rewrite rule proxies any browser call to `/api/...` on Vercel seamlessly to your Render backend, eliminating CORS issues entirely and keeping cookies/headers secure!*

---

## Step 4: Deploy Frontend on Vercel

1. Go to **[Vercel.com](https://vercel.com/)** and log in.
2. Click **Add New** and select **Project**.
3. Import your repository.
4. Configure the Vercel settings:
   * **Framework Preset**: `Vite` (Vercel detects this automatically).
   * **Root Directory**: Leave as the **root of your repository** (so Vercel can read `vercel.json`, `package.json`, and compile the Vite static assets).
5. Click **Deploy**.

🎉 Vercel will build your static assets and host your modern portfolio frontend.

---

## 🔒 Security Best Practices

1. **Keep Secrets Secret**: Never commit real database passwords or JWT secret keys to your public Git repository. Always pass them via **Render Environment Variables**.
2. **Initial Admin Setup**: In Spring Boot, on first boot with `spring.jpa.hibernate.ddl-auto=update`, the schema is constructed automatically. Set up your admin user either via a custom SQL script, or let the authentication service handle initial admin signup.
3. **CORS Safe listing**: In production, you can lock down your backend `WebConfig.java` to only accept requests from your exact Vercel URL rather than using `.allowedOriginPatterns("*")`.
