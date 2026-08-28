import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, BookOpen, Cpu, Award, Briefcase, GraduationCap, 
  BarChart3, Mail, Settings, RefreshCw, Terminal, LogOut, Code2, Database, ShieldAlert,
  Share2, FileText, User, Palette, AlertTriangle, Trophy, Shield, History,
  Menu, X, Folder, Eye, Sparkles, Search, Bell, HardDrive, ShieldCheck, Activity, Globe, Lock
} from 'lucide-react';

// Subpages
import DashboardPage from './admin/DashboardPage';
import ProfilePage from './admin/ProfilePage';
import ProjectsPage from './admin/ProjectsPage';
import SkillsPage from './admin/SkillsPage';
import CertificatesPage from './admin/CertificatesPage';
import AchievementsPage from './admin/AchievementsPage';
import ExperiencePage from './admin/ExperiencePage';
import EducationPage from './admin/EducationPage';
import AnalyticsPage from './admin/AnalyticsPage';
import MessagesPage from './admin/MessagesPage';
import SettingsPage from './admin/SettingsPage';
import SocialLinksPage from './admin/SocialLinksPage';
import ResumePage from './admin/ResumePage';
import FooterManagementPage, { FooterSocialLinkItem } from './admin/FooterManagementPage';
import ThemePage from './admin/ThemePage';
import ActivityHistoryPage from './admin/ActivityHistoryPage';
import SecuritySettingsPage from './admin/SecuritySettingsPage';
import HeroManagementPage from './admin/HeroManagementPage';
import TechStackPage from './admin/TechStackPage';
import CodingProfilesPage from './admin/CodingProfilesPage';
import MediaManagerPage from './admin/MediaManagerPage';
import ToolsPage from './admin/ToolsPage';
import PortfolioMetricsPage from './admin/PortfolioMetricsPage';
import LivePreviewModal from './admin/LivePreviewModal';

// Enterprise Platform Subpages & Modals
import AIAssistantModal from './admin/AIAssistantModal';
import GlobalSearchModal from './admin/GlobalSearchModal';
import NotificationsDrawer, { NotificationItem } from './admin/NotificationsDrawer';
import NotificationCenterPage from './admin/NotificationCenterPage';
import BackupPage from './admin/BackupPage';
import EmailSettingsPage from './admin/EmailSettingsPage';
import RoleManagementPage from './admin/RoleManagementPage';
import SystemHealthPage from './admin/SystemHealthPage';
import SEOManagerPage from './admin/SEOManagerPage';

// Seed lists
import { 
  ProjectItem, SkillItem,
  CertificateItem, ExperienceItem, EducationItem, MessageItem, SettingsConfig, SocialLinkItem,
  ThemeSettings, initialThemeSettings, AchievementItem, CodingProfileItem, ToolItem, PortfolioMetricItem
} from '../data/cmsMockData';

import Toast, { ToastProps } from './Toast';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps = {}) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Enterprise Modals & Drawer State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Database lists
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<SettingsConfig | null>(null);
  const [footer, setFooter] = useState<any>(null);
  const [footerSocialLinks, setFooterSocialLinks] = useState<FooterSocialLinkItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [codingProfiles, setCodingProfiles] = useState<CodingProfileItem[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetricItem[]>([]);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Global Toast State
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

  // Sync / loading status
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detect Recruiter / Guest Demo Mode session
  const isDemoSession = React.useMemo(() => {
    try {
      const rawUser = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed.isDemo) return true;
      }
    } catch (e) {}
    return sessionStorage.getItem('is_demo_session') === 'true';
  }, []);

  // Helper trigger Toast
  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Helper to check Demo restrictions on write operations
  const checkDemoRestriction = (actionName = 'Modifying records') => {
    if (isDemoSession) {
      triggerToast(`🛡️ Recruiter / Demo Mode: You have read-only access in the demo tour. ${actionName} is disabled in demo mode. Please log in as Master Admin to create, edit, or delete records.`, 'error');
      return true;
    }
    return false;
  };

  // Helper to get authentication header
  const getAuthHeader = () => {
    const token = localStorage.getItem('alex_dev_jwt_token') || localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const getJsonHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
  };

  // Fetch all database lists from Express APIs
  const fetchAllData = async () => {
    try {
      const cacheBuster = `t=${Date.now()}`;
      const authHeader = getAuthHeader();
      const [projectsRes, skillsRes, certsRes, achievementsRes, expRes, eduRes, msgRes, analyticsRes, settingsRes, footerRes, socialsRes, themeRes, profileRes, footerSocialsRes, codingProfilesRes, toolsRes, metricsRes] = await Promise.all([
        fetch(`/api/projects?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/skills?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/certificates?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/achievements?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/experiences?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/education?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/messages?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/analytics?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/settings?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/footer?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/social-links?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/theme?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/profile?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/footer/social-links?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/coding-profiles?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/tools?${cacheBuster}`, { headers: authHeader }),
        fetch(`/api/portfolio-metrics?${cacheBuster}`, { headers: authHeader })
      ]);

      const projectsData = await projectsRes.json();
      const skillsData = await skillsRes.json();
      const certsData = await certsRes.json();
      const achievementsData = await achievementsRes.json();
      const expData = await expRes.json();
      const eduData = await eduRes.json();
      const msgData = await msgRes.json();
      const analyticsData = await analyticsRes.json();
      const settingsData = await settingsRes.json();
      const footerData = await footerRes.json();
      const socialsData = await socialsRes.json();
      const themeData = await themeRes.json();

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setSkills(Array.isArray(skillsData) ? skillsData : []);
      setCertificates(Array.isArray(certsData) ? certsData : []);
      setAchievements(Array.isArray(achievementsData) ? achievementsData : []);
      setExperiences(Array.isArray(expData) ? expData : []);
      setEducation(Array.isArray(eduData) ? eduData : []);
      setMessages(Array.isArray(msgData) ? msgData : []);
      setAnalytics(analyticsData);
      setSettings(settingsData);
      setFooter(footerData);
      setSocialLinks(Array.isArray(socialsData) ? socialsData : []);
      setThemeSettings(themeData);
      if (codingProfilesRes.ok) {
        const cpData = await codingProfilesRes.json();
        setCodingProfiles(Array.isArray(cpData) ? cpData : []);
      }
      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        setTools(Array.isArray(toolsData) ? toolsData : []);
      }
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setPortfolioMetrics(Array.isArray(metricsData) ? metricsData : []);
      }
      if (profileRes.ok) {
        setProfile(await profileRes.json());
      }
      if (footerSocialsRes.ok) {
        const fsData = await footerSocialsRes.json();
        setFooterSocialLinks(Array.isArray(fsData) ? fsData : []);
      }
    } catch (error) {
      console.error('Error fetching CMS tables:', error);
      triggerToast('Failed to connect to full-stack API pool.', 'error');
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (e) {
      // transient
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-read', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({}) 
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      triggerToast('Error updating notifications', 'error');
    }
  };

  const handleClearNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/clear', { method: 'POST' });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (e) {
      triggerToast('Error clearing notifications', 'error');
    }
  };

  // Project CRUD
  const handleAddProject = async (proj: Omit<ProjectItem, 'id'>) => {
    if (checkDemoRestriction('Add Project')) {
      const mockProj: ProjectItem = { ...proj, id: Date.now() } as any;
      setProjects(prev => [...prev, mockProj]);
      return;
    }
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(proj)
      });
      if (res.ok) {
        const created = await res.json();
        setProjects(prev => [...prev, created]);
        triggerToast(`Successfully committed project "${proj.title}" to MySQL 3NF pool.`, 'success');
      }
    } catch (e) {
      triggerToast('Error inserting project into database.', 'error');
    }
  };

  const handleUpdateProject = async (proj: ProjectItem) => {
    if (checkDemoRestriction('Update Project')) {
      setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
      return;
    }
    try {
      const res = await fetch(`/api/projects/${proj.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(proj)
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
        triggerToast(`Updated project "${proj.title}" record in DB successfully.`, 'success');
      }
    } catch (e) {
      triggerToast('Error updating project.', 'error');
    }
  };

  const handleDeleteProject = async (id: number) => {
    const target = projects.find(p => p.id === id);
    if (checkDemoRestriction('Delete Project')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/projects/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        triggerToast(`Purged project record: "${target?.title}" from database cascade schemas.`, 'success');
      }
    } catch (e) {
      triggerToast('Error deleting project.', 'error');
    }
  };

  // Skills CRUD
  const handleAddSkill = async (skill: Omit<SkillItem, 'id'>) => {
    if (checkDemoRestriction('Add Skill')) {
      const mockSkill: SkillItem = { ...skill, id: Date.now() } as any;
      setSkills(prev => [...prev, mockSkill]);
      return;
    }
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(skill)
      });
      if (res.ok) {
        const created = await res.json();
        setSkills(prev => [...prev, created]);
        triggerToast(`Registered skill competency "${skill.name}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error adding skill.', 'error');
    }
  };

  const handleUpdateSkill = async (skill: SkillItem) => {
    if (checkDemoRestriction('Update Skill')) {
      setSkills(prev => prev.map(s => s.id === skill.id ? skill : s));
      return;
    }
    try {
      const res = await fetch(`/api/skills/${skill.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(skill)
      });
      if (res.ok) {
        setSkills(prev => prev.map(s => s.id === skill.id ? skill : s));
        triggerToast(`Updated competency metrics for "${skill.name}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error updating skill.', 'error');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    const target = skills.find(s => s.id === id);
    if (checkDemoRestriction('Delete Skill')) {
      setSkills(prev => prev.filter(s => s.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/skills/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setSkills(prev => prev.filter(s => s.id !== id));
        triggerToast(`Removed skill "${target?.name}" from curriculum log.`, 'success');
      }
    } catch (e) {
      triggerToast('Error deleting skill.', 'error');
    }
  };

  // Certificates CRUD
  const handleAddCertificate = async (cert: Omit<CertificateItem, 'id'>) => {
    if (checkDemoRestriction('Add Certificate')) {
      const mockCert: CertificateItem = { ...cert, id: Date.now() } as any;
      setCertificates(prev => [...prev, mockCert]);
      return;
    }
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(cert)
      });
      if (res.ok) {
        const created = await res.json();
        setCertificates(prev => [...prev, created]);
        triggerToast(`Logged certification: "${cert.name}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error logging certificate.', 'error');
    }
  };

  const handleUpdateCertificate = async (cert: CertificateItem) => {
    if (checkDemoRestriction('Update Certificate')) {
      setCertificates(prev => prev.map(c => c.id === cert.id ? cert : c));
      return;
    }
    try {
      const res = await fetch(`/api/certificates/${cert.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(cert)
      });
      if (res.ok) {
        setCertificates(prev => prev.map(c => c.id === cert.id ? cert : c));
        triggerToast(`Updated certificate attributes for "${cert.name}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error updating certificate.', 'error');
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    const target = certificates.find(c => c.id === id);
    if (checkDemoRestriction('Delete Certificate')) {
      setCertificates(prev => prev.filter(c => c.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/certificates/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setCertificates(prev => prev.filter(c => c.id !== id));
        triggerToast(`Purged credentials record: "${target?.name}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error deleting certificate.', 'error');
    }
  };

  // Tools & Technologies CRUD
  const handleAddTool = async (tool: Omit<ToolItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (checkDemoRestriction('Add Tool')) {
      const mockTool: ToolItem = { ...tool, id: Date.now() } as any;
      setTools(prev => [...prev, mockTool]);
      return;
    }
    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(tool)
      });
      if (res.ok) {
        const created = await res.json();
        setTools(prev => [...prev, created]);
        triggerToast(`Added tool "${tool.name}" to database.`, 'success');
      } else {
        triggerToast('Failed to save tool.', 'error');
      }
    } catch (e) {
      triggerToast('Error saving tool.', 'error');
    }
  };

  const handleUpdateTool = async (tool: ToolItem) => {
    if (checkDemoRestriction('Update Tool')) {
      setTools(prev => prev.map(t => t.id === tool.id ? tool : t));
      return;
    }
    try {
      const res = await fetch(`/api/tools/${tool.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(tool)
      });
      if (res.ok) {
        setTools(prev => prev.map(t => t.id === tool.id ? tool : t));
        triggerToast(`Updated tool "${tool.name}" successfully.`, 'success');
      } else {
        triggerToast('Failed to update tool.', 'error');
      }
    } catch (e) {
      triggerToast('Error updating tool.', 'error');
    }
  };

  const handleDeleteTool = async (id: number) => {
    const target = tools.find(t => t.id === id);
    if (checkDemoRestriction('Delete Tool')) {
      setTools(prev => prev.filter(t => t.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setTools(prev => prev.filter(t => t.id !== id));
        triggerToast(`Deleted tool "${target?.name || id}".`, 'success');
      } else {
        triggerToast('Failed to delete tool.', 'error');
      }
    } catch (e) {
      triggerToast('Error deleting tool.', 'error');
    }
  };

  const handleToggleToolVisibility = async (id: number, isVisible: boolean) => {
    if (checkDemoRestriction('Toggle Tool Visibility')) {
      setTools(prev => prev.map(t => t.id === id ? { ...t, isVisible } : t));
      return;
    }
    try {
      const res = await fetch(`/api/tools/${id}/visibility`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ isVisible })
      });
      if (res.ok) {
        setTools(prev => prev.map(t => t.id === id ? { ...t, isVisible } : t));
        triggerToast(`Tool visibility toggled.`, 'success');
      }
    } catch (e) {
      triggerToast('Error toggling visibility.', 'error');
    }
  };

  const handleToggleToolFeatured = async (id: number, isFeatured: boolean) => {
    if (checkDemoRestriction('Toggle Tool Featured')) {
      setTools(prev => prev.map(t => t.id === id ? { ...t, isFeatured } : t));
      return;
    }
    try {
      const res = await fetch(`/api/tools/${id}/featured`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ isFeatured })
      });
      if (res.ok) {
        setTools(prev => prev.map(t => t.id === id ? { ...t, isFeatured } : t));
        triggerToast(`Tool featured status toggled.`, 'success');
      }
    } catch (e) {
      triggerToast('Error toggling featured status.', 'error');
    }
  };

  const handleReorderTools = async (reordered: ToolItem[]) => {
    setTools(reordered);
    if (checkDemoRestriction('Reorder Tools')) {
      return;
    }
    try {
      await fetch('/api/tools/order', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ orderedIds: reordered.map(t => t.id) })
      });
      triggerToast('Tools display order saved.', 'success');
    } catch (e) {
      triggerToast('Error saving tool order.', 'error');
    }
  };

  const handleAddAchievement = async (achievement: Omit<AchievementItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (checkDemoRestriction('Add Achievement')) {
      const mockAch: AchievementItem = { ...achievement, id: Date.now() } as any;
      setAchievements(prev => [...prev, mockAch]);
      return;
    }
    try {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(achievement)
      });
      if (res.ok) {
        const created = await res.json();
        setAchievements(prev => [...prev, created]);
        triggerToast(`Committed achievement "${achievement.title}" to portfolio index.`, 'success');
      } else {
        triggerToast('Failed to insert achievement record.', 'error');
      }
    } catch (e) {
      triggerToast('Error inserting achievement.', 'error');
    }
  };

  const handleUpdateAchievement = async (achievement: AchievementItem) => {
    if (checkDemoRestriction('Update Achievement')) {
      setAchievements(prev => prev.map(a => a.id === achievement.id ? achievement : a));
      return;
    }
    try {
      const res = await fetch(`/api/achievements/${achievement.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(achievement)
      });
      if (res.ok) {
        setAchievements(prev => prev.map(a => a.id === achievement.id ? achievement : a));
        triggerToast(`Updated achievement "${achievement.title}" successfully.`, 'success');
      } else {
        triggerToast('Failed to update achievement.', 'error');
      }
    } catch (e) {
      triggerToast('Error updating achievement.', 'error');
    }
  };

  const handleDeleteAchievement = async (id: number) => {
    const target = achievements.find(a => a.id === id);
    if (checkDemoRestriction('Delete Achievement')) {
      setAchievements(prev => prev.filter(a => a.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setAchievements(prev => prev.filter(a => a.id !== id));
        triggerToast(`Purged achievement record "${target?.title}" from repository.`, 'success');
      } else {
        triggerToast('Failed to delete achievement.', 'error');
      }
    } catch (e) {
      triggerToast('Error deleting achievement.', 'error');
    }
  };

  const handleToggleAchievementVisibility = async (id: number, visibility: boolean) => {
    if (checkDemoRestriction('Toggle Achievement Visibility')) {
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, visibility } : a));
      return;
    }
    try {
      const res = await fetch(`/api/achievements/${id}/visibility`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ visibility })
      });
      if (res.ok) {
        setAchievements(prev => prev.map(a => a.id === id ? { ...a, visibility } : a));
        triggerToast(`Visibility toggled: ${visibility ? 'Published' : 'Draft'}`, 'success');
      } else {
        triggerToast('Failed to toggle visibility.', 'error');
      }
    } catch (e) {
      triggerToast('Error toggling visibility.', 'error');
    }
  };

  const handleToggleAchievementFeatured = async (id: number, featured: boolean) => {
    if (checkDemoRestriction('Toggle Achievement Featured')) {
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, featured } : a));
      return;
    }
    try {
      const res = await fetch(`/api/achievements/${id}/featured`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ featured })
      });
      if (res.ok) {
        setAchievements(prev => prev.map(a => a.id === id ? { ...a, featured } : a));
        triggerToast(`Highlight toggled: ${featured ? 'Featured' : 'Standard'}`, 'success');
      } else {
        triggerToast('Failed to toggle featured status.', 'error');
      }
    } catch (e) {
      triggerToast('Error toggling featured status.', 'error');
    }
  };

  const handleReorderAchievements = async (reordered: AchievementItem[]) => {
    setAchievements(reordered);
    if (checkDemoRestriction('Reorder Achievements')) {
      return;
    }
    try {
      const res = await fetch('/api/achievements/order', {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          order: reordered.map((item, index) => ({
            id: item.id,
            displayOrder: index + 1
          }))
        })
      });
      if (res.ok) {
        triggerToast('Committed new display hierarchy order to database.', 'success');
      } else {
        const freshRes = await fetch('/api/achievements');
        setAchievements(await freshRes.json());
        triggerToast('Failed to save achievement display order.', 'error');
      }
    } catch (e) {
      const freshRes = await fetch('/api/achievements');
      setAchievements(await freshRes.json());
      triggerToast('Error updating display order.', 'error');
    }
  };

  // Experience CRUD
  const handleAddExperience = async (exp: Omit<ExperienceItem, 'id'>) => {
    if (checkDemoRestriction('Add Experience')) {
      const mockExp: ExperienceItem = { ...exp, id: Date.now() } as any;
      setExperiences(prev => [...prev, mockExp]);
      return;
    }
    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(exp)
      });
      if (res.ok) {
        const created = await res.json();
        setExperiences(prev => [...prev, created]);
        triggerToast(`Saved work experience at "${exp.company}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error logging experience.', 'error');
    }
  };

  const handleUpdateExperience = async (exp: ExperienceItem) => {
    if (checkDemoRestriction('Update Experience')) {
      setExperiences(prev => prev.map(e => e.id === exp.id ? exp : e));
      return;
    }
    try {
      const res = await fetch(`/api/experiences/${exp.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(exp)
      });
      if (res.ok) {
        setExperiences(prev => prev.map(e => e.id === exp.id ? exp : e));
        triggerToast(`Updated professional milestone details at "${exp.company}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error updating experience.', 'error');
    }
  };

  const handleDeleteExperience = async (id: number) => {
    const target = experiences.find(e => e.id === id);
    if (checkDemoRestriction('Delete Experience')) {
      setExperiences(prev => prev.filter(e => e.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/experiences/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setExperiences(prev => prev.filter(e => e.id !== id));
        triggerToast(`Deleted experience record for "${target?.company}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error deleting experience.', 'error');
    }
  };

  // Education CRUD
  const handleAddEducation = async (edu: Omit<EducationItem, 'id'>) => {
    if (checkDemoRestriction('Add Education')) {
      const mockEdu: EducationItem = { ...edu, id: Date.now() } as any;
      setEducation(prev => [...prev, mockEdu]);
      return;
    }
    try {
      const res = await fetch('/api/education', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(edu)
      });
      if (res.ok) {
        const created = await res.json();
        setEducation(prev => [...prev, created]);
        triggerToast(`Logged academic degrees at "${edu.institution}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error adding education academic record.', 'error');
    }
  };

  const handleUpdateEducation = async (edu: EducationItem) => {
    if (checkDemoRestriction('Update Education')) {
      setEducation(prev => prev.map(e => e.id === edu.id ? edu : e));
      return;
    }
    try {
      const res = await fetch(`/api/education/${edu.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(edu)
      });
      if (res.ok) {
        setEducation(prev => prev.map(e => e.id === edu.id ? edu : e));
        triggerToast(`Updated academic credentials record for "${edu.institution}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error updating education.', 'error');
    }
  };

  const handleDeleteEducation = async (id: number) => {
    const target = education.find(e => e.id === id);
    if (checkDemoRestriction('Delete Education')) {
      setEducation(prev => prev.filter(e => e.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/education/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setEducation(prev => prev.filter(e => e.id !== id));
        triggerToast(`Purged academic records for "${target?.institution}".`, 'success');
      }
    } catch (e) {
      triggerToast('Error deleting education.', 'error');
    }
  };

  // Messages CRUD
  const handleToggleReadMessage = async (id: number) => {
    if (checkDemoRestriction('Toggle message read state')) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: !m.isRead } : m));
      return;
    }
    try {
      const res = await fetch(`/api/messages/${id}/read`, { 
        method: 'PUT',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: !m.isRead } : m));
      }
    } catch (e) {
      triggerToast('Error marking message as read.', 'error');
    }
  };

  const handleToggleStarMessage = async (id: number) => {
    if (checkDemoRestriction('Toggle message star')) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
      return;
    }
    try {
      const res = await fetch(`/api/messages/${id}/star`, { 
        method: 'PUT',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
        const msg = messages.find(m => m.id === id);
        triggerToast(msg?.isStarred ? "Removed star from message." : "Starred message successfully.", 'success');
      }
    } catch (e) {
      triggerToast('Error toggling message star.', 'error');
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (checkDemoRestriction('Delete message')) {
      setMessages(prev => prev.filter(m => m.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/messages/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        triggerToast("Inbox message removed successfully.", 'success');
      }
    } catch (e) {
      triggerToast('Error purging message.', 'error');
    }
  };

  // Social Links CRUD Handlers
  const handleAddSocialLink = async (social: Omit<SocialLinkItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/social-links', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(social)
      });
      if (res.ok) {
        const created = await res.json();
        setSocialLinks(prev => [...prev, created]);
        triggerToast(`Added social link for platform "${social.platform}".`, 'success');
      } else {
        const errData = await res.json();
        triggerToast(errData.error || 'Failed to add social link.', 'error');
      }
    } catch (e) {
      triggerToast('Error inserting social link.', 'error');
    }
  };

  const handleUpdateSocialLink = async (social: SocialLinkItem) => {
    try {
      const res = await fetch(`/api/social-links/${social.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(social)
      });
      if (res.ok) {
        const updated = await res.json();
        setSocialLinks(prev => prev.map(s => s.id === social.id ? updated : s));
        triggerToast(`Updated social link details for "${social.platform}".`, 'success');
      } else {
        const errData = await res.json();
        triggerToast(errData.error || 'Failed to update social link.', 'error');
      }
    } catch (e) {
      triggerToast('Error updating social link.', 'error');
    }
  };

  const handleDeleteSocialLink = async (id: number) => {
    try {
      const res = await fetch(`/api/social-links/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setSocialLinks(prev => prev.filter(s => s.id !== id));
        triggerToast('Removed social link from backend database.', 'success');
      } else {
        triggerToast('Failed to delete social link.', 'error');
      }
    } catch (e) {
      triggerToast('Error deleting social link.', 'error');
    }
  };

  const handleToggleSocialLinkVisibility = async (id: number, isVisible: boolean) => {
    try {
      const res = await fetch(`/api/social-links/${id}/visibility`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ isVisible })
      });
      if (res.ok) {
        const updated = await res.json();
        setSocialLinks(prev => prev.map(s => s.id === id ? updated : s));
        triggerToast(`Social link visibility toggled to ${isVisible ? 'Visible' : 'Hidden'}.`, 'success');
      } else {
        triggerToast('Failed to toggle visibility.', 'error');
      }
    } catch (e) {
      triggerToast('Error toggling visibility.', 'error');
    }
  };

  const handleReorderSocialLinks = async (reorderedList: SocialLinkItem[]) => {
    // Optimistic state update
    setSocialLinks(reorderedList);
    try {
      const res = await fetch('/api/social-links/order', {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          order: reorderedList.map((item, idx) => ({ id: item.id, displayOrder: idx + 1 }))
        })
      });
      if (!res.ok) {
        // Rollback or fetch fresh data if it failed
        const freshRes = await fetch('/api/social-links', { headers: getAuthHeader() });
        setSocialLinks(await freshRes.json());
        triggerToast('Failed to save display order.', 'error');
      } else {
        triggerToast('Successfully persisted social links order.', 'success');
      }
    } catch (e) {
      const freshRes = await fetch('/api/social-links', { headers: getAuthHeader() });
      setSocialLinks(await freshRes.json());
      triggerToast('Error updating order.', 'error');
    }
  };

  // Coding Profiles CRUD Handlers
  const handleAddCodingProfile = async (profile: Omit<CodingProfileItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/coding-profiles', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const created = await res.json();
        setCodingProfiles(prev => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
        triggerToast(`Added coding profile for ${profile.displayName}.`, 'success');
      } else {
        const err = await res.json();
        triggerToast(err.error || 'Failed to add coding profile.', 'error');
        throw new Error(err.error || 'Failed to add coding profile.');
      }
    } catch (e: any) {
      triggerToast(e.message || 'Error creating coding profile.', 'error');
      throw e;
    }
  };

  const handleUpdateCodingProfile = async (profile: CodingProfileItem) => {
    try {
      const res = await fetch(`/api/coding-profiles/${profile.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const updated = await res.json();
        setCodingProfiles(prev => prev.map(p => p.id === profile.id ? updated : p).sort((a, b) => a.displayOrder - b.displayOrder));
        triggerToast(`Updated coding profile for ${profile.displayName}.`, 'success');
      } else {
        const err = await res.json();
        triggerToast(err.error || 'Failed to update coding profile.', 'error');
        throw new Error(err.error || 'Failed to update coding profile.');
      }
    } catch (e: any) {
      triggerToast(e.message || 'Error updating coding profile.', 'error');
      throw e;
    }
  };

  const handleDeleteCodingProfile = async (id: number) => {
    try {
      const res = await fetch(`/api/coding-profiles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setCodingProfiles(prev => prev.filter(p => p.id !== id));
        triggerToast('Removed coding profile from database.', 'success');
      } else {
        triggerToast('Failed to delete coding profile.', 'error');
      }
    } catch (e) {
      triggerToast('Error deleting coding profile.', 'error');
    }
  };

  const handleToggleCodingProfileVisibility = async (id: number, visible: boolean) => {
    try {
      const res = await fetch(`/api/coding-profiles/${id}/visibility`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ visible })
      });
      if (res.ok) {
        const updated = await res.json();
        setCodingProfiles(prev => prev.map(p => p.id === id ? updated : p));
        triggerToast(`Toggled visibility of coding profile.`, 'success');
      } else {
        triggerToast('Failed to toggle visibility.', 'error');
      }
    } catch (e) {
      triggerToast('Error toggling visibility.', 'error');
    }
  };

  const handleReorderCodingProfiles = async (reorderedList: CodingProfileItem[]) => {
    setCodingProfiles(reorderedList);
    try {
      const res = await fetch('/api/coding-profiles/order', {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          order: reorderedList.map((item, idx) => ({ id: item.id, displayOrder: idx + 1 }))
        })
      });
      if (!res.ok) {
        const freshRes = await fetch('/api/coding-profiles', { headers: getAuthHeader() });
        setCodingProfiles(await freshRes.json());
        triggerToast('Failed to save coding profiles order.', 'error');
      } else {
        triggerToast('Successfully persisted coding profiles display order.', 'success');
      }
    } catch (e) {
      const freshRes = await fetch('/api/coding-profiles', { headers: getAuthHeader() });
      setCodingProfiles(await freshRes.json());
      triggerToast('Error updating coding profiles order.', 'error');
    }
  };

  // Settings Save
  const handleSaveSettings = async (cfg: SettingsConfig) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(cfg)
      });
      if (res.ok) {
        setSettings(cfg);
        triggerToast("Committed global SEO settings and theme overrides.", 'success');
      }
    } catch (e) {
      triggerToast('Error saving settings.', 'error');
    }
  };

  // Footer Save
 const handleSaveFooter = async (footerData: any) => {
  try {
    const res = await fetch('/api/footer', {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(footerData)
    });

    if (res.ok) {
      const updated = await res.json();
      setFooter(updated);
      triggerToast("Committed footer configurations and contact highlights.", 'success');
    } else {
      triggerToast('Failed to save footer settings.', 'error');
    }
  } catch (e) {
    triggerToast('Error saving footer settings.', 'error');
  }
};
  // Footer Social Links CRUD Handlers
  const handleAddFooterSocialLink = async (social: Omit<FooterSocialLinkItem, 'id'>) => {
    try {
      const res = await fetch('/api/footer/social-links', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(social)
      });
      if (res.ok) {
        const created = await res.json();
        setFooterSocialLinks(prev => [...prev, created]);
        triggerToast(`Added footer social link for "${social.platform}".`, 'success');
      } else {
        const errData = await res.json();
        triggerToast(errData.error || 'Failed to add footer social link.', 'error');
      }
    } catch (e) {
      triggerToast('Error inserting footer social link.', 'error');
    }
  };

  const handleUpdateFooterSocialLink = async (social: FooterSocialLinkItem) => {
    try {
      const res = await fetch(`/api/footer/social-links/${social.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(social)
      });
      if (res.ok) {
        const updated = await res.json();
        setFooterSocialLinks(prev => prev.map(s => s.id === social.id ? updated : s));
        triggerToast(`Updated footer social link details for "${social.platform}".`, 'success');
      } else {
        const errData = await res.json();
        triggerToast(errData.error || 'Failed to update footer social link.', 'error');
      }
    } catch (e) {
      triggerToast('Error updating footer social link.', 'error');
    }
  };

  const handleDeleteFooterSocialLink = async (id: number) => {
    try {
      const res = await fetch(`/api/footer/social-links/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setFooterSocialLinks(prev => prev.filter(s => s.id !== id));
        triggerToast('Removed footer social link from database.', 'success');
      } else {
        triggerToast('Failed to delete footer social link.', 'error');
      }
    } catch (e) {
      triggerToast('Error deleting footer social link.', 'error');
    }
  };

  const handleToggleFooterSocialLinkVisibility = async (id: number, isVisible: boolean) => {
    try {
      const res = await fetch(`/api/footer/social-links/${id}/visibility`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ isVisible })
      });
      if (res.ok) {
        const updated = await res.json();
        setFooterSocialLinks(prev => prev.map(s => s.id === id ? updated : s));
        triggerToast(`Footer social link visibility toggled to ${isVisible ? 'Visible' : 'Hidden'}.`, 'success');
      } else {
        triggerToast('Failed to toggle visibility.', 'error');
      }
    } catch (e) {
      triggerToast('Error toggling visibility.', 'error');
    }
  };

  const handleReorderFooterSocialLinks = async (reorderedList: FooterSocialLinkItem[]) => {
    // Optimistic state update
    setFooterSocialLinks(reorderedList);
    try {
      const res = await fetch('/api/footer/social-links/order', {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          order: reorderedList.map((item, idx) => ({ id: item.id, displayOrder: idx + 1 }))
        })
      });
      if (!res.ok) {
        const freshRes = await fetch('/api/footer/social-links', { headers: getAuthHeader() });
        setFooterSocialLinks(await freshRes.json());
        triggerToast('Failed to save footer display order.', 'error');
      } else {
        triggerToast('Successfully persisted footer social links order.', 'success');
      }
    } catch (e) {
      const freshRes = await fetch('/api/footer/social-links', { headers: getAuthHeader() });
      setFooterSocialLinks(await freshRes.json());
      triggerToast('Error updating order.', 'error');
    }
  };

  // Theme & Appearance Customizer Handlers
 const handleSaveTheme = async (updatedTheme: ThemeSettings) => {
  try {
    const res = await fetch('/api/theme', {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(updatedTheme)
    });

    if (res.ok) {
      const data = await res.json();
      setThemeSettings(data);
    } else {
      triggerToast("Unauthorized access. Admin credentials required to modify theme assets.", 'error');
    }
  } catch (e) {
    triggerToast('Failed to save theme modifications.', 'error');
  }
};

 const handleResetTheme = async () => {
  try {
    const res = await fetch('/api/theme', {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(initialThemeSettings)
    });

    if (res.ok) {
      const data = await res.json();
      setThemeSettings(data);
      triggerToast("Successfully restored standard design template.", 'success');
    } else {
      triggerToast("Unauthorized access. Admin credentials required.", 'error');
    }
  } catch (e) {
    triggerToast('Failed to restore theme configuration.', 'error');
  }
};

  // Global Sync handler
  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    try {
      const analyticsRes = await fetch('/api/analytics');
      const latestAnalytics = await analyticsRes.json();
      setAnalytics(latestAnalytics);
      triggerToast("Synchronized statistics with MySQL operational storage.", 'success');
    } catch (e) {
      triggerToast('Failed to sync database stats.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Portfolio Metrics CRUD Handlers
  const handleAddPortfolioMetric = async (metric: Omit<PortfolioMetricItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (checkDemoRestriction('Add Metric')) {
      const mockMetric: PortfolioMetricItem = { ...metric, id: Date.now() } as any;
      setPortfolioMetrics(prev => [...prev, mockMetric]);
      return;
    }
    try {
      const res = await fetch('/api/portfolio-metrics', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(metric)
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      } else {
        triggerToast('Failed to add metric', 'error');
      }
    } catch (e) {
      triggerToast('Error adding metric', 'error');
    }
  };

  const handleUpdatePortfolioMetric = async (metric: PortfolioMetricItem) => {
    if (checkDemoRestriction('Update Metric')) {
      setPortfolioMetrics(prev => prev.map(m => m.id === metric.id ? metric : m));
      return;
    }
    try {
      const res = await fetch(`/api/portfolio-metrics/${metric.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(metric)
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      } else {
        triggerToast('Failed to update metric', 'error');
      }
    } catch (e) {
      triggerToast('Error updating metric', 'error');
    }
  };

  const handleDeletePortfolioMetric = async (id: number) => {
    if (checkDemoRestriction('Delete Metric')) {
      setPortfolioMetrics(prev => prev.filter(m => m.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/portfolio-metrics/${id}`, {
        method: 'DELETE',
        headers: getJsonHeaders()
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      } else {
        triggerToast('Failed to delete metric', 'error');
      }
    } catch (e) {
      triggerToast('Error deleting metric', 'error');
    }
  };

  const handleBulkDeletePortfolioMetrics = async (ids: number[]) => {
    if (checkDemoRestriction('Bulk Delete Metrics')) {
      setPortfolioMetrics(prev => prev.filter(m => !ids.includes(m.id)));
      return;
    }
    try {
      const res = await fetch('/api/portfolio-metrics/bulk-delete', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      }
    } catch (e) {
      triggerToast('Error bulk deleting metrics', 'error');
    }
  };

  const handleBulkVisibilityPortfolioMetrics = async (ids: number[], visible: boolean) => {
    if (checkDemoRestriction('Update Metrics Visibility')) {
      setPortfolioMetrics(prev => prev.map(m => ids.includes(m.id) ? { ...m, visible } : m));
      return;
    }
    try {
      const res = await fetch('/api/portfolio-metrics/bulk-visibility', {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ ids, visible })
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      }
    } catch (e) {
      triggerToast('Error updating metrics visibility', 'error');
    }
  };

  const handleToggleVisibilityPortfolioMetric = async (id: number, visible: boolean) => {
    if (checkDemoRestriction('Toggle Metric Visibility')) {
      setPortfolioMetrics(prev => prev.map(m => m.id === id ? { ...m, visible } : m));
      return;
    }
    try {
      const res = await fetch(`/api/portfolio-metrics/${id}/visibility`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ visible })
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      } else {
        triggerToast('Failed to toggle visibility', 'error');
      }
    } catch (e) {
      triggerToast('Error toggling visibility', 'error');
    }
  };

  const handleReorderPortfolioMetrics = async (orderedMetrics: PortfolioMetricItem[]) => {
    setPortfolioMetrics(orderedMetrics);
    if (checkDemoRestriction('Reorder Metrics')) {
      return;
    }
    try {
      const res = await fetch('/api/portfolio-metrics/order', {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          order: orderedMetrics.map((m, idx) => ({ id: m.id, displayOrder: idx + 1 }))
        })
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      }
    } catch (e) {
      triggerToast('Error reordering metrics', 'error');
    }
  };

  const handleDuplicatePortfolioMetric = async (id: number) => {
    if (checkDemoRestriction('Duplicate Metric')) {
      const target = portfolioMetrics.find(m => m.id === id);
      if (target) {
        const mockDuplicate = { ...target, id: Date.now(), title: `${target.title} (Copy)` };
        setPortfolioMetrics(prev => [...prev, mockDuplicate]);
      }
      return;
    }
    try {
      const res = await fetch(`/api/portfolio-metrics/${id}/duplicate`, {
        method: 'POST',
        headers: getJsonHeaders()
      });
      if (res.ok) {
        await fetchAllData();
        window.dispatchEvent(new CustomEvent('cms-data-updated'));
      }
    } catch (e) {
      triggerToast('Error duplicating metric', 'error');
    }
  };

  // Navigation config
  const navItems = [
    { name: 'Dashboard', icon: <Layout className="w-4 h-4" /> },
    { name: 'Notification Center', icon: <Bell className="w-4 h-4 text-emerald-400" /> },
    { name: 'Media Manager', icon: <Folder className="w-4 h-4 text-emerald-400" /> },
    { name: 'Hero Management', icon: <Palette className="w-4 h-4 text-emerald-400" /> },
    { name: 'Portfolio Metrics', icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
    { name: 'Tech Stack', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
    { name: 'Profile', icon: <User className="w-4 h-4" /> },
    { name: 'Projects', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Skills', icon: <Cpu className="w-4 h-4" /> },
    { name: 'Tools & Technologies', icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
    { name: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { name: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { name: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Messages', icon: <Mail className="w-4 h-4" /> },
    { name: 'Email & SMTP', icon: <Mail className="w-4 h-4 text-emerald-400" /> },
    { name: 'Backup Manager', icon: <HardDrive className="w-4 h-4 text-emerald-400" /> },
    { name: 'Role Matrix', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { name: 'System Health', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { name: 'SEO & PWA', icon: <Globe className="w-4 h-4 text-emerald-400" /> },
    { name: 'Footer Management', icon: <Share2 className="w-4 h-4" /> },
    { name: 'Coding Profiles', icon: <Code2 className="w-4 h-4 text-emerald-400" /> },
    { name: 'Social Links', icon: <Share2 className="w-4 h-4 text-emerald-400" /> },
    { name: 'Resumes', icon: <FileText className="w-4 h-4" /> },
    { name: 'Theme & Appearance', icon: <Palette className="w-4 h-4" /> },
    { name: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { name: 'Security Settings', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { name: 'Activity History', icon: <History className="w-4 h-4 text-slate-400" /> }
  ];

  return (
    <div className="flex flex-col w-full min-h-[580px] bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100">
      
      {/* Recruiter / Guest Demo Mode Banner */}
      {isDemoSession && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-cyan-950/90 border-b border-emerald-500/30 px-4 py-2.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-lg z-40 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold uppercase tracking-wider text-emerald-400 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Recruiter Demo Tour Active
            </span>
            <span className="text-slate-400 text-[11px] hidden lg:inline">
              — Full read access to live CMS analytics, project schemas, system health, and theme controls.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
              Recruiter Sandbox Mode
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 relative">
      
      {/* Mobile Nav Top Bar */}
      <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-900 bg-slate-950/90 sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">CMS Panel</h2>
            <p className="text-xs font-bold text-slate-100 truncate">{activeTab}</p>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-900/40 rounded-lg border border-slate-800 transition-all cursor-pointer shrink-0"
        >
          {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute top-[65px] left-0 right-0 z-20 bg-slate-950/95 border-b border-slate-900 max-h-[calc(100vh-140px)] overflow-y-auto p-4 space-y-4 shadow-2xl backdrop-blur-xl"
          >
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all text-left ${
                    activeTab === item.name
                      ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                  {item.name === 'Messages' && messages.filter(m => !m.isRead).length > 0 && (
                    <span className="ml-auto bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0">
                      {messages.filter(m => !m.isRead).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                <Database className="w-3.5 h-3.5 text-slate-600" />
                <span>Secure JPA Pool</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar navigation column */}
      <aside className="hidden md:flex w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950/60 p-5 shrink-0 flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1.5 border-b border-slate-900/60 pb-5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
              {profile?.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-black text-slate-100 uppercase tracking-wide truncate">
                {profile?.fullName || "Alex Rivera"}
              </h2>
              <p className="text-[10px] font-medium text-slate-400 truncate">
                {profile?.title || "Principal Systems Architect"}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  profile?.onlineStatus === 'Offline' ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
                }`} />
                <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-400">
                  {profile?.onlineStatus === 'Offline' ? 'Offline' : 'Online'}
                </span>
              </div>
            </div>
          </div>

          {/* Enterprise Action Bar: Search, AI, Notifications */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition flex items-center justify-center cursor-pointer relative group"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAIAssistant(true)}
              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center justify-center cursor-pointer relative group"
              title="AI Writing Copilot"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowNotificationsDrawer(true)}
              className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition flex items-center justify-center cursor-pointer relative group"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              )}
            </button>
          </div>

          {/* Live Preview Button */}
          <button
            onClick={() => setShowLivePreview(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/5 group"
          >
            <Eye className="w-4 h-4 text-emerald-400 group-hover:text-slate-950" />
            <span>Launch Live Preview</span>
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3.5 transition-all text-left ${
                  activeTab === item.name
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {item.icon}
                {item.name}
                
                {item.name === 'Messages' && messages.filter(m => !m.isRead).length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    {messages.filter(m => !m.isRead).length}
                  </span>
                )}

                {(item.name === 'Notification Center' || item.name === 'Notifications') && notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-auto bg-emerald-500 text-slate-950 font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold shadow-sm">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-3 py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-3.5 transition-all text-left text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer mt-6"
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400" />
            <span>Logout Session</span>
          </button>
        </div>

        {/* Sidebar Footer info */}
        <div className="pt-6 border-t border-slate-900/60 hidden md:block">
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>Connection: Secure JPA Pool</span>
          </div>
        </div>
      </aside>

      {/* Main active workspace page panel */}
      <section className="flex-1 p-5 sm:p-7 bg-slate-950/20 overflow-x-hidden min-h-[500px]">
        {activeTab === 'Dashboard' && (
          <DashboardPage 
            analytics={analytics} 
            messages={messages} 
            projects={projects}
            skillsCount={skills.length}
            certificatesCount={certificates.length}
            onNavigate={(page) => setActiveTab(page)}
            onRefresh={handleRefreshStats}
            isRefreshing={isRefreshing}
          />
        )}

        {(activeTab === 'Notification Center' || activeTab === 'Notifications') && (
          <NotificationCenterPage
            onTriggerToast={triggerToast}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'Media Manager' && (
          <MediaManagerPage />
        )}

        {activeTab === 'Hero Management' && (
          <HeroManagementPage 
            onTriggerToast={triggerToast}
            onHeroUpdated={fetchAllData}
          />
        )}

        {activeTab === 'Portfolio Metrics' && (
          <PortfolioMetricsPage
            metrics={portfolioMetrics}
            onAdd={handleAddPortfolioMetric}
            onUpdate={handleUpdatePortfolioMetric}
            onDelete={handleDeletePortfolioMetric}
            onBulkDelete={handleBulkDeletePortfolioMetrics}
            onBulkVisibility={handleBulkVisibilityPortfolioMetrics}
            onToggleVisibility={handleToggleVisibilityPortfolioMetric}
            onReorder={handleReorderPortfolioMetrics}
            onDuplicate={handleDuplicatePortfolioMetric}
            triggerToast={triggerToast}
          />
        )}

        {activeTab === 'Tech Stack' && (
          <TechStackPage 
            onTriggerToast={triggerToast}
            onTechStackUpdated={fetchAllData}
          />
        )}

        {activeTab === 'Profile' && (
          <ProfilePage 
            onTriggerToast={triggerToast}
            onProfileUpdated={setProfile}
          />
        )}

        {activeTab === 'Theme & Appearance' && (
          <ThemePage 
            theme={themeSettings} 
            onSave={handleSaveTheme} 
            onReset={handleResetTheme} 
          />
        )}

        {activeTab === 'Projects' && (
          <ProjectsPage 
            projects={projects}
            onAdd={handleAddProject}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
          />
        )}

        {activeTab === 'Skills' && (
          <SkillsPage 
            skills={skills}
            onAdd={handleAddSkill}
            onUpdate={handleUpdateSkill}
            onDelete={handleDeleteSkill}
          />
        )}

        {activeTab === 'Tools & Technologies' && (
          <ToolsPage
            tools={tools}
            onAdd={handleAddTool}
            onUpdate={handleUpdateTool}
            onDelete={handleDeleteTool}
            onToggleVisibility={handleToggleToolVisibility}
            onToggleFeatured={handleToggleToolFeatured}
            onReorder={handleReorderTools}
          />
        )}

        {activeTab === 'Certificates' && (
          <CertificatesPage 
            certificates={certificates}
            onAdd={handleAddCertificate}
            onUpdate={handleUpdateCertificate}
            onDelete={handleDeleteCertificate}
          />
        )}

        {activeTab === 'Achievements' && (
          <AchievementsPage 
            achievements={achievements}
            onAdd={handleAddAchievement}
            onUpdate={handleUpdateAchievement}
            onDelete={handleDeleteAchievement}
            onToggleVisibility={handleToggleAchievementVisibility}
            onToggleFeatured={handleToggleAchievementFeatured}
            onReorder={handleReorderAchievements}
          />
        )}

        {activeTab === 'Experience' && (
          <ExperiencePage 
            experiences={experiences}
            onAdd={handleAddExperience}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        )}

        {activeTab === 'Education' && (
          <EducationPage 
            education={education}
            onAdd={handleAddEducation}
            onUpdate={handleUpdateEducation}
            onDelete={handleDeleteEducation}
          />
        )}

        {activeTab === 'Analytics' && (
          <AnalyticsPage analytics={analytics} />
        )}

        {activeTab === 'Messages' && (
          <MessagesPage 
            messages={messages}
            onToggleRead={handleToggleReadMessage}
            onToggleStar={handleToggleStarMessage}
            onDelete={handleDeleteMessage}
          />
        )}

        {activeTab === 'Email & SMTP' && (
          <EmailSettingsPage triggerToast={triggerToast} />
        )}

        {activeTab === 'Backup Manager' && (
          <BackupPage triggerToast={triggerToast} />
        )}

        {activeTab === 'Role Matrix' && (
          <RoleManagementPage triggerToast={triggerToast} />
        )}

        {activeTab === 'System Health' && (
          <SystemHealthPage triggerToast={triggerToast} />
        )}

        {activeTab === 'SEO & PWA' && (
          <SEOManagerPage triggerToast={triggerToast} />
        )}

        {activeTab === 'Footer Management' && (
          <FooterManagementPage 
            footer={footer}
            onSaveFooter={handleSaveFooter}
            footerSocialLinks={footerSocialLinks}
            onAddSocialLink={handleAddFooterSocialLink}
            onUpdateSocialLink={handleUpdateFooterSocialLink}
            onDeleteSocialLink={handleDeleteFooterSocialLink}
            onToggleSocialLinkVisibility={handleToggleFooterSocialLinkVisibility}
            onReorderSocialLinks={handleReorderFooterSocialLinks}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === 'Coding Profiles' && (
          <CodingProfilesPage
            profiles={codingProfiles}
            onAdd={handleAddCodingProfile}
            onUpdate={handleUpdateCodingProfile}
            onDelete={handleDeleteCodingProfile}
            onToggleVisibility={handleToggleCodingProfileVisibility}
            onReorder={handleReorderCodingProfiles}
          />
        )}

        {activeTab === 'Social Links' && (
          <SocialLinksPage
            socialLinks={socialLinks}
            onAdd={handleAddSocialLink}
            onUpdate={handleUpdateSocialLink}
            onDelete={handleDeleteSocialLink}
            onToggleVisibility={handleToggleSocialLinkVisibility}
            onReorder={handleReorderSocialLinks}
          />
        )}

        {activeTab === 'Resumes' && (
          <ResumePage 
            onTriggerToast={triggerToast}
            onResumeUpdated={fetchAllData}
          />
        )}

        {activeTab === 'Settings' && (
          <SettingsPage 
            settings={settings || initialSettings}
            onSave={handleSaveSettings}
          />
        )}

        {activeTab === 'Security Settings' && (
          <SecuritySettingsPage />
        )}

        {activeTab === 'Activity History' && (
          <ActivityHistoryPage />
        )}
      </section>
      </div>

      {/* Global Toast render */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-slate-900/95 border border-white/[0.08] shadow-2xl shadow-rose-500/5 rounded-2xl p-6 max-w-sm w-full relative z-10 backdrop-blur-xl text-center overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500/50 via-emerald-500/50 to-rose-500/50" />
              
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono mb-2">Confirm Termination</h3>
              <p className="text-xs text-slate-400 mb-6">
                Are you sure you want to logout?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] text-xs font-mono text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = '/';
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-rose-500/10 hover:scale-[1.01]"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Preview Modal */}
      <LivePreviewModal 
        isOpen={showLivePreview} 
        onClose={() => setShowLivePreview(false)} 
      />

      {/* Enterprise AI Assistant Copilot Modal */}
      <AIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onApplyText={(text) => {
          navigator.clipboard.writeText(text);
          triggerToast('AI generated text copied to clipboard!', 'success');
        }}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        allData={{
          projects,
          skills,
          certificates,
          experiences,
          education,
          messages
        }}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkNotificationsRead}
        onClearAll={handleClearNotifications}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
