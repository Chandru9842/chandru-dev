# 📜 Release Notes — Custom Portfolio CMS v1.0.0 (Gold Release)

The Custom Portfolio CMS team is proud to announce the general availability of **Version 1.0.0**. This release represents a production-ready, feature-complete, enterprise-grade open-source CMS platform.

---

## 🚀 Key Features

### 1. Unified Full-Stack Run Engine
*   **Dual-State Service Architecture**: Runs a high-performance Express REST API integrated with a static single-page application router, built and packaged using **Vite 6** and **esbuild** into a secure, standalone container running on Port 3000.
*   **Synchronous JSON Document Store**: Fast local schema storage (`src/data/db.json`) utilizing synchronous file locking for robust database operations without external dependencies.
*   **Alternative Java Backend Ready**: Prepared with a fully functional Spring Boot 3 enterprise microservice backend (under `/backend`) mapped to standard database adapters.

### 2. High-Fidelity 3D WebGL Canvas
*   **Three.js Custom Geometries**: Implements a procedural spinning Earth model with geographic point markers, custom galaxy particle arrays with interactive scroll multipliers, and realistic holographic models.
*   **Reduced-Motion Accessibility Support**: Integrates media listeners checking for operating system reduced-motion flags (`prefers-reduced-motion`) to automatically swap heavy WebGL loops with fast vector assets.

### 3. Comprehensive Administrative CMS Suite
*   **Bento Layout Projects CRUD**: Dynamic grid layout featuring drag-to-reorder sorting weights, featured toggle sliders, and image uploads.
*   **Granular Taxonomy Managers**: Customized managers for career timelines, scholastic credentials, certification badges, and technical skill matrices.
*   **Custom Global Theme Engine**: Allows updating primary palettes, corporate labels, layout structures, and copyright strings with instantaneous preview re-renders.

### 4. Zero-Dependency Telemetry & Security
*   **JWT & Rotating Session Keys**: Secure authentication utilizing cryptographically signed tokens (HS512) and account lockouts (brute-force lockout threshold).
*   **Real-Time Visitor Auditing**: Direct logging of visitor page path counts, geo-locations, browser configurations, click metrics, and conversion funnels without cookie banners.

---

## 📈 Quality Improvements & Bug Fixes

*   **Fixed**: Fixed WebGL rendering pipeline memory leaks when switching admin pages.
*   **Fixed**: Resolved Node ESM syntax import path resolution issues via bundled build scripts.
*   **Improved**: Added automated **CI/CD GitHub Actions Workflow** for package lints, type assertions, and production build checks.
*   **Improved**: Added REST API rate limits and centralized try-catch middleware logging unhandled system exceptions directly to the administrative history audits.
*   **Improved**: Implemented instant database export and recovery tools (JSON backup streams) to ensure reliable disaster recovery.

---

## 📋 Known Issues

*   **3D Hero Mobile Performance**: Older iOS/Android devices might experience minor frame rate drops when displaying complex particle arrays simultaneously. *Recommendation*: Toggle the reduced-motion setting on your mobile device to render static high-definition assets.

---

## 🔮 Future Development Roadmap

1.  **PostgreSQL Dynamic Driver Integration**: Simple toggle inside `.env` to route data from local JSON files to AWS RDS or Google Cloud SQL databases.
2.  **Multi-Factor Authenticator (MFA/2FA)**: Standard Google Authenticator TOTP backup key verification on admin login screen.
3.  **Dynamic S3/Cloudinary Cloud Media Buckets**: Support for streaming uploads directly to cloud storage providers.
