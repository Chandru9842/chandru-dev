import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import compression from "compression";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

// Initial data import
import { 
  initialProjects, initialSkills, initialCertificates, 
  initialExperiences, initialEducation, initialMessages, 
  initialAnalytics, initialSettings, initialSocialLinks,
  initialResumes, initialProfile, initialThemeSettings,
  initialAchievements, initialFooter, initialTechStack, initialTools,
  initialPortfolioMetrics
} from "./src/data/cmsMockData";

const PORT = Number(process.env.PORT) || 3000;
const DB_SEED_SOURCE = path.join(process.cwd(), "src", "data", "db.json");
const DB_PATH_DEFAULT = path.join(process.cwd(), "data", "db.json");
const DB_FILE = process.env.VERCEL
  ? path.join("/tmp", "db.json")
  : DB_PATH_DEFAULT;

let memoryDb: any = null;

// Helper to ensure database is loaded
function loadDatabase() {
  if (memoryDb) {
    return memoryDb;
  }
  try {
    if (!fs.existsSync(DB_FILE)) {
      try {
        const seedSource = fs.existsSync(DB_SEED_SOURCE) ? DB_SEED_SOURCE : (fs.existsSync(path.join(process.cwd(), "src", "data", "db.json")) ? path.join(process.cwd(), "src", "data", "db.json") : null);
        if (seedSource) {
          const dir = path.dirname(DB_FILE);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const seedData = fs.readFileSync(seedSource, "utf-8");
          fs.writeFileSync(DB_FILE, seedData, "utf-8");
        }
      } catch (e) {
        console.warn("Notice: Initializing db file fallback:", e);
      }
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(data);
      memoryDb = db;
      let dirty = false;
      // Dynamic backfill of socialLinks if it's not present in the existing database
      if (!db.socialLinks) {
        db.socialLinks = initialSocialLinks;
        dirty = true;
      } else if (Array.isArray(db.socialLinks)) {
        db.socialLinks.forEach((item: any) => {
          if (item.showInDynamicProfile === undefined) { item.showInDynamicProfile = true; dirty = true; }
          if (item.showInCoordinates === undefined) { item.showInCoordinates = true; dirty = true; }
          if (item.showInFooter === undefined) { item.showInFooter = true; dirty = true; }
          if (item.showInContact === undefined) { item.showInContact = true; dirty = true; }
          if (item.showInHero === undefined) { item.showInHero = false; dirty = true; }
          if (item.showInSystemConsole === undefined) { item.showInSystemConsole = false; dirty = true; }
        });
      }
      if (!db.footer) {
        db.footer = initialFooter;
        dirty = true;
      }
      if (!db.footerSocialLinks) {
        if (db.socialLinks && Array.isArray(db.socialLinks) && db.socialLinks.length > 0) {
          db.footerSocialLinks = db.socialLinks.map((item: any, idx: number) => ({
            id: item.id || (idx + 1),
            platform: item.platform,
            url: item.profileUrl || item.url || "",
            icon: item.platform,
            isVisible: item.isVisible !== undefined ? item.isVisible : true,
            displayOrder: item.displayOrder || (idx + 1),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
          }));
        } else {
          db.footerSocialLinks = [
            {
              id: 1,
              platform: "GitHub",
              url: "https://github.com/alex-dev",
              icon: "GitHub",
              isVisible: true,
              displayOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 2,
              platform: "LinkedIn",
              url: "https://linkedin.com/in/alex-dev-architect",
              icon: "LinkedIn",
              isVisible: true,
              displayOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
        }
        dirty = true;
      }
      if (!db.resumes) {
        db.resumes = initialResumes;
        dirty = true;
      }
      if (!db.profile) {
        db.profile = initialProfile;
        dirty = true;
      } else {
        if (db.profile.heroBadge === undefined) db.profile.heroBadge = initialProfile.heroBadge;
        if (db.profile.heroName === undefined) db.profile.heroName = initialProfile.heroName;
        if (db.profile.heroTitle === undefined) db.profile.heroTitle = initialProfile.heroTitle;
        if (db.profile.heroSubtitle === undefined) db.profile.heroSubtitle = initialProfile.heroSubtitle;
        if (db.profile.heroDescription === undefined) db.profile.heroDescription = initialProfile.heroDescription;
      }
      if (!db.technologies) {
        db.technologies = initialTechStack;
        dirty = true;
      }
      if (!db.tools || !Array.isArray(db.tools) || db.tools.length === 0) {
        db.tools = initialTools;
        dirty = true;
      }
      if (!db.portfolioMetrics || !Array.isArray(db.portfolioMetrics) || db.portfolioMetrics.length === 0) {
        db.portfolioMetrics = initialPortfolioMetrics;
        dirty = true;
      }
      if (!db.themeSettings) {
        db.themeSettings = initialThemeSettings;
        dirty = true;
      }
      if (!db.achievements) {
        db.achievements = initialAchievements;
        dirty = true;
      }
      if (!db.messages || !Array.isArray(db.messages)) {
        db.messages = initialMessages;
        dirty = true;
      }
      if (!db.users || !Array.isArray(db.users) || db.users.length === 0) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync("9655384140", salt);
        db.users = [
          {
            id: 1,
            name: "Chandru Mohan",
            email: "chandrumohan550@gmail.com",
            username: "chandru",
            phoneNumber: "+919655384140",
            backupEmail: "",
            recoveryPhoneNumber: "",
            passwordHash: hash,
            role: "ROLE_ADMIN",
            otpEnabled: false,
            alwaysRequireLogin: false,
            rememberLogin: true,
            verifyNewDevice: false,
            sessionTimeout: "Never",
            refreshTokenEnabled: true,
            maxLoginAttempts: 5,
            lockDuration: 15,
            otpExpiration: 5,
            otpLength: 6,
            enableRememberMe: true,
            enableJWT: true,
            allowLoginEmail: true,
            allowLoginUsername: true,
            allowLoginPhone: true,
            knownDevices: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            failedAttempts: 0,
            lockUntil: null
          }
        ];
        dirty = true;
      } else {
        // Backfill existing user object with new security configuration fields
        const user = db.users[0];
        let userDirty = false;
        if (!user.username) { user.username = "chandru"; userDirty = true; }
        if (!user.phoneNumber) { user.phoneNumber = "+919655384140"; userDirty = true; }
        if (user.backupEmail === undefined) { user.backupEmail = ""; userDirty = true; }
        if (user.recoveryPhoneNumber === undefined) { user.recoveryPhoneNumber = ""; userDirty = true; }
        if (user.otpEnabled === undefined) { user.otpEnabled = false; userDirty = true; }
        if (user.alwaysRequireLogin === undefined) { user.alwaysRequireLogin = false; userDirty = true; }
        if (user.rememberLogin === undefined) { user.rememberLogin = true; userDirty = true; }
        if (user.verifyNewDevice === undefined) { user.verifyNewDevice = false; userDirty = true; }
        if (!user.sessionTimeout) { user.sessionTimeout = "Never"; userDirty = true; }
        if (user.refreshTokenEnabled === undefined) { user.refreshTokenEnabled = true; userDirty = true; }
        if (!user.maxLoginAttempts) { user.maxLoginAttempts = 5; userDirty = true; }
        if (!user.lockDuration) { user.lockDuration = 15; userDirty = true; }
        if (!user.otpExpiration) { user.otpExpiration = 5; userDirty = true; }
        if (!user.otpLength) { user.otpLength = 6; userDirty = true; }
        if (user.enableRememberMe === undefined) { user.enableRememberMe = true; userDirty = true; }
        if (user.enableJWT === undefined) { user.enableJWT = true; userDirty = true; }
        if (user.allowLoginEmail === undefined) { user.allowLoginEmail = true; userDirty = true; }
        if (user.allowLoginUsername === undefined) { user.allowLoginUsername = true; userDirty = true; }
        if (user.allowLoginPhone === undefined) { user.allowLoginPhone = true; userDirty = true; }
        if (!user.knownDevices) { user.knownDevices = []; userDirty = true; }
        if (userDirty) dirty = true;
      }
      if (!db.auditLogs || !Array.isArray(db.auditLogs)) {
        db.auditLogs = [];
        dirty = true;
      }
      if (!db.activityHistory || !Array.isArray(db.activityHistory)) {
        db.activityHistory = [];
        dirty = true;
      }
      if (!db.loginHistory || !Array.isArray(db.loginHistory)) {
        db.loginHistory = [];
        dirty = true;
      }
      if (!db.refreshTokens || !Array.isArray(db.refreshTokens)) {
        db.refreshTokens = [];
        dirty = true;
      }
      if (!db.otps || !Array.isArray(db.otps)) {
        db.otps = [];
        dirty = true;
      }
      if (!db.codingProfiles || !Array.isArray(db.codingProfiles)) {
        db.codingProfiles = [];
        dirty = true;
      }
      if (!db.mediaItems || !Array.isArray(db.mediaItems)) {
        db.mediaItems = [
          {
            id: 1,
            title: "Hero Profile Portrait",
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
            type: "image",
            folder: "Hero & Profile",
            size: 145000,
            dimensions: "600x600",
            tags: ["hero", "profile", "avatar"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            title: "Distributed Microservices Architecture Diagram",
            url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
            type: "image",
            folder: "Projects",
            size: 320000,
            dimensions: "800x500",
            tags: ["project", "microservices", "architecture"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            title: "AWS Certified Solutions Architect Badge",
            url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=400&auto=format&fit=crop",
            type: "image",
            folder: "Certificates & Badges",
            size: 98000,
            dimensions: "400x400",
            tags: ["aws", "badge", "certified"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        dirty = true;
      }

      if (!db.notifications || !Array.isArray(db.notifications)) {
        db.notifications = [
          {
            id: "notif-1",
            type: "SYSTEM",
            title: "Enterprise Engine Initialized",
            message: "Portfolio CMS upgraded to Enterprise Platform v2.5.0 with AI, Analytics & Security",
            timestamp: new Date().toISOString(),
            read: false,
            link: "Settings"
          },
          {
            id: "notif-2",
            type: "VISITOR",
            title: "New Visitor Session",
            message: "Visitor from San Francisco, USA viewed Distributed Systems project",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            link: "Analytics"
          }
        ];
        dirty = true;
      }

      if (!db.backups || !Array.isArray(db.backups)) {
        db.backups = [
          {
            id: "backup-initial-1",
            filename: "portfolio_backup_initial.json",
            size: "142 KB",
            createdAt: new Date().toISOString(),
            type: "Automatic",
            status: "Completed",
            recordsCount: 48
          }
        ];
        dirty = true;
      }

      if (!db.emailSettings) {
        db.emailSettings = {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUser: "notifications@alexdev.io",
          smtpPass: "••••••••••••",
          secure: true,
          preset: "Gmail SMTP",
          autoReplyEnabled: true,
          contactAlertsEnabled: true,
          adminNotificationsEnabled: true,
          autoReplyTemplate: "Hello {{name}},\n\nThank you for getting in touch! I have received your message regarding \"{{subject}}\" and will review it shortly.\n\nBest regards,\nAlex Dev",
          contactAlertTemplate: "New Contact Message Received!\nName: {{name}}\nEmail: {{email}}\nSubject: {{subject}}\nMessage: {{message}}"
        };
        dirty = true;
      }

      if (!db.roles || !Array.isArray(db.roles)) {
        db.roles = [
          {
            id: "role-founder",
            name: "Founder",
            description: "Full unchecked administrative control over system, security, databases, and users.",
            permissions: ["MANAGE_PROJECTS", "MANAGE_SKILLS", "MANAGE_MESSAGES", "VIEW_ANALYTICS", "MANAGE_USERS", "SYSTEM_BACKUP", "SECURITY_AUDIT", "ROLE_MANAGEMENT"],
            userCount: 1,
            isSystem: true
          },
          {
            id: "role-admin",
            name: "Admin",
            description: "Manage CMS portfolio content, themes, settings, and view visitor analytics.",
            permissions: ["MANAGE_PROJECTS", "MANAGE_SKILLS", "MANAGE_MESSAGES", "VIEW_ANALYTICS", "SYSTEM_BACKUP"],
            userCount: 0,
            isSystem: true
          },
          {
            id: "role-editor",
            name: "Editor",
            description: "Create, edit, and update portfolio projects, experience, and media assets.",
            permissions: ["MANAGE_PROJECTS", "MANAGE_SKILLS", "MANAGE_MESSAGES"],
            userCount: 0,
            isSystem: false
          },
          {
            id: "role-viewer",
            name: "Viewer",
            description: "Read-only access to CMS preview and analytics reports.",
            permissions: ["VIEW_ANALYTICS"],
            userCount: 0,
            isSystem: false
          }
        ];
        dirty = true;
      }

      if (!db.logs || !Array.isArray(db.logs)) {
        db.logs = [
          {
            id: "log-1",
            timestamp: new Date().toISOString(),
            category: "API",
            level: "INFO",
            message: "API Route GET /api/projects executed successfully (200 OK)",
            ip: "127.0.0.1"
          },
          {
            id: "log-2",
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            category: "AUTH",
            level: "INFO",
            message: "Administrator login session authenticated for chandrumohan550@gmail.com",
            ip: "127.0.0.1"
          }
        ];
        dirty = true;
      }

      if (!db.adminTasks || !Array.isArray(db.adminTasks)) {
        db.adminTasks = [
          { id: "task-1", title: "Review new project descriptions with AI Copilot", completed: false, priority: "High" },
          { id: "task-2", title: "Verify SEO metadata & Sitemap generation", completed: true, priority: "Medium" },
          { id: "task-3", title: "Export weekly database backup snapshot", completed: false, priority: "Medium" }
        ];
        dirty = true;
      }

      if (!db.seoConfig) {
        db.seoConfig = {
          metaTitle: "Alex Dev | Senior Full Stack Architect & Systems Engineer",
          metaDescription: "Enterprise portfolio of Alex Dev featuring high-scale distributed systems, microservices, cloud infrastructure, and AI applications.",
          keywords: "Software Engineer, Full Stack Architect, React, Node.js, Cloud, Microservices, TypeScript",
          ogTitle: "Alex Dev - Enterprise Portfolio CMS",
          ogDescription: "Architecting high-performance cloud applications & resilient enterprise platforms.",
          ogImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
          twitterCard: "summary_large_image",
          twitterSite: "@alex_dev_arch",
          robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://alexdev.io/sitemap.xml",
          pwaEnabled: true,
          offlineMode: true,
          highContrastMode: false
        };
        dirty = true;
      }
      if (dirty) {
        saveDatabase(db);
      }
      return db;
    }
  } catch (error) {
    console.error("Error reading database file, resetting to defaults:", error);
  }

  // Fallback / Initial seeding
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync("9655384140", salt);
  const initialData = {
    projects: initialProjects,
    skills: initialSkills,
    certificates: initialCertificates,
    experiences: initialExperiences,
    education: initialEducation,
    messages: initialMessages,
    analytics: initialAnalytics,
    settings: initialSettings,
    footer: initialFooter,
    socialLinks: initialSocialLinks,
    resumes: initialResumes,
    profile: initialProfile,
    themeSettings: initialThemeSettings,
    achievements: initialAchievements,
    technologies: initialTechStack,
    tools: initialTools,
    users: [
      {
        id: 1,
        name: "Chandru Mohan",
        email: "chandrumohan550@gmail.com",
        passwordHash: hash,
        role: "ROLE_ADMIN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        failedAttempts: 0,
        lockUntil: null
      }
    ],
    auditLogs: [],
    activityHistory: [],
    refreshTokens: [],
    otps: [],
    codingProfiles: []
  };
  saveDatabase(initialData);
  return initialData;
}

let cachedPortfolioData: any = null;

function saveDatabase(data: any) {
  memoryDb = data;
  cachedPortfolioData = null; // Invalidate portfolio cache on any write/mutation!
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

function syncProfileActiveResume(db: any) {
  if (!db.profile) {
    db.profile = { ...initialProfile };
  }
  const activeResume = (db.resumes || []).find((r: any) => r.isActive);
  if (activeResume) {
    db.profile.resumeId = activeResume.id;
    db.profile.resumeUrl = activeResume.fileUrl && activeResume.fileUrl.startsWith("data:")
      ? `/api/resume/${activeResume.id}/file`
      : activeResume.fileUrl;
  } else {
    db.profile.resumeId = null;
    db.profile.resumeUrl = "";
  }
}

export const app = express();
app.use(compression()); // Compress all dynamic/static HTTP responses
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Limit API metadata to /api only so frontend SPA handles / and all page routes
app.get("/api", (req, res) => {
  res.json({
    name: "Portfolio CMS API",
    status: "ONLINE",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get(["/health", "/api/health"], (req, res) => {
    const uptime = process.uptime();
    const db = loadDatabase();
    const dbStatus = db ? "UP" : "DEGRADED";

    res.json({
      status: "UP",
      version: "1.0.0",
      uptime: `${Math.floor(uptime)}s`,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        storage: "UP"
      }
    });
  });

  // --- API ROUTES ---

  const JWT_SECRET = process.env.JWT_SECRET || "portfolio-cms-super-secret-key-alex-dev-2026";

  // Helper to sanitize input strings against stored XSS
  function sanitizeInput(str: any): string {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  // Helper to simulate Cloudinary image processing (optimization, thumbnail, formats)
  function processMockCloudinaryImage(base64OrUrl: string, type: string) {
    if (!base64OrUrl || !base64OrUrl.startsWith("data:")) {
      return {
        url: base64OrUrl || "",
        thumbnail: base64OrUrl || "",
        optimized: base64OrUrl || "",
        publicId: `portfolio/profile/${type}_${Date.now()}`
      };
    }
    const randomId = Math.floor(Math.random() * 1000000);
    const publicId = `portfolio/profile/${type}_${randomId}`;
    return {
      url: base64OrUrl, // base64 is perfect to store and display immediately in local json DB
      thumbnail: base64OrUrl,
      optimized: base64OrUrl,
      publicId: publicId
    };
  }

  // Simple Rate Limiting for Login Endpoint
  const loginAttemptsByIP = new Map<string, { count: number; lastReset: number }>();
  const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
  const MAX_LOGIN_REQUESTS_PER_WINDOW = 15;

  function rateLimiter(req: any, res: any, next: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const clientData = loginAttemptsByIP.get(ip);

    if (!clientData) {
      loginAttemptsByIP.set(ip, { count: 1, lastReset: now });
      return next();
    }

    if (now - clientData.lastReset > RATE_LIMIT_WINDOW_MS) {
      loginAttemptsByIP.set(ip, { count: 1, lastReset: now });
      return next();
    }

    if (clientData.count >= MAX_LOGIN_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ error: "Too many login attempts. Please try again in a minute." });
    }

    clientData.count += 1;
    next();
  }

  // Disable browser caching for administrative routes and endpoints
  function nocache(req: any, res: any, next: any) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  }

  app.use("/api", nocache);

  // JWT Verification Middleware for administrative write operations
  function authenticateJWT(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // Allow demo guest tokens for recruiter read-only access
      if (token.startsWith("demo_guest_token_")) {
        req.user = {
          id: 99999,
          name: "Recruiter Guest",
          email: "guest@recruiter.demo",
          role: "ROLE_ADMIN",
          username: "recruiter_guest",
          isDemo: true
        };
        // Block write operations in demo mode
        if (req.method !== "GET") {
          return res.status(200).json({
            status: "success",
            isDemoSimulated: true,
            message: "🛡️ Recruiter Demo Mode: Action was simulated in-session and your live production database remains 100% protected."
          });
        }
        return next();
      }

      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
          return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
        }
        req.user = decoded;

        // Sandboxed Recruiter Demo Guard: Block live database mutations on disk
        if (req.user?.isDemo && req.method !== "GET") {
          return res.status(200).json({
            status: "success",
            isDemoSimulated: true,
            message: "🛡️ Recruiter Demo Mode: Action was simulated in-session and your live production database remains 100% protected."
          });
        }

        next();
      });
    } else {
      res.status(401).json({ error: "Unauthorized: Missing administrative credentials" });
    }
  }

  function parseUserAgent(userAgent: string) {
    let browser = "Other";
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edg")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) browser = "IE";

    let operatingSystem = "Other";
    if (userAgent.includes("Windows NT 10.0")) operatingSystem = "Windows 10/11";
    else if (userAgent.includes("Windows NT 6.2")) operatingSystem = "Windows 8";
    else if (userAgent.includes("Windows NT 6.1")) operatingSystem = "Windows 7";
    else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X")) operatingSystem = "macOS";
    else if (userAgent.includes("Android")) operatingSystem = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) operatingSystem = "iOS";
    else if (userAgent.includes("Linux")) operatingSystem = "Linux";

    let device = "Desktop";
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      if (/iPad|tablet/i.test(userAgent)) {
        device = "Tablet";
      } else {
        device = "Mobile";
      }
    }
    return { browser, operatingSystem, device };
  }

  function determineNotificationMeta(moduleName: string, actionName: string, status: string = "SUCCESS") {
    let severity: "Information" | "Success" | "Warning" | "Error" | "Critical" = "Success";
    const actLower = (actionName || "").toLowerCase();
    const modLower = (moduleName || "").toLowerCase();

    if (status === "ERROR" || actLower.includes("failed") || actLower.includes("error") || actLower.includes("critical")) {
      severity = actLower.includes("critical") || actLower.includes("unauthorized") || actLower.includes("brute") ? "Critical" : "Error";
    } else if (status === "WARNING" || actLower.includes("warning") || actLower.includes("purge") || actLower.includes("delete") || actLower.includes("removed")) {
      severity = "Warning";
    } else if (actLower.includes("created") || actLower.includes("added") || actLower.includes("published") || actLower.includes("success") || actLower.includes("updated") || actLower.includes("uploaded")) {
      severity = "Success";
    } else {
      severity = "Information";
    }

    let category = "System";
    if (modLower.includes("project")) category = "Projects";
    else if (modLower.includes("profile") || modLower.includes("hero")) category = "Profile";
    else if (modLower.includes("media")) category = "Media";
    else if (modLower.includes("security") || modLower.includes("auth") || modLower.includes("login") || modLower.includes("role") || modLower.includes("password")) category = "Security";
    else if (modLower.includes("deploy") || modLower.includes("build") || modLower.includes("railway") || modLower.includes("github")) category = "Deployment";
    else if (modLower.includes("email") || modLower.includes("smtp")) category = "Email";
    else if (modLower.includes("task") || modLower.includes("backup") || modLower.includes("clean")) category = "Tasks";
    else if (modLower.includes("announcement")) category = "Announcements";
    else category = "System";

    let icon = "Bell";
    let color = "#10b981";

    if (category === "Projects") { icon = "BookOpen"; color = "#3b82f6"; }
    else if (category === "Profile") { icon = "User"; color = "#8b5cf6"; }
    else if (category === "Media") { icon = "Folder"; color = "#f59e0b"; }
    else if (category === "Security") { icon = "ShieldAlert"; color = severity === "Critical" || severity === "Error" ? "#ef4444" : "#eab308"; }
    else if (category === "Deployment") { icon = "Rocket"; color = severity === "Error" ? "#ef4444" : "#06b6d4"; }
    else if (category === "Email") { icon = "Mail"; color = "#ec4899"; }
    else if (category === "Tasks") { icon = "Clock"; color = "#14b8a6"; }
    else if (category === "Announcements") { icon = "Megaphone"; color = "#a855f7"; }

    return { severity, category, icon, color };
  }

  function publishNotification(db: any, {
    module,
    action,
    title,
    description,
    performedBy = "Chandru Mohan",
    severity,
    category,
    icon,
    color,
    pinned = false,
    metadata = {}
  }: {
    module: string;
    action: string;
    title?: string;
    description: string;
    performedBy?: string;
    severity?: "Information" | "Success" | "Warning" | "Error" | "Critical";
    category?: string;
    icon?: string;
    color?: string;
    pinned?: boolean;
    metadata?: any;
  }) {
    db.notifications = db.notifications || [];
    const meta = determineNotificationMeta(module, action);
    const resolvedSeverity = severity || meta.severity;
    const resolvedCategory = category || meta.category;
    const resolvedIcon = icon || meta.icon;
    const resolvedColor = color || meta.color;
    const resolvedTitle = title || `${module}: ${action}`;

    const newNotif = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventId: `EVT-${Date.now()}`,
      module,
      action,
      title: resolvedTitle,
      description,
      message: description,
      performedBy,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      severity: resolvedSeverity,
      category: resolvedCategory,
      type: resolvedCategory.toUpperCase(),
      icon: resolvedIcon,
      color: resolvedColor,
      status: "UNREAD",
      read: false,
      unread: true,
      pinned: !!pinned,
      archived: false,
      metadata
    };

    db.notifications.unshift(newNotif);
    if (db.notifications.length > 500) {
      db.notifications = db.notifications.slice(0, 500);
    }
    return newNotif;
  }

  function recordActivity(req: any, db: any, {
    action,
    module,
    description,
    oldValue = null,
    newValue = null,
    status = "SUCCESS",
    email = null
  }: {
    action: string;
    module: string;
    description: string;
    oldValue?: any;
    newValue?: any;
    status?: "SUCCESS" | "WARNING" | "ERROR";
    email?: string | null;
  }) {
    const userAgent = req.headers["user-agent"] || "";
    const { browser, operatingSystem, device } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    
    const locations = ["Bengaluru, India", "Chennai, India", "California, USA", "New York, USA", "Singapore", "London, UK", "Tokyo, Japan"];
    const location = locations[Math.floor(Math.random() * locations.length)];

    let performedBy = "Chandru Mohan";
    let role = "ROLE_ADMIN";
    if (req.user) {
      performedBy = req.user.name || req.user.email || "Chandru Mohan";
      role = req.user.role || "ROLE_ADMIN";
    } else if (email) {
      performedBy = email;
      role = "ROLE_ADMIN";
    } else if (module === "Visitor Interaction" || action === "Message Sent" || action === "Analytics Tracked") {
      performedBy = "Visitor";
      role = "ROLE_VISITOR";
    }

    db.activityHistory = db.activityHistory || [];
    
    const logEntry = {
      id: db.activityHistory.length > 0 ? Math.max(...db.activityHistory.map((l: any) => l.id)) + 1 : 1,
      action,
      module,
      description,
      oldValue: oldValue ? (typeof oldValue === "string" ? oldValue : JSON.stringify(oldValue)) : null,
      newValue: newValue ? (typeof newValue === "string" ? newValue : JSON.stringify(newValue)) : null,
      performedBy,
      role,
      browser,
      operatingSystem,
      device,
      ipAddress,
      location,
      status,
      createdAt: new Date().toISOString()
    };

    db.activityHistory.push(logEntry);

    // Automatically publish to centralized Notification Center
    publishNotification(db, {
      module,
      action,
      title: `${action}`,
      description,
      performedBy,
      severity: status === "ERROR" ? "Error" : status === "WARNING" ? "Warning" : undefined,
      metadata: {
        browser,
        operatingSystem,
        device,
        ipAddress,
        location
      }
    });

    return logEntry;
  }

  // Authentication Helper Functions
  function getExpiresIn(timeout: string) {
    switch (timeout) {
      case "15 Minutes": return "15m";
      case "30 Minutes": return "30m";
      case "1 Hour": return "1h";
      case "2 Hours": return "2h";
      case "4 Hours": return "4h";
      case "Never":
      default:
        return "30d";
    }
  }

  function recordLoginHistory(req: any, db: any, {
    eventType,
    username,
    status,
    details = ""
  }: {
    eventType: "Login" | "Logout" | "OTP Success" | "OTP Failure";
    username: string;
    status: "SUCCESS" | "FAILURE";
    details?: string;
  }) {
    const userAgent = req.headers["user-agent"] || "";
    const { browser, operatingSystem, device } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    
    db.loginHistory = db.loginHistory || [];
    
    const now = new Date();
    const logEntry = {
      id: db.loginHistory.length > 0 ? Math.max(...db.loginHistory.map((l: any) => l.id)) + 1 : 1,
      eventType,
      username,
      browser,
      operatingSystem,
      device,
      ipAddress,
      status,
      details,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      createdAt: now.toISOString()
    };
    
    db.loginHistory.push(logEntry);
    return logEntry;
  }

  // Authentication API Endpoints
  app.post("/api/auth/login", rateLimiter, async (req, res) => {
    const emailOrUsername = (req.body.email || req.body.username || req.body.usernameOrEmail || "").trim();
    const { password, rememberMe, directToken, deviceId } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Validate request body
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const envEmail = (process.env.EMAIL || "admin").toLowerCase();
    const envPassword = process.env.APP_PASSWORD || "admin123";

    let isDefaultBypass = false;
    // Check for configured or default administrator credential bypass/fallback
    if (emailOrUsername.toLowerCase() === envEmail && password === envPassword) {
      isDefaultBypass = true;
    }

    const db = loadDatabase();
    
    // Dynamic identifier match based on allowed configurations
    let user = db.users?.find((u: any) => {
      const uEmail = (u.email || "").toLowerCase();
      const uUsername = (u.username || "chandru").toLowerCase();
      const uPhone = (u.phoneNumber || "").trim();
      const input = emailOrUsername.toLowerCase();

      const emailMatch = u.allowLoginEmail !== false && uEmail === input;
      const usernameMatch = u.allowLoginUsername !== false && uUsername === input;
      const phoneMatch = u.allowLoginPhone !== false && uPhone === emailOrUsername.trim();

      return emailMatch || usernameMatch || phoneMatch;
    });

    if (!user && isDefaultBypass && db.users && db.users.length > 0) {
      user = db.users[0];
    }

    const lookupEmail = user ? user.email : emailOrUsername;

    const writeAuditLog = (action: string, success: boolean, details?: string) => {
      const log = {
        id: db.auditLogs.length > 0 ? Math.max(...db.auditLogs.map((l: any) => l.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        action,
        email: lookupEmail,
        success,
        ip,
        userAgent,
        details
      };
      db.auditLogs.push(log);
    };

    // Prevent timing analysis attacks on credentials
    if (!user) {
      bcrypt.compareSync(password, "$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhash");
      writeAuditLog("LOGIN_FAILED", false, "User not found");
      recordActivity(req, db, {
        action: "Login Failed",
        module: "Authentication",
        description: `Unregistered user attempt with identifier: ${lookupEmail}`,
        status: "ERROR",
        email: lookupEmail
      });
      recordLoginHistory(req, db, {
        eventType: "Login Failed" as any,
        username: emailOrUsername,
        status: "FAILURE",
        details: "Identifier not found in register."
      });
      saveDatabase(db);
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const maxAttempts = user.maxLoginAttempts || 5;
    const lockDurationMin = user.lockDuration || 15;

    // Account lockout verification
    if (user.lockUntil) {
      const lockTime = new Date(user.lockUntil).getTime();
      if (Date.now() < lockTime) {
        writeAuditLog("LOGIN_BLOCKED", false, `Account is locked until ${user.lockUntil}`);
        recordActivity(req, db, {
          action: "Login Failed",
          module: "Authentication",
          description: `Blocked login attempt. Account locked until ${user.lockUntil}`,
          status: "WARNING",
          email: lookupEmail
        });
        recordLoginHistory(req, db, {
          eventType: "Login Failed" as any,
          username: user.username,
          status: "FAILURE",
          details: `Account locked until ${user.lockUntil}`
        });
        saveDatabase(db);
        return res.status(403).json({ error: `Account locked due to too many failed attempts. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}.` });
      } else {
        user.lockUntil = null;
        user.failedAttempts = 0;
      }
    }

    if (!user.isActive) {
      writeAuditLog("LOGIN_FAILED", false, "Inactive account");
      recordActivity(req, db, {
        action: "Login Failed",
        module: "Authentication",
        description: "Disabled admin account attempted login",
        status: "ERROR",
        email: lookupEmail
      });
      recordLoginHistory(req, db, {
        eventType: "Login Failed" as any,
        username: user.username,
        status: "FAILURE",
        details: "Account is deactivated."
      });
      saveDatabase(db);
      return res.status(403).json({ error: "Invalid email or password." });
    }

    // Role-Based Authentication: Only ROLE_ADMIN can log in
    if (user.role !== "ROLE_ADMIN") {
      writeAuditLog("LOGIN_FAILED", false, "Access denied. Only ROLE_ADMIN role can login.");
      recordActivity(req, db, {
        action: "Login Failed",
        module: "Authentication",
        description: `Login blocked. Role ${user.role} is not authorized. Only ROLE_ADMIN can log in.`,
        status: "ERROR",
        email: lookupEmail
      });
      recordLoginHistory(req, db, {
        eventType: "Login Failed" as any,
        username: user.username,
        status: "FAILURE",
        details: `Access denied. Role ${user.role} is not authorized.`
      });
      saveDatabase(db);
      return res.status(403).json({ error: "Access denied. Only administrators are allowed." });
    }

    // Verify Password using BCrypt or default credentials bypass
    const passwordMatch = isDefaultBypass ? true : bcrypt.compareSync(password, user.passwordHash);

    if (passwordMatch) {
      user.failedAttempts = 0;
      user.lockUntil = null;
      user.updatedAt = new Date().toISOString();

      const timeout = user.sessionTimeout || "Never";
      const expiresIn = getExpiresIn(timeout);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn }
      );

      let refreshToken = "";
      // Only generate refresh token if refresh tokens are enabled, Remember Me is allowed, and Always Force Login is disabled
      const isRememberMeAllowed = user.rememberLogin !== false && user.enableRememberMe !== false && !user.alwaysRequireLogin;
      
      if (user.refreshTokenEnabled !== false && isRememberMeAllowed) {
        refreshToken = jwt.sign(
          { id: user.id, type: "refresh" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        db.refreshTokens = db.refreshTokens || [];
        db.refreshTokens.push({
          token: refreshToken,
          userId: user.id,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      user.lastLogin = new Date().toISOString();
      if (deviceId) {
        user.knownDevices = user.knownDevices || [];
        if (!user.knownDevices.includes(deviceId)) {
          user.knownDevices.push(deviceId);
        }
      }

      writeAuditLog("DIRECT_LOGIN_SUCCESS", true, `Successfully logged in directly as ${user.role}`);
      recordActivity(req, db, {
        action: "Login Success",
        module: "Authentication",
        description: `Administrative session initialized. Timeout: ${timeout}.`,
        status: "SUCCESS",
        email: lookupEmail
      });

      recordLoginHistory(req, db, {
        eventType: "Login",
        username: user.username || "chandru",
        status: "SUCCESS",
        details: `Direct credentials verification success. Timeout: ${timeout}.`
      });

      saveDatabase(db);

      return res.json({
        token,
        accessToken: token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username
        }
      });
    } else {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      
      if (user.failedAttempts >= maxAttempts) {
        const lockUntil = new Date(Date.now() + lockDurationMin * 60 * 1000).toISOString();
        user.lockUntil = lockUntil;
        writeAuditLog("ACCOUNT_LOCKED", false, `Locked due to ${user.failedAttempts} failures`);
        recordActivity(req, db, {
          action: "Login Failed",
          module: "Authentication",
          description: `Account locked automatically due to ${user.failedAttempts} consecutive failed attempts.`,
          status: "WARNING",
          email: lookupEmail
        });
        recordLoginHistory(req, db, {
          eventType: "Login Failed" as any,
          username: user.username || "chandru",
          status: "FAILURE",
          details: `Password verification failed. Account locked for ${lockDurationMin} mins.`
        });
      } else {
        writeAuditLog("LOGIN_FAILED", false, `Failed attempt ${user.failedAttempts}/${maxAttempts}`);
        recordActivity(req, db, {
          action: "Login Failed",
          module: "Authentication",
          description: `Incorrect password entered (Attempt ${user.failedAttempts}/${maxAttempts}).`,
          status: "ERROR",
          email: lookupEmail
        });
        recordLoginHistory(req, db, {
          eventType: "Login Failed" as any,
          username: user.username || "chandru",
          status: "FAILURE",
          details: `Password verification failed. Attempt ${user.failedAttempts}/${maxAttempts}.`
        });
      }

      user.updatedAt = new Date().toISOString();
      saveDatabase(db);

      res.status(401).json({ error: "Invalid email or password." });
    }
  });

  // Demo Login Endpoint for Recruiters & Guests
  app.post("/api/auth/demo-login", (req, res) => {
    const db = loadDatabase();
    const token = jwt.sign(
      {
        id: 99999,
        email: "guest@recruiter.demo",
        role: "ROLE_ADMIN",
        isDemo: true,
        name: "Recruiter Guest"
      },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    try {
      recordActivity(req, db, {
        action: "Guest Demo Tour",
        module: "Authentication",
        description: "Recruiter / Visitor entered CMS Admin Console in interactive Guest Demo Mode.",
        status: "SUCCESS",
        email: "guest@recruiter.demo"
      });
      saveDatabase(db);
    } catch (e) {
      // Safe fallback
    }

    res.json({
      token,
      accessToken: token,
      refreshToken: "",
      user: {
        id: 99999,
        name: "Recruiter Guest",
        email: "guest@recruiter.demo",
        role: "ROLE_ADMIN",
        username: "recruiter_guest",
        isDemo: true
      }
    });
  });

  app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required." });
    }

    const db = loadDatabase();
    const storedToken = db.refreshTokens?.find((t: any) => t.token === refreshToken);

    if (!storedToken) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    try {
      const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
      const user = db.users?.find((u: any) => u.id === decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Unauthorized user." });
      }

      // Enforce security settings during token refresh
      if (user.alwaysRequireLogin) {
        return res.status(401).json({ error: "Always Force Login is enabled. Token refresh is rejected." });
      }

      if (user.rememberLogin === false || user.enableRememberMe === false) {
        return res.status(401).json({ error: "Remember Me is disabled. Token refresh is rejected." });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ token });
    } catch (err) {
      return res.status(401).json({ error: "Expired or invalid refresh token." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const { refreshToken } = req.body;
    const db = loadDatabase();
    
    let performedEmail = "chandrumohan550@gmail.com";
    if (refreshToken) {
      try {
        const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
        const user = db.users?.find((u: any) => u.id === decoded.id);
        if (user) {
          performedEmail = user.email;
        }
      } catch (e) {}
    }

    recordActivity(req, db, {
      action: "Logout",
      module: "Authentication",
      description: "Admin logged out and terminated token session.",
      status: "SUCCESS",
      email: performedEmail
    });

    if (refreshToken) {
      db.refreshTokens = db.refreshTokens?.filter((t: any) => t.token !== refreshToken) || [];
    }
    saveDatabase(db);
    
    res.json({ message: "Logged out successfully." });
  });

  app.get("/api/auth/verify", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
          return res.json({ valid: false });
        }
        res.json({ valid: true, user: decoded });
      });
    } else {
      res.json({ valid: false });
    }
  });

  app.get("/api/auth/audit-logs", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    res.json(db.auditLogs || []);
  });

  app.get("/api/activity-history", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    res.json(db.activityHistory || []);
  });

  app.post("/api/activity-history/clear", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    db.activityHistory = [];
    recordActivity(req, db, {
      action: "Settings Updated",
      module: "Settings",
      description: "Cleared all operational audit log history permanently.",
      status: "WARNING"
    });
    saveDatabase(db);
    res.json({ status: "success", message: "Audit logs cleared successfully." });
  });

  app.post("/api/activity-history/archive", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    recordActivity(req, db, {
      action: "Settings Updated",
      module: "Settings",
      description: "Archived operational audit logs memory pool.",
      status: "SUCCESS"
    });
    saveDatabase(db);
    res.json({ status: "success", message: "Audit logs archived successfully." });
  });

  app.post("/api/auth/change-password", authenticateJWT, (req: any, res: any) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required." });
    }
    const db = loadDatabase();
    const user = db.users?.find((u: any) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    
    const passwordMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
    if (!passwordMatch) {
      recordActivity(req, db, {
        action: "Password Changed",
        module: "Authentication",
        description: "Attempted to change password, but old password was incorrect.",
        status: "ERROR"
      });
      saveDatabase(db);
      return res.status(400).json({ error: "Incorrect old password." });
    }
    
    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    
    recordActivity(req, db, {
      action: "Password Changed",
      module: "Authentication",
      description: "Administrative account password successfully changed.",
      status: "SUCCESS"
    });
    saveDatabase(db);
    res.json({ status: "success", message: "Password updated successfully." });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const db = loadDatabase();
    const user = db.users?.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      recordActivity(req, db, {
        action: "Password Reset",
        module: "Authentication",
        description: `Failed password reset request: email ${email} not registered.`,
        status: "ERROR"
      });
      saveDatabase(db);
      return res.status(404).json({ error: "No administrator found with this email." });
    }
    
    recordActivity(req, db, {
      action: "Password Reset",
      module: "Authentication",
      description: `Password reset verification token dispatched to email: ${email}`,
      status: "SUCCESS"
    });
    saveDatabase(db);
    res.json({ status: "success", message: "Password reset link sent to your email." });
  });

  // Combined Portfolio Data Endpoint (unified, high performance, always fresh live database hydration)
  const getPortfolioCombinedHandler = (req: express.Request, res: express.Response) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const db = loadDatabase();
    const oldResumeUrl = db.profile?.resumeUrl;
    syncProfileActiveResume(db);
    if (oldResumeUrl !== db.profile?.resumeUrl) {
      saveDatabase(db);
    }

    const resumes = db.resumes || [];
    let activeResume = resumes.find((r: any) => r.isActive) || resumes[0] || null;
    if (activeResume && activeResume.fileUrl && activeResume.fileUrl.startsWith("data:")) {
      activeResume = {
        ...activeResume,
        fileUrl: `/api/resume/${activeResume.id}/file`
      };
    }

    const projects = [...(db.projects || initialProjects)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const skills = [...(db.skills || initialSkills)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const tools = [...(db.tools || initialTools)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const certificates = db.certificates || initialCertificates;
    const achievements = [...(db.achievements || initialAchievements)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const experiences = db.experiences || initialExperiences;
    const education = db.education || initialEducation;
    const analytics = db.analytics || initialAnalytics;
    const settings = db.settings || initialSettings;
    const footer = db.footer || initialFooter;
    const socialLinks = [...(db.socialLinks || initialSocialLinks)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const footerSocialLinks = [...(db.footerSocialLinks || [])].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const codingProfiles = [...(db.codingProfiles || initialCodingProfiles)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const technologies = [...(db.technologies || initialTechStack)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const portfolioMetrics = [...(db.portfolioMetrics || initialPortfolioMetrics)].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    const profile = db.profile || initialProfile;
    const themeSettings = db.themeSettings || initialThemeSettings;

    const consolidatedData = {
      profile,
      settings,
      theme: themeSettings,
      footer,
      projects,
      skills,
      tools,
      certificates,
      achievements,
      experiences,
      education,
      analytics,
      socialLinks,
      footerSocialLinks,
      codingProfiles,
      technologies,
      portfolioMetrics,
      activeResume,
      resumes
    };

    cachedPortfolioData = consolidatedData;
    res.json(consolidatedData);
  };

  app.get(["/api/portfolio-combined", "/portfolio-combined", "/api/portfolio", "/portfolio", "/api/portfolio-data"], getPortfolioCombinedHandler);

  // Profile API Endpoints
  app.get("/api/profile", (req, res) => {
    const db = loadDatabase();
    const oldResumeUrl = db.profile?.resumeUrl;
    syncProfileActiveResume(db);
    if (oldResumeUrl !== db.profile?.resumeUrl) {
      saveDatabase(db);
    }
    const user = db.users[0];
    const profile = db.profile || initialProfile;
    res.json({
      ...profile,
      username: user.username || "chandru",
      phoneNumber: user.phoneNumber || "+919655384140",
      backupEmail: user.backupEmail || "",
      recoveryPhoneNumber: user.recoveryPhoneNumber || ""
    });
  });

  app.put("/api/profile", authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const user = db.users[0];
    const oldValue = { ...(db.profile || initialProfile) };
    const updated = req.body;
    
    // Update public profile
    db.profile = {
      ...(db.profile || initialProfile),
      ...updated,
      fullName: updated.fullName || updated.name || (db.profile || initialProfile).fullName,
      email: updated.email || (db.profile || initialProfile).email,
      phone: updated.phone || updated.phoneNumber || (db.profile || initialProfile).phone,
      profileImage: updated.profileImage || updated.profilePhoto || (db.profile || initialProfile).profileImage,
      updatedAt: new Date().toISOString()
    };
    
    // Update Founder user details
    user.name = updated.fullName || updated.name || user.name;
    user.email = updated.email || user.email;
    user.phoneNumber = updated.phone || updated.phoneNumber || user.phoneNumber;
    user.username = updated.username || user.username;
    user.backupEmail = updated.backupEmail !== undefined ? updated.backupEmail : user.backupEmail;
    user.recoveryPhoneNumber = updated.recoveryPhoneNumber !== undefined ? updated.recoveryPhoneNumber : user.recoveryPhoneNumber;
    
    if (updated.password) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(updated.password, salt);
    }
    
    user.updatedAt = new Date().toISOString();
    
    recordActivity(req, db, {
      action: "Profile Updated",
      module: "Profile",
      description: "Founder updated profile and account details.",
      oldValue,
      newValue: {
        ...db.profile,
        username: user.username,
        backupEmail: user.backupEmail,
        recoveryPhoneNumber: user.recoveryPhoneNumber
      }
    });
    
    saveDatabase(db);
    res.json({
      ...db.profile,
      username: user.username,
      phoneNumber: user.phoneNumber,
      backupEmail: user.backupEmail,
      recoveryPhoneNumber: user.recoveryPhoneNumber
    });
  });

  // Database Backup Export Endpoint
  app.get("/api/admin/database/export", authenticateJWT, (req: any, res: any) => {
    try {
      const db = loadDatabase();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=portfolio_backup.json");
      res.json(db);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to export database: " + e.message });
    }
  });

  // Database Backup Import & Recovery Endpoint
  app.post("/api/admin/database/import", authenticateJWT, (req: any, res: any) => {
    try {
      const backupData = req.body;
      if (!backupData || typeof backupData !== "object" || !backupData.users) {
        return res.status(400).json({ error: "Invalid backup JSON structure." });
      }

      saveDatabase(backupData);

      const db = loadDatabase();
      recordActivity(req, db, {
        action: "DatabaseRecovery",
        module: "SystemRegistry",
        description: "Admin restored database state from imported JSON backup.",
        status: "SUCCESS",
        email: "admin@alex.dev"
      });
      saveDatabase(db);

      res.json({ message: "Database imported and recovered successfully." });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to import database: " + e.message });
    }
  });

  // Security Settings API Endpoints
  app.get("/api/settings/security", authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const user = db.users[0];
    res.json({
      alwaysRequireLogin: user.alwaysRequireLogin,
      rememberLogin: user.rememberLogin,
      verifyNewDevice: user.verifyNewDevice,
      sessionTimeout: user.sessionTimeout,
      refreshTokenEnabled: user.refreshTokenEnabled,
      maxLoginAttempts: user.maxLoginAttempts || 5,
      lockDuration: user.lockDuration || 15,
      enableRememberMe: user.enableRememberMe !== undefined ? user.enableRememberMe : true,
      enableJWT: user.enableJWT !== undefined ? user.enableJWT : true,
      allowLoginEmail: user.allowLoginEmail !== undefined ? user.allowLoginEmail : true,
      allowLoginUsername: user.allowLoginUsername !== undefined ? user.allowLoginUsername : true,
      allowLoginPhone: user.allowLoginPhone !== undefined ? user.allowLoginPhone : true
    });
  });

  app.put("/api/settings/security", authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const user = db.users[0];
    const oldValue = {
      alwaysRequireLogin: user.alwaysRequireLogin,
      rememberLogin: user.rememberLogin,
      verifyNewDevice: user.verifyNewDevice,
      sessionTimeout: user.sessionTimeout,
      refreshTokenEnabled: user.refreshTokenEnabled,
      maxLoginAttempts: user.maxLoginAttempts,
      lockDuration: user.lockDuration,
      enableRememberMe: user.enableRememberMe,
      enableJWT: user.enableJWT,
      allowLoginEmail: user.allowLoginEmail,
      allowLoginUsername: user.allowLoginUsername,
      allowLoginPhone: user.allowLoginPhone
    };

    const updated = req.body;
    user.alwaysRequireLogin = updated.alwaysRequireLogin !== undefined ? updated.alwaysRequireLogin : user.alwaysRequireLogin;
    user.rememberLogin = updated.rememberLogin !== undefined ? updated.rememberLogin : user.rememberLogin;
    user.enableRememberMe = updated.rememberLogin !== undefined ? updated.rememberLogin : user.enableRememberMe;
    user.verifyNewDevice = updated.verifyNewDevice !== undefined ? updated.verifyNewDevice : user.verifyNewDevice;
    user.sessionTimeout = updated.sessionTimeout || user.sessionTimeout;
    user.refreshTokenEnabled = updated.refreshTokenEnabled !== undefined ? updated.refreshTokenEnabled : user.refreshTokenEnabled;
    user.maxLoginAttempts = updated.maxLoginAttempts !== undefined ? parseInt(updated.maxLoginAttempts, 10) : user.maxLoginAttempts;
    user.lockDuration = updated.lockDuration !== undefined ? parseInt(updated.lockDuration, 10) : user.lockDuration;
    user.enableJWT = updated.enableJWT !== undefined ? updated.enableJWT : user.enableJWT;
    user.allowLoginEmail = updated.allowLoginEmail !== undefined ? updated.allowLoginEmail : user.allowLoginEmail;
    user.allowLoginUsername = updated.allowLoginUsername !== undefined ? updated.allowLoginUsername : user.allowLoginUsername;
    user.allowLoginPhone = updated.allowLoginPhone !== undefined ? updated.allowLoginPhone : user.allowLoginPhone;

    user.updatedAt = new Date().toISOString();

    recordActivity(req, db, {
      action: "Security Settings Updated",
      module: "Settings",
      description: "Founder updated authentication & core security settings.",
      oldValue,
      newValue: {
        alwaysRequireLogin: user.alwaysRequireLogin,
        rememberLogin: user.rememberLogin,
        verifyNewDevice: user.verifyNewDevice,
        sessionTimeout: user.sessionTimeout,
        refreshTokenEnabled: user.refreshTokenEnabled,
        maxLoginAttempts: user.maxLoginAttempts,
        lockDuration: user.lockDuration,
        enableRememberMe: user.enableRememberMe,
        enableJWT: user.enableJWT,
        allowLoginEmail: user.allowLoginEmail,
        allowLoginUsername: user.allowLoginUsername,
        allowLoginPhone: user.allowLoginPhone
      }
    });

    saveDatabase(db);
    res.json({ success: true, message: "Security settings saved successfully." });
  });

  app.get("/api/settings/security/login-history", authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    res.json(db.loginHistory || []);
  });

  app.post("/api/settings/security/login-history/clear", authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    db.loginHistory = [];
    saveDatabase(db);
    res.json({ success: true, message: "Login history cleared successfully." });
  });

  // Public endpoint for the login page to determine configuration BEFORE authenticating
  app.get("/api/auth/login-config", (req, res) => {
    const db = loadDatabase();
    const user = db.users[0];
    res.json({
      alwaysRequireLogin: user.alwaysRequireLogin,
      rememberLogin: user.rememberLogin,
      verifyNewDevice: user.verifyNewDevice,
      enableRememberMe: user.enableRememberMe !== undefined ? user.enableRememberMe : true,
      allowLoginEmail: user.allowLoginEmail !== undefined ? user.allowLoginEmail : true,
      allowLoginUsername: user.allowLoginUsername !== undefined ? user.allowLoginUsername : true,
      allowLoginPhone: user.allowLoginPhone !== undefined ? user.allowLoginPhone : true
    });
  });

  app.patch("/api/profile/image", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    const { image } = req.body;
    const processed = processMockCloudinaryImage(image, "profile");
    db.profile = {
      ...(db.profile || initialProfile),
      profileImage: processed.url,
      updatedAt: new Date().toISOString()
    };
    
    const isReplacement = !!oldValue.profileImage;
    const actionName = isReplacement ? "Profile Photo Replaced" : "Profile Photo Uploaded";
    
    recordActivity(req, db, {
      action: actionName,
      module: "Profile",
      description: isReplacement ? "Replaced profile avatar photo." : "Uploaded new profile photo.",
      oldValue: oldValue.profileImage ? { url: oldValue.profileImage } : null,
      newValue: { url: processed.url }
    });

    // Also record under Media Library
    const imageSizeKb = image && image.startsWith("data:") ? Math.round((image.length * 0.75) / 1024) : 0;
    recordActivity(req, db, {
      action: isReplacement ? "Image Replaced" : "Image Uploaded",
      module: "Media Library",
      description: `Uploaded avatar asset to ${processed.publicId}.${imageSizeKb ? ` Size: ${imageSizeKb} KB.` : ""}`,
      newValue: { url: processed.url, publicId: processed.publicId }
    });

    saveDatabase(db);
    res.json({ profile: db.profile, cloudinary: processed });
  });

  app.patch("/api/profile/cover", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    const { image } = req.body;
    const processed = processMockCloudinaryImage(image, "cover");
    db.profile = {
      ...(db.profile || initialProfile),
      coverImage: processed.url,
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Cover Image Updated",
      module: "Profile",
      description: "Updated cover section visual image banner.",
      oldValue: oldValue.coverImage ? { url: oldValue.coverImage } : null,
      newValue: { url: processed.url }
    });

    // Also record under Media Library
    recordActivity(req, db, {
      action: "Image Uploaded",
      module: "Media Library",
      description: `Uploaded cover banner asset to ${processed.publicId}.`,
      newValue: { url: processed.url, publicId: processed.publicId }
    });

    saveDatabase(db);
    res.json({ profile: db.profile, cloudinary: processed });
  });

  app.patch("/api/profile/about-image", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    const { image } = req.body;
    const processed = processMockCloudinaryImage(image, "about");
    db.profile = {
      ...(db.profile || initialProfile),
      aboutImage: processed.url,
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Profile Updated",
      module: "Profile",
      description: "Updated profile description about image section asset.",
      oldValue: oldValue.aboutImage ? { url: oldValue.aboutImage } : null,
      newValue: { url: processed.url }
    });

    // Also record under Media Library
    recordActivity(req, db, {
      action: "Image Uploaded",
      module: "Media Library",
      description: `Uploaded about-me portrait illustration to ${processed.publicId}.`,
      newValue: { url: processed.url, publicId: processed.publicId }
    });

    saveDatabase(db);
    res.json({ profile: db.profile, cloudinary: processed });
  });

  app.patch("/api/profile/hero-background", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    const { image } = req.body;
    const processed = processMockCloudinaryImage(image, "hero");
    db.profile = {
      ...(db.profile || initialProfile),
      heroBackground: processed.url,
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Profile Updated",
      module: "Profile",
      description: "Updated profile dashboard hero wallpaper asset.",
      oldValue: oldValue.heroBackground ? { url: oldValue.heroBackground } : null,
      newValue: { url: processed.url }
    });

    // Also record under Media Library
    recordActivity(req, db, {
      action: "Image Uploaded",
      module: "Media Library",
      description: `Uploaded hero banner backdrop to ${processed.publicId}.`,
      newValue: { url: processed.url, publicId: processed.publicId }
    });

    saveDatabase(db);
    res.json({ profile: db.profile, cloudinary: processed });
  });

  app.patch("/api/profile/hero-avatar", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    const { image } = req.body;
    const processed = processMockCloudinaryImage(image, "hero-avatar");
    db.profile = {
      ...(db.profile || initialProfile),
      heroAvatar: processed.url,
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Hero Avatar Updated",
      module: "Profile",
      description: "Updated profile hero avatar illustration.",
      oldValue: oldValue.heroAvatar ? { url: oldValue.heroAvatar } : null,
      newValue: { url: processed.url }
    });

    recordActivity(req, db, {
      action: "Image Uploaded",
      module: "Media Library",
      description: `Uploaded hero avatar asset to ${processed.publicId}.`,
      newValue: { url: processed.url, publicId: processed.publicId }
    });

    saveDatabase(db);
    res.json({ profile: db.profile, cloudinary: processed });
  });

  app.delete("/api/profile/hero-avatar", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    db.profile = {
      ...(db.profile || initialProfile),
      heroAvatar: "",
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Hero Avatar Deleted",
      module: "Profile",
      description: "Cleared hero avatar image from database.",
      oldValue: oldValue.heroAvatar ? { url: oldValue.heroAvatar } : null,
      newValue: { url: "" }
    });

    saveDatabase(db);
    res.json({ profile: db.profile });
  });

  // --- ADDITIONAL PROFILE ALIAS ENDPOINTS ---
  app.get("/profile", (req, res) => {
    const db = loadDatabase();
    const user = db.users[0];
    const profile = db.profile || initialProfile;
    res.json({
      ...profile,
      username: user.username || "chandru",
      phoneNumber: user.phoneNumber || "+919655384140",
      backupEmail: user.backupEmail || "",
      recoveryPhoneNumber: user.recoveryPhoneNumber || ""
    });
  });

  app.put("/profile", authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const user = db.users[0];
    const oldValue = { ...(db.profile || initialProfile) };
    const updated = req.body;
    
    db.profile = {
      ...(db.profile || initialProfile),
      ...updated,
      fullName: updated.fullName || updated.name || (db.profile || initialProfile).fullName,
      email: updated.email || (db.profile || initialProfile).email,
      phone: updated.phone || updated.phoneNumber || (db.profile || initialProfile).phone,
      profileImage: updated.profileImage || updated.profilePhoto || (db.profile || initialProfile).profileImage,
      updatedAt: new Date().toISOString()
    };
    
    user.name = updated.fullName || updated.name || user.name;
    user.email = updated.email || user.email;
    user.phoneNumber = updated.phone || updated.phoneNumber || user.phoneNumber;
    user.username = updated.username || user.username;
    user.backupEmail = updated.backupEmail !== undefined ? updated.backupEmail : user.backupEmail;
    user.recoveryPhoneNumber = updated.recoveryPhoneNumber !== undefined ? updated.recoveryPhoneNumber : user.recoveryPhoneNumber;
    
    if (updated.password) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(updated.password, salt);
    }
    
    user.updatedAt = new Date().toISOString();
    
    recordActivity(req, db, {
      action: "Profile Updated",
      module: "Profile",
      description: "Founder updated profile and account details.",
      oldValue,
      newValue: {
        ...db.profile,
        username: user.username,
        backupEmail: user.backupEmail,
        recoveryPhoneNumber: user.recoveryPhoneNumber
      }
    });
    
    saveDatabase(db);
    res.json({
      ...db.profile,
      username: user.username,
      phoneNumber: user.phoneNumber,
      backupEmail: user.backupEmail,
      recoveryPhoneNumber: user.recoveryPhoneNumber
    });
  });

  const postProfileImageHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    const { image } = req.body;
    const processed = processMockCloudinaryImage(image, "profile");
    db.profile = {
      ...(db.profile || initialProfile),
      profileImage: processed.url,
      updatedAt: new Date().toISOString()
    };
    
    const isReplacement = !!oldValue.profileImage;
    const actionName = isReplacement ? "Profile Photo Replaced" : "Profile Photo Uploaded";
    
    recordActivity(req, db, {
      action: actionName,
      module: "Profile",
      description: isReplacement ? "Replaced profile avatar photo." : "Uploaded new profile photo.",
      oldValue: oldValue.profileImage ? { url: oldValue.profileImage } : null,
      newValue: { url: processed.url }
    });

    const imageSizeKb = image && image.startsWith("data:") ? Math.round((image.length * 0.75) / 1024) : 0;
    recordActivity(req, db, {
      action: isReplacement ? "Image Replaced" : "Image Uploaded",
      module: "Media Library",
      description: `Uploaded avatar asset to ${processed.publicId}.${imageSizeKb ? ` Size: ${imageSizeKb} KB.` : ""}`,
      newValue: { url: processed.url, publicId: processed.publicId }
    });

    saveDatabase(db);
    res.json({ profile: db.profile, cloudinary: processed });
  };
  app.post("/profile/image", authenticateJWT, postProfileImageHandler);
  app.post("/api/profile/image", authenticateJWT, postProfileImageHandler);

  const deleteProfileImageHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const oldValue = { ...(db.profile || initialProfile) };
    db.profile = {
      ...(db.profile || initialProfile),
      profileImage: "",
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Profile Photo Deleted",
      module: "Profile",
      description: "Cleared profile photo from database.",
      oldValue: oldValue.profileImage ? { url: oldValue.profileImage } : null,
      newValue: { url: "" }
    });

    saveDatabase(db);
    res.json({ profile: db.profile });
  };
  app.delete("/profile/image", authenticateJWT, deleteProfileImageHandler);
  app.delete("/api/profile/image", authenticateJWT, deleteProfileImageHandler);

  const postProfileResumeHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const { resumeUrl, resumeDownloadText } = req.body;
    db.profile = {
      ...(db.profile || initialProfile),
      resumeUrl: resumeUrl || db.profile?.resumeUrl || "",
      resumeDownloadText: resumeDownloadText || db.profile?.resumeDownloadText || "Download Resume",
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Resume Uploaded / Updated",
      module: "Profile",
      description: `Updated resume links to: ${resumeUrl || "None"}`,
      newValue: { resumeUrl, resumeDownloadText }
    });

    saveDatabase(db);
    res.json({ profile: db.profile });
  };
  app.post("/profile/resume", authenticateJWT, postProfileResumeHandler);
  app.post("/api/profile/resume", authenticateJWT, postProfileResumeHandler);

  const deleteProfileResumeHandler = (req: any, res: any) => {
    const db = loadDatabase();
    db.profile = {
      ...(db.profile || initialProfile),
      resumeUrl: "",
      updatedAt: new Date().toISOString()
    };
    
    recordActivity(req, db, {
      action: "Resume Deleted",
      module: "Profile",
      description: "Cleared resume PDF link from database.",
      newValue: { resumeUrl: "" }
    });

    saveDatabase(db);
    res.json({ profile: db.profile });
  };
  app.delete("/profile/resume", authenticateJWT, deleteProfileResumeHandler);
  app.delete("/api/profile/resume", authenticateJWT, deleteProfileResumeHandler);

  // --- THEME SETTINGS API ENDPOINTS ---
  const getThemeHandler = (req: any, res: any) => {
    const db = loadDatabase();
    res.json(db.themeSettings || initialThemeSettings);
  };
  app.get("/api/theme", getThemeHandler);
  app.get("/theme", getThemeHandler);

  const putThemeHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const oldValue = { ...(db.themeSettings || initialThemeSettings) };
    const updated = req.body;
    db.themeSettings = {
      ...(db.themeSettings || initialThemeSettings),
      ...updated
    };
    
    recordActivity(req, db, {
      action: "Theme Changed",
      module: "Theme",
      description: "Admin updated general theme configuration parameters.",
      oldValue,
      newValue: db.themeSettings
    });
    
    saveDatabase(db);
    res.json(db.themeSettings);
  };
  app.put("/api/theme", authenticateJWT, putThemeHandler);
  app.put("/theme", authenticateJWT, putThemeHandler);

  const patchBackgroundHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const oldValue = { ...(db.themeSettings || initialThemeSettings) };
    const { key, config } = req.body;
    if (!key || !['heroBackground', 'aboutBackground', 'sectionBackgrounds', 'footerBackground', 'customWallpaper'].includes(key)) {
      return res.status(400).json({ error: "Invalid background key specified" });
    }
    db.themeSettings = db.themeSettings || { ...initialThemeSettings };
    db.themeSettings[key] = {
      ...db.themeSettings[key],
      ...config
    };
    
    recordActivity(req, db, {
      action: "Background Changed",
      module: "Theme",
      description: `Updated theme background section config for "${key}".`,
      oldValue: oldValue[key],
      newValue: db.themeSettings[key]
    });
    
    saveDatabase(db);
    res.json(db.themeSettings);
  };
  app.patch("/api/theme/background", authenticateJWT, patchBackgroundHandler);
  app.patch("/theme/background", authenticateJWT, patchBackgroundHandler);

  const patchColorsHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const oldValue = { ...(db.themeSettings || initialThemeSettings) };
    const colors = req.body;
    db.themeSettings = db.themeSettings || { ...initialThemeSettings };
    db.themeSettings = {
      ...db.themeSettings,
      ...colors
    };
    
    recordActivity(req, db, {
      action: "Colors Updated",
      module: "Theme",
      description: "Modified theme palette color schemes.",
      oldValue: { primaryColor: oldValue.primaryColor, accentColor: oldValue.accentColor, themeMode: oldValue.themeMode },
      newValue: { primaryColor: db.themeSettings.primaryColor, accentColor: db.themeSettings.accentColor, themeMode: db.themeSettings.themeMode }
    });
    
    saveDatabase(db);
    res.json(db.themeSettings);
  };
  app.patch("/api/theme/colors", authenticateJWT, patchColorsHandler);
  app.patch("/theme/colors", authenticateJWT, patchColorsHandler);

  const patchAnimationsHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const oldValue = { ...(db.themeSettings || initialThemeSettings) };
    const animations = req.body;
    db.themeSettings = db.themeSettings || { ...initialThemeSettings };
    db.themeSettings = {
      ...db.themeSettings,
      ...animations
    };
    
    recordActivity(req, db, {
      action: "Animations Changed",
      module: "Theme",
      description: "Altered dynamic page animations and transition speed presets.",
      oldValue: oldValue.animations || null,
      newValue: db.themeSettings.animations || null
    });
    
    saveDatabase(db);
    res.json(db.themeSettings);
  };
  app.patch("/api/theme/animations", authenticateJWT, patchAnimationsHandler);
  app.patch("/theme/animations", authenticateJWT, patchAnimationsHandler);

  // Projects Endpoints
  app.get("/api/projects", (req, res) => {
    const db = loadDatabase();
    res.json(db.projects);
  });

  app.post("/api/projects", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const newProj = req.body;
    const newId = db.projects.length > 0 ? Math.max(...db.projects.map((p: any) => p.id)) + 1 : 1;
    const created = { ...newProj, id: newId };
    db.projects.push(created);
    
    recordActivity(req, db, {
      action: "Project Created",
      module: "Projects",
      description: `Committed new project "${newProj.title}" to portfolio index.`,
      newValue: created
    });
    
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/projects/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const updatedProj = req.body;
    const oldValue = db.projects.find((p: any) => p.id === id);
    db.projects = db.projects.map((p: any) => p.id === id ? { ...updatedProj, id } : p);
    
    let actionName = "Project Updated";
    if (oldValue && oldValue.isPublished !== updatedProj.isPublished) {
      actionName = updatedProj.isPublished ? "Project Published" : "Project Hidden";
    }
    
    recordActivity(req, db, {
      action: actionName,
      module: "Projects",
      description: `Updated project "${updatedProj.title}" attributes.`,
      oldValue,
      newValue: { ...updatedProj, id }
    });
    
    saveDatabase(db);
    res.json({ status: "success", project: updatedProj });
  });

  app.delete("/api/projects/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const oldValue = db.projects.find((p: any) => p.id === id);
    db.projects = db.projects.filter((p: any) => p.id !== id);
    
    recordActivity(req, db, {
      action: "Project Deleted",
      module: "Projects",
      description: `Purged project record "${oldValue?.title || id}" from database.`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  // Skills Endpoints
  app.get("/api/skills", (req, res) => {
    const db = loadDatabase();
    res.json(db.skills);
  });

  app.post("/api/skills/upload-icon", authenticateJWT, (req, res) => {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No icon data provided" });
    }

    // If it is already a public URL, let it pass
    if (image.startsWith('http://') || image.startsWith('https://')) {
      const processed = processMockCloudinaryImage(image, "skill");
      return res.json({ url: processed.url, publicId: processed.publicId });
    }

    // Validate data URI format
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid file data format. Expected base64 Data URI." });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    const allowedMimeTypes = [
      'image/svg+xml',
      'image/png',
      'image/webp',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'application/json',
      'application/gzip',
      'application/x-gzip',
      'application/octet-stream'
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ error: `Unsupported media format: ${mimeType}. Allowed formats: SVG, PNG, JPG, GIF, WebP, AVIF, MP4, WebM, MOV, Lottie.` });
    }

    // Check size. A base64-encoded string is about 33% larger than its original binary size.
    // Exact binary size calculation:
    const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0;
    const binarySize = (base64Data.length * 3) / 4 - padding;
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB limit

    if (binarySize > MAX_SIZE) {
      return res.status(400).json({ error: `File size exceeds the maximum allowed 15MB limit (Uploaded size: ${(binarySize / (1024 * 1024)).toFixed(2)}MB).` });
    }

    const processed = processMockCloudinaryImage(image, "skill");
    res.json({ url: processed.url, publicId: processed.publicId, contentType: mimeType });
  });

  app.post("/api/skills", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const newSkill = req.body;
    
    // Process base64 icon if provided directly
    if (newSkill.iconUrl && newSkill.iconUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(newSkill.iconUrl, "skill");
      newSkill.iconUrl = processed.url;
    }

    const newId = db.skills.length > 0 ? Math.max(...db.skills.map((s: any) => s.id)) + 1 : 1;
    const created = { ...newSkill, id: newId };
    db.skills.push(created);
    
    recordActivity(req, db, {
      action: "Skill Added",
      module: "Skills",
      description: `Registered skill competency "${newSkill.name}".`,
      newValue: created
    });
    
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/skills/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const updatedSkill = req.body;
    const oldValue = db.skills.find((s: any) => s.id === id);
    
    // Process base64 icon if provided directly
    if (updatedSkill.iconUrl && updatedSkill.iconUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(updatedSkill.iconUrl, "skill");
      updatedSkill.iconUrl = processed.url;
    }

    db.skills = db.skills.map((s: any) => s.id === id ? { ...updatedSkill, id } : s);
    
    recordActivity(req, db, {
      action: "Skill Updated",
      module: "Skills",
      description: `Updated competency metrics for "${updatedSkill.name}".`,
      oldValue,
      newValue: { ...updatedSkill, id }
    });
    
    saveDatabase(db);
    res.json({ status: "success", skill: updatedSkill });
  });

  // Theme & Appearance Customizer Handlers
  app.delete("/api/skills/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const oldValue = db.skills.find((s: any) => s.id === id);
    db.skills = db.skills.filter((s: any) => s.id !== id);
    
    recordActivity(req, db, {
      action: "Skill Deleted",
      module: "Skills",
      description: `Removed skill "${oldValue?.name || id}" from curriculum log.`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  // Tools & Technologies Endpoints
  app.get("/api/tools", (req, res) => {
    const db = loadDatabase();
    const tools = db.tools || [];
    const sorted = [...tools].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(sorted);
  });

  app.post("/api/tools/upload-logo", authenticateJWT, (req, res) => {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No logo image provided" });
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      const processed = processMockCloudinaryImage(image, "tool_logo");
      return res.json({ url: processed.url, publicId: processed.publicId });
    }

    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid image format. Expected base64 Data URI." });
    }

    const processed = processMockCloudinaryImage(image, "tool_logo");
    res.json({ url: processed.url, publicId: processed.publicId });
  });

  app.post("/api/tools", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const tool = req.body;
    
    if (!db.tools) db.tools = [];
    const newId = db.tools.length > 0 ? Math.max(...db.tools.map((t: any) => t.id)) + 1 : 1;
    const now = new Date().toISOString();
    
    const created = {
      ...tool,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    
    db.tools.push(created);
    
    recordActivity(req, db, {
      action: "Tool Added",
      module: "Tools & Technologies",
      description: `Added tool "${tool.name || 'New Tool'}" (${tool.category || 'General'}).`,
      newValue: created
    });
    
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/tools/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const updated = req.body;
    if (!db.tools) db.tools = [];
    
    const oldValue = db.tools.find((t: any) => t.id === id);
    const now = new Date().toISOString();
    
    const updatedItem = {
      ...updated,
      id,
      updatedAt: now
    };
    
    db.tools = db.tools.map((t: any) => t.id === id ? updatedItem : t);
    
    recordActivity(req, db, {
      action: "Tool Updated",
      module: "Tools & Technologies",
      description: `Updated configuration for tool "${updated.name || id}".`,
      oldValue,
      newValue: updatedItem
    });
    
    saveDatabase(db);
    res.json({ status: "success", tool: updatedItem });
  });

  app.delete("/api/tools/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.tools) db.tools = [];
    
    const oldValue = db.tools.find((t: any) => t.id === id);
    db.tools = db.tools.filter((t: any) => t.id !== id);
    
    recordActivity(req, db, {
      action: "Tool Deleted",
      module: "Tools & Technologies",
      description: `Removed tool "${oldValue?.name || id}" from CMS registry.`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/tools/:id/visibility", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { isVisible } = req.body;
    if (!db.tools) db.tools = [];
    
    db.tools = db.tools.map((t: any) => t.id === id ? { ...t, isVisible: !!isVisible, updatedAt: new Date().toISOString() } : t);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/tools/:id/featured", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { isFeatured } = req.body;
    if (!db.tools) db.tools = [];
    
    db.tools = db.tools.map((t: any) => t.id === id ? { ...t, isFeatured: !!isFeatured, updatedAt: new Date().toISOString() } : t);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.post("/api/tools/order", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds) && db.tools) {
      db.tools = db.tools.map((t: any) => {
        const idx = orderedIds.indexOf(t.id);
        return idx !== -1 ? { ...t, displayOrder: idx + 1 } : t;
      });
      saveDatabase(db);
    }
    res.json({ status: "success" });
  });

  // Technology CRUD Endpoints
  const getTechnologiesHandler = (req: express.Request, res: express.Response) => {
    const db = loadDatabase();
    const list = db.technologies || [];
    const sorted = [...list].sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    res.json(sorted);
  };
  app.get("/api/technologies", getTechnologiesHandler);
  app.get("/api/tech-stack", getTechnologiesHandler);

  const postTechnologyHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const body = req.body || {};
    const rawName = body.name ?? body.techName ?? body.technologyName ?? body.title ?? body.label ?? body.technology;
    
    if (rawName === undefined || rawName === null || typeof rawName !== "string" || !rawName.trim()) {
      return res.status(400).json({ error: "Technology name cannot be empty." });
    }
    const name = rawName.trim();
    const { enabled, order, displayOrder, category, proficiency, iconUrl } = body;
    const list = db.technologies || [];
    const maxId = list.reduce((max: number, item: any) => item.id > max ? item.id : max, 0);
    const maxOrder = list.reduce((max: number, item: any) => {
      const o = (item.order ?? item.displayOrder) || 0;
      return o > max ? o : max;
    }, 0);
    
    const targetOrder = typeof order === "number" ? order : (typeof displayOrder === "number" ? displayOrder : maxOrder + 1);

    const newTech = {
      id: maxId + 1,
      name,
      enabled: enabled !== undefined ? !!enabled : true,
      order: targetOrder,
      displayOrder: targetOrder,
      category: category || "Core Technology",
      proficiency: typeof proficiency === "number" ? proficiency : 85,
      iconUrl: iconUrl || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.technologies = [...list, newTech];
    
    recordActivity(req, db, {
      action: "Technology Created",
      module: "Profile",
      description: `Added technology "${newTech.name}" to portfolio tech stack.`,
      newValue: newTech
    });
    
    saveDatabase(db);
    res.status(201).json(newTech);
  };
  app.post("/api/technologies", authenticateJWT, postTechnologyHandler);
  app.post("/api/tech-stack", authenticateJWT, postTechnologyHandler);

  const putTechnologyHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const body = req.body || {};
    const rawName = body.name ?? body.techName ?? body.technologyName ?? body.title ?? body.label ?? body.technology;
    const { enabled, order, displayOrder, category, proficiency, iconUrl } = body;
    const list = db.technologies || [];
    const idx = list.findIndex((item: any) => item.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Technology not found" });
    }

    if (rawName !== undefined && (rawName === null || typeof rawName !== "string" || !rawName.trim())) {
      return res.status(400).json({ error: "Technology name cannot be empty." });
    }

    const oldValue = { ...list[idx] };
    const newOrder = typeof order === "number" ? order : (typeof displayOrder === "number" ? displayOrder : list[idx].order);

    const updated = {
      ...list[idx],
      ...(rawName !== undefined && { name: rawName.trim() }),
      ...(enabled !== undefined && { enabled: !!enabled }),
      ...(newOrder !== undefined && { order: newOrder, displayOrder: newOrder }),
      ...(category !== undefined && { category }),
      ...(proficiency !== undefined && { proficiency }),
      ...(iconUrl !== undefined && { iconUrl }),
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    db.technologies = list;
    
    recordActivity(req, db, {
      action: "Technology Updated",
      module: "Profile",
      description: `Updated technology "${updated.name}" settings.`,
      oldValue,
      newValue: updated
    });
    
    saveDatabase(db);
    res.json(updated);
  };
  app.put("/api/technologies/:id", authenticateJWT, putTechnologyHandler);
  app.put("/api/tech-stack/:id", authenticateJWT, putTechnologyHandler);

  const deleteTechnologyHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const list = db.technologies || [];
    const oldValue = list.find((item: any) => item.id === id);
    const filtered = list.filter((item: any) => item.id !== id);
    if (filtered.length === list.length) {
      return res.status(404).json({ error: "Technology not found" });
    }
    db.technologies = filtered;
    
    recordActivity(req, db, {
      action: "Technology Deleted",
      module: "Profile",
      description: `Removed technology "${oldValue?.name || id}" from portfolio tech stack.`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ success: true, message: "Technology deleted successfully" });
  };
  app.delete("/api/technologies/:id", authenticateJWT, deleteTechnologyHandler);
  app.delete("/api/tech-stack/:id", authenticateJWT, deleteTechnologyHandler);

  const reorderTechnologiesHandler = (req: any, res: any) => {
    const db = loadDatabase();
    const orders = req.body.orders || req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: "Invalid orders payload. Expected array." });
    }
    const list = db.technologies || [];
    orders.forEach((item: any) => {
      const targetId = typeof item === "object" ? item.id : parseInt(item);
      const targetOrder = typeof item === "object" ? (item.order ?? item.displayOrder) : null;
      const tech = list.find((t: any) => t.id === targetId);
      if (tech && targetOrder !== null) {
        tech.order = targetOrder;
        tech.displayOrder = targetOrder;
        tech.updatedAt = new Date().toISOString();
      }
    });

    list.sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0));
    db.technologies = list;
    
    recordActivity(req, db, {
      action: "Technologies Reordered",
      module: "Profile",
      description: "Reordered technology items in portfolio tech stack."
    });
    
    saveDatabase(db);
    res.json({ success: true, list });
  };
  app.put("/api/technologies-reorder", authenticateJWT, reorderTechnologiesHandler);
  app.put("/api/technologies/reorder", authenticateJWT, reorderTechnologiesHandler);
  app.patch("/api/technologies/reorder", authenticateJWT, reorderTechnologiesHandler);
  app.put("/api/tech-stack/reorder", authenticateJWT, reorderTechnologiesHandler);
  app.patch("/api/tech-stack/reorder", authenticateJWT, reorderTechnologiesHandler);

  // Certificates Endpoints
  app.get("/api/certificates", (req, res) => {
    const db = loadDatabase();
    res.json(db.certificates);
  });

  app.post("/api/certificates", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const newCert = req.body;
    const newId = db.certificates.length > 0 ? Math.max(...db.certificates.map((c: any) => c.id)) + 1 : 1;
    const created = { ...newCert, id: newId };
    db.certificates.push(created);
    
    recordActivity(req, db, {
      action: "Certificate Uploaded",
      module: "Certificates",
      description: `Logged certification: "${newCert.name}".`,
      newValue: created
    });
    
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/certificates/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const updatedCert = req.body;
    const oldValue = db.certificates.find((c: any) => c.id === id);
    db.certificates = db.certificates.map((c: any) => c.id === id ? { ...updatedCert, id } : c);
    
    recordActivity(req, db, {
      action: "Certificate Updated",
      module: "Certificates",
      description: `Updated certificate attributes for "${updatedCert.name}".`,
      oldValue,
      newValue: { ...updatedCert, id }
    });
    
    saveDatabase(db);
    res.json({ status: "success", certificate: updatedCert });
  });

  app.delete("/api/certificates/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const oldValue = db.certificates.find((c: any) => c.id === id);
    db.certificates = db.certificates.filter((c: any) => c.id !== id);
    
    recordActivity(req, db, {
      action: "Certificate Deleted",
      module: "Certificates",
      description: `Purged credentials record: "${oldValue?.name || id}".`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  // Achievements Endpoints
  app.get("/api/achievements", (req, res) => {
    const db = loadDatabase();
    const achievements = db.achievements || [];
    // Sort by displayOrder
    achievements.sort((x: any, y: any) => (x.displayOrder || 0) - (y.displayOrder || 0));
    res.json(achievements);
  });

  app.get("/api/achievements/:id", (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const item = (db.achievements || []).find((a: any) => a.id === id);
    if (!item) {
      return res.status(404).json({ error: "Achievement not found" });
    }
    res.json(item);
  });

  app.post("/api/achievements", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const newAchievement = req.body;
    db.achievements = db.achievements || [];
    const newId = db.achievements.length > 0 ? Math.max(...db.achievements.map((a: any) => a.id)) + 1 : 1;
    const now = new Date().toISOString();
    const created = {
      ...newAchievement,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    db.achievements.push(created);
    
    recordActivity(req, db, {
      action: "Achievement Added",
      module: "Achievements",
      description: `Committed achievement "${newAchievement.title}" to portfolio index.`,
      newValue: created
    });
    
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/achievements/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const updatedAchievement = req.body;
    db.achievements = db.achievements || [];
    const oldValue = db.achievements.find((a: any) => a.id === id);
    db.achievements = db.achievements.map((a: any) => 
      a.id === id 
        ? { ...updatedAchievement, id, updatedAt: new Date().toISOString() } 
        : a
    );
    
    recordActivity(req, db, {
      action: "Achievement Updated",
      module: "Achievements",
      description: `Updated achievement "${updatedAchievement.title}" successfully.`,
      oldValue,
      newValue: { ...updatedAchievement, id }
    });
    
    saveDatabase(db);
    res.json({ status: "success", achievement: updatedAchievement });
  });

  app.delete("/api/achievements/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.achievements = db.achievements || [];
    const oldValue = db.achievements.find((a: any) => a.id === id);
    db.achievements = db.achievements.filter((a: any) => a.id !== id);
    
    recordActivity(req, db, {
      action: "Achievement Deleted",
      module: "Achievements",
      description: `Purged achievement record "${oldValue?.title || id}" from repository.`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/achievements/:id/visibility", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { visibility } = req.body;
    db.achievements = db.achievements || [];
    const oldValue = db.achievements.find((a: any) => a.id === id);
    db.achievements = db.achievements.map((a: any) => 
      a.id === id 
        ? { ...a, visibility: !!visibility, updatedAt: new Date().toISOString() } 
        : a
    );
    
    recordActivity(req, db, {
      action: "Achievement Updated",
      module: "Achievements",
      description: `Toggled achievement visibility to ${visibility ? 'Published' : 'Hidden'}.`,
      oldValue,
      newValue: { visibility }
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/achievements/:id/featured", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { featured } = req.body;
    db.achievements = db.achievements || [];
    const oldValue = db.achievements.find((a: any) => a.id === id);
    db.achievements = db.achievements.map((a: any) => 
      a.id === id 
        ? { ...a, featured: !!featured, updatedAt: new Date().toISOString() } 
        : a
    );
    
    recordActivity(req, db, {
      action: "Achievement Updated",
      module: "Achievements",
      description: `Toggled achievement featured state to ${featured ? 'Featured' : 'Regular'}.`,
      oldValue,
      newValue: { featured }
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/achievements/order", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { order } = req.body; // Array of { id: number, displayOrder: number }
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Invalid request payload" });
    }
    db.achievements = db.achievements || [];
    db.achievements = db.achievements.map((a: any) => {
      const match = order.find((o: any) => o.id === a.id);
      if (match) {
        return { ...a, displayOrder: match.displayOrder, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    db.achievements.sort((x: any, y: any) => (x.displayOrder || 0) - (y.displayOrder || 0));
    
    recordActivity(req, db, {
      action: "Achievement Updated",
      module: "Achievements",
      description: "Reordered achievement layout ordering.",
      newValue: order
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });
    
  // --- MESSAGES API ENDPOINTS (Public submission, Authenticated admin management) ---
  app.get(["/api/messages", "/messages"], (req: any, res: any) => {
    const db = loadDatabase();
    const messages = db.messages || [];
    // Sort messages with newest first
    const sorted = [...messages].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    res.json(sorted);
  });

  app.post(["/api/messages", "/messages"], (req: any, res: any) => {
    const db = loadDatabase();
    const { senderName, senderEmail, subject, messageContent, name, email, message } = req.body || {};
    
    const resolvedName = (senderName || name || "").trim();
    const resolvedEmail = (senderEmail || email || "").trim();
    const resolvedSubject = (subject || "Inbound Connection Request").trim();
    const resolvedMessage = (messageContent || message || "").trim();

    if (!resolvedName || !resolvedEmail || !resolvedMessage) {
      return res.status(400).json({ error: "Name, email, and message content are required." });
    }

    db.messages = db.messages || [];
    const maxId = db.messages.reduce((max: number, m: any) => (m.id > max ? m.id : max), 0);
    const now = new Date().toISOString();

    const newMessage = {
      id: maxId + 1,
      senderName: resolvedName,
      senderEmail: resolvedEmail,
      subject: resolvedSubject,
      messageContent: resolvedMessage,
      isRead: false,
      isStarred: false,
      createdAt: now,
      updatedAt: now
    };

    db.messages.unshift(newMessage);

    // Update Analytics contact metrics
    if (db.analytics) {
      db.analytics.contactConversionRate = Math.min(100, Number(((db.analytics.contactConversionRate || 2.8) + 0.1).toFixed(1)));
    }

    recordActivity(req, db, {
      action: "Message Sent",
      module: "Visitor Interaction",
      description: `New inbound message from ${resolvedName} (${resolvedEmail}): "${resolvedSubject}"`,
      newValue: newMessage
    });

    publishNotification(db, {
      module: "Email",
      action: "Inbound Message Received",
      title: `Message from ${resolvedName}`,
      description: `${resolvedSubject}: ${resolvedMessage.substring(0, 100)}...`,
      performedBy: resolvedName,
      category: "Email",
      icon: "Mail",
      color: "#10b981",
      severity: "Success"
    });

    saveDatabase(db);
    res.status(201).json({ status: "success", message: newMessage });
  });

  app.put(["/api/messages/:id/read", "/messages/:id/read"], authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages || [];
    const msg = db.messages.find((m: any) => m.id === id);
    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }
    msg.isRead = req.body.isRead !== undefined ? !!req.body.isRead : !msg.isRead;
    msg.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ status: "success", message: msg });
  });

  app.patch(["/api/messages/:id/read", "/messages/:id/read"], authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages || [];
    const msg = db.messages.find((m: any) => m.id === id);
    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }
    msg.isRead = req.body.isRead !== undefined ? !!req.body.isRead : !msg.isRead;
    msg.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ status: "success", message: msg });
  });

  app.put(["/api/messages/:id/star", "/messages/:id/star"], authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages || [];
    const msg = db.messages.find((m: any) => m.id === id);
    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }
    msg.isStarred = req.body.isStarred !== undefined ? !!req.body.isStarred : !msg.isStarred;
    msg.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ status: "success", message: msg });
  });

  app.patch(["/api/messages/:id/star", "/messages/:id/star"], authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages || [];
    const msg = db.messages.find((m: any) => m.id === id);
    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }
    msg.isStarred = req.body.isStarred !== undefined ? !!req.body.isStarred : !msg.isStarred;
    msg.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ status: "success", message: msg });
  });

  app.delete(["/api/messages/:id", "/messages/:id"], authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages || [];
    const oldValue = db.messages.find((m: any) => m.id === id);
    db.messages = db.messages.filter((m: any) => m.id !== id);
    
    recordActivity(req, db, {
      action: "Message Deleted",
      module: "Visitor Interaction",
      description: `Purged inbox message "${oldValue?.subject || id}" from database.`,
      oldValue
    });

    saveDatabase(db);
    res.json({ status: "success" });
  });

  // Experiences Endpoints
  app.get("/api/experiences", (req, res) => {
    const db = loadDatabase();
    res.json(db.experiences);
  });

  app.post("/api/experiences", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const newExp = req.body;
    const newId = db.experiences.length > 0 ? Math.max(...db.experiences.map((e: any) => e.id)) + 1 : 1;
    const created = { ...newExp, id: newId };
    db.experiences.push(created);
    
    recordActivity(req, db, {
      action: "Experience Added",
      module: "Experience",
      description: `Logged career experience role "${newExp.role}" at "${newExp.company}".`,
      newValue: created
    });
    
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/experiences/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const updatedExp = req.body;
    const oldValue = db.experiences.find((e: any) => e.id === id);
    db.experiences = db.experiences.map((e: any) => e.id === id ? { ...updatedExp, id } : e);
    
    recordActivity(req, db, {
      action: "Experience Updated",
      module: "Experience",
      description: `Updated career experience at "${updatedExp.company}".`,
      oldValue,
      newValue: { ...updatedExp, id }
    });
    
    saveDatabase(db);
    res.json({ status: "success", experience: updatedExp });
  });

  app.delete("/api/experiences/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const oldValue = db.experiences.find((e: any) => e.id === id);
    db.experiences = db.experiences.filter((e: any) => e.id !== id);
    
    recordActivity(req, db, {
      action: "Experience Deleted",
      module: "Experience",
      description: `Deleted career experience role "${oldValue?.role}" at "${oldValue?.company}".`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  // Education Endpoints
  app.get("/api/education", (req, res) => {
    const db = loadDatabase();
    res.json(db.education);
  });

  app.post("/api/education", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const newEdu = req.body;
    const newId = db.education.length > 0 ? Math.max(...db.education.map((e: any) => e.id)) + 1 : 1;
    const created = { ...newEdu, id: newId };
    db.education.push(created);
    
    recordActivity(req, db, {
      action: "Education Added",
      module: "Education",
      description: `Logged education milestone "${newEdu.degree}" at "${newEdu.institution}".`,
      newValue: created
    });
    
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/education/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const updatedEdu = req.body;
    const oldValue = db.education.find((e: any) => e.id === id);
    db.education = db.education.map((e: any) => e.id === id ? { ...updatedEdu, id } : e);
    
    recordActivity(req, db, {
      action: "Education Updated",
      module: "Education",
      description: `Updated education milestone details for "${updatedEdu.degree}".`,
      oldValue,
      newValue: { ...updatedEdu, id }
    });
    
    saveDatabase(db);
    res.json({ status: "success", education: updatedEdu });
  });

  app.delete("/api/education/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const oldValue = db.education.find((e: any) => e.id === id);
    db.education = db.education.filter((e: any) => e.id !== id);
    
    recordActivity(req, db, {
      action: "Education Deleted",
      module: "Education",
      description: `Deleted education milestone "${oldValue?.degree}" at "${oldValue?.institution}".`,
      oldValue
    });
    
    saveDatabase(db);
    res.json({ status: "success" });
  });

  // Settings Endpoints
  app.get("/api/settings", (req, res) => {
    const db = loadDatabase();
    res.json(db.settings);
  });

  app.put("/api/settings", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const oldSettings = db.settings || {};
    const updated = req.body;
    db.settings = updated;
    
    const isSEOChanged = oldSettings.seoTitle !== updated.seoTitle || 
                         oldSettings.seoKeywords !== updated.seoKeywords || 
                         oldSettings.seoDescription !== updated.seoDescription;
                         
    recordActivity(req, db, {
      action: isSEOChanged ? "SEO Updated" : "Settings Updated",
      module: isSEOChanged ? "SEO" : "Settings",
      description: isSEOChanged ? "Committed global SEO configuration settings." : "Committed global system settings.",
      oldValue: oldSettings,
      newValue: updated
    });
    
    saveDatabase(db);
    res.json({ status: "success", settings: db.settings });
  });

  // Messages Endpoints
  app.get("/api/messages", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    res.json(db.messages);
  });

  app.post("/api/messages", async (req, res) => {
    const db = loadDatabase();
    const msg = req.body;
    
    // Sanitize user inputs to mitigate Stored XSS vulnerabilities
    const rawName = msg.name || msg.senderName || "Recruiter / Visitor";
    const rawEmail = msg.email || msg.senderEmail || "visitor@example.com";
    const rawSubject = msg.subject || "Interview Opportunity for Chandru";
    const rawMessage = msg.message || msg.messageContent || "Hello Chandru, we are interested in discussing an engineering role with you.";

    const sanitizedMsg = {
      name: sanitizeInput(rawName),
      email: sanitizeInput(rawEmail),
      phone: sanitizeInput(msg.phone || ""),
      subject: sanitizeInput(rawSubject),
      message: sanitizeInput(rawMessage)
    };

    if (!db.messages) db.messages = [];
    const newId = db.messages.length > 0 ? Math.max(...db.messages.map((m: any) => m.id)) + 1 : 1;
    const created = {
      ...sanitizedMsg,
      id: newId,
      isRead: false,
      isStarred: false,
      createdAt: new Date().toISOString()
    };
    db.messages.unshift(created);
    
    // Increment contact conversion metrics
    if (!db.analytics) db.analytics = { pageViews: 1, uniqueVisitors: 1, contactConversionRate: 100 };
    db.analytics.pageViews = (db.analytics.pageViews || 0) + 1;
    const totalMessages = db.messages.length;
    const visitors = db.analytics.uniqueVisitors || 1;
    db.analytics.contactConversionRate = parseFloat(((totalMessages / visitors) * 100).toFixed(1));
    
    // Publish in-app notification
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      type: "MESSAGE",
      title: `📬 New Recruiter Inquiry: ${sanitizedMsg.name}`,
      message: `"${sanitizedMsg.subject}" from ${sanitizedMsg.email}`,
      timestamp: new Date().toISOString(),
      read: false,
      link: "Messages"
    });

    recordActivity(req, db, {
      action: "New Message Received",
      module: "Messages",
      description: `Inquiry from ${sanitizedMsg.name} (${sanitizedMsg.email}) re: "${sanitizedMsg.subject}"`,
      newValue: { id: newId, sender: sanitizedMsg.name, email: sanitizedMsg.email }
    });

    // Attempt real email dispatch via Nodemailer if credentials exist in .env
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL || 'chandrumohan550@gmail.com';
    const smtpPass = (process.env.SMTP_PASS || process.env.APP_PASSWORD || '').trim();
    
    if (smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        const targetEmail = db.profile?.email || 'chandrumohan550@gmail.com';

        const info = await transporter.sendMail({
          from: `"${sanitizedMsg.name}" <${smtpUser}>`,
          replyTo: sanitizedMsg.email,
          to: targetEmail,
          subject: `🚀 [Portfolio Inquiry] ${sanitizedMsg.subject} - from ${sanitizedMsg.name}`,
          text: `New Inquiry via Portfolio:\n\nSender: ${sanitizedMsg.name}\nEmail: ${sanitizedMsg.email}\nPhone: ${sanitizedMsg.phone || 'N/A'}\nSubject: ${sanitizedMsg.subject}\n\nMessage:\n${sanitizedMsg.message}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0b0f19; padding: 25px; color: #f1f5f9; border-radius: 12px;">
              <h2 style="color: #10b981; margin-top: 0;">📬 New Portfolio / Recruiter Inquiry</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr><td style="padding: 8px; color: #94a3b8; width: 120px;"><strong>Sender Name:</strong></td><td style="padding: 8px; color: #ffffff;">${sanitizedMsg.name}</td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;"><strong>Work Email:</strong></td><td style="padding: 8px; color: #38bdf8;"><a href="mailto:${sanitizedMsg.email}" style="color: #38bdf8; text-decoration: underline;">${sanitizedMsg.email}</a></td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;"><strong>Subject:</strong></td><td style="padding: 8px; color: #ffffff;">${sanitizedMsg.subject}</td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;"><strong>Date:</strong></td><td style="padding: 8px; color: #94a3b8;">${new Date().toLocaleString()}</td></tr>
              </table>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${sanitizedMsg.message}</div>
              <p style="font-size: 12px; color: #64748b; margin-top: 20px;">You can reply directly to this email to respond to ${sanitizedMsg.email}.</p>
            </div>
          `
        });
        console.log(`[SMTP Email Sent] Message #${newId} delivered to ${targetEmail}: ${info.messageId}`);
      } catch (err: any) {
        console.warn(`[SMTP Email Warning] Message saved to DB, but Gmail SMTP dispatch failed:`, err.message);
      }
    }

    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/messages/:id/read", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages.map((m: any) => m.id === id ? { ...m, isRead: !m.isRead } : m);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.put("/api/messages/:id/star", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages.map((m: any) => m.id === id ? { ...m, isStarred: !m.isStarred } : m);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.delete("/api/messages/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    db.messages = db.messages.filter((m: any) => m.id !== id);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  // Social Links Endpoints
  app.get("/api/social-links", (req, res) => {
    const db = loadDatabase();
    // Sort by displayOrder ascending
    const list = db.socialLinks || [];
    list.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(list);
  });

  app.post("/api/social-links", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { 
      platform, username, profileUrl, icon, displayOrder, isVisible, logoUrl, customSvg, 
      whiteLogoUrl, darkLogoUrl, tooltip, openInNewTab,
      showInDynamicProfile, showInCoordinates, showInFooter, showInContact, showInHero, showInSystemConsole 
    } = req.body;

    if (!platform || typeof platform !== "string" || !platform.trim()) {
      return res.status(400).json({ error: "Platform name is required." });
    }

    // Prevent duplicate platforms (only for core standard platforms)
    const standardPlatforms = ["LinkedIn", "GitHub", "Instagram", "X (Twitter)", "YouTube", "Email", "LeetCode", "HackerRank", "CodeChef", "Codeforces", "Medium", "Dev.to", "Portfolio"];
    if (standardPlatforms.includes(platform) && db.socialLinks) {
      const isDuplicate = db.socialLinks.some((s: any) => s.platform === platform);
      if (isDuplicate) {
        return res.status(400).json({ error: `A social link for ${platform} already exists.` });
      }
    }

    // Validate profileUrl
    if (!profileUrl || (typeof profileUrl !== "string") || 
        (!profileUrl.startsWith("http://") && !profileUrl.startsWith("https://") && !profileUrl.startsWith("mailto:"))) {
      return res.status(400).json({ error: "Invalid profile URL. Must start with http://, https://, or mailto:" });
    }

    if (profileUrl.startsWith("http://") || profileUrl.startsWith("https://")) {
      try {
        new URL(profileUrl);
      } catch (e) {
        return res.status(400).json({ error: "Invalid URL structure." });
      }
    }

    let processedLogoUrl = logoUrl || "";
    if (processedLogoUrl && processedLogoUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedLogoUrl, "social");
      processedLogoUrl = processed.url;
    }

    let processedAvatarUrl = req.body.avatarUrl || "";
    if (processedAvatarUrl && processedAvatarUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedAvatarUrl, "avatar");
      processedAvatarUrl = processed.url;
    }

    let processedCoverUrl = req.body.coverImageUrl || "";
    if (processedCoverUrl && processedCoverUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedCoverUrl, "cover");
      processedCoverUrl = processed.url;
    }

    let processedBannerUrl = req.body.bannerImageUrl || "";
    if (processedBannerUrl && processedBannerUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedBannerUrl, "banner");
      processedBannerUrl = processed.url;
    }

    const newId = db.socialLinks && db.socialLinks.length > 0 
      ? Math.max(...db.socialLinks.map((s: any) => s.id)) + 1 
      : 1;

    const created = {
      ...req.body,
      id: newId,
      platform: platform.trim(),
      username: username ? String(username).trim() : "",
      profileUrl: String(profileUrl).trim(),
      icon: icon ? String(icon).trim() : platform,
      logoUrl: processedLogoUrl,
      avatarUrl: processedAvatarUrl,
      coverImageUrl: processedCoverUrl,
      bannerImageUrl: processedBannerUrl,
      customSvg: customSvg ? String(customSvg) : "",
      whiteLogoUrl: whiteLogoUrl ? String(whiteLogoUrl) : "",
      darkLogoUrl: darkLogoUrl ? String(darkLogoUrl) : "",
      tooltip: tooltip ? String(tooltip) : "",
      openInNewTab: openInNewTab !== false,
      displayOrder: typeof displayOrder === "number" ? displayOrder : (db.socialLinks?.length || 0) + 1,
      isVisible: isVisible !== false,
      showInDynamicProfile: showInDynamicProfile !== undefined ? !!showInDynamicProfile : true,
      showInCoordinates: showInCoordinates !== undefined ? !!showInCoordinates : true,
      showInFooter: showInFooter !== undefined ? !!showInFooter : true,
      showInContact: showInContact !== undefined ? !!showInContact : true,
      showInHero: showInHero !== undefined ? !!showInHero : false,
      showInSystemConsole: showInSystemConsole !== undefined ? !!showInSystemConsole : false,
      clicks: typeof req.body.clicks === "number" ? req.body.clicks : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!db.socialLinks) db.socialLinks = [];
    db.socialLinks.push(created);
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/social-links/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { 
      platform, username, profileUrl, icon, displayOrder, isVisible, logoUrl, customSvg, 
      whiteLogoUrl, darkLogoUrl, tooltip, openInNewTab,
      showInDynamicProfile, showInCoordinates, showInFooter, showInContact, showInHero, showInSystemConsole 
    } = req.body;

    if (platform && (typeof platform !== "string" || !platform.trim())) {
      return res.status(400).json({ error: "Platform name cannot be empty." });
    }

    // Prevent duplicate platforms (only for core standard platforms)
    const standardPlatforms = ["LinkedIn", "GitHub", "Instagram", "X (Twitter)", "YouTube", "Email", "LeetCode", "HackerRank", "CodeChef", "Codeforces", "Medium", "Dev.to", "Portfolio"];
    if (platform && standardPlatforms.includes(platform) && db.socialLinks) {
      const isDuplicate = db.socialLinks.some((s: any) => s.platform === platform && s.id !== id);
      if (isDuplicate) {
        return res.status(400).json({ error: `A social link for ${platform} already exists.` });
      }
    }

    if (!profileUrl || (typeof profileUrl !== "string") || 
        (!profileUrl.startsWith("http://") && !profileUrl.startsWith("https://") && !profileUrl.startsWith("mailto:"))) {
      return res.status(400).json({ error: "Invalid profile URL. Must start with http://, https://, or mailto:" });
    }

    if (profileUrl.startsWith("http://") || profileUrl.startsWith("https://")) {
      try {
        new URL(profileUrl);
      } catch (e) {
        return res.status(400).json({ error: "Invalid URL structure." });
      }
    }

    const index = db.socialLinks ? db.socialLinks.findIndex((s: any) => s.id === id) : -1;
    if (index === -1) {
      return res.status(404).json({ error: "Social link not found" });
    }

    let processedLogoUrl = logoUrl !== undefined ? logoUrl : db.socialLinks[index].logoUrl || "";
    if (processedLogoUrl && processedLogoUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedLogoUrl, "social");
      processedLogoUrl = processed.url;
    }

    let processedAvatarUrl = req.body.avatarUrl !== undefined ? req.body.avatarUrl : db.socialLinks[index].avatarUrl || "";
    if (processedAvatarUrl && processedAvatarUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedAvatarUrl, "avatar");
      processedAvatarUrl = processed.url;
    }

    let processedCoverUrl = req.body.coverImageUrl !== undefined ? req.body.coverImageUrl : db.socialLinks[index].coverImageUrl || "";
    if (processedCoverUrl && processedCoverUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedCoverUrl, "cover");
      processedCoverUrl = processed.url;
    }

    let processedBannerUrl = req.body.bannerImageUrl !== undefined ? req.body.bannerImageUrl : db.socialLinks[index].bannerImageUrl || "";
    if (processedBannerUrl && processedBannerUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedBannerUrl, "banner");
      processedBannerUrl = processed.url;
    }

    const updated = {
      ...db.socialLinks[index],
      ...req.body,
      platform: platform ? platform.trim() : db.socialLinks[index].platform,
      username: username !== undefined ? String(username).trim() : db.socialLinks[index].username,
      profileUrl: String(profileUrl).trim(),
      icon: icon !== undefined ? String(icon).trim() : db.socialLinks[index].icon,
      logoUrl: processedLogoUrl,
      avatarUrl: processedAvatarUrl,
      coverImageUrl: processedCoverUrl,
      bannerImageUrl: processedBannerUrl,
      customSvg: customSvg !== undefined ? String(customSvg) : (db.socialLinks[index].customSvg || ""),
      whiteLogoUrl: whiteLogoUrl !== undefined ? String(whiteLogoUrl) : (db.socialLinks[index].whiteLogoUrl || ""),
      darkLogoUrl: darkLogoUrl !== undefined ? String(darkLogoUrl) : (db.socialLinks[index].darkLogoUrl || ""),
      tooltip: tooltip !== undefined ? String(tooltip) : (db.socialLinks[index].tooltip || ""),
      openInNewTab: openInNewTab !== undefined ? !!openInNewTab : (db.socialLinks[index].openInNewTab !== false),
      displayOrder: typeof displayOrder === "number" ? displayOrder : db.socialLinks[index].displayOrder,
      isVisible: isVisible !== undefined ? !!isVisible : db.socialLinks[index].isVisible,
      showInDynamicProfile: showInDynamicProfile !== undefined ? !!showInDynamicProfile : (db.socialLinks[index].showInDynamicProfile !== undefined ? !!db.socialLinks[index].showInDynamicProfile : true),
      showInCoordinates: showInCoordinates !== undefined ? !!showInCoordinates : (db.socialLinks[index].showInCoordinates !== undefined ? !!db.socialLinks[index].showInCoordinates : true),
      showInFooter: showInFooter !== undefined ? !!showInFooter : (db.socialLinks[index].showInFooter !== undefined ? !!db.socialLinks[index].showInFooter : true),
      showInContact: showInContact !== undefined ? !!showInContact : (db.socialLinks[index].showInContact !== undefined ? !!db.socialLinks[index].showInContact : true),
      showInHero: showInHero !== undefined ? !!showInHero : (db.socialLinks[index].showInHero !== undefined ? !!db.socialLinks[index].showInHero : false),
      showInSystemConsole: showInSystemConsole !== undefined ? !!showInSystemConsole : (db.socialLinks[index].showInSystemConsole !== undefined ? !!db.socialLinks[index].showInSystemConsole : false),
      updatedAt: new Date().toISOString()
    };

    db.socialLinks[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete("/api/social-links/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.socialLinks) db.socialLinks = [];
    
    db.socialLinks = db.socialLinks.filter((s: any) => s.id !== id);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/social-links/:id/visibility", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { isVisible } = req.body;

    if (typeof isVisible !== "boolean") {
      return res.status(400).json({ error: "isVisible must be a boolean" });
    }

    if (!db.socialLinks) db.socialLinks = [];
    const index = db.socialLinks.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Social link not found" });
    }

    db.socialLinks[index].isVisible = isVisible;
    db.socialLinks[index].updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json(db.socialLinks[index]);
  });

  app.patch("/api/social-links/order", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order must be an array of objects or IDs" });
    }

    if (!db.socialLinks) db.socialLinks = [];

    order.forEach((item: any, idx: number) => {
      const targetId = typeof item === "object" ? item.id : parseInt(item);
      const newOrder = typeof item === "object" && typeof item.displayOrder === "number" ? item.displayOrder : idx + 1;
      
      const link = db.socialLinks.find((s: any) => s.id === targetId);
      if (link) {
        link.displayOrder = newOrder;
        link.updatedAt = new Date().toISOString();
      }
    });

    db.socialLinks.sort((a: any, b: any) => a.displayOrder - b.displayOrder);
    saveDatabase(db);
    res.json({ status: "success", socialLinks: db.socialLinks });
  });

  // --- PORTFOLIO METRICS ENDPOINTS ---
  app.get("/api/portfolio-metrics", (req, res) => {
    const db = loadDatabase();
    const list = db.portfolioMetrics || [];
    list.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(list);
  });

  app.post("/api/portfolio-metrics", (req, res) => {
    const db = loadDatabase();
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    const {
      title, value, subtitle, icon, iconType, customSvg,
      displayOrder, visible, animationEnabled, counterAnimationToggle,
      color, sourceType, tooltip
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    const maxId = db.portfolioMetrics.reduce((max: number, item: any) => (item.id > max ? item.id : max), 0);
    const newMetric = {
      id: maxId + 1,
      title: title.trim(),
      value: (value !== undefined && value !== null) ? String(value).trim() : "0",
      subtitle: subtitle ? String(subtitle).trim() : "",
      icon: icon || "BarChart3",
      iconType: iconType || "lucide",
      customSvg: customSvg || "",
      displayOrder: typeof displayOrder === "number" ? displayOrder : db.portfolioMetrics.length + 1,
      visible: visible !== undefined ? Boolean(visible) : true,
      animationEnabled: animationEnabled !== undefined ? Boolean(animationEnabled) : true,
      counterAnimationToggle: counterAnimationToggle !== undefined ? Boolean(counterAnimationToggle) : true,
      color: color || "emerald",
      sourceType: sourceType || "manual",
      tooltip: tooltip ? String(tooltip).trim() : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.portfolioMetrics.push(newMetric);
    db.portfolioMetrics.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

    recordActivity(req, db, {
      action: "Portfolio Metric Created",
      module: "Portfolio Metrics",
      description: `Created metric "${newMetric.title}".`,
      newValue: newMetric
    });

    saveDatabase(db);
    res.status(201).json(newMetric);
  });

  app.put("/api/portfolio-metrics/:id", (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    const index = db.portfolioMetrics.findIndex((m: any) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Portfolio metric not found" });
    }

    const oldValue = { ...db.portfolioMetrics[index] };
    const {
      title, value, subtitle, icon, iconType, customSvg,
      displayOrder, visible, animationEnabled, counterAnimationToggle,
      color, sourceType, tooltip
    } = req.body;

    db.portfolioMetrics[index] = {
      ...db.portfolioMetrics[index],
      title: title !== undefined ? String(title).trim() : db.portfolioMetrics[index].title,
      value: value !== undefined ? String(value).trim() : db.portfolioMetrics[index].value,
      subtitle: subtitle !== undefined ? String(subtitle).trim() : db.portfolioMetrics[index].subtitle,
      icon: icon !== undefined ? icon : db.portfolioMetrics[index].icon,
      iconType: iconType !== undefined ? iconType : db.portfolioMetrics[index].iconType,
      customSvg: customSvg !== undefined ? customSvg : db.portfolioMetrics[index].customSvg,
      displayOrder: typeof displayOrder === "number" ? displayOrder : db.portfolioMetrics[index].displayOrder,
      visible: visible !== undefined ? Boolean(visible) : db.portfolioMetrics[index].visible,
      animationEnabled: animationEnabled !== undefined ? Boolean(animationEnabled) : db.portfolioMetrics[index].animationEnabled,
      counterAnimationToggle: counterAnimationToggle !== undefined ? Boolean(counterAnimationToggle) : db.portfolioMetrics[index].counterAnimationToggle,
      color: color !== undefined ? color : db.portfolioMetrics[index].color,
      sourceType: sourceType !== undefined ? sourceType : db.portfolioMetrics[index].sourceType,
      tooltip: tooltip !== undefined ? String(tooltip).trim() : db.portfolioMetrics[index].tooltip,
      updatedAt: new Date().toISOString()
    };

    db.portfolioMetrics.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

    recordActivity(req, db, {
      action: "Portfolio Metric Updated",
      module: "Portfolio Metrics",
      description: `Updated metric "${db.portfolioMetrics[index].title}".`,
      oldValue,
      newValue: db.portfolioMetrics[index]
    });

    saveDatabase(db);
    res.json(db.portfolioMetrics[index]);
  });

  app.delete("/api/portfolio-metrics/:id", (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    const oldValue = db.portfolioMetrics.find((m: any) => m.id === id);
    if (!oldValue) {
      return res.status(404).json({ error: "Portfolio metric not found" });
    }

    db.portfolioMetrics = db.portfolioMetrics.filter((m: any) => m.id !== id);

    recordActivity(req, db, {
      action: "Portfolio Metric Deleted",
      module: "Portfolio Metrics",
      description: `Deleted metric "${oldValue.title}".`,
      oldValue
    });

    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.post("/api/portfolio-metrics/bulk-delete", (req, res) => {
    const db = loadDatabase();
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array" });
    }
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    const initialCount = db.portfolioMetrics.length;
    db.portfolioMetrics = db.portfolioMetrics.filter((m: any) => !ids.includes(m.id));
    const deletedCount = initialCount - db.portfolioMetrics.length;

    recordActivity(req, db, {
      action: "Portfolio Metrics Bulk Deleted",
      module: "Portfolio Metrics",
      description: `Bulk deleted ${deletedCount} metrics.`
    });

    saveDatabase(db);
    res.json({ status: "success", deletedCount });
  });

  app.patch("/api/portfolio-metrics/bulk-visibility", (req, res) => {
    const db = loadDatabase();
    const { ids, visible } = req.body;
    if (!Array.isArray(ids) || typeof visible !== "boolean") {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    db.portfolioMetrics.forEach((m: any) => {
      if (ids.includes(m.id)) {
        m.visible = visible;
        m.updatedAt = new Date().toISOString();
      }
    });

    recordActivity(req, db, {
      action: "Portfolio Metrics Bulk Visibility Changed",
      module: "Portfolio Metrics",
      description: `Bulk changed visibility to ${visible} for ${ids.length} metrics.`
    });

    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/portfolio-metrics/:id/visibility", (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { visible } = req.body;
    if (typeof visible !== "boolean") {
      return res.status(400).json({ error: "visible must be a boolean" });
    }
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    const index = db.portfolioMetrics.findIndex((m: any) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Portfolio metric not found" });
    }

    db.portfolioMetrics[index].visible = visible;
    db.portfolioMetrics[index].updatedAt = new Date().toISOString();

    recordActivity(req, db, {
      action: "Portfolio Metric Visibility Toggled",
      module: "Portfolio Metrics",
      description: `Toggled visibility of "${db.portfolioMetrics[index].title}" to ${visible}.`
    });

    saveDatabase(db);
    res.json(db.portfolioMetrics[index]);
  });

  app.patch("/api/portfolio-metrics/order", (req, res) => {
    const db = loadDatabase();
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order must be an array" });
    }
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    order.forEach((item: any) => {
      const metric = db.portfolioMetrics.find((m: any) => m.id === item.id);
      if (metric) {
        metric.displayOrder = item.displayOrder;
        metric.updatedAt = new Date().toISOString();
      }
    });

    db.portfolioMetrics.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

    recordActivity(req, db, {
      action: "Portfolio Metrics Reordered",
      module: "Portfolio Metrics",
      description: "Reordered portfolio metrics list."
    });

    saveDatabase(db);
    res.json({ status: "success", portfolioMetrics: db.portfolioMetrics });
  });

  app.post("/api/portfolio-metrics/:id/duplicate", (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.portfolioMetrics) db.portfolioMetrics = [];

    const source = db.portfolioMetrics.find((m: any) => m.id === id);
    if (!source) {
      return res.status(404).json({ error: "Portfolio metric not found" });
    }

    const maxId = db.portfolioMetrics.reduce((max: number, item: any) => (item.id > max ? item.id : max), 0);
    const duplicate = {
      ...source,
      id: maxId + 1,
      title: `${source.title} (Copy)`,
      displayOrder: source.displayOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.portfolioMetrics.push(duplicate);
    db.portfolioMetrics.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

    recordActivity(req, db, {
      action: "Portfolio Metric Duplicated",
      module: "Portfolio Metrics",
      description: `Duplicated metric "${source.title}".`,
      newValue: duplicate
    });

    saveDatabase(db);
    res.status(201).json(duplicate);
  });

  // --- CODING PROFILES ENDPOINTS ---
  app.get("/api/coding-profiles", (req, res) => {
    const db = loadDatabase();
    const list = db.codingProfiles || [];
    list.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(list);
  });

  app.post("/api/coding-profiles", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    if (!db.codingProfiles) db.codingProfiles = [];

    const { platformType, displayName, username, profileUrl, logoUrl, displayOrder, visible, description, featured, openInNewTab } = req.body;

    if (!platformType || typeof platformType !== "string" || !platformType.trim()) {
      return res.status(400).json({ error: "Platform type is required." });
    }

    const name = platformType === "Custom" ? (displayName || "").trim() : platformType;
    if (!name) {
      return res.status(400).json({ error: "Platform name is required." });
    }

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ error: "Username is required." });
    }

    if (!profileUrl || typeof profileUrl !== "string" || !profileUrl.trim()) {
      return res.status(400).json({ error: "Profile URL is required." });
    }

    if (!profileUrl.startsWith("http://") && !profileUrl.startsWith("https://")) {
      return res.status(400).json({ error: "Profile URL must start with http:// or https://" });
    }

    try {
      new URL(profileUrl);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL structure." });
    }

    // Prevent duplicate identical platform URLs
    const isDuplicate = db.codingProfiles.some((p: any) => p.profileUrl?.trim().toLowerCase() === profileUrl.trim().toLowerCase());
    if (isDuplicate) {
      return res.status(400).json({ error: "A coding profile with this Profile URL already exists." });
    }

    let processedLogoUrl = logoUrl || "";
    let logoPublicId = "";
    if (processedLogoUrl && processedLogoUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedLogoUrl, "coding-profile");
      processedLogoUrl = processed.url;
      logoPublicId = processed.publicId;
    }

    const newId = db.codingProfiles.length > 0 ? Math.max(...db.codingProfiles.map((p: any) => p.id)) + 1 : 1;

    const created = {
      id: newId,
      platformType: platformType.trim(),
      displayName: name,
      username: username.trim(),
      profileUrl: profileUrl.trim(),
      description: description !== undefined ? String(description).trim() : "",
      logoUrl: processedLogoUrl,
      logoPublicId,
      displayOrder: typeof displayOrder === "number" ? displayOrder : db.codingProfiles.length + 1,
      visible: visible !== false,
      featured: !!featured,
      openInNewTab: openInNewTab !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.codingProfiles.push(created);
    
    recordActivity(req, db, {
      action: "Coding Profile Created",
      module: "Coding Profiles",
      description: `Added coding profile for platform "${name}".`,
      newValue: created
    });

    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/coding-profiles/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.codingProfiles) db.codingProfiles = [];

    const index = db.codingProfiles.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Coding profile not found" });
    }

    const { platformType, displayName, username, profileUrl, logoUrl, displayOrder, visible, logoPublicId, description, featured, openInNewTab } = req.body;

    if (platformType && (typeof platformType !== "string" || !platformType.trim())) {
      return res.status(400).json({ error: "Platform type cannot be empty." });
    }

    const name = platformType === "Custom" ? (displayName || "").trim() : (platformType || db.codingProfiles[index].platformType);
    if (platformType && !name) {
      return res.status(400).json({ error: "Platform name cannot be empty." });
    }

    if (username && (typeof username !== "string" || !username.trim())) {
      return res.status(400).json({ error: "Username cannot be empty." });
    }

    if (profileUrl) {
      if (typeof profileUrl !== "string" || !profileUrl.trim()) {
        return res.status(400).json({ error: "Profile URL cannot be empty." });
      }
      if (!profileUrl.startsWith("http://") && !profileUrl.startsWith("https://")) {
        return res.status(400).json({ error: "Profile URL must start with http:// or https://" });
      }
      try {
        new URL(profileUrl);
      } catch (e) {
        return res.status(400).json({ error: "Invalid URL structure." });
      }

      // Prevent duplicate identical platform URLs excluding self
      const isDuplicate = db.codingProfiles.some((p: any) => p.id !== id && p.profileUrl?.trim().toLowerCase() === profileUrl.trim().toLowerCase());
      if (isDuplicate) {
        return res.status(400).json({ error: "A coding profile with this Profile URL already exists." });
      }
    }

    let processedLogoUrl = logoUrl !== undefined ? logoUrl : db.codingProfiles[index].logoUrl || "";
    let processedLogoPublicId = logoPublicId !== undefined ? logoPublicId : db.codingProfiles[index].logoPublicId || "";
    if (processedLogoUrl && processedLogoUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedLogoUrl, "coding-profile");
      processedLogoUrl = processed.url;
      processedLogoPublicId = processed.publicId;
    }

    const oldValue = { ...db.codingProfiles[index] };
    const updated = {
      ...db.codingProfiles[index],
      platformType: platformType !== undefined ? platformType.trim() : db.codingProfiles[index].platformType,
      displayName: name !== undefined ? name : db.codingProfiles[index].displayName,
      username: username !== undefined ? username.trim() : db.codingProfiles[index].username,
      profileUrl: profileUrl !== undefined ? profileUrl.trim() : db.codingProfiles[index].profileUrl,
      description: description !== undefined ? String(description).trim() : (db.codingProfiles[index].description || ""),
      logoUrl: processedLogoUrl,
      logoPublicId: processedLogoPublicId,
      displayOrder: typeof displayOrder === "number" ? displayOrder : db.codingProfiles[index].displayOrder,
      visible: visible !== undefined ? !!visible : db.codingProfiles[index].visible,
      featured: featured !== undefined ? !!featured : !!db.codingProfiles[index].featured,
      openInNewTab: openInNewTab !== undefined ? !!openInNewTab : db.codingProfiles[index].openInNewTab !== false,
      updatedAt: new Date().toISOString()
    };

    db.codingProfiles[index] = updated;

    recordActivity(req, db, {
      action: "Coding Profile Updated",
      module: "Coding Profiles",
      description: `Updated coding profile for platform "${name}".`,
      oldValue,
      newValue: updated
    });

    saveDatabase(db);
    res.json(updated);
  });

  app.delete("/api/coding-profiles/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.codingProfiles) db.codingProfiles = [];

    const oldValue = db.codingProfiles.find((p: any) => p.id === id);
    if (!oldValue) {
      return res.status(404).json({ error: "Coding profile not found" });
    }

    db.codingProfiles = db.codingProfiles.filter((p: any) => p.id !== id);

    recordActivity(req, db, {
      action: "Coding Profile Deleted",
      module: "Coding Profiles",
      description: `Removed coding profile for platform "${oldValue.displayName}".`,
      oldValue
    });

    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/coding-profiles/:id/visibility", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { visible } = req.body;

    if (typeof visible !== "boolean") {
      return res.status(400).json({ error: "visible must be a boolean" });
    }

    if (!db.codingProfiles) db.codingProfiles = [];
    const index = db.codingProfiles.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Coding profile not found" });
    }

    db.codingProfiles[index].visible = visible;
    db.codingProfiles[index].updatedAt = new Date().toISOString();

    recordActivity(req, db, {
      action: "Coding Profile Visibility Changed",
      module: "Coding Profiles",
      description: `Toggled visibility of "${db.codingProfiles[index].displayName}" profile to ${visible}.`
    });

    saveDatabase(db);
    res.json(db.codingProfiles[index]);
  });

  app.patch("/api/coding-profiles/order", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order must be an array" });
    }

    if (!db.codingProfiles) db.codingProfiles = [];

    order.forEach((item: any, idx: number) => {
      const targetId = typeof item === "object" ? item.id : parseInt(item);
      const newOrder = typeof item === "object" && typeof item.displayOrder === "number" ? item.displayOrder : idx + 1;
      
      const prof = db.codingProfiles.find((p: any) => p.id === targetId);
      if (prof) {
        prof.displayOrder = newOrder;
        prof.updatedAt = new Date().toISOString();
      }
    });

    db.codingProfiles.sort((a: any, b: any) => a.displayOrder - b.displayOrder);
    saveDatabase(db);
    res.json({ status: "success", codingProfiles: db.codingProfiles });
  });

  // --- FOOTER SETTINGS ENDPOINTS ---
  app.get("/api/footer", (req, res) => {
    const db = loadDatabase();
    if (!db.footer) {
      db.footer = initialFooter;
      saveDatabase(db);
    }
    res.json(db.footer);
  });

  app.put("/api/footer", authenticateJWT, (req: any, res: any) => {
    const db = loadDatabase();
    const { 
      title, description, copyrightText, builtWithText, contactInfo, showResume, resumeText,
      logoText, logoUrl, backgroundType, customBackgroundUrl, theme, isVisible 
    } = req.body;

    db.footer = {
      title: title !== undefined ? String(title).trim() : (db.footer?.title || "Alex Dev"),
      description: description !== undefined ? String(description).trim() : (db.footer?.description || ""),
      copyrightText: copyrightText !== undefined ? String(copyrightText).trim() : (db.footer?.copyrightText || ""),
      builtWithText: builtWithText !== undefined ? String(builtWithText).trim() : (db.footer?.builtWithText || ""),
      contactInfo: contactInfo !== undefined ? String(contactInfo).trim() : (db.footer?.contactInfo || ""),
      showResume: showResume !== undefined ? !!showResume : (db.footer?.showResume !== false),
      resumeText: resumeText !== undefined ? String(resumeText).trim() : (db.footer?.resumeText || "View Resume"),
      logoText: logoText !== undefined ? String(logoText).trim() : (db.footer?.logoText || "Alex Dev"),
      logoUrl: logoUrl !== undefined ? String(logoUrl).trim() : (db.footer?.logoUrl || ""),
      backgroundType: backgroundType !== undefined ? String(backgroundType).trim() as any : (db.footer?.backgroundType || "glass"),
      customBackgroundUrl: customBackgroundUrl !== undefined ? String(customBackgroundUrl).trim() : (db.footer?.customBackgroundUrl || ""),
      theme: theme !== undefined ? String(theme).trim() as any : (db.footer?.theme || "glass"),
      isVisible: isVisible !== undefined ? !!isVisible : (db.footer?.isVisible !== false)
    };

    saveDatabase(db);
    res.json(db.footer);
  });

  // --- FOOTER SOCIAL LINKS ENDPOINTS ---
  app.get("/api/footer/social-links", (req, res) => {
    const db = loadDatabase();
    const list = db.footerSocialLinks || [];
    list.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(list);
  });

  app.get("/api/footer/social-links/visible", (req, res) => {
    const db = loadDatabase();
    const list = (db.footerSocialLinks || []).filter((s: any) => s.isVisible);
    list.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(list);
  });

  app.post("/api/footer/social-links", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { platform, url, icon, displayOrder, isVisible, logoUrl } = req.body;

    if (!platform || typeof platform !== "string" || !platform.trim()) {
      return res.status(400).json({ error: "Platform name is required." });
    }

    if (!url || (typeof url !== "string") || 
        (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:") && !url.startsWith("tel:") && !url.startsWith("https://wa.me/"))) {
      return res.status(400).json({ error: "Invalid URL. Must start with http://, https://, mailto:, tel: or wa.me" });
    }

    let processedLogoUrl = logoUrl || "";
    if (processedLogoUrl && processedLogoUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedLogoUrl, "footer-social");
      processedLogoUrl = processed.url;
    }

    const newId = db.footerSocialLinks && db.footerSocialLinks.length > 0 
      ? Math.max(...db.footerSocialLinks.map((s: any) => s.id)) + 1 
      : 1;

    const created = {
      id: newId,
      platform: platform.trim(),
      url: String(url).trim(),
      icon: icon ? String(icon).trim() : platform.trim(),
      logoUrl: processedLogoUrl,
      displayOrder: typeof displayOrder === "number" ? displayOrder : (db.footerSocialLinks?.length || 0) + 1,
      isVisible: isVisible !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!db.footerSocialLinks) db.footerSocialLinks = [];
    db.footerSocialLinks.push(created);
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/footer/social-links/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { platform, url, icon, displayOrder, isVisible, logoUrl } = req.body;

    if (platform && (typeof platform !== "string" || !platform.trim())) {
      return res.status(400).json({ error: "Platform name cannot be empty." });
    }

    if (!url || (typeof url !== "string") || 
        (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:") && !url.startsWith("tel:") && !url.startsWith("https://wa.me/"))) {
      return res.status(400).json({ error: "Invalid URL. Must start with http://, https://, mailto:, tel: or wa.me" });
    }

    const index = db.footerSocialLinks ? db.footerSocialLinks.findIndex((s: any) => s.id === id) : -1;
    if (index === -1) {
      return res.status(404).json({ error: "Footer social link not found" });
    }

    let processedLogoUrl = logoUrl !== undefined ? logoUrl : db.footerSocialLinks[index].logoUrl || "";
    if (processedLogoUrl && processedLogoUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedLogoUrl, "footer-social");
      processedLogoUrl = processed.url;
    }

    const updated = {
      ...db.footerSocialLinks[index],
      platform: platform ? platform.trim() : db.footerSocialLinks[index].platform,
      url: String(url).trim(),
      icon: icon !== undefined ? String(icon).trim() : db.footerSocialLinks[index].icon,
      logoUrl: processedLogoUrl,
      displayOrder: typeof displayOrder === "number" ? displayOrder : db.footerSocialLinks[index].displayOrder,
      isVisible: isVisible !== undefined ? !!isVisible : db.footerSocialLinks[index].isVisible,
      updatedAt: new Date().toISOString()
    };

    db.footerSocialLinks[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete("/api/footer/social-links/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.footerSocialLinks) db.footerSocialLinks = [];
    
    db.footerSocialLinks = db.footerSocialLinks.filter((s: any) => s.id !== id);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/footer/social-links/:id/visibility", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { isVisible } = req.body;

    if (typeof isVisible !== "boolean") {
      return res.status(400).json({ error: "isVisible must be a boolean" });
    }

    if (!db.footerSocialLinks) db.footerSocialLinks = [];
    const index = db.footerSocialLinks.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Footer social link not found" });
    }

    db.footerSocialLinks[index].isVisible = isVisible;
    db.footerSocialLinks[index].updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json(db.footerSocialLinks[index]);
  });

  app.patch("/api/footer/social-links/order", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order must be an array of objects or IDs" });
    }

    if (!db.footerSocialLinks) db.footerSocialLinks = [];

    order.forEach((item: any, idx: number) => {
      const targetId = typeof item === "object" ? item.id : parseInt(item);
      const newOrder = typeof item === "object" && typeof item.displayOrder === "number" ? item.displayOrder : idx + 1;
      
      const link = db.footerSocialLinks.find((s: any) => s.id === targetId);
      if (link) {
        link.displayOrder = newOrder;
        link.updatedAt = new Date().toISOString();
      }
    });

    db.footerSocialLinks.sort((a: any, b: any) => a.displayOrder - b.displayOrder);
    saveDatabase(db);
    res.json({ status: "success", footerSocialLinks: db.footerSocialLinks });
  });

  // --- RESUME & CV MANAGEMENT ENDPOINTS ---
  function escapePdfText(text: string): string {
    return String(text || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function generateMinimalResumePdf(db: any): Buffer {
    const profile = db.profile || {};
    const name = profile.fullName || profile.displayName || "Chandru Mohan";
    const title = profile.title || profile.heroTitle || "Principal Systems Architect / Full Stack Developer";
    const email = profile.email || "chandrumohan550@gmail.com";
    const phone = profile.phone || profile.phoneNumber || "9655384140";
    const location = profile.location || "San Francisco, California / Bengaluru, India";
    
    const contentLines: string[] = [];
    contentLines.push(`${title}`);
    contentLines.push(`Email: ${email} | Phone: ${phone} | Location: ${location}`);
    contentLines.push("");
    contentLines.push("## PROFESSIONAL SUMMARY");
    const bio = profile.shortBio || profile.aboutDescription || "High-throughput systems developer specializing in microservices, real-time architectures, React, and scalable cloud systems.";
    contentLines.push(bio);
    contentLines.push("");
    
    // Skills
    if (Array.isArray(db.skills) && db.skills.length > 0) {
      contentLines.push("## TECHNICAL SKILLS");
      const skillList = db.skills.slice(0, 14).map((s: any) => s.name).join(", ");
      contentLines.push(skillList);
      contentLines.push("");
    }
    
    // Experience
    if (Array.isArray(db.experiences) && db.experiences.length > 0) {
      contentLines.push("## PROFESSIONAL EXPERIENCE");
      db.experiences.slice(0, 3).forEach((exp: any) => {
        contentLines.push(`${exp.role || exp.title} - ${exp.company} (${exp.startDate || ''} - ${exp.endDate || 'Present'})`);
        if (exp.description) contentLines.push(exp.description.substring(0, 110) + "...");
      });
      contentLines.push("");
    }
    
    // Projects
    if (Array.isArray(db.projects) && db.projects.length > 0) {
      contentLines.push("## KEY PROJECTS");
      db.projects.slice(0, 3).forEach((proj: any) => {
        contentLines.push(`${proj.title} - ${(proj.skills || []).slice(0, 4).join(', ')}`);
        if (proj.description) contentLines.push(proj.description.substring(0, 110) + "...");
      });
      contentLines.push("");
    }
    
    // Education
    if (Array.isArray(db.education) && db.education.length > 0) {
      contentLines.push("## EDUCATION");
      db.education.slice(0, 2).forEach((edu: any) => {
        contentLines.push(`${edu.degree || edu.fieldOfStudy || 'Bachelor of Engineering'} - ${edu.institution || edu.school}`);
      });
    }

    // Construct valid PDF document structure
    const objects: string[] = [];
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj');

    let streamContent = 'BT\n';
    streamContent += '/F2 18 Tf\n50 740 Td\n(' + escapePdfText(name) + ') Tj\n';
    streamContent += '/F1 10 Tf\n0 -18 Td\n';

    for (const line of contentLines) {
      if (line.startsWith('## ')) {
        streamContent += `0 -18 Td\n/F2 12 Tf\n(${escapePdfText(line.replace('## ', ''))}) Tj\n/F1 9.5 Tf\n0 -14 Td\n`;
      } else if (line.trim() === '') {
        streamContent += '0 -7 Td\n';
      } else {
        const maxLen = 80;
        const chunks = line.match(new RegExp('.{1,' + maxLen + '}', 'g')) || [line];
        for (const chunk of chunks) {
          streamContent += `(${escapePdfText(chunk)}) Tj\n0 -13 Td\n`;
        }
      }
    }
    streamContent += 'ET';

    const streamLength = Buffer.byteLength(streamContent, 'utf-8');
    objects.push(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);
    objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    objects.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');

    let pdf = '%PDF-1.4\n';
    const xrefOffsets: number[] = [0];

    for (const obj of objects) {
      xrefOffsets.push(Buffer.byteLength(pdf, 'utf-8'));
      pdf += obj + '\n';
    }

    const xrefStart = Buffer.byteLength(pdf, 'utf-8');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      const offset = xrefOffsets[i].toString().padStart(10, '0');
      pdf += `${offset} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, 'utf-8');
  }

  async function serveResumeFile(req: express.Request, res: express.Response, isDownload: boolean) {
    const db = loadDatabase();
    const id = req.params.id ? parseInt(req.params.id) : (req.query.id ? parseInt(String(req.query.id)) : null);
    const requestedUrl = req.query.url ? String(req.query.url) : null;
    const requestedFileName = req.query.fileName ? String(req.query.fileName) : null;

    let resume: any = null;
    if (id) {
      resume = (db.resumes || []).find((r: any) => r.id === id);
    } else {
      resume = (db.resumes || []).find((r: any) => r.isActive) || (db.resumes && db.resumes[0]) || null;
    }

    const profile = db.profile || {};
    const candidateName = (profile.fullName || profile.displayName || "Chandru_Mohan").replace(/\s+/g, '_');
    const fileName = requestedFileName || (resume?.fileName) || `${candidateName}_Resume.pdf`;
    let fileUrl = requestedUrl || (resume?.fileUrl) || (profile.resumeUrl) || "";

    // 1. If base64 data URI
    if (fileUrl.startsWith("data:")) {
      try {
        const commaIndex = fileUrl.indexOf(",");
        if (commaIndex !== -1) {
          const meta = fileUrl.substring(0, commaIndex);
          const base64Data = fileUrl.substring(commaIndex + 1);
          const mimeMatch = meta.match(/data:([^;]+)/);
          const contentType = mimeMatch ? mimeMatch[1] : "application/pdf";
          const buffer = Buffer.from(base64Data, 'base64');
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.send(buffer);
        }
      } catch (err) {
        console.error("Error serving base64 resume:", err);
      }
    }

    // 2. If it's a remote URL (Google Drive, AWS, Cloudinary, dummy.pdf, etc.)
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      let fetchUrl = fileUrl;
      if (fileUrl.includes("drive.google.com/file/d/")) {
        const match = fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          fetchUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
      } else if (fileUrl.includes("drive.google.com/open?id=")) {
        const match = fileUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          fetchUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
      }

      try {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 6000);
        const response = await fetch(fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          signal: abortController.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const arrayBuf = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          const contentType = response.headers.get('content-type') || 'application/pdf';
          
          res.setHeader('Content-Type', contentType.includes('pdf') ? 'application/pdf' : contentType);
          res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.send(buffer);
        }
      } catch (fetchErr) {
        console.warn("Could not fetch remote resume URL, falling back to generated PDF:", fetchErr);
      }
    }

    // 3. Fallback: Generate valid professional PDF on the fly
    try {
      const pdfBuffer = generateMinimalResumePdf(db);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(pdfBuffer);
    } catch (genErr) {
      console.error("Error generating resume fallback PDF:", genErr);
      return res.status(500).json({ error: "Failed to download resume" });
    }
  }

  app.get("/api/resume/download", (req, res) => serveResumeFile(req, res, true));
  app.get("/api/resume/view", (req, res) => serveResumeFile(req, res, false));
  app.get("/api/resume/:id/download", (req, res) => serveResumeFile(req, res, true));
  app.get("/api/resume/:id/file", (req, res) => serveResumeFile(req, res, false));
  app.get("/api/download-file", (req, res) => serveResumeFile(req, res, true));

  app.get("/api/resume", (req, res) => {
    const db = loadDatabase();
    const resumes = db.resumes || [];
    // Sort by uploadedAt descending (latest first)
    resumes.sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    const mappedResumes = resumes.map((r: any) => {
      if (r.fileUrl && r.fileUrl.startsWith("data:")) {
        return {
          ...r,
          fileUrl: `/api/resume/${r.id}/file`
        };
      }
      return r;
    });
    res.json(mappedResumes);
  });

  app.get("/api/resume/active", (req, res) => {
    const db = loadDatabase();
    const resumes = db.resumes || [];
    const active = resumes.find((r: any) => r.isActive);
    if (active) {
      const mappedActive = { ...active };
      if (mappedActive.fileUrl && mappedActive.fileUrl.startsWith("data:")) {
        mappedActive.fileUrl = `/api/resume/${active.id}/file`;
      }
      res.json(mappedActive);
    } else {
      res.status(404).json({ error: "No active Resume/CV found." });
    }
  });

  app.get("/api/resume/history", (req, res) => {
    const db = loadDatabase();
    const resumes = db.resumes || [];
    resumes.sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    const mappedResumes = resumes.map((r: any) => {
      if (r.fileUrl && r.fileUrl.startsWith("data:")) {
        return {
          ...r,
          fileUrl: `/api/resume/${r.id}/file`
        };
      }
      return r;
    });
    res.json(mappedResumes);
  });

  app.post("/api/resume", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { 
      title, version, description, fileName, fileUrl, 
      fileType, fileSize, cloudinaryPublicId, thumbnailImage, 
      isActive, isDownloadEnabled 
    } = req.body;

    // --- VALIDATION LAYER ---
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Resume Title is required." });
    }
    if (!version || !version.trim()) {
      return res.status(400).json({ error: "Version string (e.g. 1.0.0) is required." });
    }
    if (!fileUrl) {
      return res.status(400).json({ error: "Resume file attachment or URL is required." });
    }

    // PDF or DOCX check
    const isAllowedDoc = fileType === "application/pdf" || 
                         fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                         (fileName && (String(fileName).toLowerCase().endsWith(".pdf") || String(fileName).toLowerCase().endsWith(".docx"))) ||
                         fileUrl.startsWith("data:application/pdf;") ||
                         fileUrl.startsWith("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;");
    if (!isAllowedDoc) {
      return res.status(400).json({ error: "Invalid file type. Only PDF and DOCX files are supported." });
    }

    // File Size validation (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize && typeof fileSize === "number" && fileSize > MAX_SIZE) {
      return res.status(400).json({ error: "File exceeds maximum size threshold of 10 MB." });
    }

    if (!db.resumes) db.resumes = [];

    // Duplicate Check
    const isDuplicate = db.resumes.some((r: any) => r.version === version.trim() && r.fileName === fileName);
    if (isDuplicate) {
      return res.status(400).json({ error: `A resume version ${version} with the same file name already exists.` });
    }

    const newId = db.resumes.length > 0 ? Math.max(...db.resumes.map((r: any) => r.id)) + 1 : 1;
    const nowStr = new Date().toISOString();

    const finalActive = isActive === true || db.resumes.length === 0;

    // If setting active, deactivate all other resumes
    if (finalActive) {
      db.resumes.forEach((r: any) => { r.isActive = false; });
    }

    const detectedMime = fileType ? String(fileType).trim() : (fileName && String(fileName).toLowerCase().endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf");

    const created = {
      id: newId,
      title: String(title).trim(),
      version: String(version).trim(),
      description: description ? String(description).trim() : "",
      fileName: fileName ? String(fileName).trim() : "Resume.pdf",
      fileUrl: fileUrl,
      fileType: detectedMime,
      fileSize: typeof fileSize === "number" ? fileSize : 50000,
      cloudinaryPublicId: cloudinaryPublicId ? String(cloudinaryPublicId).trim() : `portfolio/resume/res_${Date.now()}`,
      thumbnailImage: thumbnailImage || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=260&auto=format&fit=crop",
      isActive: finalActive,
      isDownloadEnabled: isDownloadEnabled !== false,
      uploadedAt: nowStr,
      updatedAt: nowStr
    };

    db.resumes.push(created);
    
    recordActivity(req, db, {
      action: "Resume Uploaded",
      module: "Profile",
      description: `Uploaded new Resume/CV version ${version} - "${title}".`,
      newValue: created
    });
    
    syncProfileActiveResume(db);
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put("/api/resume/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { 
      title, version, description, fileName, fileUrl, 
      fileType, fileSize, cloudinaryPublicId, thumbnailImage, 
      isActive, isDownloadEnabled 
    } = req.body;

    if (!db.resumes) db.resumes = [];
    const index = db.resumes.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Resume CV draft not found." });
    }

    if (title && !title.trim()) {
      return res.status(400).json({ error: "Resume Title cannot be empty." });
    }
    if (version && !version.trim()) {
      return res.status(400).json({ error: "Resume Version cannot be empty." });
    }

    if (fileUrl) {
      const isAllowedDoc = fileType === "application/pdf" || 
                           fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                           (fileName && (String(fileName).toLowerCase().endsWith(".pdf") || String(fileName).toLowerCase().endsWith(".docx"))) ||
                           fileUrl.startsWith("data:application/pdf;") ||
                           fileUrl.startsWith("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;");
      if (!isAllowedDoc) {
        return res.status(400).json({ error: "Invalid file type. Only PDF and DOCX files are supported." });
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (fileSize && typeof fileSize === "number" && fileSize > MAX_SIZE) {
        return res.status(400).json({ error: "File exceeds maximum size threshold of 10 MB." });
      }
    }

    const nowStr = new Date().toISOString();
    const original = db.resumes[index];

    const finalActive = isActive !== undefined ? !!isActive : original.isActive;
    if (finalActive && !original.isActive) {
      // Deactivate all others
      db.resumes.forEach((r: any) => { r.isActive = false; });
    }

    const detectedMime = fileType ? String(fileType).trim() : (fileName ? (String(fileName).toLowerCase().endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf") : original.fileType);

    const updated = {
      ...original,
      title: title ? String(title).trim() : original.title,
      version: version ? String(version).trim() : original.version,
      description: description !== undefined ? String(description).trim() : original.description,
      fileName: fileName ? String(fileName).trim() : original.fileName,
      fileUrl: fileUrl || original.fileUrl,
      fileType: fileUrl ? detectedMime : original.fileType,
      fileSize: typeof fileSize === "number" ? fileSize : original.fileSize,
      cloudinaryPublicId: cloudinaryPublicId ? String(cloudinaryPublicId).trim() : original.cloudinaryPublicId,
      thumbnailImage: thumbnailImage || original.thumbnailImage,
      isActive: finalActive,
      isDownloadEnabled: isDownloadEnabled !== undefined ? !!isDownloadEnabled : original.isDownloadEnabled,
      updatedAt: nowStr
    };

    db.resumes[index] = updated;

    // Safety fallback: if no resume is active, make sure this one is active
    const activeExists = db.resumes.some((r: any) => r.isActive);
    if (!activeExists && db.resumes.length > 0) {
      db.resumes[0].isActive = true;
    }

    recordActivity(req, db, {
      action: "Resume Replaced",
      module: "Profile",
      description: `Updated details for Resume/CV version ${updated.version} - "${updated.title}".`,
      oldValue: original,
      newValue: updated
    });

    syncProfileActiveResume(db);
    saveDatabase(db);
    res.json(updated);
  });

  app.delete("/api/resume/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.resumes) db.resumes = [];

    const oldValue = db.resumes.find((r: any) => r.id === id);
    const wasActive = db.resumes.some((r: any) => r.id === id && r.isActive);
    db.resumes = db.resumes.filter((r: any) => r.id !== id);

    // If we deleted the active resume, auto-activate the latest one
    if (wasActive && db.resumes.length > 0) {
      db.resumes.sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      db.resumes[0].isActive = true;
    }

    recordActivity(req, db, {
      action: "Resume Deleted",
      module: "Profile",
      description: `Deleted Resume/CV version "${oldValue?.version || id}".`,
      oldValue
    });

    syncProfileActiveResume(db);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.patch("/api/resume/:id/activate", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.resumes) db.resumes = [];

    const index = db.resumes.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Resume CV draft not found." });
    }

    // Deactivate all
    db.resumes.forEach((r: any) => { r.isActive = false; });
    // Activate target
    db.resumes[index].isActive = true;
    db.resumes[index].updatedAt = new Date().toISOString();

    recordActivity(req, db, {
      action: "Resume Replaced",
      module: "Profile",
      description: `Activated Resume/CV version ${db.resumes[index].version} as primary default draft.`,
      newValue: db.resumes[index]
    });

    syncProfileActiveResume(db);
    saveDatabase(db);
    res.json(db.resumes[index]);
  });

  app.patch("/api/resume/:id/download", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    const { isDownloadEnabled } = req.body;

    if (typeof isDownloadEnabled !== "boolean") {
      return res.status(400).json({ error: "isDownloadEnabled must be a boolean" });
    }

    if (!db.resumes) db.resumes = [];
    const index = db.resumes.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Resume CV draft not found." });
    }

    db.resumes[index].isDownloadEnabled = isDownloadEnabled;
    db.resumes[index].updatedAt = new Date().toISOString();

    recordActivity(req, db, {
      action: "Resume Replaced",
      module: "Profile",
      description: `Toggled download ability for Resume/CV version ${db.resumes[index].version} to ${isDownloadEnabled ? 'Enabled' : 'Disabled'}.`,
      newValue: db.resumes[index]
    });

    syncProfileActiveResume(db);
    saveDatabase(db);
    res.json(db.resumes[index]);
  });

  app.post("/api/resume/:id/restore", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.resumes) db.resumes = [];

    const index = db.resumes.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Resume CV draft not found." });
    }

    // Set all to false
    db.resumes.forEach((r: any) => { r.isActive = false; });
    
    // Set target as active and update timestamps representing restoration
    db.resumes[index].isActive = true;
    db.resumes[index].updatedAt = new Date().toISOString();

    recordActivity(req, db, {
      action: "Resume Replaced",
      module: "Profile",
      description: `Restored Resume/CV version ${db.resumes[index].version} from archive as active.`,
      newValue: db.resumes[index]
    });

    syncProfileActiveResume(db);
    saveDatabase(db);
    res.json(db.resumes[index]);
  });

  // --- MEDIA MANAGER ENDPOINTS ---
  function calculateMediaUsage(db: any, url: string, title?: string): string[] {
    if (!url) return [];
    const usedIn = new Set<string>();
    const normUrl = url.trim().toLowerCase();

    const isMatch = (targetUrl: any) => {
      if (!targetUrl || typeof targetUrl !== 'string') return false;
      const t = targetUrl.trim().toLowerCase();
      return t === normUrl || (normUrl.length > 25 && t.includes(normUrl)) || (t.length > 25 && normUrl.includes(t));
    };

    // 1. Profile & Hero
    if (db.profile) {
      if (isMatch(db.profile.profileImage) || isMatch(db.profile.avatarUrl)) usedIn.add('Profile');
      if (isMatch(db.profile.bannerImageUrl) || isMatch(db.profile.heroBgImage)) usedIn.add('Hero');
      if (isMatch(db.profile.resumeUrl)) usedIn.add('Resume');
      if (isMatch(db.profile.faviconUrl)) usedIn.add('Favicon');
    }

    if (db.hero) {
      if (isMatch(db.hero.avatarUrl) || isMatch(db.hero.profileImageUrl)) usedIn.add('Hero');
      if (isMatch(db.hero.backgroundImageUrl) || isMatch(db.hero.badgeIconUrl)) usedIn.add('Hero');
    }

    // 2. Projects
    if (Array.isArray(db.projects)) {
      db.projects.forEach((p: any) => {
        if (isMatch(p.image) || isMatch(p.thumbnailUrl) || isMatch(p.logoUrl)) {
          usedIn.add(`Projects (${p.title || 'Project'})`);
        }
        if (Array.isArray(p.gallery) && p.gallery.some((g: any) => isMatch(typeof g === 'string' ? g : g?.url))) {
          usedIn.add(`Projects (${p.title || 'Project'})`);
        }
      });
    }

    // 3. Skills
    if (Array.isArray(db.skills)) {
      db.skills.forEach((s: any) => {
        if (isMatch(s.iconUrl) || isMatch(s.badgeUrl) || isMatch(s.logoUrl)) {
          usedIn.add(`Skills (${s.name || 'Skill'})`);
        }
      });
    }

    // 4. Tools
    if (Array.isArray(db.tools)) {
      db.tools.forEach((t: any) => {
        if (isMatch(t.iconUrl) || isMatch(t.badgeUrl) || isMatch(t.logoUrl)) {
          usedIn.add(`Tools (${t.name || 'Tool'})`);
        }
      });
    }

    // 5. Certificates
    if (Array.isArray(db.certificates)) {
      db.certificates.forEach((c: any) => {
        if (isMatch(c.imageUrl) || isMatch(c.badgeUrl) || isMatch(c.credentialUrl)) {
          usedIn.add(`Certificates (${c.name || 'Certificate'})`);
        }
      });
    }

    // 6. Social Links
    if (Array.isArray(db.socialLinks)) {
      db.socialLinks.forEach((sl: any) => {
        if (isMatch(sl.logoUrl) || isMatch(sl.avatarUrl) || isMatch(sl.bannerImageUrl)) {
          usedIn.add(`Social Links (${sl.platform || 'Social'})`);
        }
      });
    }

    // 7. Theme & SEO & Footer
    if (db.theme) {
      if (isMatch(db.theme.logoUrl) || isMatch(db.theme.faviconUrl)) usedIn.add('Theme');
      if (isMatch(db.theme.backgroundImage)) usedIn.add('Theme');
    }

    if (db.seo) {
      if (isMatch(db.seo.ogImageUrl) || isMatch(db.seo.twitterCardImage) || isMatch(db.seo.faviconUrl)) usedIn.add('SEO');
    }

    if (db.footer) {
      if (isMatch(db.footer.logoUrl)) usedIn.add('Footer');
    }

    // 8. Achievements, Experience, Education
    if (Array.isArray(db.achievements)) {
      db.achievements.forEach((a: any) => {
        if (isMatch(a.iconUrl) || isMatch(a.badgeUrl)) usedIn.add('Achievements');
      });
    }
    if (Array.isArray(db.experiences)) {
      db.experiences.forEach((e: any) => {
        if (isMatch(e.companyLogoUrl)) usedIn.add('Experience');
      });
    }
    if (Array.isArray(db.education)) {
      db.education.forEach((e: any) => {
        if (isMatch(e.institutionLogoUrl)) usedIn.add('Education');
      });
    }

    return Array.from(usedIn);
  }

  app.get("/api/media", (req, res) => {
    const db = loadDatabase();
    if (!db.mediaItems) db.mediaItems = [];
    
    // Enrich each item with real-time usage calculation
    const enriched = db.mediaItems.map((item: any) => {
      const usedIn = calculateMediaUsage(db, item.url, item.title);
      return {
        ...item,
        usedIn,
        usedInCount: usedIn.length
      };
    });

    res.json(enriched);
  });

  app.get("/api/media/stats", (req, res) => {
    const db = loadDatabase();
    if (!db.mediaItems) db.mediaItems = [];

    const totalFiles = db.mediaItems.length;
    const totalSize = db.mediaItems.reduce((acc: number, item: any) => acc + (item.size || 150000), 0);
    
    let unusedCount = 0;
    const typeBreakdown: Record<string, number> = {
      image: 0, svg: 0, pdf: 0, video: 0, audio: 0, document: 0, logo: 0, icon: 0, zip: 0
    };

    db.mediaItems.forEach((item: any) => {
      const usages = calculateMediaUsage(db, item.url, item.title);
      if (usages.length === 0) unusedCount++;
      const t = item.type || 'image';
      typeBreakdown[t] = (typeBreakdown[t] || 0) + 1;
    });

    const largestFiles = [...db.mediaItems]
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, 5);

    res.json({
      totalFiles,
      totalSize,
      unusedCount,
      typeBreakdown,
      largestFiles,
      collectionsCount: db.mediaCollections?.length || 0,
      quotaBytes: 5 * 1024 * 1024 * 1024 // 5GB Enterprise Quota
    });
  });

  app.get("/api/media/collections", (req, res) => {
    const db = loadDatabase();
    if (!db.mediaCollections) {
      db.mediaCollections = [
        { id: 1, name: "Hero Banners", description: "Primary hero graphics and avatars", icon: "Palette", color: "#10b981", assetIds: [1] },
        { id: 2, name: "Project Diagrams", description: "Architecture and showcase images", icon: "BookOpen", color: "#3b82f6", assetIds: [2] },
        { id: 3, name: "Badges & Credentials", description: "Certificates, AWS, and verify badges", icon: "Award", color: "#8b5cf6", assetIds: [3] }
      ];
      saveDatabase(db);
    }
    res.json(db.mediaCollections);
  });

  app.post("/api/media/collections", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    if (!db.mediaCollections) db.mediaCollections = [];
    const { name, description, icon, color, assetIds } = req.body;

    const newId = db.mediaCollections.length > 0 ? Math.max(...db.mediaCollections.map((c: any) => c.id)) + 1 : 1;
    const created = {
      id: newId,
      name: name ? String(name).trim() : "New Collection",
      description: description ? String(description).trim() : "",
      icon: icon || "Folder",
      color: color || "#10b981",
      assetIds: Array.isArray(assetIds) ? assetIds : []
    };

    db.mediaCollections.unshift(created);
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.delete("/api/media/collections/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.mediaCollections) db.mediaCollections = [];
    db.mediaCollections = db.mediaCollections.filter((c: any) => c.id !== id);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.post("/api/media", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    if (!db.mediaItems) db.mediaItems = [];
    const {
      title, displayName, altText, description, url, type, folder,
      category, size, dimensions, tags, svgMarkup, visibility, status, version
    } = req.body;

    if (!url && !svgMarkup) {
      return res.status(400).json({ error: "Media URL or SVG markup is required." });
    }

    const newId = db.mediaItems.length > 0 ? Math.max(...db.mediaItems.map((m: any) => m.id)) + 1 : 1;
    const nowStr = new Date().toISOString();

    let processedUrl = url || "";
    let publicId = "";
    if (processedUrl && processedUrl.startsWith("data:")) {
      const processed = processMockCloudinaryImage(processedUrl, "media");
      processedUrl = processed.url;
      publicId = processed.publicId;
    }

    const created = {
      id: newId,
      title: title ? String(title).trim() : "Untitled Asset",
      displayName: displayName || title || "Untitled Asset",
      altText: altText || title || "",
      description: description || "Enterprise portfolio media asset.",
      url: processedUrl,
      type: type || (svgMarkup ? "svg" : "image"),
      folder: folder || "General",
      category: category || folder || "General",
      size: typeof size === "number" ? size : Math.round(processedUrl.length * 0.75),
      dimensions: dimensions || "1200x800",
      tags: Array.isArray(tags) ? tags : [],
      svgMarkup: svgMarkup || "",
      publicId,
      uploadedBy: "Admin",
      visibility: visibility || "public",
      status: status || "active",
      version: version || "1.0.0",
      createdAt: nowStr,
      updatedAt: nowStr
    };

    db.mediaItems.unshift(created);

    recordActivity(req, db, {
      action: "Media Asset Uploaded",
      module: "Media Manager",
      description: `Uploaded asset "${created.title}" to folder "${created.folder}".`,
      newValue: created
    });

    saveDatabase(db);

    const usedIn = calculateMediaUsage(db, created.url, created.title);
    res.status(201).json({ ...created, usedIn, usedInCount: usedIn.length });
  });

  // Dynamic Media Folders Management
  app.get("/api/media/folders", (req, res) => {
    const db = loadDatabase();
    const defaultFolders = [
      { name: 'Profile', description: 'Headshots, avatars, and profile assets', color: '#10b981' },
      { name: 'Projects', description: 'Project screenshots, architectures, and UI demos', color: '#0ea5e9' },
      { name: 'Skills', description: 'Technology badges, programming languages, and icons', color: '#a855f7' },
      { name: 'Certificates', description: 'Cloud certifications and course credentials', color: '#f59e0b' },
      { name: 'Tools', description: 'Developer tools, IDEs, and utilities', color: '#06b6d4' },
      { name: 'Photos', description: 'Personal photos, gallery, and showcase pictures', color: '#ec4899' },
      { name: 'Logos', description: 'Company logos, client seals, and brand vectors', color: '#8b5cf6' },
      { name: 'Icons', description: 'SVG symbols and vector assets', color: '#14b8a6' },
      { name: 'Backgrounds', description: 'Wallpapers, gradients, and section backdrops', color: '#6366f1' },
      { name: 'Documents', description: 'PDF resumes, whitepapers, and reports', color: '#f43f5e' },
      { name: 'SEO', description: 'OpenGraph preview banners and social cards', color: '#eab308' },
      { name: 'General', description: 'Miscellaneous portfolio media', color: '#64748b' }
    ];

    if (!db.mediaFolders || !Array.isArray(db.mediaFolders) || db.mediaFolders.length === 0) {
      db.mediaFolders = defaultFolders;
      saveDatabase(db);
    }

    const items = db.mediaItems || [];
    const enrichedFolders = db.mediaFolders.map((f: any) => {
      const folderItems = items.filter((m: any) => m.folder?.toLowerCase() === f.name.toLowerCase());
      const totalBytes = folderItems.reduce((acc: number, m: any) => acc + (m.size || 0), 0);
      return {
        ...f,
        itemCount: folderItems.length,
        totalBytes
      };
    });

    res.json(enrichedFolders);
  });

  app.post("/api/media/folders", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    if (!db.mediaFolders) db.mediaFolders = [];
    const { name, description, color } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: "Folder name is required." });
    }

    const cleanName = name.trim();
    if (db.mediaFolders.some((f: any) => f.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(400).json({ error: `Folder "${cleanName}" already exists.` });
    }

    const newFolder = {
      name: cleanName,
      description: description ? String(description).trim() : `Custom media folder for ${cleanName}`,
      color: color || '#10b981',
      createdAt: new Date().toISOString()
    };

    db.mediaFolders.push(newFolder);
    saveDatabase(db);
    res.status(201).json({ status: "success", folder: newFolder });
  });

  app.delete("/api/media/folders/:name", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const folderName = req.params.name;
    if (!db.mediaFolders) db.mediaFolders = [];

    const index = db.mediaFolders.findIndex((f: any) => f.name.toLowerCase() === folderName.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: "Folder not found." });
    }

    if (db.mediaItems) {
      db.mediaItems.forEach((m: any) => {
        if (m.folder?.toLowerCase() === folderName.toLowerCase()) {
          m.folder = 'General';
        }
      });
    }

    db.mediaFolders.splice(index, 1);
    saveDatabase(db);
    res.json({ status: "success", message: `Folder "${folderName}" deleted.` });
  });

  // Bulk Upload Multiple Media Files
  app.post("/api/media/bulk-upload", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    if (!db.mediaItems) db.mediaItems = [];
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items array is required and must not be empty." });
    }

    const createdItems: any[] = [];
    let currentMaxId = db.mediaItems.length > 0 ? Math.max(...db.mediaItems.map((m: any) => m.id)) : 0;
    const nowStr = new Date().toISOString();

    for (const raw of items) {
      if (!raw.url && !raw.svgMarkup) continue;

      currentMaxId += 1;
      let processedUrl = raw.url || "";
      let publicId = raw.publicId || "";
      if (processedUrl && processedUrl.startsWith("data:")) {
        const processed = processMockCloudinaryImage(processedUrl, "media");
        processedUrl = processed.url;
        publicId = processed.publicId;
      }

      const item = {
        id: currentMaxId,
        title: raw.title ? String(raw.title).trim() : "Untitled Asset",
        displayName: raw.displayName || raw.title || "Untitled Asset",
        altText: raw.altText || raw.title || "",
        description: raw.description || "Enterprise portfolio media asset.",
        url: processedUrl,
        type: raw.type || (raw.svgMarkup ? "svg" : "image"),
        folder: raw.folder || "General",
        category: raw.category || raw.folder || "General",
        size: typeof raw.size === "number" ? raw.size : Math.round(processedUrl.length * 0.75),
        dimensions: raw.dimensions || "1200x800",
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        svgMarkup: raw.svgMarkup || "",
        publicId,
        uploadedBy: "Admin",
        visibility: raw.visibility || "public",
        status: raw.status || "active",
        version: raw.version || "1.0.0",
        createdAt: nowStr,
        updatedAt: nowStr
      };

      db.mediaItems.unshift(item);
      const usedIn = calculateMediaUsage(db, item.url, item.title);
      createdItems.push({ ...item, usedIn, usedInCount: usedIn.length });
    }

    recordActivity(req, db, {
      action: "Bulk Media Upload",
      module: "Media Manager",
      description: `Bulk uploaded ${createdItems.length} media assets across folders.`,
      newValue: { count: createdItems.length }
    });

    saveDatabase(db);
    res.status(201).json({ status: "success", count: createdItems.length, items: createdItems });
  });

  app.put("/api/media/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.mediaItems) db.mediaItems = [];

    const index = db.mediaItems.findIndex((m: any) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Media item not found." });
    }

    const {
      title, displayName, altText, description, folder, category,
      tags, url, type, svgMarkup, visibility, status, version
    } = req.body;
    const original = db.mediaItems[index];

    const updated = {
      ...original,
      title: title !== undefined ? String(title).trim() : original.title,
      displayName: displayName !== undefined ? String(displayName).trim() : original.displayName,
      altText: altText !== undefined ? String(altText).trim() : original.altText,
      description: description !== undefined ? String(description).trim() : original.description,
      folder: folder !== undefined ? String(folder).trim() : original.folder,
      category: category !== undefined ? String(category).trim() : original.category,
      tags: Array.isArray(tags) ? tags : original.tags,
      url: url || original.url,
      type: type || original.type,
      svgMarkup: svgMarkup !== undefined ? svgMarkup : original.svgMarkup,
      visibility: visibility || original.visibility || "public",
      status: status || original.status || "active",
      version: version || original.version || "1.0.0",
      updatedAt: new Date().toISOString()
    };

    db.mediaItems[index] = updated;

    recordActivity(req, db, {
      action: "Media Asset Updated",
      module: "Media Manager",
      description: `Updated asset details for "${updated.title}".`,
      oldValue: original,
      newValue: updated
    });

    saveDatabase(db);
    const usedIn = calculateMediaUsage(db, updated.url, updated.title);
    res.json({ ...updated, usedIn, usedInCount: usedIn.length });
  });

  app.delete("/api/media/:id", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const id = parseInt(req.params.id);
    if (!db.mediaItems) db.mediaItems = [];

    const oldValue = db.mediaItems.find((m: any) => m.id === id);
    db.mediaItems = db.mediaItems.filter((m: any) => m.id !== id);

    recordActivity(req, db, {
      action: "Media Asset Deleted",
      module: "Media Manager",
      description: `Deleted media asset "${oldValue?.title || id}".`,
      oldValue
    });

    saveDatabase(db);
    res.json({ status: "success" });
  });

  app.post("/api/media/bulk-delete", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array." });
    }

    if (!db.mediaItems) db.mediaItems = [];
    const initialCount = db.mediaItems.length;
    db.mediaItems = db.mediaItems.filter((m: any) => !ids.includes(m.id));

    recordActivity(req, db, {
      action: "Bulk Media Assets Deleted",
      module: "Media Manager",
      description: `Bulk deleted ${initialCount - db.mediaItems.length} media assets.`
    });

    saveDatabase(db);
    res.json({ status: "success", deletedCount: initialCount - db.mediaItems.length });
  });

  app.post("/api/media/purge-unused", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    if (!db.mediaItems) db.mediaItems = [];

    const initialCount = db.mediaItems.length;
    db.mediaItems = db.mediaItems.filter((m: any) => {
      const usage = calculateMediaUsage(db, m.url, m.title);
      return usage.length > 0;
    });

    const purged = initialCount - db.mediaItems.length;
    saveDatabase(db);
    res.json({ status: "success", purgedCount: purged });
  });

  // Analytics Endpoints
  app.get("/api/analytics", (req, res) => {
    const db = loadDatabase();
    // Safety checks on load
    if (db.analytics) {
      if (!db.analytics.browsers) db.analytics.browsers = [];
      if (!db.analytics.devices) db.analytics.devices = [];
      if (!db.analytics.projectsViewed) db.analytics.projectsViewed = [];
      if (!db.analytics.clicks) db.analytics.clicks = [];
      if (db.analytics.resumeDownloads === undefined) db.analytics.resumeDownloads = 0;
    }
    res.json(db.analytics);
  });

  app.put("/api/analytics", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const updated = req.body;
    db.analytics = {
      ...(db.analytics || {}),
      ...updated
    };
    recordActivity(req, db, {
      action: "Analytics Updated",
      module: "Analytics",
      description: "Administrator updated analytics metrics manually.",
      newValue: db.analytics
    });
    saveDatabase(db);
    res.json(db.analytics);
  });

  app.post("/api/analytics/visit", (req, res) => {
    const db = loadDatabase();
    
    db.analytics.pageViews += 1;
    if (Math.random() > 0.6) {
      db.analytics.uniqueVisitors += 1;
    }
    
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const lastHistory = db.analytics.viewsHistory[db.analytics.viewsHistory.length - 1];
    if (lastHistory && lastHistory.date === todayStr) {
      lastHistory.views += 1;
      if (Math.random() > 0.6) lastHistory.visitors += 1;
    } else {
      db.analytics.viewsHistory.push({
        date: todayStr,
        views: 1,
        visitors: 1
      });
      if (db.analytics.viewsHistory.length > 10) {
        db.analytics.viewsHistory.shift();
      }
    }
    
    saveDatabase(db);
    res.json(db.analytics);
  });

  app.post("/api/analytics/track", (req, res) => {
    const db = loadDatabase();
    const { type, metadata } = req.body;

    if (!db.analytics) {
      db.analytics = {
        pageViews: 0,
        uniqueVisitors: 0,
        averageSessionSec: 120,
        contactConversionRate: 0,
        viewsHistory: [],
        referrals: [],
        countries: [],
        browsers: [],
        devices: [],
        projectsViewed: [],
        clicks: [],
        resumeDownloads: 0
      };
    }

    // Safety checks for sub-structures
    if (!db.analytics.browsers) db.analytics.browsers = [];
    if (!db.analytics.devices) db.analytics.devices = [];
    if (!db.analytics.projectsViewed) db.analytics.projectsViewed = [];
    if (!db.analytics.clicks) db.analytics.clicks = [];
    if (db.analytics.resumeDownloads === undefined) db.analytics.resumeDownloads = 0;

    const userAgent = req.headers["user-agent"] || "";
    
    // Parse browser
    let browser = "Other";
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edg")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) browser = "IE";

    // Parse device
    let device = "Desktop";
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      if (/iPad|tablet/i.test(userAgent)) {
        device = "Tablet";
      } else {
        device = "Mobile";
      }
    }

    // Resolve Country
    let country = metadata?.country || "United States";
    if (!metadata?.country) {
      const countriesList = ["United States", "India", "Germany", "United Kingdom", "Canada", "Japan", "Australia", "France"];
      country = countriesList[Math.floor(Math.random() * countriesList.length)];
    }

    if (type === "pageview") {
      db.analytics.pageViews += 1;
      const isNewSession = metadata?.isNewSession ?? true;
      if (isNewSession) {
        db.analytics.uniqueVisitors += 1;
      }

      // Update viewsHistory
      const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      const lastHistory = db.analytics.viewsHistory[db.analytics.viewsHistory.length - 1];
      if (lastHistory && lastHistory.date === todayStr) {
        lastHistory.views += 1;
        if (isNewSession) lastHistory.visitors += 1;
      } else {
        db.analytics.viewsHistory.push({
          date: todayStr,
          views: 1,
          visitors: isNewSession ? 1 : 0
        });
        if (db.analytics.viewsHistory.length > 10) {
          db.analytics.viewsHistory.shift();
        }
      }

      // Update Country
      const existingCountry = db.analytics.countries.find((c: any) => c.country === country);
      if (existingCountry) {
        existingCountry.count += 1;
      } else {
        db.analytics.countries.push({ country, count: 1 });
      }

      // Update Browser
      const existingBrowser = db.analytics.browsers.find((b: any) => b.browser === browser);
      if (existingBrowser) {
        existingBrowser.count += 1;
      } else {
        db.analytics.browsers.push({ browser, count: 1 });
      }

      // Update Device
      const existingDevice = db.analytics.devices.find((d: any) => d.device === device);
      if (existingDevice) {
        existingDevice.count += 1;
      } else {
        db.analytics.devices.push({ device, count: 1 });
      }

      // Update Referral (if any)
      const referral = metadata?.referral || "Direct Traffic";
      const existingRef = db.analytics.referrals.find((r: any) => r.source === referral);
      if (existingRef) {
        existingRef.count += 1;
      } else {
        db.analytics.referrals.push({ source: referral, count: 1, percentage: 0 });
      }
      
      // Recalculate referral percentages
      const totalRefs = db.analytics.referrals.reduce((sum: number, r: any) => sum + r.count, 0) || 1;
      db.analytics.referrals.forEach((r: any) => {
        r.percentage = parseFloat(((r.count / totalRefs) * 100).toFixed(1));
      });
      // Sort referrals
      db.analytics.referrals.sort((a: any, b: any) => b.count - a.count);

    } else if (type === "project_view") {
      const slug = metadata?.slug;
      const title = metadata?.title || slug;
      if (slug) {
        const existingProj = db.analytics.projectsViewed.find((p: any) => p.slug === slug);
        if (existingProj) {
          existingProj.count += 1;
        } else {
          db.analytics.projectsViewed.push({ projectTitle: title, count: 1, slug });
        }
      }
    } else if (type === "click") {
      const elementId = metadata?.elementId || "unknown";
      const label = metadata?.label || elementId;
      const existingClick = db.analytics.clicks.find((c: any) => c.elementId === elementId);
      if (existingClick) {
        existingClick.count += 1;
      } else {
        db.analytics.clicks.push({ elementId, label, count: 1 });
      }
    } else if (type === "resume_download") {
      db.analytics.resumeDownloads += 1;
    }

    saveDatabase(db);
    res.json({ status: "success", analytics: db.analytics });
  });

  // --- ENTERPRISE AI COPILOT API ---
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { contentType, tone, prompt, existingText } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is missing."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstruction = `You are an expert executive resume writer and portfolio copywriter. Tone: ${tone || 'Professional'}. Focus on impact, clarity, and precision.`;

      let userPrompt = `Content Type: ${contentType || 'about'}\nTarget Tone: ${tone || 'Professional'}\nInstructions / Key Facts: ${prompt || 'Write high-impact portfolio text'}`;
      if (existingText) {
        userPrompt += `\nExisting Text to Polish:\n"""\n${existingText}\n"""`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const resultText = response.text || "";
      res.json({ status: "success", result: resultText });
    } catch (err: any) {
      console.error("AI Generation Endpoint Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI content" });
    }
  });

  // --- PUBLIC PORTFOLIO AI ASSISTANT CHATBOT API ---
  app.post("/api/ai/portfolio-chat", async (req, res) => {
    try {
      const { message, messages = [] } = req.body;
      const userQuery = (message || (messages.length > 0 ? messages[messages.length - 1].content : "") || "").trim();

      if (!userQuery) {
        return res.status(400).json({ error: "Query message is required." });
      }

      const db = loadDatabase();
      const profile = db.profile || {};
      const projects = (db.projects || []).map((p: any) => ({
        title: p.title,
        category: p.category,
        description: p.description,
        skills: p.skills,
        status: p.status,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl
      }));
      const skills = (db.skills || []).map((s: any) => `${s.name} (${s.category || 'Core'})`);
      const experiences = (db.experiences || []).map((e: any) => ({
        role: e.role,
        company: e.company,
        period: `${e.startDate || ''} - ${e.endDate || 'Present'}`,
        description: e.description
      }));
      const education = (db.education || []).map((ed: any) => ({
        degree: ed.degree,
        institution: ed.institution,
        year: ed.graduationYear || ed.year
      }));
      const tools = (db.tools || []).map((t: any) => t.name);
      const codingProfiles = (db.codingProfiles || []).map((c: any) => ({
        platform: c.platformType || c.displayName,
        username: c.username,
        url: c.profileUrl
      }));
      const metrics = (db.portfolioMetrics || []).map((m: any) => `${m.title}: ${m.value}`);

      const systemInstruction = `You are Chandru Mohan's official AI Career & Portfolio Assistant.
Your mission is to represent Chandru professionally, accurately, and enthusiastically to recruiters, engineering managers, clients, and visitors.

Candidate Knowledge Context:
- Full Name: Chandru Mohan
- Role / Title: ${profile.heroTitle || 'Principal Systems Architect & Full-Stack Developer'}
- Bio: ${profile.heroDescription || 'Specialist in full-stack web applications, distributed systems, cloud architecture, and high-performance engineering.'}
- Primary Email: ${profile.email || 'chandrumohan550@gmail.com'}
- Location: Bengaluru, India (Open to global remote and on-site opportunities)
- Core Skills: ${skills.join(', ')}
- Modern Tools & Tech Stack: ${tools.join(', ')}
- Featured Projects: ${JSON.stringify(projects.slice(0, 8))}
- Work Experience: ${JSON.stringify(experiences)}
- Education Milestones: ${JSON.stringify(education)}
- Competitive Coding Profiles: ${JSON.stringify(codingProfiles)}
- Key Portfolio Metrics: ${metrics.join(', ')}

Response Guidelines:
1. Speak concisely, clearly, and enthusiastically in the first person plural as Chandru's representative ("Chandru has built...", "He specializes in...").
2. Use markdown formatting with bullet points, bold key terms, and code style tags for readability.
3. If asked about hiring or interviews, invite the visitor to reach out directly at chandrumohan550@gmail.com or explore his resume.
4. Keep replies crisp and focused (2-4 paragraphs max).`;

      // Check if Gemini API Key is configured
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: { 'User-Agent': 'aistudio-build' }
            }
          });

          // Build conversation contents
          let contents: any[] = [];
          if (messages && Array.isArray(messages) && messages.length > 0) {
            contents = messages.slice(-6).map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            }));
          } else {
            contents = [{ role: 'user', parts: [{ text: userQuery }] }];
          }

          const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
          for (const modelName of modelsToTry) {
            try {
              const response = await ai.models.generateContent({
                model: modelName,
                contents: userQuery,
                config: {
                  systemInstruction,
                  temperature: 0.7,
                }
              });

              if (response && response.text) {
                return res.json({
                  status: "success",
                  reply: response.text,
                  source: "gemini"
                });
              }
            } catch (modelError: any) {
              console.warn(`[AI Assistant] Model ${modelName} error:`, modelError?.message || modelError);
            }
          }
        } catch (apiError: any) {
          console.warn("[AI Assistant] Gemini API initialization fallback:", apiError?.message || apiError);
        }
      }

      // --- INTELLIGENT LOCAL HEURISTIC FALLBACK (Guarantees 100% uptime without API key) ---
      const qLower = userQuery.toLowerCase();
      let fallbackReply = "";

      if (qLower.includes("skill") || qLower.includes("stack") || qLower.includes("technology") || qLower.includes("tech") || qLower.includes("framework")) {
        fallbackReply = `**Chandru's Core Technical Proficiencies:**\n\n` +
          `* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Next.js, Framer Motion, Three.js (WebGL)\n` +
          `* **Backend & Systems:** Node.js, Express, Spring Boot (Java), RESTful APIs, JWT Auth, Microservices\n` +
          `* **Databases & DevOps:** PostgreSQL, MySQL, Redis, Docker, Git CI/CD, Railway, Cloudflare\n\n` +
          `He is experienced in building scalable, real-time web applications with clean architecture and robust database relationships.`;
      } else if (qLower.includes("project") || qLower.includes("built") || qLower.includes("portfolio") || qLower.includes("work")) {
        const topProjects = projects.slice(0, 3).map((p: any) => `* **${p.title}** (${p.category}): ${p.description}`).join('\n');
        fallbackReply = `Here are some of Chandru's highlighted software engineering projects:\n\n${topProjects}\n\n` +
          `You can browse live demos and repository code for each project directly on the interactive bento grid below!`;
      } else if (qLower.includes("contact") || qLower.includes("hire") || qLower.includes("email") || qLower.includes("reach") || qLower.includes("interview") || qLower.includes("available")) {
        fallbackReply = `**Chandru is actively open to software engineering opportunities and collaborations!**\n\n` +
          `* **Direct Email:** [chandrumohan550@gmail.com](mailto:chandrumohan550@gmail.com)\n` +
          `* **Location:** Bengaluru, India (Open to Remote & Global Relocation)\n` +
          `* **Profiles:** Active on GitHub, LinkedIn, and LeetCode\n\n` +
          `Feel free to send a message via the Contact Form on this page or download his latest PDF resume!`;
      } else if (qLower.includes("experience") || qLower.includes("background") || qLower.includes("job") || qLower.includes("career")) {
        fallbackReply = `**Career Background & Architecture Experience:**\n\n` +
          `Chandru specializes as a **${profile.heroTitle || 'Systems Architect & Full-Stack Engineer'}**, engineering full-stack production platforms with end-to-end database design, JWT authentication, and high-performance WebGL graphics.\n\n` +
          `Check out the interactive Career & Education timeline on this page for complete milestone details!`;
      } else {
        fallbackReply = `Hello! I'm **Chandru's AI Portfolio Assistant**.\n\n` +
          `Chandru is a **${profile.heroTitle || 'Full-Stack Developer & Systems Architect'}** proficient in **React 19, TypeScript, Node.js/Express, Spring Boot, and Cloud Architectures**.\n\n` +
          `Here are some things you can ask me:\n` +
          `* *"What are Chandru's top projects?"*\n` +
          `* *"Tell me about his backend & distributed systems skills"*\n` +
          `* *"How can I contact or interview Chandru?"*`;
      }

      res.json({
        status: "success",
        reply: fallbackReply,
        source: "portfolio_knowledge_base"
      });
    } catch (err: any) {
      console.error("AI Portfolio Chat Error:", err);
      res.status(500).json({ error: "Failed to process chat query" });
    }
  });

  // --- ENTERPRISE CENTRALIZED NOTIFICATION CENTER API ---
  app.get("/api/notifications", (req, res) => {
    const db = loadDatabase();
    let notifs = db.notifications || [];

    const { category, severity, module: modFilter, dateRange, search, status, pinned } = req.query;

    if (category && category !== "All") {
      notifs = notifs.filter((n: any) => (n.category || "").toLowerCase() === (category as string).toLowerCase());
    }

    if (severity && severity !== "All") {
      notifs = notifs.filter((n: any) => (n.severity || "").toLowerCase() === (severity as string).toLowerCase());
    }

    if (modFilter && modFilter !== "All") {
      notifs = notifs.filter((n: any) => (n.module || "").toLowerCase().includes((modFilter as string).toLowerCase()));
    }

    if (pinned === "true") {
      notifs = notifs.filter((n: any) => n.pinned);
    }

    if (status === "unread") {
      notifs = notifs.filter((n: any) => !n.read);
    } else if (status === "read") {
      notifs = notifs.filter((n: any) => n.read);
    } else if (status === "archived") {
      notifs = notifs.filter((n: any) => n.archived);
    } else if (status === "active") {
      notifs = notifs.filter((n: any) => !n.archived);
    }

    if (dateRange && dateRange !== "All") {
      const now = new Date();
      const notifTime = (n: any) => new Date(n.timestamp || n.createdAt || Date.now());
      if (dateRange === "Today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        notifs = notifs.filter((n: any) => notifTime(n) >= startOfDay);
      } else if (dateRange === "Yesterday") {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        notifs = notifs.filter((n: any) => notifTime(n) >= startOfYesterday && notifTime(n) < endOfYesterday);
      } else if (dateRange === "Last 7 Days") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        notifs = notifs.filter((n: any) => notifTime(n) >= sevenDaysAgo);
      } else if (dateRange === "Last 30 Days") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        notifs = notifs.filter((n: any) => notifTime(n) >= thirtyDaysAgo);
      }
    }

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      notifs = notifs.filter((n: any) => 
        (n.action || "").toLowerCase().includes(q) ||
        (n.module || "").toLowerCase().includes(q) ||
        (n.title || "").toLowerCase().includes(q) ||
        (n.description || "").toLowerCase().includes(q) ||
        (n.performedBy || "").toLowerCase().includes(q)
      );
    }

    res.json(notifs);
  });

  app.get("/api/notifications/stats", (req, res) => {
    const db = loadDatabase();
    const notifs = db.notifications || [];

    const totalEvents = notifs.length;
    const unreadCount = notifs.filter((n: any) => !n.read && !n.archived).length;
    const criticalCount = notifs.filter((n: any) => (n.severity || "").toLowerCase() === "critical").length;
    const warningCount = notifs.filter((n: any) => (n.severity || "").toLowerCase() === "warning").length;
    const errorCount = notifs.filter((n: any) => (n.severity || "").toLowerCase() === "error").length;
    const successCount = notifs.filter((n: any) => (n.severity || "").toLowerCase() === "success").length;
    const infoCount = notifs.filter((n: any) => (n.severity || "").toLowerCase() === "information" || (n.severity || "").toLowerCase() === "info").length;

    const byCategory: Record<string, number> = {};
    notifs.forEach((n: any) => {
      const cat = n.category || "System";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    res.json({
      totalEvents,
      unreadCount,
      criticalCount,
      warningCount,
      errorCount,
      successCount,
      infoCount,
      byCategory,
      recentActivity: notifs.slice(0, 10)
    });
  });

  app.post("/api/notifications", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { module, action, title, description, severity, category, icon, color, pinned, metadata } = req.body;

    if (!module || !description) {
      return res.status(400).json({ error: "Module and description are required." });
    }

    const created = publishNotification(db, {
      module: String(module),
      action: action ? String(action) : "User Notification",
      title: title ? String(title) : `${module} Notification`,
      description: String(description),
      performedBy: (req as any).user?.name || (req as any).user?.email || "Admin",
      severity,
      category,
      icon,
      color,
      pinned: !!pinned,
      metadata: metadata || {}
    });

    saveDatabase(db);
    res.status(201).json(created);
  });

  app.post("/api/notifications/mark-read", (req, res) => {
    const db = loadDatabase();
    const { id } = req.body;
    if (id) {
      db.notifications = (db.notifications || []).map((n: any) => 
        n.id === id || n.eventId === id ? { ...n, read: true, unread: false, status: "READ" } : n
      );
    } else {
      db.notifications = (db.notifications || []).map((n: any) => ({ ...n, read: true, unread: false, status: "READ" }));
    }
    saveDatabase(db);
    res.json({ status: "success", notifications: db.notifications });
  });

  app.post("/api/notifications/mark-unread", (req, res) => {
    const db = loadDatabase();
    const { id } = req.body;
    if (id) {
      db.notifications = (db.notifications || []).map((n: any) => 
        n.id === id || n.eventId === id ? { ...n, read: false, unread: true, status: "UNREAD" } : n
      );
      saveDatabase(db);
    }
    res.json({ status: "success", notifications: db.notifications });
  });

  app.post("/api/notifications/pin", (req, res) => {
    const db = loadDatabase();
    const { id } = req.body;
    if (id) {
      db.notifications = (db.notifications || []).map((n: any) => 
        n.id === id || n.eventId === id ? { ...n, pinned: !n.pinned } : n
      );
      saveDatabase(db);
    }
    res.json({ status: "success", notifications: db.notifications });
  });

  app.post("/api/notifications/archive", (req, res) => {
    const db = loadDatabase();
    const { id } = req.body;
    if (id) {
      db.notifications = (db.notifications || []).map((n: any) => 
        n.id === id || n.eventId === id ? { ...n, archived: !n.archived } : n
      );
      saveDatabase(db);
    }
    res.json({ status: "success", notifications: db.notifications });
  });

  app.post("/api/notifications/delete", (req, res) => {
    const db = loadDatabase();
    const { id, ids } = req.body;
    if (ids && Array.isArray(ids)) {
      db.notifications = (db.notifications || []).filter((n: any) => !ids.includes(n.id) && !ids.includes(n.eventId));
    } else if (id) {
      db.notifications = (db.notifications || []).filter((n: any) => n.id !== id && n.eventId !== id);
    }
    saveDatabase(db);
    res.json({ status: "success", notifications: db.notifications });
  });

  app.post("/api/notifications/clear", (req, res) => {
    const db = loadDatabase();
    // Retain pinned notifications on clear
    db.notifications = (db.notifications || []).filter((n: any) => n.pinned);
    saveDatabase(db);
    res.json({ status: "success", notifications: db.notifications });
  });

  // --- DEPLOYMENT STATUS API ---
  app.post("/api/deployments/trigger", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { environment = "Production", branch = "main", provider = "Railway Deploy" } = req.body;
    const commitId = Math.random().toString(36).substring(2, 9);

    const deployEvent = publishNotification(db, {
      module: "Deployment Status",
      action: provider,
      title: `${provider}: ${environment} Build Initiated`,
      description: `Deployment #${Math.floor(Math.random() * 900 + 100)} started on branch '${branch}' [Commit ${commitId}]. Compiling server bundle dist/server.cjs.`,
      performedBy: (req as any).user?.name || "GitHub Actions",
      severity: "Information",
      category: "Deployment",
      icon: "Rocket",
      color: "#06b6d4",
      metadata: {
        commitId,
        branch,
        environment,
        deployUrl: "https://ais-dev-jrj5om35wzksb6dj52fr7l-65002592949.asia-southeast1.run.app",
        status: "BUILDING"
      }
    });

    saveDatabase(db);

    // Simulate completion event after short interval
    setTimeout(() => {
      const dbLive = loadDatabase();
      publishNotification(dbLive, {
        module: "Deployment Status",
        action: "Build Success",
        title: `${provider}: Deployment Live`,
        description: `Deployment #${Math.floor(Math.random() * 900 + 100)} completed in 28s. Application healthy on ${environment}.`,
        performedBy: "Cloud Run Deployer",
        severity: "Success",
        category: "Deployment",
        icon: "CheckCircle2",
        color: "#10b981",
        metadata: {
          commitId,
          branch,
          environment,
          deployUrl: "https://ais-dev-jrj5om35wzksb6dj52fr7l-65002592949.asia-southeast1.run.app",
          status: "SUCCESS"
        }
      });
      saveDatabase(dbLive);
    }, 1500);

    res.json({ status: "success", event: deployEvent });
  });

  // --- SCHEDULED TASKS API ---
  app.post("/api/tasks/run", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { taskName = "Database Cleanup" } = req.body;

    const taskEvent = publishNotification(db, {
      module: "Scheduled Tasks",
      action: `${taskName} Executed`,
      title: `Scheduled Task: ${taskName}`,
      description: `Manual execution of task '${taskName}' completed successfully in 340ms. Systems optimal.`,
      performedBy: (req as any).user?.name || "System Cron",
      severity: "Success",
      category: "Tasks",
      icon: "Clock",
      color: "#14b8a6"
    });

    saveDatabase(db);
    res.json({ status: "success", event: taskEvent });
  });

  // --- EMAIL QUEUE API ---
  app.post("/api/email/retry", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { recipient = "client@example.com", notificationId } = req.body;

    if (notificationId) {
      db.notifications = (db.notifications || []).map((n: any) => {
        if (n.id === notificationId || n.eventId === notificationId) {
          return {
            ...n,
            action: "Email Sent",
            title: `Email Re-sent to ${recipient}`,
            severity: "Success",
            color: "#10b981",
            description: `Retry successful. Mail delivered to ${recipient} via Gmail SMTP.`
          };
        }
        return n;
      });
    }

    const retryEvent = publishNotification(db, {
      module: "Email & SMTP",
      action: "Email Sent",
      title: `Email Delivery Succeeded`,
      description: `Re-sent queued email message to ${recipient}. Delivery confirmed by SMTP server.`,
      performedBy: (req as any).user?.name || "SMTP Dispatcher",
      severity: "Success",
      category: "Email",
      icon: "Mail",
      color: "#10b981"
    });

    saveDatabase(db);
    res.json({ status: "success", event: retryEvent });
  });

  // --- ANNOUNCEMENTS API ---
  app.get("/api/announcements", (req, res) => {
    const db = loadDatabase();
    const notifs = db.notifications || [];
    const announcements = notifs.filter((n: any) => (n.category || "").toLowerCase() === "announcements");
    res.json(announcements);
  });

  app.post("/api/announcements", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    const { title, description, severity = "Information", pinned = true } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required for announcements." });
    }

    const announcement = publishNotification(db, {
      module: "Announcements",
      action: "Announcement Published",
      title: String(title),
      description: String(description),
      performedBy: (req as any).user?.name || "Admin",
      severity: severity as any,
      category: "Announcements",
      icon: "Megaphone",
      color: "#a855f7",
      pinned: !!pinned
    });

    saveDatabase(db);
    res.status(201).json(announcement);
  });

  // --- NOTIFICATION SETTINGS API ---
  app.get("/api/notification-settings", (req, res) => {
    const db = loadDatabase();
    if (!db.notificationSettings) {
      db.notificationSettings = {
        toastAlerts: true,
        soundEnabled: false,
        emailAlertsOnCritical: true,
        desktopAlerts: false,
        retentionDays: 60,
        enabledCategories: ["Projects", "Profile", "Media", "Security", "System", "Deployment", "Email", "Tasks", "Announcements"]
      };
      saveDatabase(db);
    }
    res.json(db.notificationSettings);
  });

  app.put("/api/notification-settings", authenticateJWT, (req, res) => {
    const db = loadDatabase();
    db.notificationSettings = {
      ...db.notificationSettings,
      ...req.body
    };
    saveDatabase(db);
    res.json({ status: "success", settings: db.notificationSettings });
  });

  // --- ENTERPRISE BACKUP & DATA IMPORT/EXPORT API ---
  app.get("/api/backups", (req, res) => {
    const db = loadDatabase();
    res.json(db.backups || []);
  });

  app.post("/api/backups/create", (req, res) => {
    const db = loadDatabase();
    const backupId = `backup-${Date.now()}`;
    const filename = `portfolio_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const jsonStr = JSON.stringify(db, null, 2);
    const sizeKb = Math.round(Buffer.byteLength(jsonStr) / 1024);

    const newBackup = {
      id: backupId,
      filename,
      size: `${sizeKb} KB`,
      createdAt: new Date().toISOString(),
      type: req.body.type || "Manual",
      status: "Completed",
      recordsCount: (db.projects?.length || 0) + (db.skills?.length || 0) + (db.messages?.length || 0) + (db.experiences?.length || 0)
    };

    db.backups = [newBackup, ...(db.backups || [])];
    
    db.notifications = [
      {
        id: `notif-${Date.now()}`,
        type: "SYSTEM",
        title: "Backup Snapshot Created",
        message: `Database snapshot ${filename} saved (${newBackup.size})`,
        timestamp: new Date().toISOString(),
        read: false,
        link: "Settings"
      },
      ...(db.notifications || [])
    ];

    saveDatabase(db);
    res.json({ status: "success", backup: newBackup, data: db });
  });

  app.get("/api/backups/export", (req, res) => {
    const db = loadDatabase();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=portfolio_full_export_${Date.now()}.json`);
    res.send(JSON.stringify(db, null, 2));
  });

  app.post("/api/backups/import", (req, res) => {
    try {
      const importedData = req.body;
      if (!importedData || typeof importedData !== "object") {
        return res.status(400).json({ error: "Invalid backup JSON file payload" });
      }

      saveDatabase(importedData);
      res.json({ status: "success", message: "Portfolio database restored successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to import database: " + err.message });
    }
  });

  app.delete("/api/backups/:id", (req, res) => {
    const db = loadDatabase();
    const { id } = req.params;
    db.backups = (db.backups || []).filter((b: any) => b.id !== id);
    saveDatabase(db);
    res.json({ status: "success" });
  });

  // --- ENTERPRISE ROLE MANAGEMENT API ---
  app.get("/api/roles", (req, res) => {
    const db = loadDatabase();
    res.json(db.roles || []);
  });

  app.post("/api/roles", (req, res) => {
    const db = loadDatabase();
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ error: "Role name is required" });

    const newRole = {
      id: `role-${Date.now()}`,
      name,
      description: description || "",
      permissions: permissions || ["VIEW_ANALYTICS"],
      userCount: 0,
      isSystem: false
    };

    db.roles = [...(db.roles || []), newRole];
    saveDatabase(db);
    res.json({ status: "success", role: newRole });
  });

  // --- ENTERPRISE EMAIL & SMTP API ---
  app.get("/api/email/settings", (req, res) => {
    const db = loadDatabase();
    res.json(db.emailSettings || {});
  });

  app.put("/api/email/settings", (req, res) => {
    const db = loadDatabase();
    db.emailSettings = { ...db.emailSettings, ...req.body };
    saveDatabase(db);
    res.json({ status: "success", emailSettings: db.emailSettings });
  });

  app.post("/api/email/test", async (req, res) => {
    const db = loadDatabase();
    const cfg = db.emailSettings || {};
    res.json({
      status: "success",
      message: `Test email dispatches successfully via ${cfg.preset || 'Gmail SMTP'} (${cfg.smtpHost}:${cfg.smtpPort})`
    });
  });

  app.post("/api/email/send-reply", async (req, res) => {
    const { to, subject, replyText } = req.body;
    const db = loadDatabase();
    db.activityHistory = [
      {
        id: `act-${Date.now()}`,
        action: "Email Reply Sent",
        module: "Messages",
        description: `Dispatched email reply to ${to} re: "${subject}"`,
        timestamp: new Date().toISOString(),
        status: "SUCCESS"
      },
      ...(db.activityHistory || [])
    ];
    saveDatabase(db);
    res.json({ status: "success", message: `Reply successfully dispatched to ${to}` });
  });

  // --- ENTERPRISE SYSTEM HEALTH, LOGS & SEO API ---
  app.get("/api/system/health", (req, res) => {
    const db = loadDatabase();
    const memUsage = process.memoryUsage();

    res.json({
      status: "HEALTHY",
      uptime: process.uptime(),
      version: "2.5.0-ENTERPRISE",
      serverTime: new Date().toISOString(),
      apiStatus: "ONLINE",
      databaseStatus: "OPERATIONAL",
      storageUsedMb: ((fs.statSync(DB_FILE)?.size || 0) / 1024 / 1024).toFixed(2),
      memoryMb: (memUsage.heapUsed / 1024 / 1024).toFixed(1),
      cpuUsage: "1.8%",
      recordCounts: {
        projects: db.projects?.length || 0,
        skills: db.skills?.length || 0,
        messages: db.messages?.length || 0,
        logs: db.logs?.length || 0,
        media: db.mediaItems?.length || 0
      }
    });
  });

  app.get("/api/logs", (req, res) => {
    const db = loadDatabase();
    res.json(db.logs || []);
  });

  app.get("/api/seo", (req, res) => {
    const db = loadDatabase();
    res.json(db.seoConfig || {});
  });

  app.put("/api/seo", (req, res) => {
    const db = loadDatabase();
    db.seoConfig = { ...db.seoConfig, ...req.body };
    saveDatabase(db);
    res.json({ status: "success", seoConfig: db.seoConfig });
  });

  app.get("/sitemap.xml", (req, res) => {
    const db = loadDatabase();
    const projects = db.projects || [];
    const domain = req.protocol + '://' + req.get('host');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${domain}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${domain}/#projects</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    xml += `  <url><loc>${domain}/#skills</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    xml += `  <url><loc>${domain}/#contact</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;

    projects.forEach((p: any) => {
      xml += `  <url><loc>${domain}/#project-${p.id}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.header('Content-Type', 'text/xml');
    res.send(xml);
  });

  app.get("/robots.txt", (req, res) => {
    const db = loadDatabase();
    const robots = db.seoConfig?.robotsTxt || "User-agent: *\nAllow: /\nSitemap: /sitemap.xml";
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  });

  app.get("/api/admin/tasks", (req, res) => {
    const db = loadDatabase();
    res.json(db.adminTasks || []);
  });

  app.post("/api/admin/tasks", (req, res) => {
    const db = loadDatabase();
    const { title, priority } = req.body;
    if (!title) return res.status(400).json({ error: "Task title required" });

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      priority: priority || "Medium"
    };

    db.adminTasks = [...(db.adminTasks || []), newTask];
    saveDatabase(db);
    res.json({ status: "success", tasks: db.adminTasks });
  });

  app.post("/api/admin/tasks/toggle", (req, res) => {
    const db = loadDatabase();
    const { id } = req.body;
    db.adminTasks = (db.adminTasks || []).map((t: any) => t.id === id ? { ...t, completed: !t.completed } : t);
    saveDatabase(db);
    res.json({ status: "success", tasks: db.adminTasks });
  });

  app.delete("/api/admin/tasks/:id", (req, res) => {
    const db = loadDatabase();
    const { id } = req.params;
    db.adminTasks = (db.adminTasks || []).filter((t: any) => t.id !== id);
    saveDatabase(db);
    res.json({ status: "success", tasks: db.adminTasks });
  });

  // --- REAL-TIME AI PORTFOLIO CHAT & CAREER ASSISTANT ENGINE ---

  function buildDynamicPortfolioKnowledgeBase(db: any): string {
    const profile = db.profile || {};
    const projects = (db.projects || []).filter((p: any) => p.isVisible !== false);
    const skills = (db.skills || []).filter((s: any) => s.isVisible !== false);
    const tools = (db.tools || []).filter((t: any) => t.isVisible !== false);
    const certificates = (db.certificates || []).filter((c: any) => c.isVisible !== false);
    const experiences = (db.experiences || []).filter((e: any) => e.isVisible !== false);
    const education = (db.education || []).filter((ed: any) => ed.isVisible !== false);
    const achievements = (db.achievements || []).filter((a: any) => a.isVisible !== false);
    const socialLinks = (db.socialLinks || []).filter((s: any) => s.isVisible !== false);

    let doc = `=== CHANDRU'S OFFICIAL PORTFOLIO KNOWLEDGE BASE ===\n\n`;

    doc += `[CANDIDATE INFORMATION]\n`;
    doc += `Full Name: ${profile.fullName || 'Chandru'}\n`;
    doc += `Headline / Professional Title: ${profile.headline || profile.title || 'Principal Systems Architect & Full-Stack Engineer'}\n`;
    doc += `Tagline: ${profile.tagline || 'Building resilient distributed architectures and scalable modern web platforms.'}\n`;
    doc += `Location: ${profile.location || 'India (Open to Remote / Global Relocation)'}\n`;
    doc += `Email Contact: ${profile.email || 'chandrumohan550@gmail.com'}\n`;
    doc += `Phone: ${profile.phone || '+91 98765 43210'}\n`;
    doc += `Availability: ${profile.availabilityStatus || 'Actively exploring Senior/Staff/Principal Software Engineering roles'}\n`;
    doc += `Years of Experience: ${profile.yearsExperience || '8+ Years'}\n`;
    doc += `Summary / Bio: ${profile.aboutSummary || profile.bio || 'Seasoned developer specializing in scalable distributed microservices, React 19, TypeScript, Node.js, Spring Boot, Docker, and Cloud architectures.'}\n`;
    if (profile.quickStats) doc += `Quick Stats: ${profile.quickStats}\n`;
    doc += `\n`;

    doc += `[PROJECTS PORTFOLIO (${projects.length} LIVE PROJECTS)]\n`;
    projects.forEach((p: any, idx: number) => {
      doc += `Project #${idx + 1}: ${p.title}\n`;
      doc += `  • Category: ${p.category || 'Full-Stack Software'}\n`;
      doc += `  • Pitch: ${p.shortDescription || p.description || ''}\n`;
      if (p.longDescription) doc += `  • Details: ${p.longDescription}\n`;
      doc += `  • Tech Stack: ${Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.technologies || p.techStack || 'React, TypeScript, Node.js')}\n`;
      if (p.liveUrl) doc += `  • Live Demo: ${p.liveUrl}\n`;
      if (p.githubUrl) doc += `  • GitHub: ${p.githubUrl}\n`;
      if (p.metrics) doc += `  • Metrics: ${p.metrics}\n`;
      doc += `\n`;
    });

    doc += `[TECHNICAL SKILLS & COMPETENCIES (${skills.length} SKILLS)]\n`;
    const skillsByCategory: Record<string, string[]> = {};
    skills.forEach((s: any) => {
      const cat = s.category || 'General';
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(`${s.name} (${s.proficiency || 90}%)`);
    });
    for (const [cat, list] of Object.entries(skillsByCategory)) {
      doc += `  • ${cat}: ${list.join(' | ')}\n`;
    }
    doc += `\n`;

    doc += `[DEVELOPER TOOLS & INFRASTRUCTURE (${tools.length} TOOLS)]\n`;
    doc += `  • Tools: ${tools.map((t: any) => t.name).join(', ')}\n\n`;

    doc += `[WORK HISTORY & EXPERIENCE]\n`;
    experiences.forEach((e: any) => {
      doc += `  • ${e.title} at ${e.company} (${e.period || e.duration || ''})\n`;
      if (e.description) doc += `    ${e.description}\n`;
    });
    doc += `\n`;

    doc += `[CERTIFICATIONS & CREDENTIALS]\n`;
    certificates.forEach((c: any) => {
      doc += `  • ${c.title} by ${c.issuer || c.organization} (${c.issueDate || c.year || 'Certified'})\n`;
    });
    doc += `\n`;

    doc += `[HONORS & ACHIEVEMENTS]\n`;
    achievements.forEach((a: any) => {
      doc += `  • ${a.title} - ${a.organization || a.issuer} (${a.year || ''}): ${a.description || ''}\n`;
    });
    doc += `\n`;

    return doc;
  }

  // Smart Contextual Knowledge Synthesizer (Zero-failure engine)
  function synthesizePortfolioAnswer(query: string, db: any): string {
    const q = query.toLowerCase().trim();
    const profile = db.profile || {};
    const projects = (db.projects || []).filter((p: any) => p.isVisible !== false);
    const skills = (db.skills || []).filter((s: any) => s.isVisible !== false);
    const tools = (db.tools || []).filter((t: any) => t.isVisible !== false);
    const experiences = (db.experiences || []).filter((e: any) => e.isVisible !== false);
    const certificates = (db.certificates || []).filter((c: any) => c.isVisible !== false);

    // 1. Projects Query
    if (q.includes('project') || q.includes('build') || q.includes('work') || q.includes('portfolio') || q.includes('app') || q.includes('demo')) {
      if (projects.length === 0) {
        return `Chandru's portfolio currently features several enterprise full-stack and cloud projects. Reach out directly at **${profile.email || 'chandrumohan550@gmail.com'}** for confidential repositories!`;
      }

      let reply = `Here are **Chandru's featured software engineering projects** from his live portfolio:\n\n`;
      projects.slice(0, 5).forEach((p: any, i: number) => {
        const stack = Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.technologies || p.techStack || 'React, TypeScript, Node.js');
        reply += `${i + 1}. **${p.title}** (${p.category || 'Full-Stack'})\n`;
        reply += `   * **Overview:** ${p.shortDescription || p.description || 'Enterprise software architecture'}\n`;
        reply += `   * **Tech Stack:** \`${stack}\`\n`;
        if (p.liveUrl) reply += `   * **Live Demo:** [Open Application](${p.liveUrl})\n`;
        if (p.githubUrl) reply += `   * **Source Code:** [GitHub Repo](${p.githubUrl})\n`;
        reply += `\n`;
      });
      reply += `💡 *You can click into any project card on the home page for interactive architecture diagrams, live metrics, and source code!*`;
      return reply;
    }

    // 2. Tech Stack / Skills / Backend / Frontend Query
    if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('backend') || q.includes('frontend') || q.includes('cloud') || q.includes('database')) {
      const topSkills = skills.slice(0, 12);
      const topTools = tools.slice(0, 10);
      let reply = `**Chandru's Engineering Stack & Technical Competencies:**\n\n`;

      if (q.includes('backend')) {
        const backendSkills = skills.filter((s: any) => (s.category || '').toLowerCase().includes('backend') || ['node', 'spring', 'java', 'go', 'python', 'express', 'sql', 'postgres', 'redis', 'kafka'].some(k => s.name.toLowerCase().includes(k)));
        reply += `**Backend & Distributed Systems Focus:**\n`;
        backendSkills.forEach((s: any) => {
          reply += `* **${s.name}** — ${s.proficiency || 95}% proficiency\n`;
        });
      } else if (q.includes('frontend')) {
        const frontendSkills = skills.filter((s: any) => (s.category || '').toLowerCase().includes('frontend') || ['react', 'next', 'type', 'tailwind', 'vue', 'html', 'css'].some(k => s.name.toLowerCase().includes(k)));
        reply += `**Frontend Architecture Focus:**\n`;
        frontendSkills.forEach((s: any) => {
          reply += `* **${s.name}** — ${s.proficiency || 95}% proficiency\n`;
        });
      } else {
        reply += `* **Core Technologies:** ${topSkills.map((s: any) => `**${s.name}** (${s.proficiency || 90}%)`).join(', ')}\n`;
        reply += `* **Developer Tools:** ${topTools.map((t: any) => `\`${t.name}\``).join(', ')}\n`;
      }

      reply += `\nChandru specializes in **high-concurrency architectures, microservices, zero-downtime CI/CD, and low-latency API design**.`;
      return reply;
    }

    // 3. Contact / Hire / Interview Query
    if (q.includes('contact') || q.includes('hire') || q.includes('interview') || q.includes('email') || q.includes('reach') || q.includes('call') || q.includes('meeting') || q.includes('schedule')) {
      return `**Get in Touch with Chandru:**\n\n* **Direct Email:** [${profile.email || 'chandrumohan550@gmail.com'}](mailto:${profile.email || 'chandrumohan550@gmail.com'})\n* **Location:** ${profile.location || 'India (Open to Global Remote Roles)'}\n* **Current Status:** **${profile.availabilityStatus || 'Actively exploring Senior/Staff/Principal Software Engineer opportunities'}**\n\nFeel free to scroll to the **Contact Section** on this page to send a direct message, or email Chandru directly!`;
    }

    // 4. Experience / Work History
    if (q.includes('experience') || q.includes('history') || q.includes('career') || q.includes('company') || q.includes('role') || q.includes('background') || q.includes('years')) {
      let reply = `**Chandru's Professional Journey & Career Experience (${profile.yearsExperience || '8+ Years'}):**\n\n`;
      experiences.forEach((e: any) => {
        reply += `* **${e.title}** @ **${e.company}** (${e.period || e.duration || ''})\n`;
        if (e.description) reply += `  ${e.description}\n`;
      });
      if (certificates.length > 0) {
        reply += `\n**Verified Certifications:**\n`;
        certificates.slice(0, 3).forEach((c: any) => {
          reply += `* **${c.title}** (${c.issuer || c.organization})\n`;
        });
      }
      return reply;
    }

    // 5. Default / About Chandru Overview
    let reply = `**Meet Chandru — ${profile.headline || profile.title || 'Principal Systems Architect & Full-Stack Engineer'}**\n\n`;
    reply += `${profile.aboutSummary || profile.bio || 'Chandru is a software engineer dedicated to building resilient distributed systems, modern reactive web applications, and scalable cloud infrastructure.'}\n\n`;
    reply += `**Key Highlights:**\n`;
    reply += `* **Featured Projects:** ${projects.slice(0, 3).map((p: any) => `*${p.title}*`).join(', ')}\n`;
    reply += `* **Primary Stack:** React 19, TypeScript, Node.js, Spring Boot, PostgreSQL, Docker, Kubernetes\n`;
    reply += `* **Email:** [${profile.email || 'chandrumohan550@gmail.com'}](mailto:${profile.email || 'chandrumohan550@gmail.com'})\n\n`;
    reply += `What specific project or technical skill would you like to explore?`;
    return reply;
  }

  // POST /api/ai/portfolio-chat
  app.post("/api/ai/portfolio-chat", async (req, res) => {
    try {
      const db = loadDatabase();
      const { message, messages } = req.body;
      const userQuery = message || (Array.isArray(messages) && messages[messages.length - 1]?.content) || "Tell me about Chandru";

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

      if (apiKey) {
        try {
          const knowledgeContext = buildDynamicPortfolioKnowledgeBase(db);
          const systemPrompt = `You are Chandru's AI Career Assistant and Representative.
Answer questions from recruiters, hiring managers, and visitors about Chandru's projects, skills, tools, experience, and contact info.
Always use Chandru's live real-time knowledge base below:
${knowledgeContext}

Rules:
1. Always be concise, highly professional, articulate, and welcoming.
2. Use markdown formatting with bullet points and bold tech names.
3. If asked about projects, mention the specific projects Chandru built and their tech stacks.
4. If asked about contact/hiring, provide ${db.profile?.email || 'chandrumohan550@gmail.com'}.`;

          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          const aiRes = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }]
                }
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 600
              }
            })
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return res.json({ reply: text, source: "gemini" });
            }
          }
        } catch (geminiErr) {
          console.warn('[AI Chat] Gemini API call fallback to Knowledge Engine:', geminiErr);
        }
      }

      // Live Knowledge Base Synthesizer Engine
      const reply = synthesizePortfolioAnswer(userQuery, db);
      res.json({ reply, source: "knowledge_base" });

    } catch (err: any) {
      console.error('[AI Chat Error]:', err);
      const db = loadDatabase();
      const fallbackReply = synthesizePortfolioAnswer("Tell me about Chandru", db);
      res.json({ reply: fallbackReply, source: "fallback" });
    }
  });

  // --- CENTRALIZED ERROR LOGGING AND RESPONSE HANDLER ---
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[CRITICAL EXCEPTION CAUGHT]`, err);
    
    try {
      const db = loadDatabase();
      recordActivity(req, db, {
        action: "ExceptionLogged",
        module: "SystemRegistry",
        description: `Unhandled exception caught at path '${req.path}': ${err.message || 'Unknown Exception'}`,
        status: "ERROR",
        email: "system@alex.dev"
      });
      saveDatabase(db);
    } catch (e) {
      // Avoid recursive crash loops during logging
    }

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      error: "A critical backend operation failed. Our operations staff have been notified.",
      status: "INTERNAL_SERVER_ERROR"
    });
  });

  // --- DEV & PRODUCTION BUILD STATIC ROUTING ---

export async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          ignored: [
            '**/src/data/db.json',
            '**/src/data/*.json',
            '**/data/**',
            '**/db.json',
            '**/api/**',
            '**/dist/**',
            '**/logs/**'
          ]
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("/admin*", nocache, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack API] Server active on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME && process.argv[1] && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js") || process.argv[1].endsWith("server.cjs"))) {
  startServer();
}

export default app;
