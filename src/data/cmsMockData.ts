export interface ProjectItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  liveUrl: string;
  githubUrl: string;
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  displayOrder: number;
  skills: string[];
  imageUrl: string;
  category: string;
  status: 'Concept' | 'In Development' | 'Completed' | 'Maintained' | 'Archived';
  videoUrl: string;
  gallery: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CodingProfileItem {
  id: number;
  platformType: string;
  displayName: string;
  username: string;
  profileUrl: string;
  description?: string;
  logoUrl?: string;
  logoPublicId?: string;
  displayOrder: number;
  visible: boolean;
  featured?: boolean;
  openInNewTab?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioMetricItem {
  id: number;
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  iconType?: 'lucide' | 'url' | 'svg';
  customSvg?: string;
  displayOrder: number;
  visible: boolean;
  animationEnabled?: boolean;
  counterAnimationToggle?: boolean;
  color?: string;
  sourceType?: 'manual' | 'google_analytics' | 'github_api' | 'leetcode_api' | 'cloudflare' | 'plausible' | 'umami' | 'clarity' | 'custom_api';
  tooltip?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToolItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  officialWebsite?: string;
  logoType: 'upload' | 'url' | 'icon' | 'svg';
  logoUrl?: string;
  customSvg?: string;
  iconLibrary?: 'lucide' | 'simple' | 'fontawesome';
  iconName?: string;
  brandColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverColor?: string;
  logoSize?: number;
  logoPadding?: number;
  borderRadius?: string;
  shadow?: string;
  hasGlow?: boolean;
  hoverScale?: number;
  hoverRotation?: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  isFeatured: boolean;
  displayOrder: number;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillItem {
  id: number;
  name: string;
  category: string;
  proficiency?: number; // 1 to 100
  displayOrder: number;
  iconName?: string;
  iconUrl?: string;
  description?: string;
  color?: string;
  animation?: string;
  visibility?: boolean;
}

export interface CertificateItem {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
  credentialUrl: string;
}

export interface ExperienceItem {
  id: number;
  company: string;
  role: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface EducationItem {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  grade: string;
}

export interface MessageItem {
  id: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  messageContent: string;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
}

export interface AnalyticsMetric {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionSec: number;
  contactConversionRate: number;
  viewsHistory: { date: string; views: number; visitors: number }[];
  referrals: { source: string; count: number; percentage: number }[];
  countries: { country: string; count: number }[];
  browsers: { browser: string; count: number }[];
  devices: { device: string; count: number }[];
  projectsViewed: { projectTitle: string; count: number; slug: string }[];
  clicks: { elementId: string; label: string; count: number }[];
  resumeDownloads: number;
  apiMetrics?: {
    totalRequests: number;
    failedRequests: number;
    slowRequests: number;
    avgResponseTimeMs: number;
    history: {
      method: string;
      path: string;
      status: number;
      durationMs: number;
      isFailed: boolean;
      isSlow: boolean;
      timestamp: string;
    }[];
  };
}

export interface SettingsConfig {
  siteName: string;
  siteDescription: string;
  metaKeywords: string;
  themeColor: string;
  analyticsId: string;
  isMaintenanceMode: boolean;
  allowContact: boolean;
}

export interface FooterConfig {
  title: string;
  description: string;
  copyrightText: string;
  builtWithText: string;
  contactInfo: string;
  showResume: boolean;
  resumeText: string;
  logoText?: string;
  logoUrl?: string;
  backgroundType?: 'none' | 'glass' | 'emerald' | 'purple' | 'slate' | 'custom';
  customBackgroundUrl?: string;
  theme?: 'dark' | 'light' | 'colored' | 'glass';
  isVisible?: boolean;
}

export interface SocialLinkItem {
  id: number;
  platform: string;
  username: string;
  profileUrl: string;
  icon: string;
  logoUrl?: string;
  customSvg?: string;
  whiteLogoUrl?: string;
  darkLogoUrl?: string;
  lightLogoUrl?: string;
  monochromeLogoUrl?: string;
  tooltip?: string;
  openInNewTab?: boolean;
  displayOrder: number;
  isVisible: boolean;

  // Profile Information
  displayName?: string;
  profileName?: string;
  profileTitle?: string;
  shortDescription?: string;
  category?: string;
  status?: 'Active' | 'Beta' | 'VIP' | 'Featured' | 'Archived' | 'Offline' | string;
  verifiedBadge?: boolean;
  followers?: string | number;
  following?: string | number;
  repositories?: string | number;
  stars?: string | number;
  customStats?: { label: string; value: string }[];

  // Branding Colors
  brandColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverColor?: string;
  textColor?: string;
  accentColor?: string;

  // Images & Media
  avatarUrl?: string;
  coverImageUrl?: string;
  bannerImageUrl?: string;

  // Independent Section Visibility
  showInCoordinates?: boolean;
  showInDynamicProfile?: boolean;
  showInContact?: boolean;
  showInFooter?: boolean;
  showInNavigation?: boolean;
  showInHeroCard?: boolean;
  showInAbout?: boolean;
  showInProjects?: boolean;
  showInResume?: boolean;
  showInSystemConsole?: boolean;
  showInHero?: boolean;

  // Profile Card Configuration
  enableProfileCard?: boolean;
  cardTitle?: string;
  cardSubtitle?: string;
  cardDescription?: string;
  ctaButtonText?: string;
  profileBadge?: string;
  statusIndicator?: string;
  onlineIndicator?: boolean;
  featuredBadge?: boolean;

  // Additional URLs
  secondaryUrl?: string;
  documentationUrl?: string;
  communityUrl?: string;
  supportUrl?: string;
  blogUrl?: string;
  portfolioUrl?: string;

  // Button Customization
  buttonText?: string;
  buttonIcon?: string;
  buttonStyle?: 'filled' | 'outline' | 'ghost' | 'gradient' | 'glass';

  // FX & Animations
  hoverEffect?: 'glow' | 'lift' | 'scale' | 'rotate' | 'shadow' | 'glass' | 'border';
  animationEffect?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'framer';

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;

  // Analytics
  clicks?: number;
  ctr?: number;
  visitors?: number;
  lastClicked?: string;
  topReferrer?: string;

  // Status Meta
  isArchived?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ResumeItem {
  id: number;
  title: string;
  version: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number; // in bytes
  cloudinaryPublicId: string;
  thumbnailImage: string;
  isActive: boolean;
  isDownloadEnabled: boolean;
  uploadedAt: string;
  updatedAt: string;
}

export interface AchievementItem {
  id: number;
  title: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  category: 'Hackathon' | 'Competition' | 'Award' | 'Coding' | 'Internship' | 'Research' | 'Open Source' | 'Academic' | 'Certification' | 'Leadership' | 'Volunteer' | 'Other';
  organization: string;
  achievementDate: string;
  imageUrl?: string;
  logoUrl?: string;
  certificateUrl?: string; // Optional PDF
  credentialUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  skills?: string[];
  technologies?: string[];
  position?: string;
  awardType?: string;
  badge?: string;
  featured: boolean;
  visibility: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileItem {
  id: number;
  profileImage: string;
  coverImage: string;
  aboutImage: string;
  heroBackground: string;
  heroAvatar?: string;
  heroBadge?: string;
  heroName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  fullName: string;
  displayName: string;
  title: string;
  subtitle: string;
  typingText: string;
  shortBio: string;
  aboutDescription: string;
  shortTagline?: string;
  shortIntroduction?: string;
  biography?: string;
  careerObjective?: string;
  aboutHeading?: string;
  experienceSummary?: string;
  skillsSummary?: string;
  quickStats?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  primaryCtaIcon?: string;
  primaryCtaVisible?: boolean;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  secondaryCtaIcon?: string;
  secondaryCtaVisible?: boolean;
  resumeCtaText?: string;
  resumeCtaVisible?: boolean;
  downloadCtaText?: string;
  downloadCtaVisible?: boolean;
  versionText?: string;
  updateText?: string;
  floatingIconsVisible?: boolean;
  heroVisibility?: boolean;
  contactHeading?: string;
  contactDescription?: string;
  contactSectionVisible?: boolean;
  apiStatusCardVisible?: boolean;
  apiStatusText?: string;
  dynamicChannelsVisible?: boolean;
  email: string;
  phone: string;
  whatsapp?: string;
  resumeUrl?: string;
  resumeDownloadText?: string;
  onlineStatus?: 'Online' | 'Offline';
  location: string;
  country: string;
  availability: 'Available' | 'Busy' | 'Not Available' | 'Open to Work';
  yearsExperience: number;
  currentCompany: string;
  currentPosition: string;
  birthday?: string;
  resumeId?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  leetcodeUrl?: string;
  hackerrankUrl?: string;
  codechefUrl?: string;
  codeforcesUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechStackItem {
  id: number;
  name: string;
  enabled: boolean;
  order: number;
}

export const initialTechStack: TechStackItem[] = [
  { id: 1, name: "Java", enabled: true, order: 1 },
  { id: 2, name: "Spring Boot", enabled: true, order: 2 },
  { id: 3, name: "React", enabled: true, order: 3 },
  { id: 4, name: "MySQL", enabled: true, order: 4 },
  { id: 5, name: "Docker", enabled: true, order: 5 },
  { id: 6, name: "AWS", enabled: true, order: 6 },
];

export const initialProfile: ProfileItem = {
  id: 1,
  profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  aboutImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  heroBackground: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  heroAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  heroBadge: "Full Stack Java Developer",
  heroName: "Alex Rivera",
  heroTitle: "Principal Systems Architect",
  heroSubtitle: "Ecosystem Architect & Product Pioneer",
  heroDescription: "I design and build resilient cloud systems, real-time analytics engines, and gorgeous web-based developer interfaces that scale dynamically.",
  fullName: "Alex Rivera",
  displayName: "Alex Dev",
  title: "Principal Systems Architect",
  subtitle: "Designing high-throughput distributed architectures & interactive visual frameworks.",
  typingText: "Principal Systems Architect, Full-Stack Pioneer, Clean Code Advocate",
  shortBio: "Hi, I'm Alex. I specialize in designing and engineering scalable microservice frameworks and high-performance React systems.",
  aboutDescription: "With over 8 years of professional enterprise engineering experience, I bridge the gap between rigorous back-end systems engineering and fluid, interactive modern interfaces. I'm passionate about automation, clean database designs, and optimal React state pipelines.",
  shortTagline: "Ecosystem Architect & Product Pioneer",
  shortIntroduction: "I design and build resilient cloud systems, real-time analytics engines, and gorgeous web-based developer interfaces that scale dynamically.",
  biography: "I am a high-throughput systems developer with an obsession for performance and visual fidelity. Over the past eight years, I've designed cloud native integrations for Nexus and Google Partners, written database layers supporting millions of transactions, and optimized responsive micro-dashboards. Outside of direct engineering, I mentor developers and speak at system design meetups.",
  careerObjective: "To drive high-impact technical initiatives as a Principal Software Engineer, leading teams to deliver ultra-scalable systems, beautiful developer experiences, and resilient microservices architectures.",
  aboutHeading: "A Journey of Technical Rigor & Aesthetic Execution",
  experienceSummary: "8+ Years of Crafting Clean Systems & Interactive Developer Tools",
  skillsSummary: "Microservice Design, Real-time WebSockets, PostgreSQL optimization, High-performance React, Tailwind CSS design languages, DevOps automation",
  quickStats: "8+ Years Exp | 50+ Projects Mapped | 99.9% Core SLA Uptime | 120k+ Lines Written",
  seoTitle: "Alex Rivera | Principal Systems Architect & Portfolio",
  seoDescription: "The professional full-stack portfolio of Alex Rivera, featuring advanced analytics, system designs, and visual client-side engineering dashboards.",
  seoKeywords: "Systems Architect, React developer, full-stack engineer, PostgreSQL, Tailwind CSS, CMS dashboard",
  primaryCtaText: "Explore Engineering",
  primaryCtaUrl: "#projects",
  primaryCtaIcon: "ChevronRight",
  primaryCtaVisible: true,
  secondaryCtaText: "Get in Touch",
  secondaryCtaUrl: "#contact",
  secondaryCtaIcon: "Mail",
  secondaryCtaVisible: true,
  resumeCtaText: "View Resume",
  resumeCtaVisible: true,
  downloadCtaText: "Download CV",
  downloadCtaVisible: true,
  versionText: "Version 2.4.0",
  updateText: "Updated Recently",
  floatingIconsVisible: true,
  heroVisibility: true,
  contactHeading: "Let's coordinate on new paradigms",
  contactDescription: "Have an open enterprise role, a microservices system challenge, or want to collaborate on clean-architecture solutions? Send an inquiry.",
  contactSectionVisible: true,
  apiStatusCardVisible: true,
  apiStatusText: "REST Pool: ONLINE | Cascade Purge Hooks: ATTACHED",
  dynamicChannelsVisible: true,
  email: "alex.dev@example.com",
  phone: "+1 (555) 019-2834",
  whatsapp: "+1 (555) 019-2834",
  resumeUrl: "https://example.com/resume.pdf",
  resumeDownloadText: "Download Resume",
  onlineStatus: "Online",
  location: "San Francisco, California",
  country: "United States",
  availability: "Open to Work",
  yearsExperience: 8,
  currentCompany: "Nexus Cloud Systems",
  currentPosition: "Lead Engineer",
  birthday: "1994-10-14",
  resumeId: 1,
  githubUrl: "https://github.com/username",
  linkedinUrl: "https://linkedin.com/in/username",
  instagramUrl: "https://instagram.com/username",
  twitterUrl: "https://twitter.com/username",
  youtubeUrl: "https://youtube.com/c/username",
  leetcodeUrl: "https://leetcode.com/username",
  hackerrankUrl: "https://hackerrank.com/username",
  codechefUrl: "https://codechef.com/users/username",
  codeforcesUrl: "https://codeforces.com/profile/username",
  portfolioUrl: "https://example.com",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-07-09T04:40:00.000Z"
};

export const initialProjects: ProjectItem[] = [
  {
    id: 1,
    title: "AI-Powered Meeting Summarizer",
    slug: "ai-meeting-summarizer",
    description: "Full-stack enterprise application with a clean, responsive layout utilizing Gemini API to transcribe, summarize, and categorize workspace calls.",
    liveUrl: "https://example.com/summarizer",
    githubUrl: "https://github.com/admin/summarizer",
    startDate: "2026-01-15",
    endDate: "2026-04-30",
    isFeatured: true,
    displayOrder: 1,
    skills: ["React", "Spring Boot", "MySQL", "Gemini API"],
    imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    category: "Full-Stack",
    status: "Completed",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    gallery: [
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-04-30T17:30:00Z"
  },
  {
    id: 2,
    title: "Real-time Collaborative Board",
    slug: "collab-board-realtime",
    description: "Multiplayer interactive canvas with custom room locks, vector toolkits, and server-authoritative state replication using WebSockets.",
    liveUrl: "https://example.com/collab",
    githubUrl: "https://github.com/admin/collab",
    startDate: "2025-08-10",
    endDate: "2025-12-20",
    isFeatured: true,
    displayOrder: 2,
    skills: ["React", "Node.js", "WebSocket", "TailwindCSS"],
    imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
    category: "Frontend",
    status: "Maintained",
    videoUrl: "",
    gallery: [
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: "2025-08-10T10:00:00Z",
    updatedAt: "2025-12-20T18:00:00Z"
  },
  {
    id: 3,
    title: "Personal FinTech Dashboard",
    slug: "fintech-dashboard-pro",
    description: "Financial statistics suite with D3 charts tracking banking transaction streams, user goals, and dynamic tax forecasting engines.",
    liveUrl: "https://example.com/fintech",
    githubUrl: "https://github.com/admin/fintech",
    startDate: "2025-03-01",
    endDate: "2025-07-15",
    isFeatured: false,
    displayOrder: 3,
    skills: ["React", "D3.js", "Spring Boot", "MySQL"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    category: "Full-Stack",
    status: "Completed",
    videoUrl: "",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: "2025-03-01T08:00:00Z",
    updatedAt: "2025-07-15T16:00:00Z"
  }
];

export const initialSkills: SkillItem[] = [
  { id: 1, name: "React / Next.js", category: "Frontend", proficiency: 95, displayOrder: 1, iconName: "Layout" },
  { id: 2, name: "TypeScript", category: "Frontend", proficiency: 90, displayOrder: 2, iconName: "Code2" },
  { id: 3, name: "TailwindCSS", category: "Frontend", proficiency: 98, displayOrder: 3, iconName: "Palette" },
  { id: 4, name: "Spring Boot", category: "Backend", proficiency: 88, displayOrder: 4, iconName: "Cpu" },
  { id: 5, name: "Spring Security & JWT", category: "Backend", proficiency: 85, displayOrder: 5, iconName: "ShieldCheck" },
  { id: 6, name: "MySQL / Hibernate", category: "Database", proficiency: 87, displayOrder: 6, iconName: "Database" },
  { id: 7, name: "Cloudinary", category: "DevOps", proficiency: 80, displayOrder: 7, iconName: "Image" },
  { id: 8, name: "Docker & Kubernetes", category: "DevOps", proficiency: 75, displayOrder: 8, iconName: "Container" }
];

export const initialCertificates: CertificateItem[] = [
  {
    id: 1,
    name: "Spring Certified Professional",
    issuingOrganization: "VMware",
    issueDate: "2025-05-12",
    expirationDate: "2028-05-12",
    credentialId: "VMW-SPC-779021",
    credentialUrl: "https://badgr.com/public/assertions/v9012"
  },
  {
    id: 2,
    name: "AWS Certified Solutions Architect",
    issuingOrganization: "Amazon Web Services",
    issueDate: "2024-11-20",
    expirationDate: "2027-11-20",
    credentialId: "AWS-ASA-99031",
    credentialUrl: "https://aws.amazon.com/verification"
  }
];

export const initialExperiences: ExperienceItem[] = [
  {
    id: 1,
    company: "Google AI Studio Labs",
    role: "Senior Full-Stack Architect",
    description: "Designing cloud native templates, securing backend REST services with JWT integrations, and building high-fidelity workspace visualizers.",
    location: "Mountain View, CA (Remote)",
    startDate: "2024-06-01",
    endDate: "",
    isCurrent: true
  },
  {
    id: 2,
    company: "Pinnacle Software Systems",
    role: "Java Backend Engineer",
    description: "Implemented high-throughput microservices using Spring Boot and JPA/Hibernate. Managed database migrations for multi-tenant configurations.",
    location: "Austin, TX",
    startDate: "2022-03-15",
    endDate: "2024-05-30",
    isCurrent: false
  }
];

export const initialEducation: EducationItem[] = [
  {
    id: 1,
    institution: "Stanford University",
    degree: "Master of Science",
    fieldOfStudy: "Computer Science (Specialization: AI Systems)",
    startDate: "2020-09-15",
    endDate: "2022-06-15",
    isCurrent: false,
    grade: "GPA: 3.92/4.0"
  },
  {
    id: 2,
    institution: "University of Texas at Austin",
    degree: "Bachelor of Science",
    fieldOfStudy: "Software Engineering",
    startDate: "2016-09-01",
    endDate: "2020-05-30",
    isCurrent: false,
    grade: "GPA: 3.85/4.0"
  }
];

export const initialMessages: MessageItem[] = [
  {
    id: 1,
    senderName: "Sarah Jenkins",
    senderEmail: "sarah@stripe.com",
    subject: "Hiring Inquiry: Full-Stack Developer Role",
    messageContent: "Hi, I checked out your recent fintech project and loved the custom transaction reporting. We have an open staff role in our core team. Let me know if you would like to connect next Tuesday!",
    isRead: false,
    isStarred: true,
    createdAt: "2026-07-08T14:30:00Z"
  },
  {
    id: 2,
    senderName: "Marcus Aurelius",
    senderEmail: "marcus@rome.org",
    subject: "Collaboration Request on Zen App",
    messageContent: "A wonderful portfolio! I am looking for an architect to bootstrap the backend of our meditation log app using clean architecture guidelines. Your spring security expertise is exactly what we need.",
    isRead: true,
    isStarred: false,
    createdAt: "2026-07-06T09:15:00Z"
  }
];

export const initialAnalytics: AnalyticsMetric = {
  pageViews: 12450,
  uniqueVisitors: 4120,
  averageSessionSec: 184,
  contactConversionRate: 2.8,
  viewsHistory: [
    { date: "Jul 03", views: 1200, visitors: 390 },
    { date: "Jul 04", views: 1450, visitors: 420 },
    { date: "Jul 05", views: 1100, visitors: 350 },
    { date: "Jul 06", views: 1800, visitors: 580 },
    { date: "Jul 07", views: 2100, visitors: 690 },
    { date: "Jul 08", views: 2450, visitors: 820 },
    { date: "Jul 09", views: 2350, visitors: 870 }
  ],
  referrals: [
    { source: "GitHub", count: 4890, percentage: 39.3 },
    { source: "LinkedIn", count: 3240, percentage: 26.0 },
    { source: "Direct Traffic", count: 2180, percentage: 17.5 },
    { source: "Google / SEO", count: 1440, percentage: 11.6 },
    { source: "Twitter / X", count: 700, percentage: 5.6 }
  ],
  countries: [
    { country: "United States", count: 5890 },
    { country: "India", count: 2120 },
    { country: "Germany", count: 1100 },
    { country: "United Kingdom", count: 980 },
    { country: "Canada", count: 850 },
    { country: "Japan", count: 710 }
  ],
  browsers: [
    { browser: "Chrome", count: 7450 },
    { browser: "Safari", count: 2890 },
    { browser: "Firefox", count: 1120 },
    { browser: "Edge", count: 710 },
    { browser: "Other", count: 280 }
  ],
  devices: [
    { device: "Desktop", count: 8590 },
    { device: "Mobile", count: 3240 },
    { device: "Tablet", count: 520 },
    { device: "Other", count: 100 }
  ],
  projectsViewed: [
    { projectTitle: "AI-Powered Meeting Summarizer", count: 1240, slug: "ai-meeting-summarizer" },
    { projectTitle: "Distributed Redis Clone", count: 980, slug: "distributed-redis-clone" },
    { projectTitle: "Enterprise Cloud Security Mesh", count: 720, slug: "cloud-security-mesh" }
  ],
  clicks: [
    { elementId: "github_profile", label: "GitHub Profile View", count: 320 },
    { elementId: "linkedin_profile", label: "LinkedIn Connect", count: 280 },
    { elementId: "contact_submit", label: "Contact Form Submit Button", count: 45 },
    { elementId: "experience_linkedin", label: "Company Profile Link", count: 110 }
  ],
  resumeDownloads: 345,
  apiMetrics: {
    totalRequests: 1420,
    failedRequests: 12,
    slowRequests: 34,
    avgResponseTimeMs: 42.5,
    history: [
      {
        method: "GET",
        path: "/api/portfolio-combined",
        status: 200,
        durationMs: 82.1,
        isFailed: false,
        isSlow: false,
        timestamp: "2026-07-18T06:30:00.000Z"
      },
      {
        method: "POST",
        path: "/api/analytics/track",
        status: 200,
        durationMs: 14.5,
        isFailed: false,
        isSlow: false,
        timestamp: "2026-07-18T06:31:00.000Z"
      }
    ]
  }
};

export const initialSettings: SettingsConfig = {
  siteName: "Alex Dev | Tech Architect & Systems builder",
  siteDescription: "The digital home of Alex Dev, showing core full-stack competencies, cloud engineering certifications, and interactive UI creations.",
  metaKeywords: "Alex Dev, software architect, Spring Boot developer, React specialist, cloud engineering, Java backend portfolio",
  themeColor: "#10b981", // emerald-500
  analyticsId: "G-990321A8",
  isMaintenanceMode: false,
  allowContact: true
};

export const initialFooter: FooterConfig = {
  title: "Alex Dev",
  description: "Designing high-throughput distributed architectures & interactive visual frameworks.",
  copyrightText: "© 2026 Chandru Mohan Portfolio. All database relations mapped to 3NF standards.",
  builtWithText: "Securely served from local sandbox cache. Admin actions synchronized with Express backend.",
  contactInfo: "chandrumohan550@gmail.com | San Francisco, California",
  showResume: true,
  resumeText: "View Resume",
  logoText: "Alex Dev",
  logoUrl: "",
  backgroundType: "glass",
  customBackgroundUrl: "",
  theme: "glass",
  isVisible: true
};

export const initialSocialLinks: SocialLinkItem[] = [
  {
    id: 1,
    platform: "GitHub",
    username: "Chandru9842",
    profileUrl: "https://github.com/Chandru9842",
    icon: "GitHub",
    displayOrder: 1,
    isVisible: true,
    showInDynamicProfile: true,
    showInCoordinates: true,
    showInFooter: true,
    showInContact: true,
    showInHero: false,
    showInSystemConsole: false,
    createdAt: "2026-07-09T04:40:00.000Z",
    updatedAt: "2026-07-09T04:40:00.000Z"
  },
  {
    id: 2,
    platform: "LinkedIn",
   username: "chandru9842",
    profileUrl: "https://www.linkedin.com/in/chandru9842/",
    icon: "LinkedIn",
    displayOrder: 2,
    isVisible: true,
    showInDynamicProfile: true,
    showInCoordinates: true,
    showInFooter: true,
    showInContact: true,
    showInHero: false,
    showInSystemConsole: false,
    createdAt: "2026-07-09T04:40:00.000Z",
    updatedAt: "2026-07-09T04:40:00.000Z"
  },
  {
    id: 3,
    platform: "X (Twitter)",
    username: "chandru_kmn",
    profileUrl: "https://x.com/chandru_kmn",
    icon: "X (Twitter)",
    displayOrder: 3,
    isVisible: true,
    showInDynamicProfile: true,
    showInCoordinates: true,
    showInFooter: true,
    showInContact: true,
    showInHero: false,
    showInSystemConsole: false,
    createdAt: "2026-07-09T04:40:00.000Z",
    updatedAt: "2026-07-09T04:40:00.000Z"
  },
  {
    id: 4,
    platform: "Email",
    username: "chandrumohan550@gmail.com",
    profileUrl: "mailto:chandrumohan550@gmail.com",
    icon: "Email",
    displayOrder: 4,
    isVisible: true,
    showInDynamicProfile: true,
    showInCoordinates: true,
    showInFooter: true,
    showInContact: true,
    showInHero: false,
    showInSystemConsole: false,
    createdAt: "2026-07-09T04:40:00.000Z",
    updatedAt: "2026-07-09T04:40:00.000Z"
  }
];

export const initialResumes: ResumeItem[] = [
  {
    id: 1,
    title: "Alex Dev - Principal Systems Engineer Resume",
    version: "2.4.0",
    description: "Principal Systems Engineer CV focusing on Full-Stack systems architecture, Kubernetes, and AI Integration with Gemini API.",
    fileName: "Alex_Dev_Resume_v2.4.pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "application/pdf",
    fileSize: 45210, // ~45 KB
    cloudinaryPublicId: "portfolio/resume/alex_dev_systems_eng_v2_4",
    thumbnailImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=260&auto=format&fit=crop",
    isActive: true,
    isDownloadEnabled: true,
    uploadedAt: "2026-06-15T09:30:00.000Z",
    updatedAt: "2026-07-01T12:00:00.000Z"
  },
  {
    id: 2,
    title: "Alex Dev - Full-Stack React Architect CV",
    version: "2.3.1",
    description: "Secondary draft focusing specifically on Frontend performance, Tailwind UI crafting, and edge rendering systems.",
    fileName: "Alex_Dev_CV_Frontend_v2.3.1.pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "application/pdf",
    fileSize: 38940, // ~39 KB
    cloudinaryPublicId: "portfolio/resume/alex_dev_react_arch_v2_3_1",
    thumbnailImage: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=260&auto=format&fit=crop",
    isActive: false,
    isDownloadEnabled: true,
    uploadedAt: "2026-05-10T14:15:00.000Z",
    updatedAt: "2026-05-10T14:15:00.000Z"
  }
];

export interface BackgroundConfig {
  type: 'image' | 'video' | 'animated' | 'gradient';
  src: string;
  enabled: boolean;
  opacity: number;
  blur: number;
  brightness: number;
  overlayColor: string;
}

export interface ThemeSettings {
  id: number;
  themeMode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  buttonColor: string;
  hoverColor: string;
  gradientStart: string;
  gradientEnd: string;

  // Background configurations
  heroBackground: BackgroundConfig;
  aboutBackground: BackgroundConfig;
  sectionBackgrounds: BackgroundConfig;
  footerBackground: BackgroundConfig;
  customWallpaper: BackgroundConfig;

  // Animations
  animationsEnabled: boolean;
  pageTransition: 'fade' | 'zoom' | 'slide' | 'parallax' | 'none';
  mouseGlow: boolean;
  cursorEffect: 'none' | 'sparkle' | 'trail' | 'invert';
  floatingObjects: boolean;
  particlesEnabled: boolean;
  glassEffect: boolean;
  animationSpeed: number; // e.g. 1.0

  // 3D Settings
  threeDEnabled: boolean;
  galaxyEnabled: boolean;
  starsEnabled: boolean;
  planetEarthEnabled: boolean;
  laptopModelEnabled: boolean;
  floatingIconsEnabled: boolean;
  cameraMovement: 'none' | 'rotate' | 'pan' | 'follow';
  mouseInteraction3D: boolean;
  lightingIntensity: number;
  fogDensity: number;
  performanceMode: boolean;

  // Typography
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  fontSizeBase: 'sm' | 'base' | 'lg' | 'xl';
  letterSpacing: 'tighter' | 'tight' | 'normal' | 'wide' | 'widest';
  lineHeight: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';

  // Buttons
  buttonShape: 'square' | 'rounded' | 'pill';
  buttonBorderRadius: string;
  buttonShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';
  buttonGlow: boolean;
  buttonHoverEffect: 'none' | 'scale' | 'lift' | 'shine';
  buttonAnimation: 'none' | 'pulse' | 'bounce' | 'wiggle';

  // Layout
  containerWidth: 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';
  sidebarWidth: 'w-60' | 'w-64' | 'w-72' | 'w-80';
  navbarStyle: 'transparent' | 'solid' | 'glass';
  footerStyle: 'simple' | 'detailed' | 'centered';
  layoutSpacing: 'compact' | 'normal' | 'relaxed';
  layoutBorderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const initialThemeSettings: ThemeSettings = {
  id: 1,
  themeMode: 'dark',
  primaryColor: '#10b981', // emerald-500
  secondaryColor: '#059669', // emerald-600
  accentColor: '#34d399', // emerald-400
  textColor: '#f8fafc', // slate-50
  backgroundColor: '#020617', // slate-950
  cardColor: '#0f172a66', // slate-900 with opacity 0.4
  borderColor: '#10b98133', // emerald-500 with opacity 0.2
  buttonColor: '#10b981', // emerald-500
  hoverColor: '#059669', // emerald-600
  gradientStart: '#020617',
  gradientEnd: '#0b1528',

  heroBackground: {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    enabled: true,
    opacity: 0.15,
    blur: 0,
    brightness: 1,
    overlayColor: '#020617'
  },
  aboutBackground: {
    type: 'gradient',
    src: '',
    enabled: true,
    opacity: 0.1,
    blur: 4,
    brightness: 1,
    overlayColor: '#020617'
  },
  sectionBackgrounds: {
    type: 'gradient',
    src: '',
    enabled: true,
    opacity: 0.1,
    blur: 0,
    brightness: 1,
    overlayColor: '#020617'
  },
  footerBackground: {
    type: 'gradient',
    src: '',
    enabled: true,
    opacity: 0.1,
    blur: 0,
    brightness: 1,
    overlayColor: '#020617'
  },
  customWallpaper: {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    enabled: false,
    opacity: 0.1,
    blur: 8,
    brightness: 0.8,
    overlayColor: '#020617'
  },

  animationsEnabled: true,
  pageTransition: 'fade',
  mouseGlow: true,
  cursorEffect: 'none',
  floatingObjects: true,
  particlesEnabled: true,
  glassEffect: true,
  animationSpeed: 1.0,

  threeDEnabled: true,
  galaxyEnabled: true,
  starsEnabled: true,
  planetEarthEnabled: true,
  laptopModelEnabled: true,
  floatingIconsEnabled: true,
  cameraMovement: 'follow',
  mouseInteraction3D: true,
  lightingIntensity: 1.0,
  fogDensity: 0.015,
  performanceMode: false,

  fontFamily: 'Inter',
  headingFont: 'Space Grotesk',
  bodyFont: 'Inter',
  fontSizeBase: 'base',
  letterSpacing: 'normal',
  lineHeight: 'relaxed',

  buttonShape: 'rounded',
  buttonBorderRadius: '0.75rem',
  buttonShadow: 'md',
  buttonGlow: true,
  buttonHoverEffect: 'lift',
  buttonAnimation: 'none',

  containerWidth: 'max-w-7xl',
  sidebarWidth: 'w-64',
  navbarStyle: 'glass',
  footerStyle: 'simple',
  layoutSpacing: 'normal',
  layoutBorderRadius: 'xl'
};

export const initialAchievements: AchievementItem[] = [
  {
    id: 1,
    title: "Global AI Hackathon Champion",
    subtitle: "1st Place out of 450+ Teams Worldwide",
    shortDescription: "Won first prize in the open-track AI automation and generative models division with an autonomous microservice orchestration platform.",
    description: "Led a remote engineering team of 4 to design, build, and pitch an intelligent service orchestration engine. The solution utilized localized LLMs to auto-heal distributed REST endpoints, achieving a 98% reduction in mean time to repair (MTTR). Awarded Grand Prize by industry experts.",
    category: "Hackathon",
    organization: "Global AI Alliance & Google Cloud",
    achievementDate: "2026-05-15",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80",
    certificateUrl: "",
    credentialUrl: "https://example.com/credentials/global-ai-winner",
    projectUrl: "https://example.com/projects/ai-orchestrator",
    githubUrl: "https://github.com/admin/ai-orchestration-engine",
    demoUrl: "https://example.com/demo/ai-orchestrator",
    skills: ["Team Leadership", "Distributed Systems", "Generative AI API", "Clean Architecture"],
    technologies: ["React", "Go", "Docker", "Python", "Gemini API"],
    position: "Team Lead & Lead Architect",
    awardType: "1st Place Grand Prize",
    badge: "🏆 Champion",
    featured: true,
    visibility: true,
    displayOrder: 1,
    createdAt: "2026-05-16T08:00:00Z",
    updatedAt: "2026-05-16T08:00:00Z"
  },
  {
    id: 2,
    title: "AWS Certified Solutions Architect - Professional",
    subtitle: "Validation of advanced cloud architecture competencies",
    shortDescription: "Acquired industry-standard certification demonstrating expertise in design, migration, and management of complex enterprise cloud deployments.",
    description: "Successfully cleared the professional tier examination proving mastery in designing secure, resilient, and dynamically scalable multi-tier web architectures across complex hybrid-cloud environments with stringent high-availability constraints.",
    category: "Certification",
    organization: "Amazon Web Services (AWS)",
    achievementDate: "2026-02-10",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=120&q=80",
    certificateUrl: "",
    credentialUrl: "https://example.com/verify/aws-sap-994321",
    skills: ["Cloud Architecture", "Enterprise Security", "Cost Optimization", "Disaster Recovery"],
    technologies: ["AWS", "Terraform", "Kubernetes", "IAM", "VPC"],
    position: "Solutions Architect",
    awardType: "Professional Certification",
    badge: "☁️ AWS SAP-C02",
    featured: true,
    visibility: true,
    displayOrder: 2,
    createdAt: "2026-02-11T10:00:00Z",
    updatedAt: "2026-02-11T10:00:00Z"
  },
  {
    id: 3,
    title: "1st Place - National Competitive Coding Championship",
    subtitle: "Ranked #1 out of 2,500+ Top Collegiate Programmers",
    shortDescription: "Achieved perfect score in record speed across advanced data structures, graph theory, and dynamic programming algorithms.",
    description: "Competed in the annual algorithmic showdown, solving all 8 complex logic problems in under 92 minutes. Leveraged highly optimized C++ code and advanced algorithmic complexity techniques to secure the top spot in the leaderboards.",
    category: "Coding",
    organization: "National Informatics Society",
    achievementDate: "2025-11-05",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=120&q=80",
    certificateUrl: "",
    credentialUrl: "https://example.com/rank/nicc-2025-alex",
    skills: ["Competitive Programming", "Advanced Algorithms", "Dynamic Programming", "Time Complexity Optimization"],
    technologies: ["C++", "Python", "Data Structures"],
    position: "Contestant",
    awardType: "1st Place Winner",
    badge: "💻 Elite Coder",
    featured: false,
    visibility: true,
    displayOrder: 3,
    createdAt: "2025-11-06T09:00:00Z",
    updatedAt: "2025-11-06T09:00:00Z"
  }
];

export const initialCodingProfiles: CodingProfileItem[] = [
  {
    id: 1,
    platformType: "GitHub",
    displayName: "GitHub Developer",
    username: "alex-rivera-dev",
    profileUrl: "https://github.com",
    description: "Open-source contributor, maintaining distributed microservices and systems tools.",
    displayOrder: 1,
    visible: true,
    featured: true,
    openInNewTab: true
  },
  {
    id: 2,
    platformType: "LeetCode",
    displayName: "LeetCode Algorithm Ledger",
    username: "alex_architect",
    profileUrl: "https://leetcode.com",
    description: "Knight Badge (Rating 2150+) | 1,200+ Data Structures & Algorithms Problems Solved.",
    displayOrder: 2,
    visible: true,
    featured: true,
    openInNewTab: true
  },
  {
    id: 3,
    platformType: "GeeksforGeeks",
    displayName: "GeeksforGeeks Profile",
    username: "alex_systems",
    profileUrl: "https://geeksforgeeks.org",
    description: "Top 1% Campus Rank | Problem Solving & Core Computer Science.",
    displayOrder: 3,
    visible: true,
    featured: false,
    openInNewTab: true
  }
];

export const initialTools: ToolItem[] = [
  {
    id: 1,
    name: "VS Code",
    slug: "vs-code",
    category: "Development IDEs",
    description: "Primary lightweight code editor equipped with rich extension ecosystem, custom keybindings, and debugger integration.",
    officialWebsite: "https://code.visualstudio.com",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Code2",
    brandColor: "#007ACC",
    backgroundColor: "#007ACC15",
    borderColor: "#007ACC40",
    hoverColor: "#007ACC",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 2,
    experienceLevel: "Expert",
    yearsOfExperience: 8,
    isFeatured: true,
    displayOrder: 1,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "TypeScript",
    slug: "typescript",
    category: "Programming Languages",
    description: "Strongly typed programming language built on JavaScript for scalable micro-architectures and enterprise frontends.",
    officialWebsite: "https://www.typescriptlang.org",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "FileCode",
    brandColor: "#3178C6",
    backgroundColor: "#3178C615",
    borderColor: "#3178C640",
    hoverColor: "#3178C6",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 0,
    experienceLevel: "Expert",
    yearsOfExperience: 6,
    isFeatured: true,
    displayOrder: 2,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 3,
    name: "React",
    slug: "react",
    category: "Frontend",
    description: "Declarative component-driven UI library utilized for high-throughput single-page web applications.",
    officialWebsite: "https://react.dev",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Atom",
    brandColor: "#61DAFB",
    backgroundColor: "#61DAFB15",
    borderColor: "#61DAFB40",
    hoverColor: "#61DAFB",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 4,
    experienceLevel: "Expert",
    yearsOfExperience: 7,
    isFeatured: true,
    displayOrder: 3,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 4,
    name: "Node.js",
    slug: "nodejs",
    category: "Backend",
    description: "Asynchronous event-driven JavaScript runtime built on Chrome V8 engine for high-concurrency API servers.",
    officialWebsite: "https://nodejs.org",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Server",
    brandColor: "#5FA04E",
    backgroundColor: "#5FA04E15",
    borderColor: "#5FA04E40",
    hoverColor: "#5FA04E",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: -2,
    experienceLevel: "Expert",
    yearsOfExperience: 7,
    isFeatured: true,
    displayOrder: 4,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 5,
    name: "PostgreSQL",
    slug: "postgresql",
    category: "Databases",
    description: "Advanced open-source object-relational database system with high ACID compliance and JSON query indexing.",
    officialWebsite: "https://www.postgresql.org",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Database",
    brandColor: "#4169E1",
    backgroundColor: "#4169E115",
    borderColor: "#4169E140",
    hoverColor: "#4169E1",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: false,
    hoverScale: 1.05,
    hoverRotation: 0,
    experienceLevel: "Advanced",
    yearsOfExperience: 5,
    isFeatured: false,
    displayOrder: 5,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 6,
    name: "Docker",
    slug: "docker",
    category: "DevOps",
    description: "Containerization engine used to package applications with system dependencies for reproducible cloud deployments.",
    officialWebsite: "https://www.docker.com",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Box",
    brandColor: "#2496ED",
    backgroundColor: "#2496ED15",
    borderColor: "#2496ED40",
    hoverColor: "#2496ED",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 3,
    experienceLevel: "Advanced",
    yearsOfExperience: 5,
    isFeatured: true,
    displayOrder: 6,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 7,
    name: "AWS",
    slug: "aws",
    category: "Cloud & Deployment",
    description: "Comprehensive cloud platform supplying serverless computing, S3 object buckets, IAM, and VPC infrastructure.",
    officialWebsite: "https://aws.amazon.com",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Cloud",
    brandColor: "#FF9900",
    backgroundColor: "#FF990015",
    borderColor: "#FF990040",
    hoverColor: "#FF9900",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 0,
    experienceLevel: "Advanced",
    yearsOfExperience: 5,
    isFeatured: true,
    displayOrder: 7,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 8,
    name: "Git",
    slug: "git",
    category: "Version Control",
    description: "Distributed version control system for tracking changes in source code during collaborative software development.",
    officialWebsite: "https://git-scm.com",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "GitBranch",
    brandColor: "#F05032",
    backgroundColor: "#F0503215",
    borderColor: "#F0503240",
    hoverColor: "#F05032",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: false,
    hoverScale: 1.05,
    hoverRotation: -3,
    experienceLevel: "Expert",
    yearsOfExperience: 8,
    isFeatured: false,
    displayOrder: 8,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 9,
    name: "Postman",
    slug: "postman",
    category: "API Tools",
    description: "API platform for building, testing, documenting, and automating REST & GraphQL HTTP endpoint calls.",
    officialWebsite: "https://www.postman.com",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Send",
    brandColor: "#FF6C37",
    backgroundColor: "#FF6C3715",
    borderColor: "#FF6C3740",
    hoverColor: "#FF6C37",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: false,
    hoverScale: 1.05,
    hoverRotation: 0,
    experienceLevel: "Advanced",
    yearsOfExperience: 6,
    isFeatured: false,
    displayOrder: 9,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 10,
    name: "Figma",
    slug: "figma",
    category: "Design",
    description: "Collaborative interface design tool for wireframing, prototyping, and establishing component design tokens.",
    officialWebsite: "https://www.figma.com",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Figma",
    brandColor: "#F24E1E",
    backgroundColor: "#F24E1E15",
    borderColor: "#F24E1E40",
    hoverColor: "#F24E1E",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 2,
    experienceLevel: "Intermediate",
    yearsOfExperience: 4,
    isFeatured: false,
    displayOrder: 10,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 11,
    name: "Gemini AI",
    slug: "gemini-ai",
    category: "AI Tools",
    description: "Google multimodal AI platform used for automated code synthesis, intelligence agent prompts, and LLM orchestration.",
    officialWebsite: "https://deepmind.google/technologies/gemini/",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Sparkles",
    brandColor: "#10B981",
    backgroundColor: "#10B98115",
    borderColor: "#10B98140",
    hoverColor: "#10B981",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 4,
    experienceLevel: "Advanced",
    yearsOfExperience: 3,
    isFeatured: true,
    displayOrder: 11,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 12,
    name: "Linux",
    slug: "linux",
    category: "Operating Systems",
    description: "Unix-like open-source operating system kernel providing high stability, bash scripting, and container host environments.",
    officialWebsite: "https://www.kernel.org",
    logoType: "icon",
    iconLibrary: "lucide",
    iconName: "Terminal",
    brandColor: "#FCC624",
    backgroundColor: "#FCC62415",
    borderColor: "#FCC62440",
    hoverColor: "#FCC624",
    logoSize: 28,
    logoPadding: 8,
    borderRadius: "0.75rem",
    hasGlow: false,
    hoverScale: 1.05,
    hoverRotation: 0,
    experienceLevel: "Advanced",
    yearsOfExperience: 7,
    isFeatured: false,
    displayOrder: 12,
    isVisible: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  }
];

export const initialPortfolioMetrics: PortfolioMetricItem[] = [
  {
    id: 1,
    title: "Page Views",
    value: "12,450",
    subtitle: "Live Impressions",
    icon: "Eye",
    iconType: "lucide",
    displayOrder: 1,
    visible: true,
    animationEnabled: true,
    counterAnimationToggle: true,
    color: "emerald",
    sourceType: "manual",
    tooltip: "Total portfolio page views recorded across user sessions",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "Unique Visitors",
    value: "4,820",
    subtitle: "Distinct Clients",
    icon: "Users",
    iconType: "lucide",
    displayOrder: 2,
    visible: true,
    animationEnabled: true,
    counterAnimationToggle: true,
    color: "blue",
    sourceType: "manual",
    tooltip: "Unique visitor footprint verified via client SHA-256 hashes",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 3,
    title: "Projects Delivered",
    value: "15+",
    subtitle: "Production Grade",
    icon: "Briefcase",
    iconType: "lucide",
    displayOrder: 3,
    visible: true,
    animationEnabled: true,
    counterAnimationToggle: true,
    color: "purple",
    sourceType: "manual",
    tooltip: "Full-stack enterprise applications built and deployed",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 4,
    title: "LeetCode Solved",
    value: "350+",
    subtitle: "Knight Rating 2150+",
    icon: "Code2",
    iconType: "lucide",
    displayOrder: 4,
    visible: true,
    animationEnabled: true,
    counterAnimationToggle: true,
    color: "amber",
    sourceType: "leetcode_api",
    tooltip: "Algorithmic problems solved across Data Structures & Algorithms",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 5,
    title: "GitHub Repositories",
    value: "28",
    subtitle: "Open Source",
    icon: "GitBranch",
    iconType: "lucide",
    displayOrder: 5,
    visible: true,
    animationEnabled: true,
    counterAnimationToggle: true,
    color: "cyan",
    sourceType: "github_api",
    tooltip: "Public source control repositories and open-source packages",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: 6,
    title: "Certifications",
    value: "12+",
    subtitle: "AWS & Kubernetes",
    icon: "Award",
    iconType: "lucide",
    displayOrder: 6,
    visible: true,
    animationEnabled: true,
    counterAnimationToggle: true,
    color: "indigo",
    sourceType: "manual",
    tooltip: "Verified professional cloud, security, and DevOps certifications",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  }
];



