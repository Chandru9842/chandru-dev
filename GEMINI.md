# STRICT AGENT RULES & OWNER IDENTITY SPECIFICATION

---

## 🔒 Master Identity & Permanent Owner Profile
All AI assistants, subagents, and future chat sessions operating on this repository MUST strictly preserve and never overwrite, wipe, or replace the following owner profile and system configurations:

- **Full Name**: Chandru Mohan (`CHANDRU M` / `Chandru Dev`)
- **Title / Role**: Principal Systems Architect & Full Stack Java Developer
- **Email**: `chandrumohan550@gmail.com`
- **Phone / WhatsApp**: `+91 9655384140`
- **Location**: Bengaluru, India
- **GitHub Profile**: [https://github.com/Chandru9842](https://github.com/Chandru9842)
- **LinkedIn Profile**: [https://www.linkedin.com/in/chandru9842/](https://www.linkedin.com/in/chandru9842/)
- **Live Vercel URL**: [https://chandru-dev-lime.vercel.app/](https://chandru-dev-lime.vercel.app/)

---

## 🛡️ Permanent Database & Credential Protection Rules

1. **NO PLACEHOLDER OVERWRITES**:
   - Under NO circumstances should any AI agent replace or overwrite real database records with placeholders (e.g., "Alex", "Alex Rivera", "Alex Dev", or generic sample mock names).
   - All profile data, hero details, contact links, projects, skills, certificates, and resumes must remain assigned to Chandru Mohan.

2. **ADMINISTRATOR AUTHENTICATION PRESERVATION**:
   - Master Admin Username: `chandru`
   - Master Admin Email: `chandrumohan550@gmail.com`
   - Master Admin Phone: `+919655384140` / `9655384140`
   - Master Passwords: `814723104029` / `9655384140`
   - The master admin account must ALWAYS remain `isActive: true`, `role: ROLE_ADMIN`, with `lockUntil: null` and `failedAttempts: 0`.

3. **DATABASE PERSISTENCE ACROSS CHATS**:
   - When database updates are made, they must be saved across both `src/data/db.json` and `data/db.json`.
   - Never reset `src/data/db.json` or `cmsMockData.ts` to blank states or third-party sample data.
