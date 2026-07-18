# 👥 Contributing to Portfolio CMS

Thank you for your interest in contributing! We appreciate your support in making the **Portfolio CMS** a more robust, clean, and modern platform for developers.

To maintain a high-quality codebase, we request all contributors follow the guidelines below.

---

## 🚦 Contribution Workflow

1.  **Fork the Repository**: Create a personal copy of this repository on your GitHub account.
2.  **Clone Locally**:
    ```bash
    git clone https://github.com/your-username/portfolio-cms.git
    cd portfolio-cms
    ```
3.  **Create a Feature Branch**:
    ```bash
    git checkout -b feature/AmazingNewFeature
    ```
4.  **Implement Changes**: Ensure your changes are modular, dry, and adhere to our coding standards.
5.  **Run Quality Checks**:
    ```bash
    npm run lint
    npm run build
    ```
    *Do not submit pull requests with lint warnings or compiler failures.*
6.  **Commit Changes**: Use conventional semantic commit messages (see below).
7.  **Push and Open a Pull Request (PR)**: Push to your fork and submit a PR to the `main` branch.

---

## 📝 Commit Message Guidelines

We use conventional commit formatting to keep a clean, scannable history:
```
<type>(<scope>): <short description>
```

### Types
*   `feat`: A new application feature.
*   `fix`: A bug fix.
*   `docs`: Documentation updates only.
*   `style`: Code style modifications (formatting, white-space, semi-colons).
*   `refactor`: Code changes that neither fix a bug nor add a feature.
*   `perf`: Performance-optimizing changes.
*   `test`: Adding missing tests or correcting existing tests.

### Examples
*   `feat(analytics): add real-time visitor country tracking`
*   `fix(3d-hero): prevent WebGL memory leak in planet rotation`
*   `docs(api): update security settings endpoint documentation`

---

## 🎨 Frontend & Backend Coding Standards

*   **TypeScript**: Use strict type definitions. Avoid using `any` unless absolutely necessary.
*   **React Structure**: Create small, cohesive, functional components. Keep styling purely within Tailwind CSS utility classes.
*   **Express APIs**: Every endpoint must be safe, use appropriate HTTP status codes, and return clear JSON responses. All operational modifications must call the audit history logger.
*   **Linter Compliance**: Use `npm run lint` regularly. Clear all unused imports, unused variables, and active debug statements (`console.log`) before committing.
