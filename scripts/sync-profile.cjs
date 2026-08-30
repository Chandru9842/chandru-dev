const fs = require('fs');
const path = require('path');

const profile = {
  id: 1,
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=75&fm=webp',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75&fm=webp',
  aboutImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=75&fm=webp',
  heroBackground: '',
  heroAvatar: '',
  heroBadge: 'FULL STACK JAVA DEVELOPER',
  professionalLabel: 'SYSTEMS ARCHITECT',
  heroName: 'CHANDRU M',
  heroTitle: 'Principal Systems Architect',
  heroSubtitle: 'Java Full Stack Developer',
  heroDescription: 'I design and build resilient cloud systems, real-time analytics engines, and gorgeous web-based developer interfaces that scale dynamically.',
  fullName: 'Chandru Mohan',
  displayName: 'Chandru Dev',
  title: 'Principal Systems Architect',
  subtitle: 'Designing high-throughput distributed architectures & interactive visual frameworks.',
  typingText: 'Principal Systems Architect, Full-Stack Pioneer, Clean Code Advocate, Java 21 Specialist',
  shortBio: "Hi, I'm Chandru Mohan. I specialize in designing and engineering scalable microservice frameworks and high-performance React systems.",
  aboutDescription: "With extensive professional enterprise engineering experience, I bridge the gap between rigorous back-end systems engineering and fluid, interactive modern interfaces. I'm passionate about automation, clean database designs, and optimal React state pipelines.",
  shortTagline: 'Ecosystem Architect & Product Pioneer',
  shortIntroduction: 'I design and build resilient cloud systems, real-time analytics engines, and gorgeous web-based developer interfaces that scale dynamically.',
  biography: "I am a high-throughput systems developer with an obsession for performance and visual fidelity. Over the past years, I've designed cloud native integrations, written database layers supporting millions of transactions, and optimized responsive micro-dashboards.",
  careerObjective: 'To drive high-impact technical initiatives as a Principal Software Engineer, leading teams to deliver ultra-scalable systems, beautiful developer experiences, and resilient microservices architectures.',
  aboutHeading: 'A Journey of Technical Rigor & Aesthetic Execution',
  experienceSummary: 'Crafting Clean Systems & Interactive Developer Tools',
  skillsSummary: 'Microservice Design, Real-time WebSockets, PostgreSQL optimization, High-performance React, Tailwind CSS design languages, DevOps automation',
  quickStats: '8+ Years Exp | 50+ Projects Mapped | 99.9% Core SLA Uptime | 120k+ Lines Written',
  highlightTags: '#CloudNative, #HighConcurrency, #ZeroDowntime, #DistributedSystems, #Java21, #SpringBoot, #Kafka, #React',
  statusBadgeText: 'Founder Online / Available for Hire',
  onlineStatus: 'Online',
  versionText: 'Version 2.4.0',
  updateText: 'Updated Recently',
  heroVisibility: true,
  websiteLogo: '',
  logoUrl: '',
  logoText: 'C',
  faviconUrl: '/favicon.svg',
  seoTitle: 'Chandru Mohan | Principal Systems Architect & Full Stack Java Developer',
  seoDescription: 'Enterprise portfolio of Chandru Mohan featuring high-scale distributed systems, Java 21, Spring Boot microservices, Kafka event streams, and cloud architecture.',
  seoKeywords: 'Chandru Mohan, Systems Architect, Full Stack Java Developer, Spring Boot, Kafka, React, Cloud, Microservices, TypeScript',
  ogTitle: 'Chandru Mohan - Principal Systems Architect Portfolio CMS',
  ogDescription: 'Architecting high-performance cloud applications & resilient enterprise platforms.',
  ogImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  primaryCtaText: 'Explore Engineering',
  primaryCtaUrl: '#projects',
  primaryCtaIcon: 'ChevronRight',
  primaryCtaVisible: true,
  secondaryCtaText: 'Get in Touch',
  secondaryCtaUrl: '#contact',
  secondaryCtaIcon: 'Mail',
  secondaryCtaVisible: true,
  resumeCtaText: 'View Resume',
  resumeCtaVisible: true,
  downloadCtaText: 'Download CV',
  downloadCtaVisible: true,
  floatingIconsVisible: true,
  contactHeading: "Let's coordinate on new paradigms",
  contactDescription: 'Have an open enterprise role, a microservices system challenge, or want to collaborate on clean-architecture solutions? Send an inquiry.',
  contactSectionVisible: true,
  apiStatusCardVisible: true,
  apiStatusText: 'REST Pool: ONLINE | Cascade Purge Hooks: ATTACHED',
  dynamicChannelsVisible: true,
  email: 'chandrumohan550@gmail.com',
  phone: '+91 9655384140',
  whatsapp: '+91 9655384140',
  resumeUrl: '/api/resume/download',
  resumeDownloadText: 'Download CV',
  location: 'Bengaluru, India',
  country: 'India',
  availability: 'Open to Work',
  yearsExperience: 8,
  currentCompany: 'Nexus Cloud Systems',
  currentPosition: 'Principal Systems Architect',
  birthday: '1998-04-09',
  resumeId: 1,
  githubUrl: 'https://github.com/Chandru9842',
  linkedinUrl: 'https://www.linkedin.com/in/chandru9842/',
  instagramUrl: 'https://instagram.com/chandru_kmn',
  twitterUrl: 'https://x.com/chandru_kmn',
  youtubeUrl: 'https://youtube.com',
  leetcodeUrl: 'https://leetcode.com/username',
  hackerrankUrl: 'https://hackerrank.com/username',
  codechefUrl: 'https://codechef.com/users/username',
  codeforcesUrl: 'https://codeforces.com/profile/username',
  portfolioUrl: 'https://chandru-dev-lime.vercel.app/',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString()
};

['src/data/db.json', 'data/db.json'].forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const json = JSON.parse(raw);
    json.profile = { ...profile, ...(json.profile || {}) };
    // Ensure critical identity fields stay intact
    json.profile.fullName = profile.fullName;
    json.profile.email = profile.email;
    json.profile.phone = profile.phone;
    json.profile.whatsapp = profile.whatsapp;
    json.profile.githubUrl = profile.githubUrl;
    json.profile.linkedinUrl = profile.linkedinUrl;
    json.profile.portfolioUrl = profile.portfolioUrl;
    fs.writeFileSync(fullPath, JSON.stringify(json, null, 2), 'utf-8');
    console.log('Successfully written profile to', relPath);
  }
});
