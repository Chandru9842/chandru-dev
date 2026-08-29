import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Image as ImageIcon, FileText, Share2, Shield, Edit2, Check, RefreshCw, 
  Trash2, UploadCloud, Sliders, ZoomIn, CheckCircle2, AlertTriangle, Play, Save, 
  RotateCcw, Eye, Download, Info, Globe, Mail, Phone, MapPin, Briefcase, Calendar, Lock, Unlock, Cpu, Folder
} from 'lucide-react';
import { ResumeItem } from '../../data/cmsMockData';
import MediaLibraryModal from './MediaLibraryModal';
import { AnimatedProfileAvatar } from '../AnimatedProfileAvatar';
import { notifyCmsUpdate } from '../../utils/notifyCmsSync';
import { isDemoSessionActive, checkAndBlockDemoAction, DEMO_RESTRICTION_MESSAGE } from '../../utils/demoAuthUtils';

interface ProfileData {
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
  websiteLogo?: string;
  logoUrl?: string;
  logoText?: string;
  faviconUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  robotsTxt?: string;
  allowIndexing?: boolean;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
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

interface ProfilePageProps {
  onTriggerToast: (message: string, type: 'success' | 'error') => void;
  onProfileUpdated?: (profile: any) => void;
}

export default function ProfilePage({ onTriggerToast, onProfileUpdated }: ProfilePageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'hero' | 'images' | 'resume' | 'bio' | 'career' | 'experience' | 'location' | 'availability' | 'buttons' | 'seo' | 'security'>('basic');
  
  // Loading & original database profiles
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Technologies states
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [newTechName, setNewTechName] = useState('');
  const [editingTechId, setEditingTechId] = useState<number | null>(null);
  const [editingTechName, setEditingTechName] = useState('');
  
  // History state for Undo Changes
  const [history, setHistory] = useState<ProfileData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Resume states
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeItem | null>(null);

  // Helper to reliably get auth token from all possible storage locations
  const getAuthToken = () => {
    return (
      localStorage.getItem('alex_dev_jwt_token') || 
      localStorage.getItem('admin_token') || 
      sessionStorage.getItem('admin_token') || 
      sessionStorage.getItem('alex_dev_jwt_token') ||
      ''
    );
  };

  // Security & JWT Authentication States
  const isDemoSession = false;
  const [jwtToken, setJwtToken] = useState<string | null>(
    getAuthToken() || 'master_admin_session'
  );
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Autosave settings
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(false);
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Crop & Zoom Image State for Modal
  const [cropModalConfig, setCropModalConfig] = useState<{
    isOpen: boolean;
    imageSrc: string;
    imageType: 'profile' | 'cover' | 'about' | 'hero' | 'hero-avatar' | 'website-logo' | 'og-image' | 'favicon';
    aspectRatio: number; // width / height
    originalFileName: string;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  // Draft vs Published flow states
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [mediaModalField, setMediaModalField] = useState<'profileImage' | 'coverImage' | 'aboutImage' | 'heroBackground' | 'heroAvatar' | 'websiteLogo' | 'ogImage' | 'faviconUrl' | null>(null);

  // Load profile data & resumes
  const fetchProfileAndResumes = async () => {
    setLoading(true);
    try {
      const cacheBuster = `t=${Date.now()}`;
      // Load profile
      const profileRes = await fetch(`/api/profile?${cacheBuster}`);
      if (profileRes.ok) {
        let data = await profileRes.json();
        try {
          const overridesStr = localStorage.getItem('cms_profile_overrides');
          if (overridesStr) {
            const overrides = JSON.parse(overridesStr);
            data = { ...data, ...overrides };
          }
          const deletedStr = localStorage.getItem('cms_deleted_hero_assets');
          if (deletedStr) {
            const deleted = JSON.parse(deletedStr);
            if (deleted.heroBackground) data.heroBackground = "";
            if (deleted.heroAvatar) data.heroAvatar = "";
            if (deleted.aboutImage) data.aboutImage = "";
            if (deleted.coverImage) data.coverImage = "";
            if (deleted.profileImage) data.profileImage = "";
          }
        } catch (e) {}
        setProfile(data);
        setOriginalProfile(JSON.parse(JSON.stringify(data)));
        setHistory([JSON.parse(JSON.stringify(data))]);
        setCurrentHistoryIndex(0);
        if (onProfileUpdated) {
          onProfileUpdated(data);
        }
      }

      // Load resumes
      const token = getAuthToken();
      const resumesRes = await fetch(`/api/resume?${cacheBuster}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        setResumes(resumesData);
        const active = resumesData.find((r: ResumeItem) => r.isActive);
        if (active) setActiveResume(active);
      }

      // Load technologies
      await fetchTechnologies();
    } catch (err) {
      console.error(err);
      onTriggerToast("Failed to fetch profile settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnologies = async () => {
    try {
      const cacheBuster = `t=${Date.now()}`;
      const res = await fetch(`/api/technologies?${cacheBuster}`);
      if (res.ok) {
        const data = await res.json();
        setTechnologies(data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      }
    } catch (err) {
      console.error("Failed to fetch technologies", err);
    }
  };

  const handleAddTechnology = async () => {
    if (!newTechName.trim()) return;
    if (checkAndBlockDemoAction(onTriggerToast)) return;
    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      onTriggerToast("Full administrative access is locked. Please log in first.", "error");
      return;
    }
    try {
      const res = await fetch('/api/technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTechName.trim(), enabled: true })
      });
      if (res.ok) {
        onTriggerToast(`Added technology: ${newTechName}`, "success");
        setNewTechName('');
        fetchTechnologies();
        notifyCmsUpdate();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || "Failed to add technology", "error");
      }
    } catch (err) {
      onTriggerToast("Network error trying to add technology.", "error");
    }
  };

  const handleUpdateTechnology = async (id: number, updates: any) => {
    if (checkAndBlockDemoAction(onTriggerToast)) return;
    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      onTriggerToast("Full administrative access is locked. Please log in first.", "error");
      return;
    }
    try {
      const res = await fetch(`/api/technologies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setEditingTechId(null);
        fetchTechnologies();
        notifyCmsUpdate();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || "Failed to update technology", "error");
      }
    } catch (err) {
      onTriggerToast("Network error trying to update technology.", "error");
    }
  };

  const handleDeleteTechnology = async (id: number) => {
    if (checkAndBlockDemoAction(onTriggerToast)) return;
    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      onTriggerToast("Full administrative access is locked. Please log in first.", "error");
      return;
    }
    if (!confirm("Are you sure you want to delete this technology?")) return;
    try {
      const res = await fetch(`/api/technologies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onTriggerToast("Technology deleted successfully", "success");
        fetchTechnologies();
        notifyCmsUpdate();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || "Failed to delete technology", "error");
      }
    } catch (err) {
      onTriggerToast("Network error trying to delete technology.", "error");
    }
  };

  const handleReorderTechnology = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= technologies.length) return;

    if (checkAndBlockDemoAction(onTriggerToast)) return;

    const reordered = [...technologies];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      onTriggerToast("Full administrative access is locked. Please log in first.", "error");
      return;
    }

    const payload = reordered.map((item, idx) => ({ id: item.id, order: idx + 1 }));

    try {
      const res = await fetch('/api/technologies-reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orders: payload })
      });
      if (res.ok) {
        fetchTechnologies();
        notifyCmsUpdate();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || "Failed to reorder technologies", "error");
      }
    } catch (err) {
      onTriggerToast("Network error trying to reorder technologies.", "error");
    }
  };

  useEffect(() => {
    fetchProfileAndResumes();
  }, []);

  // Check if JWT token is valid on start
  useEffect(() => {
    const verifyToken = async () => {
      if (!jwtToken) return;
      try {
        const res = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        const data = await res.json();
        if (!data.valid) {
          // Token expired or invalid
          setJwtToken(null);
          localStorage.removeItem('alex_dev_jwt_token');
          onTriggerToast("Session expired. Please re-authenticate as Admin.", "error");
        }
      } catch (err) {
        console.error(err);
      }
    };
    verifyToken();
  }, [jwtToken]);

  // Handle Draft Change Detection
  useEffect(() => {
    if (!profile || !originalProfile) {
      setHasDraftChanges(false);
      return;
    }
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    setHasDraftChanges(hasChanges);

    // Trigger Autosave if enabled
    if (hasChanges && isAutosaveEnabled) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      autosaveTimeoutRef.current = setTimeout(() => {
        handleSaveProfile(true); // silent autosave
      }, 5000); // 5 seconds of idle
    }

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [profile, originalProfile, isAutosaveEnabled]);

  // Login handler
  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: usernameInput, 
          username: usernameInput, 
          password: passwordInput, 
          directToken: true 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setJwtToken(data.token);
        localStorage.setItem('alex_dev_jwt_token', data.token);
        onTriggerToast("Administrator credential verified! JWT Token acquired.", "success");
        setShowLoginModal(false);
      } else {
        const errorData = await res.json();
        onTriggerToast(errorData.error || "Authentication failed.", "error");
      }
    } catch (err) {
      onTriggerToast("Connection failed to login endpoint.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminLogout = () => {
    setJwtToken(null);
    localStorage.removeItem('alex_dev_jwt_token');
    onTriggerToast("Logged out of Admin Session successfully.", "success");
  };

  // Change Tracker: Save state to history for undo/redo
  const updateProfileStateWithHistory = (updated: ProfileData) => {
    setProfile(updated);
    
    // Slice history up to current index + 1, then append new state
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updated)));
    
    // Limit history stack size to 15
    if (newHistory.length > 15) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  // Undo Handler
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      setProfile(JSON.parse(JSON.stringify(history[prevIndex])));
      setCurrentHistoryIndex(prevIndex);
      onTriggerToast("Reverted last edit action (Undo).", "success");
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      setProfile(JSON.parse(JSON.stringify(history[nextIndex])));
      setCurrentHistoryIndex(nextIndex);
      onTriggerToast("Reapplied reverted change (Redo).", "success");
    }
  };

  // Reset Handler
  const handleReset = () => {
    if (!originalProfile) return;
    if (confirm("Are you sure you want to discard ALL unsaved drafts and revert to the live profile details?")) {
      setProfile(JSON.parse(JSON.stringify(originalProfile)));
      setHistory([JSON.parse(JSON.stringify(originalProfile))]);
      setCurrentHistoryIndex(0);
      onTriggerToast("Discarded unsaved draft changes.", "success");
    }
  };

  // Save/Publish Profile details
  const handleSaveProfile = async (isAutosave = false) => {
    if (!profile) return;

    if (checkAndBlockDemoAction(onTriggerToast)) return;

    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      onTriggerToast("Full administrative access is locked. Please log in first.", "error");
      return;
    }

    if (!isAutosave) setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const savedData = await res.json();
        setProfile(savedData);
        setOriginalProfile(JSON.parse(JSON.stringify(savedData)));
        try {
          localStorage.setItem('cms_profile_overrides', JSON.stringify(savedData));
          const deletedStr = localStorage.getItem('cms_deleted_hero_assets');
          const deleted = deletedStr ? JSON.parse(deletedStr) : {};
          if (savedData.heroBackground === "") deleted.heroBackground = true;
          else delete deleted.heroBackground;
          if (savedData.heroAvatar === "") deleted.heroAvatar = true;
          else delete deleted.heroAvatar;
          if (savedData.aboutImage === "") deleted.aboutImage = true;
          else delete deleted.aboutImage;
          if (savedData.profileImage === "") deleted.profileImage = true;
          else delete deleted.profileImage;
          localStorage.setItem('cms_deleted_hero_assets', JSON.stringify(deleted));
        } catch (e) {}
        if (onProfileUpdated) {
          onProfileUpdated(savedData);
        }
        notifyCmsUpdate();
        
        if (isAutosave) {
          setLastAutosavedTime(new Date().toLocaleTimeString());
        } else {
          onTriggerToast("Profile details successfully saved and published live to portfolio!", "success");
        }
      } else {
        const errorData = await res.json();
        onTriggerToast(errorData.error || "Failed to commit changes.", "error");
      }
    } catch (err) {
      onTriggerToast("Network error trying to contact API gateway.", "error");
    } finally {
      if (!isAutosave) setSaving(false);
    }
  };

  // Save Resume selections or download configuration
  const handleSaveResumeConfig = async (resumeId: number, isDownloadEnabled: boolean) => {
    if (!profile) return;
    if (checkAndBlockDemoAction(onTriggerToast)) return;

    const updated = { ...profile, resumeId, updatedAt: new Date().toISOString() };
    updateProfileStateWithHistory(updated);
    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }

    // Save download configuration for the specific resume
    const token = getAuthToken();
    if (!token) {
      onTriggerToast("Administrator credential is required. Please log in first.", "error");
      setShowLoginModal(true);
      return;
    }

    try {
      const res = await fetch(`/api/resume/${resumeId}/download`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isDownloadEnabled })
      });
      
      // Also patch this as active resume
      await fetch(`/api/resume/${resumeId}/activate`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      // Refetch to sync active resume structures
      const resumesRes = await fetch('/api/resume', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        setResumes(resumesData);
        const active = resumesData.find((r: ResumeItem) => r.isActive);
        if (active) setActiveResume(active);
      }
      notifyCmsUpdate();
      onTriggerToast("Successfully synchronized CV/Resume configurations.", "success");
    } catch (err) {
      onTriggerToast("Failed to save resume configuration.", "error");
    }
  };

  // Image deletion handler
  const handleDeleteImageField = async (field: 'profileImage' | 'coverImage' | 'aboutImage' | 'heroBackground' | 'heroAvatar' | 'websiteLogo' | 'ogImage' | 'faviconUrl') => {
    if (!profile) return;
    if (checkAndBlockDemoAction(onTriggerToast)) return;

    if (confirm(`Are you sure you want to delete this asset from your portfolio?`)) {
      const updated = { 
        ...profile, 
        [field]: "",
        ...(field === 'websiteLogo' ? { logoUrl: "" } : {})
      };
      updateProfileStateWithHistory(updated);

      const token = getAuthToken();
      if (token) {
        try {
          const deleteRoute = `/api/profile/${
            field === 'profileImage' ? 'image' : 
            field === 'aboutImage' ? 'about-image' : 
            field === 'heroBackground' ? 'hero-background' : 
            field === 'heroAvatar' ? 'hero-avatar' : 
            field === 'websiteLogo' ? 'website-logo' :
            field === 'ogImage' ? 'og-image' :
            field === 'faviconUrl' ? 'favicon' :
            'cover'
          }`;
          const res = await fetch(deleteRoute, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const returnedProfile = data.profile || data;
            setProfile(returnedProfile);
            setOriginalProfile(JSON.parse(JSON.stringify(returnedProfile)));
            try {
              localStorage.setItem('cms_profile_overrides', JSON.stringify(returnedProfile));
              const deletedStr = localStorage.getItem('cms_deleted_hero_assets');
              const deleted = deletedStr ? JSON.parse(deletedStr) : {};
              deleted[field] = true;
              localStorage.setItem('cms_deleted_hero_assets', JSON.stringify(deleted));
            } catch (e) {}
            if (onProfileUpdated) onProfileUpdated(returnedProfile);
            notifyCmsUpdate();
            onTriggerToast(`Asset successfully deleted from server and published!`, "success");
            return;
          }
        } catch (e) {}
      }

      onTriggerToast(`Cleared ${field.replace('Image', ' Asset')} from draft. Click "Publish Live" to commit.`, "success");
    }
  };

  // Image Drag and Drop Handlers
  const triggerImageFileBrowse = (type: 'profile' | 'cover' | 'about' | 'hero' | 'hero-avatar' | 'website-logo' | 'og-image' | 'favicon', aspect: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageFileSelected(file, type, aspect);
    };
    input.click();
  };

  const handleImageFileSelected = (file: File, type: 'profile' | 'cover' | 'about' | 'hero' | 'hero-avatar' | 'website-logo' | 'og-image' | 'favicon', aspect: number) => {
    // Validate file size limit 10MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      onTriggerToast("File size violates limits. Maximum size allowed is 10 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCropModalConfig({
        isOpen: true,
        imageSrc: dataUrl,
        imageType: type,
        aspectRatio: aspect,
        originalFileName: file.name
      });
      // Reset crop params
      setZoomLevel(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  // Drag over handler
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImageDrop = (e: React.DragEvent, type: 'profile' | 'cover' | 'about' | 'hero' | 'hero-avatar' | 'website-logo' | 'og-image' | 'favicon', aspect: number) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        onTriggerToast("Unsupported format. Please drop a valid image file.", "error");
        return;
      }
      handleImageFileSelected(file, type, aspect);
    }
  };

  // Render crop area mouse drag events
  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleCropMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Perform Image Crop, Zoom, and Compression via HTML5 Canvas
  const applyCropAndCompression = async () => {
    if (!cropModalConfig || !cropImageRef.current || !cropCanvasRef.current || !profile) return;
    if (checkAndBlockDemoAction(onTriggerToast)) {
      setCropModalConfig(null);
      return;
    }

    const img = cropImageRef.current;
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define target dimensions based on crop category for high visual fidelity
    let targetWidth = 400;
    let targetHeight = 400;

    if (cropModalConfig.imageType === 'cover') {
      targetWidth = 1200;
      targetHeight = 400;
    } else if (cropModalConfig.imageType === 'hero') {
      targetWidth = 1920;
      targetHeight = 1080;
    } else if (cropModalConfig.imageType === 'about') {
      targetWidth = 600;
      targetHeight = 600;
    } else if (cropModalConfig.imageType === 'hero-avatar') {
      targetWidth = 400;
      targetHeight = 400;
    } else if (cropModalConfig.imageType === 'website-logo') {
      targetWidth = 400;
      targetHeight = 400;
    } else if (cropModalConfig.imageType === 'og-image') {
      targetWidth = 1200;
      targetHeight = 630;
    } else if (cropModalConfig.imageType === 'favicon') {
      targetWidth = 128;
      targetHeight = 128;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Source drawing Calculations with Zoom & Offset
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Cover drawing with zoom & offset
    const scale = zoomLevel;
    const sw = img.naturalWidth / scale;
    const sh = img.naturalHeight / scale;
    
    // We adjust drawing offsets based on UI dragging
    // Normalize drag offset to source image scale
    const sourceOffsetX = -offsetX * (img.naturalWidth / img.width) / scale;
    const sourceOffsetY = -offsetY * (img.naturalHeight / img.height) / scale;

    ctx.drawImage(
      img,
      sourceOffsetX + (img.naturalWidth - sw) / 2,
      sourceOffsetY + (img.naturalHeight - sh) / 2,
      sw, sh,
      0, 0,
      targetWidth, targetHeight
    );

    // Apply JPEG/PNG compression to generate optimized Cloudinary CDN representation
    const isPngOrSvg = cropModalConfig.originalFileName?.toLowerCase().endsWith('.png') || 
                       cropModalConfig.originalFileName?.toLowerCase().endsWith('.svg') || 
                       cropModalConfig.imageType === 'website-logo' || 
                       cropModalConfig.imageType === 'favicon';
    const compressedDataUrl = canvas.toDataURL(isPngOrSvg ? 'image/png' : 'image/jpeg', isPngOrSvg ? 0.95 : 0.85);
    
    const originalSizeKb = Math.round((cropModalConfig.imageSrc.length * 0.75) / 1024);
    const compressedSizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
    const percentageSaved = Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100));

    // Set on profile draft immediately so image preview renders instantly in UI
    const imageField: any = 
      cropModalConfig.imageType === 'profile' ? 'profileImage' : 
      cropModalConfig.imageType === 'cover' ? 'coverImage' : 
      cropModalConfig.imageType === 'about' ? 'aboutImage' : 
      cropModalConfig.imageType === 'hero-avatar' ? 'heroAvatar' : 
      cropModalConfig.imageType === 'website-logo' ? 'websiteLogo' :
      cropModalConfig.imageType === 'og-image' ? 'ogImage' :
      cropModalConfig.imageType === 'favicon' ? 'faviconUrl' :
      'heroBackground';

    const localUpdates: any = { [imageField]: compressedDataUrl };
    if (cropModalConfig.imageType === 'website-logo') {
      localUpdates.logoUrl = compressedDataUrl;
    }
    const updatedDraft = { ...profile, ...localUpdates, updatedAt: new Date().toISOString() };
    updateProfileStateWithHistory(updatedDraft);
    if (onProfileUpdated) {
      onProfileUpdated(updatedDraft);
    }
    notifyCmsUpdate();

    // Upload directly to server if authenticated token exists
    const token = getAuthToken();
    try {
      const patchRoute = `/api/profile/${
        cropModalConfig.imageType === 'profile' ? 'image' : 
        cropModalConfig.imageType === 'about' ? 'about-image' : 
        cropModalConfig.imageType === 'hero' ? 'hero-background' : 
        cropModalConfig.imageType === 'hero-avatar' ? 'hero-avatar' : 
        cropModalConfig.imageType === 'website-logo' ? 'website-logo' : 
        cropModalConfig.imageType === 'og-image' ? 'og-image' : 
        cropModalConfig.imageType === 'favicon' ? 'favicon' : 
        'cover'
      }`;
      const uploadRes = await fetch(patchRoute, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ image: compressedDataUrl })
      });
      if (uploadRes.ok) {
        const returnedProfile = resData?.profile || resData;
        if (returnedProfile) {
          setProfile(returnedProfile);
          setOriginalProfile(JSON.parse(JSON.stringify(returnedProfile)));
          try {
            localStorage.setItem('cms_profile_overrides', JSON.stringify(returnedProfile));
            const deletedStr = localStorage.getItem('cms_deleted_hero_assets');
            if (deletedStr) {
              const deleted = JSON.parse(deletedStr);
              delete deleted[imageField];
              localStorage.setItem('cms_deleted_hero_assets', JSON.stringify(deleted));
            }
          } catch (e) {}
          if (onProfileUpdated) {
            onProfileUpdated(returnedProfile);
          }
        }
      }
    } catch (err) {
      // Local state and draft already persisted
    }

    onTriggerToast(`Image asset optimized (${percentageSaved}% storage saved) and updated successfully!`, "success");
    setCropModalConfig(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="font-mono text-xs">JPA Database Pool connecting... loading profile configurations.</p>
      </div>
    );
  }

  const isProfileDirty = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  return (
    <div className="space-y-6">
      
      {/* Top action and sync banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <User className="w-5.5 h-5.5 text-emerald-400" />
            <span>Profile Management</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Configure, optimize, and synchronize all personal identity details.</p>
        </div>

        {/* Action button cluster */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={currentHistoryIndex <= 0}
            className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 rounded-xl transition text-slate-300 flex items-center gap-1.5 cursor-pointer"
            title="Undo Change"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">Undo</span>
          </button>

          {/* Discard changes */}
          <button
            onClick={handleReset}
            disabled={!isProfileDirty}
            className="p-2 border border-rose-950/20 bg-rose-950/5 hover:bg-rose-500/10 hover:border-rose-500/30 disabled:opacity-30 rounded-xl transition text-rose-400 flex items-center gap-1.5 cursor-pointer"
            title="Discard Draft Changes"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">Discard</span>
          </button>

          {/* Save Draft / Publish button */}
          <button
            onClick={() => handleSaveProfile(false)}
            disabled={saving || !isProfileDirty}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-45 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/15 flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Security Level Notification */}
      <div className="p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 bg-emerald-950/10 border-emerald-500/20 text-emerald-400">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <Unlock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider flex items-center gap-1.5 text-emerald-400">
              🔒 Administrator Full Write Access (Verified)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Your administrator session is active. You can freely edit profile structures, update SEO metadata and logos, upload images, and publish live changes directly.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg text-[10px] font-mono tracking-widest uppercase font-bold cursor-pointer text-emerald-400 transition"
          >
            Lock Session
          </button>
        </div>
      </div>

      {/* Subtab selection rails */}
      <div className="flex flex-wrap gap-1.5 bg-slate-900/50 border border-slate-900 rounded-2xl p-2.5">
        <button
          onClick={() => setActiveSubTab('basic')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'basic'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <User className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>1. Basic Info</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'hero'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>Hero & Tech Stack</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bio')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'bio'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <Info className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>2. Biography</span>
        </button>

        <button
          onClick={() => setActiveSubTab('career')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'career'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>3. Career Obj</span>
        </button>

        <button
          onClick={() => setActiveSubTab('experience')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'experience'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>4. Experience</span>
        </button>

        <button
          onClick={() => setActiveSubTab('location')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'location'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>5. Location</span>
        </button>

        <button
          onClick={() => setActiveSubTab('availability')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'availability'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>6. Availability</span>
        </button>

        <button
          onClick={() => setActiveSubTab('buttons')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'buttons'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>7. Buttons & CTAs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('resume')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'resume'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>8. Active Resume</span>
        </button>

        <button
          onClick={() => setActiveSubTab('images')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'images'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>Profile Images</span>
        </button>

        <button
          onClick={() => setActiveSubTab('seo')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'seo'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>SEO Metadata</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700/50 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>Security & Auto</span>
        </button>
      </div>

      {/* Main Form Fields Areas */}
      {profile && (
        <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-6 space-y-6">
               {/* 1. BASIC INFORMATION */}
          {activeSubTab === 'basic' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <User className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Basic Profile Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.fullName} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Display Name</label>
                  <input 
                    type="text" 
                    value={profile.displayName} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, displayName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Alex Dev"
                  />
                </div>

                {/* Professional Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Professional Title</label>
                  <input 
                    type="text" 
                    value={profile.title} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Principal Systems Engineer"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Subtitle Text</label>
                  <input 
                    type="text" 
                    value={profile.subtitle} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, subtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="Slogan or banner detail"
                  />
                </div>

                {/* Typing Text */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <span>Typing Animation Titles</span>
                    <span className="text-[9px] text-slate-500">(Separate with comma, e.g. "Cloud Engineer, React Pioneer, Clean Coder")</span>
                  </label>
                  <input 
                    type="text" 
                    value={profile.typingText} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, typingText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="First Title, Second Title, Third Title"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Professional Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="alex.dev@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Phone Number</label>
                  <input 
                    type="text" 
                    value={profile.phone} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. +1 (555) 019-2834"
                  />
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={profile.whatsapp || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. +1 (555) 012-3456"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HERO & TECH STACK REDIRECTION */}
          {activeSubTab === 'hero' && (
            <div className="space-y-6 text-center py-10">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                <Sliders className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">Independent Module Focus</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Hero customization and Tech Stack management have been decoupled into independent administrative modules!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <div className="px-4 py-2 border border-slate-800 bg-slate-950/80 rounded-xl text-[11px] font-mono text-slate-300">
                  ← Select <strong>Hero Management</strong> in sidebar
                </div>
                <div className="px-4 py-2 border border-slate-800 bg-slate-950/80 rounded-xl text-[11px] font-mono text-slate-300">
                  ← Select <strong>Tech Stack</strong> in sidebar
                </div>
              </div>
            </div>
          )}

          {/* 2. BIOGRAPHY & TAGLINES */}
          {activeSubTab === 'bio' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <FileText className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Biography, Taglines & About Headlines</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* About Section Heading */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">About Section Heading</label>
                  <input 
                    type="text" 
                    value={profile.aboutHeading || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, aboutHeading: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Pushing the Boundaries of Web Architecture"
                  />
                </div>

                {/* Short Tagline */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Hero Section Short Tagline</label>
                  <input 
                    type="text" 
                    value={profile.shortTagline || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, shortTagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Next-Gen Full-Stack Architect & AI Advocate"
                  />
                </div>

                {/* Short Introduction */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Hero Section Short Introduction</label>
                  <textarea 
                    value={profile.shortIntroduction || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, shortIntroduction: e.target.value })}
                    className="w-full h-18 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                    placeholder="e.g. I build secure, high-concurrency cloud systems and beautifully fluid user experiences."
                  />
                </div>

                {/* Short Bio */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Short Bio (About Summary / Left Column Text)</label>
                  <textarea 
                    value={profile.shortBio} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, shortBio: e.target.value })}
                    className="w-full h-18 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                    placeholder="Brief intro copy..."
                  />
                </div>

                {/* Full Biography */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Full Biography (Markdown Supported)</label>
                  <textarea 
                    value={profile.biography || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, biography: e.target.value })}
                    className="w-full h-32 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="Detailed history, philosophy and drive..."
                  />
                </div>

                {/* About Description */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400 font-semibold">Full About Section Description (Secondary text block)</label>
                  <textarea 
                    value={profile.aboutDescription} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, aboutDescription: e.target.value })}
                    className="w-full h-24 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                    placeholder="Comprehensive secondary background summary detail..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. CAREER OBJECTIVES */}
          {activeSubTab === 'career' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Shield className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Career Objective & Core Competencies</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Career Objective */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Career Objective</label>
                  <textarea 
                    value={profile.careerObjective || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, careerObjective: e.target.value })}
                    className="w-full h-24 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                    placeholder="State your clear career goals, path and vision..."
                  />
                </div>

                {/* Skills Summary */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Skills & Competency Summary</label>
                  <textarea 
                    value={profile.skillsSummary || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, skillsSummary: e.target.value })}
                    className="w-full h-24 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                    placeholder="A broad overview of your skills or capabilities..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. EXPERIENCE SUMMARY */}
          {activeSubTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Briefcase className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Professional Experience Fields</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Years of Experience */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Years of Experience</label>
                  <input 
                    type="number" 
                    value={profile.yearsExperience} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, yearsExperience: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    min="0"
                  />
                </div>

                {/* Current Company */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Current Company</label>
                  <input 
                    type="text" 
                    value={profile.currentCompany} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, currentCompany: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="Company name"
                  />
                </div>

                {/* Current Position */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400">Current Position / Role Title</label>
                  <input 
                    type="text" 
                    value={profile.currentPosition} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, currentPosition: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Principal Lead Architect"
                  />
                </div>

                {/* Experience Summary */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400">Experience Executive Summary</label>
                  <textarea 
                    value={profile.experienceSummary || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, experienceSummary: e.target.value })}
                    className="w-full h-24 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                    placeholder="Synthesized story of professional track record..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. LOCATION */}
          {activeSubTab === 'location' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <MapPin className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Location & Personal Timeline</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Location (City, State)</label>
                  <input 
                    type="text" 
                    value={profile.location} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. San Francisco, California"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Country</label>
                  <input 
                    type="text" 
                    value={profile.country} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. United States"
                  />
                </div>

                {/* Birthday */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400">Birthday (Optional)</label>
                  <input 
                    type="date" 
                    value={profile.birthday || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, birthday: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. AVAILABILITY STATUS */}
          {activeSubTab === 'availability' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Briefcase className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Availability Status Indicators</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Availability Status */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Availability Status</label>
                  <select
                    value={profile.availability}
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, availability: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none cursor-pointer"
                  >
                    <option value="Open to Work">Open to Work</option>
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>

                {/* Online Status */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Online Status Indicator</label>
                  <select
                    value={profile.onlineStatus || "Online"}
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, onlineStatus: e.target.value as 'Online' | 'Offline' })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none cursor-pointer"
                  >
                    <option value="Online">🟢 Online</option>
                    <option value="Offline">🔴 Offline</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 7. BUTTONS & CTA ACTIONS */}
          {activeSubTab === 'buttons' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <FileText className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Hero Buttons & Primary Call to Action Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary CTA Text */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Primary Button Text</label>
                  <input 
                    type="text" 
                    value={profile.primaryCtaText || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, primaryCtaText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. View Projects"
                  />
                </div>

                {/* Primary CTA URL */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Primary Button Target URL / Selector</label>
                  <input 
                    type="text" 
                    value={profile.primaryCtaUrl || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, primaryCtaUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. #portfolio"
                  />
                </div>

                {/* Secondary CTA Text */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Secondary Button Text</label>
                  <input 
                    type="text" 
                    value={profile.secondaryCtaText || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, secondaryCtaText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Let's Chat"
                  />
                </div>

                {/* Secondary CTA URL */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Secondary Button Target URL</label>
                  <input 
                    type="text" 
                    value={profile.secondaryCtaUrl || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, secondaryCtaUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. #contact"
                  />
                </div>

                {/* Resume Link URL */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">CV/Resume Document URL</label>
                  <input 
                    type="text" 
                    value={profile.resumeUrl || ""} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, resumeUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. https://example.com/resume.pdf"
                  />
                </div>

                {/* Resume Download Text */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">CV/Resume Button Caption</label>
                  <input 
                    type="text" 
                    value={profile.resumeDownloadText || "Download CV"} 
                    onChange={(e) => updateProfileStateWithHistory({ ...profile, resumeDownloadText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    placeholder="e.g. Download Resume"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. SEO METADATA & WEBSITE LOGO / BRANDING */}
          {activeSubTab === 'seo' && (
            <div className="space-y-8">
              {/* Section 1: Website Logo & Brand Identity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 font-mono">Website Logo & Visual Branding</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Displayed in header navbar, browser tabs, and brand watermarks</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Formats: SVG, PNG, WEBP (Transparent recommended)</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Website Brand Logo Card */}
                  <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold font-mono text-slate-200">Main Header / Navbar Logo</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Top-left branding mark across all pages</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setMediaModalField('websiteLogo')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Folder className="w-3 h-3" />
                          Media Library
                        </button>
                        {(profile.websiteLogo || profile.logoUrl) && (
                          <button 
                            type="button"
                            onClick={() => handleDeleteImageField('websiteLogo')}
                            className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete logo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Logo Drop Area */}
                    <div 
                      onDragOver={handleImageDragOver}
                      onDrop={(e) => handleImageDrop(e, 'website-logo', 1)}
                      onClick={() => triggerImageFileBrowse('website-logo', 1)}
                      className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                    >
                      {profile.websiteLogo || profile.logoUrl ? (
                        <div className="relative group p-2 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-center min-w-[96px] min-h-[96px]">
                          <img 
                            src={profile.websiteLogo || profile.logoUrl} 
                            alt="Website Logo" 
                            referrerPolicy="no-referrer"
                            className="max-h-20 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {profile.logoText ? profile.logoText.slice(0, 2).toUpperCase() : (profile.fullName ? profile.fullName.slice(0, 2).toUpperCase() : "CM")}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 mt-1">No Logo Set</span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs font-semibold text-slate-300">Drag & drop logo file or <span className="text-emerald-400">browse</span></p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Recommended 400x400px or transparent SVG</p>
                      </div>
                    </div>

                    {/* Direct URL Input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400">Direct Logo Image URL / CDN Link</label>
                      <input 
                        type="text"
                        value={profile.websiteLogo || profile.logoUrl || ""}
                        onChange={(e) => updateProfileStateWithHistory({ ...profile, websiteLogo: e.target.value, logoUrl: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 transition focus:outline-none"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Brand Monogram / Text & Favicon Card */}
                  <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Brand Monogram & Favicon</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Navbar text title and browser tab icon</p>
                    </div>

                    {/* Monogram / Brand Text */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-slate-400">Navbar Brand / Monogram Text</label>
                      <input 
                        type="text" 
                        value={profile.logoText || profile.displayName || profile.fullName || ""} 
                        onChange={(e) => updateProfileStateWithHistory({ ...profile, logoText: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                        placeholder="e.g. CHANDRU M or Chandru Dev"
                      />
                      <span className="text-[9px] text-slate-500 font-mono">Shown beside logo in the top navbar banner.</span>
                    </div>

                    {/* Browser Favicon */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono text-slate-400">Browser Tab Favicon Icon (.ico / .png / .svg)</label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => triggerImageFileBrowse('favicon', 1)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-mono transition cursor-pointer"
                          >
                            Upload Favicon
                          </button>
                          {profile.faviconUrl && (
                            <button 
                              type="button"
                              onClick={() => handleDeleteImageField('faviconUrl')}
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition"
                              title="Remove Favicon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {profile.faviconUrl || profile.websiteLogo ? (
                            <img 
                              src={profile.faviconUrl || profile.websiteLogo} 
                              alt="Favicon" 
                              className="w-6 h-6 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Globe className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <input 
                          type="text" 
                          value={profile.faviconUrl || ""} 
                          onChange={(e) => updateProfileStateWithHistory({ ...profile, faviconUrl: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 transition focus:outline-none"
                          placeholder="https://example.com/favicon.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Search Engine Optimization (SEO) */}
              <div className="space-y-4 pt-4 border-t border-slate-900">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 font-mono">Dynamic Search Engine Optimization (SEO)</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Google search indexing, browser document title, and search previews</p>
                    </div>
                  </div>
                </div>

                {/* Google Search Result Live Preview Snippet */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Eye className="w-3 h-3" />
                    Live Google Search Snippet Simulation
                  </span>
                  <div className="p-3 bg-white/[0.02] border border-slate-900 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans">
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span className="text-slate-300">https://chandru-dev-lime.vercel.app</span>
                      <span className="text-slate-600">›</span>
                      <span className="text-slate-500">portfolio</span>
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-blue-400 hover:underline cursor-pointer font-sans">
                      {profile.seoTitle || `${profile.fullName || "Chandru Mohan"} | ${profile.title || "Principal Systems Architect"}`}
                    </div>
                    <div className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                      {profile.seoDescription || "Senior Systems Architect & Full-Stack Java Developer portfolio showcasing enterprise microservices, cloud infrastructure, and distributed computing architectures."}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* SEO Title with Character Count */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Browser Document Title & Search Result Title <span className="text-emerald-400">*</span>
                      </label>
                      <span className={`text-[10px] font-mono ${
                        (profile.seoTitle?.length || 0) > 60 ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {profile.seoTitle?.length || 0} / 60 characters (Recommended: 50-60)
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={profile.seoTitle || ""} 
                      onChange={(e) => updateProfileStateWithHistory({ ...profile, seoTitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                      placeholder="e.g. Chandru Mohan | Principal Systems Architect & Full Stack Developer"
                    />
                  </div>

                  {/* SEO Description with Character Count */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Search Engine Meta Description <span className="text-emerald-400">*</span>
                      </label>
                      <span className={`text-[10px] font-mono ${
                        (profile.seoDescription?.length || 0) > 160 ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {profile.seoDescription?.length || 0} / 160 characters (Recommended: 150-160)
                      </span>
                    </div>
                    <textarea 
                      value={profile.seoDescription || ""} 
                      onChange={(e) => updateProfileStateWithHistory({ ...profile, seoDescription: e.target.value })}
                      className="w-full h-20 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                      placeholder="Concise overview summarizing your core architectural competencies, Java/React skills, and contact opportunities..."
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-slate-400">Meta Keywords (Comma separated)</label>
                    <input 
                      type="text" 
                      value={profile.seoKeywords || ""} 
                      onChange={(e) => updateProfileStateWithHistory({ ...profile, seoKeywords: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                      placeholder="e.g. systems architect, java full stack, spring boot, react, microservices, bangalore"
                    />
                  </div>

                  {/* Canonical URL & Indexing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">Canonical Website URL</label>
                      <input 
                        type="text" 
                        value={profile.canonicalUrl || "https://chandru-dev-lime.vercel.app/"} 
                        onChange={(e) => updateProfileStateWithHistory({ ...profile, canonicalUrl: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                        placeholder="https://chandru-dev-lime.vercel.app/"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">Search Robots Indexing</label>
                      <select
                        value={profile.allowIndexing === false ? "noindex" : "index"}
                        onChange={(e) => updateProfileStateWithHistory({ ...profile, allowIndexing: e.target.value === "index" })}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                      >
                        <option value="index">Index & Follow (Public search engine ranking)</option>
                        <option value="noindex">No-Index (Private / Hidden from Google)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Open Graph (OG) & Social Card Previews */}
              <div className="space-y-4 pt-4 border-t border-slate-900">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 font-mono">Open Graph (OG) & Social Share Preview</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Card format rendered when sharing portfolio URL on LinkedIn, WhatsApp, Twitter, Discord</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Live Social Share Card Preview */}
                  <div className="border border-slate-800 bg-slate-950/60 rounded-2xl overflow-hidden shadow-xl">
                    <div className="aspect-[1.91/1] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
                      {profile.ogImage || profile.websiteLogo || profile.profileImage ? (
                        <img 
                          src={profile.ogImage || profile.websiteLogo || profile.profileImage} 
                          alt="OG Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <span className="text-[10px] font-mono text-slate-500">No Social Image Configured</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
                        1200 x 630 OG Share
                      </div>
                    </div>
                    <div className="p-4 space-y-1 bg-slate-950">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">chandru-dev-lime.vercel.app</span>
                      <h4 className="text-xs font-bold text-slate-100 font-sans line-clamp-1">
                        {profile.ogTitle || profile.seoTitle || `${profile.fullName || "Chandru Mohan"} | Portfolio`}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                        {profile.ogDescription || profile.seoDescription || "Explore enterprise software architecture, full stack projects, and systems engineering portfolio."}
                      </p>
                    </div>
                  </div>

                  {/* OG Card Inputs */}
                  <div className="space-y-4">
                    {/* Social Share Image Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono text-slate-400">Social Card Share Image (OG Image)</label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMediaModalField('ogImage')}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono transition cursor-pointer"
                          >
                            Media Library
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerImageFileBrowse('og-image', 1.91)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-mono transition cursor-pointer"
                          >
                            Upload Image
                          </button>
                          {profile.ogImage && (
                            <button 
                              type="button"
                              onClick={() => handleDeleteImageField('ogImage')}
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition"
                              title="Delete OG Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={profile.ogImage || ""} 
                        onChange={(e) => updateProfileStateWithHistory({ ...profile, ogImage: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 transition focus:outline-none"
                        placeholder="https://example.com/og-card-image.jpg"
                      />
                    </div>

                    {/* Social Share Title */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400">Social Share Title (Optional override)</label>
                      <input 
                        type="text" 
                        value={profile.ogTitle || ""} 
                        onChange={(e) => updateProfileStateWithHistory({ ...profile, ogTitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 transition focus:outline-none"
                        placeholder="Leave blank to use main SEO Title"
                      />
                    </div>

                    {/* Social Share Description */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400">Social Share Description (Optional override)</label>
                      <textarea 
                        value={profile.ogDescription || ""} 
                        onChange={(e) => updateProfileStateWithHistory({ ...profile, ogDescription: e.target.value })}
                        className="w-full h-16 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 transition focus:outline-none resize-none"
                        placeholder="Leave blank to use main SEO Description"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar for SEO & Logo Tab */}
              <div className="pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-slate-300">SEO & Brand settings will synchronize live to the portfolio upon saving.</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition cursor-pointer"
                  >
                    Revert Unsaved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProfile(false)}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save & Publish Live</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFILE IMAGES */}
          {activeSubTab === 'images' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Image Asset Configuration</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500">Limits: 10MB JPG, PNG, WEBP, SVG</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Photo - Aspect 1:1 circular */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Profile Image</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Used for primary avatars and headers</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMediaModalField('profileImage')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Folder className="w-3 h-3" />
                        From Media Manager
                      </button>
                      {profile.profileImage && (
                        <button 
                          onClick={() => handleDeleteImageField('profileImage')}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div 
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, 'profile', 1)}
                    onClick={() => triggerImageFileBrowse('profile', 1)}
                    className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                  >
                    <AnimatedProfileAvatar
                      src={profile.profileImage}
                      alt={profile.fullName || "Profile"}
                      size="lg"
                      shape="circle"
                      glowIntensity="vibrant"
                      showStatus={false}
                    />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-300">Drag & drop or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Live animated cyber preview (Square 1:1)</p>
                    </div>
                  </div>
                </div>

                {/* Hero Avatar - Aspect 1:1 circular */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Hero Avatar Photo</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Avatar overlay inside the home section</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMediaModalField('heroAvatar')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Folder className="w-3 h-3" />
                        From Media Manager
                      </button>
                      {profile.heroAvatar && (
                        <button 
                          onClick={() => handleDeleteImageField('heroAvatar')}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div 
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, 'hero-avatar', 1)}
                    onClick={() => triggerImageFileBrowse('hero-avatar', 1)}
                    className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                  >
                    <AnimatedProfileAvatar
                      src={profile.heroAvatar}
                      alt={profile.heroName || profile.fullName || "Hero Avatar"}
                      size="lg"
                      shape="circle"
                      glowIntensity="vibrant"
                      showStatus={false}
                    />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-300">Drag & drop or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Optional Hero Avatar (1:1 circular)</p>
                    </div>
                  </div>
                </div>

                {/* About Image - Aspect 1:1 square */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">About Section Photo</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Illustrated image on the About tab</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMediaModalField('aboutImage')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Folder className="w-3 h-3" />
                        From Media Manager
                      </button>
                      {profile.aboutImage && (
                        <button 
                          onClick={() => handleDeleteImageField('aboutImage')}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div 
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, 'about', 1)}
                    onClick={() => triggerImageFileBrowse('about', 1)}
                    className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                  >
                    <AnimatedProfileAvatar
                      src={profile.aboutImage || profile.profileImage}
                      alt={profile.fullName || "About Section Photo"}
                      size="lg"
                      shape="squircle"
                      glowIntensity="vibrant"
                      showStatus={false}
                    />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-300">Drag & drop or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">High-quality portrait or photo (Squircle Cyber Frame)</p>
                    </div>
                  </div>
                </div>

                {/* Cover Photo - Aspect 3:1 banner */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Cover Banner Image</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Top panoramic panel background</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMediaModalField('coverImage')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Folder className="w-3 h-3" />
                        From Media Manager
                      </button>
                      {profile.coverImage && (
                        <button 
                          onClick={() => handleDeleteImageField('coverImage')}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div 
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, 'cover', 3)}
                    onClick={() => triggerImageFileBrowse('cover', 3)}
                    className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                  >
                    {profile.coverImage ? (
                      <img 
                        src={profile.coverImage} 
                        alt="Cover banner" 
                        referrerPolicy="no-referrer"
                        className="w-full max-h-24 rounded-lg object-cover border border-slate-800"
                      />
                    ) : (
                      <div className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-300">Drag & drop cover banner or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Panoramic 3:1 widescreen ratio</p>
                    </div>
                  </div>
                </div>

                {/* Hero Background - Aspect 16:9 wallpaper */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Hero Section Wallpaper</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Cosmic canvas overlay in portfolio header</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMediaModalField('heroBackground')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Folder className="w-3 h-3" />
                        From Media Manager
                      </button>
                      {profile.heroBackground && (
                        <button 
                          onClick={() => handleDeleteImageField('heroBackground')}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div 
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, 'hero', 16/9)}
                    onClick={() => triggerImageFileBrowse('hero', 16/9)}
                    className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                  >
                    {profile.heroBackground ? (
                      <img 
                        src={profile.heroBackground} 
                        alt="Hero background" 
                        referrerPolicy="no-referrer"
                        className="w-full max-h-32 rounded-lg object-cover border border-slate-800"
                      />
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-300">Drag & drop hero wallpaper or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">High definition 16:9 widescreen wallpaper</p>
                    </div>
                  </div>
                </div>

                {/* Website Logo - Aspect 1:1 or wide */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Website Branding Logo</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Navbar brand emblem</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMediaModalField('websiteLogo')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Folder className="w-3 h-3" />
                        From Media Manager
                      </button>
                      {(profile.websiteLogo || profile.logoUrl) && (
                        <button 
                          onClick={() => handleDeleteImageField('websiteLogo')}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div 
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, 'website-logo', 1)}
                    onClick={() => triggerImageFileBrowse('website-logo', 1)}
                    className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                  >
                    {profile.websiteLogo || profile.logoUrl ? (
                      <img 
                        src={profile.websiteLogo || profile.logoUrl} 
                        alt="Website Logo" 
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-lg object-contain p-2 bg-slate-900 border border-slate-800"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Globe className="w-8 h-8 text-emerald-400" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-300">Drag & drop website logo or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Transparent PNG / SVG recommended</p>
                    </div>
                  </div>
                </div>

                {/* Social Share OG Image */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Social Share (OG) Image</h4>
                      <p className="text-[10px] text-slate-500 font-mono">1200x630 link preview thumbnail</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMediaModalField('ogImage')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Folder className="w-3 h-3" />
                        From Media Manager
                      </button>
                      {profile.ogImage && (
                        <button 
                          onClick={() => handleDeleteImageField('ogImage')}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete OG image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div 
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, 'og-image', 1.91)}
                    onClick={() => triggerImageFileBrowse('og-image', 1.91)}
                    className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition gap-3"
                  >
                    {profile.ogImage ? (
                      <img 
                        src={profile.ogImage} 
                        alt="Social Share" 
                        referrerPolicy="no-referrer"
                        className="w-full max-h-24 rounded-lg object-cover border border-slate-800"
                      />
                    ) : (
                      <div className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Share2 className="w-8 h-8 text-emerald-400" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-300">Drag & drop OG image or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">1200x630 social card ratio</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. RESUME INTEGRATION */}
          {activeSubTab === 'resume' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <FileText className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">CV / Resume Association</h3>
              </div>

              {resumes.length === 0 ? (
                <div className="bg-slate-950/60 rounded-xl border border-slate-900 p-8 text-center text-slate-500 font-mono text-xs">
                  Please configure and upload a Resume draft inside the main Resume tab first!
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-mono">Select the active Resume draft that is linked to your landing page hero download actions:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumes.map((r) => {
                      const isSelected = profile.resumeId === r.id;
                      return (
                        <div 
                          key={r.id}
                          className={`border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/[0.02]' 
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img 
                              src={r.thumbnailImage || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=260&auto=format&fit=crop"} 
                              alt="Resume CV" 
                              className="w-12 h-16 rounded object-cover border border-slate-800 shrink-0 shadow-lg"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-200 font-mono">{r.title}</h4>
                              <p className="text-[9px] font-mono text-emerald-400 mt-0.5">Version {r.version}</p>
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{r.description || 'No description provided.'}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Enable / Disable download switcher */}
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input 
                                  type="checkbox"
                                  checked={isSelected ? r.isDownloadEnabled : false}
                                  disabled={!isSelected}
                                  onChange={(e) => handleSaveResumeConfig(r.id, e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                                />
                                <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-400' : 'text-slate-600'}`}>Allow Download</span>
                              </label>
                            </div>

                            {!isSelected ? (
                              <button
                                onClick={() => handleSaveResumeConfig(r.id, r.isDownloadEnabled)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono font-semibold rounded-lg border border-slate-800 text-emerald-400 cursor-pointer"
                              >
                                Set as Active CV
                              </button>
                            ) : (
                              <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                                Active on Live View
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. SECURITY & AUTOSAVE */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Shield className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Administrative Integrity & Backup Loops</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Autosave Switcher Card */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">Autosave Engine Loop</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Commit modifications silently to local memory buffers or secure APIs.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isAutosaveEnabled}
                        onChange={(e) => setIsAutosaveEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-slate-950 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Engine Pulse Status:</span>
                    <span className={isAutosaveEnabled ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                      {isAutosaveEnabled ? '● ACTIVE POLLING' : 'OFFLINE'}
                    </span>
                  </div>

                  {isAutosaveEnabled && lastAutosavedTime && (
                    <p className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Last automated background sync: {lastAutosavedTime}</span>
                    </p>
                  )}
                </div>

                {/* Undo changes details */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold font-mono text-slate-200 font-bold">State Histology Stack</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">The application keeps track of your draft states. You can traverse back in time.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleUndo}
                      disabled={currentHistoryIndex <= 0}
                      className="px-3 py-1.5 border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 disabled:opacity-35 disabled:hover:bg-slate-900 rounded-lg text-xs font-mono transition cursor-pointer flex-1"
                    >
                      Undo Action
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={currentHistoryIndex >= history.length - 1}
                      className="px-3 py-1.5 border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 disabled:opacity-35 disabled:hover:bg-slate-900 rounded-lg text-xs font-mono transition cursor-pointer flex-1"
                    >
                      Redo Action
                    </button>
                  </div>

                  <p className="text-[9px] text-slate-500 font-mono text-center">
                    Current Position: {currentHistoryIndex + 1} / {history.length} states stacked
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* --- REUSABLE IMAGE CROP & ZOOM MODAL --- */}
      {cropModalConfig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Image Crop & Compression Tuning</h3>
                <p className="text-[9px] text-slate-500 font-mono">Zoom and adjust positioning inside layout grid</p>
              </div>
              <button 
                onClick={() => setCropModalConfig(null)}
                className="text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Visual Cropping Window Stage */}
            <div className="relative border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden h-64 flex items-center justify-center select-none cursor-move">
              <div 
                className="absolute inset-0 z-0 flex items-center justify-center"
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUpOrLeave}
                onMouseLeave={handleCropMouseUpOrLeave}
              >
                <img 
                  ref={cropImageRef}
                  src={cropModalConfig.imageSrc} 
                  alt="Source" 
                  className="max-h-full object-contain pointer-events-none transition-transform duration-75 select-none"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`,
                    imageRendering: 'auto'
                  }}
                />
              </div>

              {/* Cropping Aspect Highlight border */}
              <div 
                className="absolute border-2 border-dashed border-emerald-500/70 pointer-events-none z-10 flex items-center justify-center bg-slate-950/30"
                style={{
                  width: cropModalConfig.aspectRatio >= 1 ? '85%' : '50%',
                  aspectRatio: cropModalConfig.aspectRatio,
                  borderRadius: cropModalConfig.imageType === 'profile' ? '9999px' : '12px'
                }}
              >
                <span className="bg-slate-950/90 text-[8px] font-mono text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                  {cropModalConfig.imageType === 'profile' ? 'Circular Crop Avatar' : `${cropModalConfig.imageType.toUpperCase()} Target`}
                </span>
              </div>
            </div>

            {/* Tuning Controls */}
            <div className="space-y-3 bg-slate-950/50 p-4 border border-slate-800/80 rounded-2xl">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3 h-3 text-slate-500" />
                    <span>Zoom Level:</span>
                  </span>
                  <span className="text-emerald-400 font-bold">{zoomLevel.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.05"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                <Cpu className="w-3.5 h-3.5 text-slate-600" />
                <span>Standard Canvas Optimization & 85% JPG Stream Compression will be applied.</span>
              </div>
            </div>

            {/* Action panel */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCropModalConfig(null)}
                className="px-4 py-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono rounded-xl cursor-pointer flex-1 transition"
              >
                Abort
              </button>
              <button
                onClick={applyCropAndCompression}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl cursor-pointer flex-1 transition text-center"
              >
                Crop & Compress
              </button>
            </div>

            {/* Hidden canvas used for processing */}
            <canvas ref={cropCanvasRef} className="hidden" />

          </div>
        </div>
      )}

      {/* --- CREDENTIAL LOGIN MODAL --- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form 
            onSubmit={handleAdminLogin}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Unlock Administrative CMS</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
              Input the default verified credentials to acquire a high-security administrative JWT session token:
            </p>

            <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-500">
                <span>Default Username:</span>
                <span className="text-slate-300 font-semibold">admin</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Default Password:</span>
                <span className="text-slate-300 font-semibold">admin123</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Username</label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Password</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-mono rounded-xl cursor-pointer flex-1 transition"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl cursor-pointer flex-1 transition text-center flex items-center justify-center gap-1.5"
              >
                {isVerifying && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Verify JWT</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Centralized Media Library Modal for Profile & Hero Assets */}
      <MediaLibraryModal
        isOpen={mediaModalField !== null}
        onClose={() => setMediaModalField(null)}
        onSelectMedia={(media) => {
          if (mediaModalField) {
            const updates: any = { [mediaModalField]: media.url };
            if (mediaModalField === 'websiteLogo') {
              updates.logoUrl = media.url;
            }
            const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
            updateProfileStateWithHistory(updated);
            if (onProfileUpdated) onProfileUpdated(updated);
            notifyCmsUpdate();
            onTriggerToast(`Selected asset from Media Library. Click "Publish Live" to commit!`, 'success');
          }
          setMediaModalField(null);
        }}
        title={`Select ${mediaModalField ? mediaModalField.replace(/([A-Z])/g, ' $1') : 'Asset'} from Centralized Media Library`}
      />

    </div>
  );
}
