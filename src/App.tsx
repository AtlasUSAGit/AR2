/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './components/Logo';
import CustomizableHeroLogo from './components/CustomizableHeroLogo';
import MindMapBuilder from './components/MindMapBuilder';
import KanbanBoard from './components/KanbanBoard';
import DocumentHub from './components/DocumentHub';
import AmbientEffects from './components/AmbientEffects';
import StaticPageView from './components/StaticPageView';
import LandingPageView from './components/LandingPage/LandingPageView';
import UserManagement from './components/UserManagement';
import ChangeLogs from './components/ChangeLogs';
import AuditMap from './components/AuditMap';
import { useAppContext } from './AppContext';
import { getUrl } from 'aws-amplify/storage';
import { getStoredVideo, saveStoredVideo, clearStoredVideo } from './components/videoDb';
import {
  Shield,
  Cpu,
  Cloud,
  Globe,
  ArrowRight,
  Check,
  Sparkles,
  Terminal,
  Monitor,
  Compass,
  Database,
  Layers,
  FileText,
  Lock,
  Workflow,
  CheckCircle,
  Play,
  Heart,
  ChevronRight,
  BookOpen,
  Briefcase,
  Download,
  Users,
  Building,
  Power,
  HelpCircle,
  MessageSquare,
  Send,
  Sun,
  Moon,
  Upload,
  Trash2
} from 'lucide-react';

const PAGE_SECTIONS: Record<string, string[]> = {
  home: [
    "Hero & Branding Section",
    "System Operations Center (SOC) Console",
    "Direct 8(a) Sole Source Advantage",
    "Operational & Governance Bylaws Summary"
  ],
  mindmap: [
    "Strategic Partnering & Joint Venture Structuring",
    "SBA Regulations & Legal Guidelines",
    "Governance, Capital & Asset Allocations",
    "Operations, Performance & Profit-Share Ratio"
  ],
  federal: [
    "Step 1: Initial Meetings - Introductions Made and Objectives Set",
    "Step 2: Draft Legislation - Legislature Reviews And Makes Decision",
    "Step 3: Approval - Legislation, LoA, and Management Agreement Signed",
    "Step 4: TCE Formation - TCE Incorporated",
    "Step 5: TCE Paperwork - Draft Capability Statement, SBE Certification",
    "Step 6: SBA 8(a) Certification - Notify SBA of Intent to Pursue Contracts",
    "Step 7: Procurement Paperwork - Drafting of Whitepaper & Unsolicited Proposals",
    "Step 8: Proposal Submission - 8(a) Package Submitted",
    "Step 9: Rate Sheet and Scope - Curation of Rate Sheet & Scope of Work",
    "Step 10: Our Primary Role - Meet With Contracting Officers & Federal Buyers",
    "Step 11: 8(a) Contract Ratification - Vendor List & Declaration Approved",
    "Step 12: BPA - Blank Purchase Agreement Acquired",
    "Step 13: Contract Award Paid - Contract Dollars Awarded to Prime",
    "Step 14: Projects Begin - Outsourcing of Roles for Project Work",
    "Step 15: Profits - 8(a) Retains Profits (Tax-Free)",
    "Step 16: Refinement & Compliance - Performance of Work Statement & Compliance"
  ],
  hub: [
    "Document Section: White Paper (Subject Matter Inside Contract)",
    "Document Section: Articles of Incorporation (Legal Corporate Foundation)",
    "Document Section: Small Business Enterprise (SBE) Certification",
    "Document Section: Capabilities Statement (Core Competency Summary)",
    "Document Section: Capabilities Brief (Interactive Presentation)",
    "Document Section: Unsolicited Proposal Volume 1 (Technical & Management)",
    "Document Section: Unsolicited Proposal Volume 2 (Cost & Pricing)",
    "Document Section: Scope of Work (SOW - Project Boundary Conditions)",
    "Document Section: Performance of Work (POW - Compliance Tracking)",
    "Document Section: Executed Contract / Past Performance Record",
    "Document Section: Declaration for Federal Employment (Form OF-306)",
    "Joint Venture Checklist Matrix Panel",
    "Required Corporate Actions Registry Panel",
    "SBA Compliance Document Hub Panel",
    "Audit & Review Workflows Panel"
  ],
  bylaws: [
    "Article I: Offices, Powers & Purpose",
    "Article II: Directors, Voting & Meetings",
    "Article III: Enterprises & Sovereign Immunity",
    "Article IV: Auditing & Compliance Controls"
  ],
  'meeting-minutes': [
    "JV Board of Directors General Minutes",
    "Special Operations Allocations Directive",
    "Operational Security Budgets"
  ],
  'board-minutes': [
    "Enterprise Governance Resolutions",
    "SBA Compliance Authorization Log"
  ],
  '-resources': [
    "SBA 8(a) Regulations Guide",
    "Economic Enterprise Framework",
    "Procurement Officers Directory"
  ]
};

export default function App() {
  const { currentUser, login, logout, maintenanceMode, setMaintenanceMode, permissions, addLog, theme, toggleTheme } = useAppContext();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showVideoIntro, setShowVideoIntro] = useState(false);

  // High-performance Cinematic Intro states & handlers
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    // Dynamically request the stream URL from your secure S3 pathway
    const fetchVideo = async () => {
      try {
        const linkResult = await getUrl({
          path: 'intros/intro-animation.mp4'
        });
        setVideoUrl(linkResult.url.toString());
      } catch (err) {
        console.error("Error fetching S3 video stream link:", err);
      }
    };
    fetchVideo();
  }, []);

  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (showVideoIntro && videoRef.current) {
      const video = videoRef.current;
      video.muted = false;
      video.volume = 1.0;
      setIsMuted(false);

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Audio autoplay blocked by browser policy, retrying muted fallback:", err);
          video.muted = true;
          setIsMuted(true);
          video.play().catch(e => {
            console.warn("Muted autoplay also blocked or unsupported:", e);
          });
        });
      }
    }
  }, [showVideoIntro]);

  useEffect(() => {
    getStoredVideo().then((url) => {
      if (url) {
        setVideoUrl(url);
        setHasCustomVideo(true);
      }
    });
  }, []);

  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    setIsVideoLoading(true);
    setVideoLoadFailed(false);

    const success = await saveStoredVideo(file);
    if (success) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setHasCustomVideo(true);
      addLog('video_config', `Uploaded custom introduction video: ${file.name}`);
    }
  };

  const handleResetVideo = async () => {
    await clearStoredVideo();
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
    setHasCustomVideo(false);
    setVideoLoadFailed(false);
    setIsVideoLoading(false);
    addLog('video_config', 'Reset introduction video to system default');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm'))) {
      handleVideoUpload(file);
    }
  };

  const [fallbackProgress, setFallbackProgress] = useState(0);

  useEffect(() => {
    if (showVideoIntro && (videoLoadFailed || isVideoLoading)) {
      setFallbackProgress(0);
      const timer = setInterval(() => {
        setFallbackProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              setShowVideoIntro(false);
            }, 600);
            return 100;
          }
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 150);
      return () => clearInterval(timer);
    }
  }, [showVideoIntro, videoLoadFailed, isVideoLoading]);

  const userRole = currentUser?.role || '';
  const rolePerm = permissions?.find(p => p.role === userRole);

  const canReadTab = (tabId: string) => {
    if (!currentUser) return false;
    if (currentUser?.role === 'SysAdmin') return true;
    if (tabId === 'users' || tabId === 'logs') {
      return currentUser?.role === 'SysAdmin';
    }
    if (!rolePerm) return true;
    return rolePerm.readPageOnlyPages.includes(tabId) || rolePerm.readPageAndFilesPages.includes(tabId);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      setLoginError('');
      setShowVideoIntro(true);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const [activeTab, setActiveTab] = useState<'home' | 'mindmap' | 'kanban' | 'hub' | 'users' | 'logs' | 'audit-map' | 'minutes' | 'resources'>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  // Submit Question Modal States
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Submit Question Handlers
  const openQuestionModal = () => {
    const sections = PAGE_SECTIONS[activeTab] || [];
    if (sections.length > 0) {
      setSelectedSection(sections[0]);
    } else {
      setSelectedSection('custom');
    }
    setCustomSection('');
    setQuestionText('');
    setQuestionSubmitted(false);
    setIsQuestionModalOpen(true);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const finalSection = selectedSection === 'custom'
      ? (customSection.trim() || 'General / Unspecified Section')
      : selectedSection;

    const tabNameDisplay = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

    addLog(
      'Submitted Question',
      `Page: "${tabNameDisplay}" | Section: "${finalSection}" | Question: "${questionText.trim()}"`
    );

    setQuestionSubmitted(true);
    setTimeout(() => {
      setIsQuestionModalOpen(false);
      setQuestionSubmitted(false);
    }, 1800);
  };

  // Cyber scan simulator triggers
  const runCyberScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs(['Initializing secure diagnostic scan...']);

    const logsList = [
      'Authenticating TLS session key...',
      'Mapping cloud container mesh structure...',
      'Probing DNSSEC signature chains...',
      'Parsing local 8(a) compliance hashes...',
      'Inspecting active Zero-Trust firewall rules...',
      'Synthesizing quantum threat matrix database...',
      'Resolving active BGP network peer channels...',
      'Core network audit completed. 0 threats detected.'
    ];

    let currentLogIdx = 0;

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const nextProgress = prev + Math.floor(Math.random() * 15) + 5;

        // Add log messages at milestones
        if (nextProgress > (currentLogIdx + 1) * 12 && currentLogIdx < logsList.length) {
          setScanLogs((prevLogs) => [...prevLogs, logsList[currentLogIdx]]);
          currentLogIdx++;
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 800);
          return 100;
        }
        return nextProgress;
      });
    }, 250);
  };

  if (!currentUser) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans p-4 select-none relative overflow-hidden"
      >
        {/* Ambient Effects behind login */}
        <div className="absolute inset-0 bg-radial-gradient from-purple-900/10 via-transparent to-transparent pointer-events-none" />

        {/* Cinematic full-screen drag-over overlay */}
        {isDragOver && (
          <div className="absolute inset-4 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center border-2 border-dashed border-[#A493F7] rounded-2xl z-50 pointer-events-none animate-pulse">
            <Upload className="w-14 h-14 text-[#A493F7] mb-4" />
            <h3 className="text-lg font-bold text-white font-sans tracking-wide">Drop Your Video File Here</h3>
            <p className="text-xs text-zinc-400 font-mono mt-2">Supports standard MP4 or WebM formats</p>
          </div>
        )}

        <div className="w-full max-w-xs flex flex-col items-center gap-6 animate-fade-in z-10">
          <form
            onSubmit={handleLogin}
            className="w-full flex flex-col gap-4"
          >
            <input
              id="username-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#A493F7] focus:ring-1 focus:ring-[#A493F7] transition-all"
              required
              autoComplete="off"
            />
            <input
              id="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#A493F7] focus:ring-1 focus:ring-[#A493F7] transition-all"
              required
            />
            {loginError && (
              <span id="login-error-message" className="text-red-500 text-xs font-mono text-center">
                {loginError}
              </span>
            )}
            <button
              id="login-submit-button"
              type="submit"
              className="w-full py-3 bg-white text-black font-semibold text-sm rounded-lg hover:bg-zinc-200 transition-all cursor-pointer mt-1"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isReadOnly = currentUser?.role === 'District Representative' || currentUser?.role === 'President';
  const isSysAdmin = currentUser?.role === 'SysAdmin';

  if (maintenanceMode && !isSysAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans p-4 select-none">
        <Logo size={100} glow={true} className="mb-6" />
        <h1 className="text-2xl font-bold mb-2 text-[#A493F7]">System Maintenance</h1>
        <p className="text-zinc-400">The application is currently offline for system maintenance.</p>
        <button onClick={logout} className="mt-8 text-xs font-mono text-zinc-600 hover:text-white">Logout</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-[#A493F7] selection:text-black font-sans relative overflow-x-hidden">

      {/* High-end ambient micro-interactions, canvas network, custom cursor and glow tracking */}
      <AmbientEffects />      {/* Cinematic Fullscreen Post-Login Video Introduction Overlay */}
      <AnimatePresence>
        {showVideoIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Direct video tag with CORS-safe play and event notifications */}
            <video
              ref={videoRef}
              autoPlay
              muted={isMuted}
              playsInline
              onEnded={() => setShowVideoIntro(false)}
              onLoadStart={() => {
                setIsVideoLoading(true);
                setVideoLoadFailed(false);
              }}
              onCanPlay={() => {
                setIsVideoLoading(false);
                setVideoLoadFailed(false);
              }}
              onError={() => {
                setVideoLoadFailed(true);
                setIsVideoLoading(false);
              }}
              className="absolute inset-0 w-full h-full object-cover z-10"
              src={videoUrl}
            />

            {/* Fallback Cinematic System Sync Loader (Visible if video is loading or fails) */}
            {(isVideoLoading || videoLoadFailed) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-6 select-none">
                <div className="w-full max-w-md space-y-6 text-left font-mono">
                  {/* Glowing core brand symbol */}
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-xl border border-purple-500/30 flex items-center justify-center bg-purple-500/5 relative animate-pulse shadow-[0_0_20px_rgba(164,147,247,0.1)]">
                      <Shield className="w-8 h-8 text-[#A493F7]" />
                      <div className="absolute inset-0 border border-purple-400/20 rounded-xl animate-ping opacity-30" />
                    </div>
                  </div>

                  {/* Diagnostic logs */}
                  <div className="space-y-1.5 text-xs text-zinc-400 max-h-40 overflow-hidden">
                    <div className="text-[#A493F7] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      <span>INITIALIZING SECURE QUANTUM LINK...</span>
                    </div>
                    {fallbackProgress > 20 && (
                      <div className="text-emerald-400 flex items-center gap-1.5">
                        <span>[OK] AUTHORIZATION SYNCED AT SECURE ENCLAVE</span>
                      </div>
                    )}
                    {fallbackProgress > 45 && (
                      <div className="text-zinc-400">
                        <span>[DB] CONNECTED TO CONTRACT DATA HOST</span>
                      </div>
                    )}
                    {fallbackProgress > 70 && (
                      <div className="text-[#A493F7] animate-pulse">
                        <span>[SYS] GENERATING 16-STEP FLOW COMPLIANCE MAP...</span>
                      </div>
                    )}
                    {fallbackProgress >= 100 && (
                      <div className="text-white font-bold">
                        <span>[READY] TERMINAL STANDBY - COMMENCING HANDSHAKE</span>
                      </div>
                    )}
                  </div>

                  {/* Progress percentage & visual bar */}
                  <div className="space-y-2 pt-4 border-t border-zinc-900">
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>SECURE HANDSHAKE STATUS</span>
                      <span className="text-[#A493F7] font-bold">{Math.min(100, fallbackProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 via-[#A493F7] to-white"
                        style={{ width: `${Math.min(100, fallbackProgress)}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Skip button in bottom-right corner */}
            <button
              onClick={() => setShowVideoIntro(false)}
              className="absolute bottom-8 right-8 z-50 px-5 py-2.5 bg-black/60 hover:bg-white hover:text-black border border-zinc-800 hover:border-white text-zinc-300 font-mono text-xs font-bold rounded-lg transition-all duration-300 backdrop-blur-md cursor-pointer flex items-center gap-1.5 shadow-lg"
            >
              SKIP SYSTEM INTRO
            </button>

            {/* Dynamic status/cyber overlay to enrich the feel */}
            <div className="absolute top-8 left-8 z-30 font-mono text-left flex flex-col gap-1 select-none pointer-events-none">
              <div className="flex items-center gap-2 text-[#A493F7]">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                <span className="text-xs font-bold tracking-widest uppercase">SECURE COMM CHANNEL INITIATED</span>
              </div>
              <span className="text-[10px] text-zinc-400">SYSTEM AUTHORIZATION: SUCCESSFUL</span>
              <span className="text-[10px] text-zinc-400">USER LEVEL: {currentUser?.role || 'AUTHORIZED'}</span>
              <span className="text-[10px] text-zinc-500 font-mono">NODE STATUS: SECURE CLOUD-NATIVE COMMAND CENTER</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic scan line overlay across the entire screen */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#A493F7]/30 to-transparent shadow-[0_0_10px_#A493F7] animate-scanline z-50" />

      {/* Ambient background network nodes background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[180px] pointer-events-none" />

      {/* ==================== NAVIGATION BAR ==================== */}
      <header className="sticky top-0 z-40 bg-[#050507]/80 backdrop-blur-md border-b border-zinc-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo Brand Group */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <Logo size={42} glow={true} padding={1} className="group-hover:rotate-12 duration-500" />
            <div>
              <span className="font-sans font-extrabold text-xl tracking-widest text-white block leading-none">
                ATLAS
              </span>
              <span className="text-[10px] font-mono text-[#A493F7] tracking-widest uppercase block mt-1">
                USA
              </span>
            </div>
          </div>

          {/* Central Workspace Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl">
            {canReadTab('home') && (
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${activeTab === 'home'
                    ? 'bg-purple-600/20 text-[#A493F7] border border-purple-500/20 shadow-[inset_0_0_10px_rgba(164,147,247,0.15)] font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
              >
                <Compass size={13} />
                Daily Briefing
              </button>
            )}
            {canReadTab('mindmap') && (
              <button
                onClick={() => setActiveTab('mindmap')}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${activeTab === 'mindmap'
                    ? 'bg-purple-600/20 text-[#A493F7] border border-purple-500/20 shadow-[inset_0_0_10px_rgba(164,147,247,0.15)] font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
              >
                <Workflow size={13} />
                Mind Map Sandbox
              </button>
            )}
            {canReadTab('kanban') && (
              <button
                onClick={() => setActiveTab('kanban')}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${activeTab === 'kanban'
                    ? 'bg-purple-600/20 text-[#A493F7] border border-purple-500/20 shadow-[inset_0_0_10px_rgba(164,147,247,0.15)] font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
              >
                <Layers size={13} />
                Kanban
              </button>
            )}
            {canReadTab('hub') && (
              <button
                onClick={() => setActiveTab('hub')}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${activeTab === 'hub'
                    ? 'bg-purple-600/20 text-[#A493F7] border border-purple-500/20 shadow-[inset_0_0_10px_rgba(164,147,247,0.15)] font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
              >
                <FileText size={13} />
                Document Hub
              </button>
            )}
          </nav>

          {/* Edit Mode Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-edit-mode'))}
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-white font-sans text-xs font-bold rounded-xl hover:border-purple-500 hover:shadow-[0_0_15px_rgba(164,147,247,0.5)] active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle size={14} className="text-purple-400" />
              <span>Toggle Edit Mode</span>
            </button>
          </div>
        </div>

        {/* SUB-HEADER NAVIGATION FOR STATIC PAGES AND ADMIN */}
        <div className="border-t border-zinc-800/80 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs font-mono">
              {canReadTab('minutes') && (
                <button onClick={() => setActiveTab('minutes')} className={`hover:text-[#A493F7] transition ${activeTab === 'minutes' ? 'text-[#A493F7]' : 'text-zinc-400'}`}>Minutes</button>
              )}
              {canReadTab('minutes') && canReadTab('resources') && <span className="text-zinc-800">|</span>}
              {canReadTab('resources') && (
                <button onClick={() => setActiveTab('resources')} className={`hover:text-[#A493F7] transition ${activeTab === 'resources' ? 'text-[#A493F7]' : 'text-zinc-400'}`}>Resources</button>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              {canReadTab('users') && (
                <>
                  <button onClick={() => setActiveTab('users')} className={`hover:text-emerald-400 transition flex items-center gap-1 ${activeTab === 'users' ? 'text-emerald-400' : 'text-emerald-400/50'}`}>
                    <Users size={12} /> Users
                  </button>
                </>
              )}
              {canReadTab('logs') && (
                <>
                  <span className="text-zinc-800">|</span>
                  <button onClick={() => setActiveTab('logs')} className={`hover:text-indigo-400 transition flex items-center gap-1 ${activeTab === 'logs' ? 'text-indigo-400' : 'text-indigo-400/50'}`}>
                    <Shield size={12} /> Audit Logs
                  </button>
                </>
              )}
              {currentUser.role === 'SysAdmin' && (
                <>
                  <span className="text-zinc-800">|</span>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className="text-red-400/50 hover:text-red-400 transition flex items-center gap-1"
                  >
                    <Power size={12} /> Toggle Maintenance
                  </button>
                </>
              )}
              <span className="text-zinc-800">|</span>
              <button onClick={logout} className="text-zinc-500 hover:text-white transition">Logout ({currentUser.username})</button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== ACTIVE VIEW WORKSPACES ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-12">

        {/* TAB 1: COMMAND CENTER (LANDING PAGE VIEW) */}
        {activeTab === 'home' && canReadTab('home') && (
          <div className="animate-fadeIn -mx-4 sm:-mx-6 lg:-mx-8 -mt-10">
            <LandingPageView />
          </div>
        )}

        {/* TAB 2: INTERACTIVE MIND MAP BUILDER */}
        {activeTab === 'mindmap' && canReadTab('mindmap') && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold text-white font-sans flex items-center gap-3">
                  <Workflow className="text-[#A493F7]" size={28} />
                  <span>Collaborative Mind Map Builder</span>
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Design intricate system hierarchies, customize nodes, and draw glowing, animated data flows.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {currentUser?.role === 'SysAdmin' && (
                  <button
                    onClick={() => setActiveTab('audit-map')}
                    className="hidden sm:inline-flex px-4 py-2 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/50 text-[#A493F7] text-xs font-mono rounded-lg transition cursor-pointer items-center gap-2"
                  >
                    <Shield size={14} /> View Admin Audit Map
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('home')}
                  className="hidden sm:inline-flex px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-lg transition cursor-pointer"
                >
                  ➔ Back to Dashboard
                </button>
              </div>
            </div>

            <MindMapBuilder currentUser={currentUser} />
          </div>
        )}

        {/* TAB 3: KANBAN PROJECT MANAGEMENT */}
        {activeTab === 'kanban' && canReadTab('kanban') && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold text-white font-sans flex items-center gap-3">
                  <Layers className="text-[#A493F7]" size={28} />
                  <span>Kanban Project Management</span>
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Manage tasks and workflows with a visual To-Do, In Progress, and Done board.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="hidden sm:inline-flex px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-lg transition cursor-pointer"
              >
                ➔ Back to Dashboard
              </button>
            </div>

            <KanbanBoard />
          </div>
        )}

        {/* TAB 4: 8(a) DOCUMENT READINESS & SUBMISSION HUB */}
        {activeTab === 'hub' && canReadTab('hub') && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold text-white font-sans flex items-center gap-3">
                  <FileText className="text-[#A493F7]" size={28} />
                  <span>Document Hub</span>
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Manage required federal solicitation drafts, check compliance scores, and align items with the 16-step roadmap.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="hidden sm:inline-flex px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-lg transition cursor-pointer"
              >
                ➔ Back to Dashboard
              </button>
            </div>

            <DocumentHub />
          </div>
        )}

        {/* STATIC PAGES */}
        {activeTab === 'minutes' && canReadTab('minutes') && <StaticPageView pageId="minutes" />}
        {activeTab === 'resources' && canReadTab('resources') && <StaticPageView pageId="resources" />}

        {/* ADMIN PANELS */}
        {activeTab === 'users' && canReadTab('users') && <UserManagement />}
        {activeTab === 'logs' && canReadTab('logs') && <ChangeLogs />}
        {activeTab === 'audit-map' && canReadTab('logs') && <AuditMap />}

      </main>

      {/* ==================== CYBER DIAGNOSTIC SCAN MODAL ==================== */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0B0B0F] border border-[#A493F7] rounded-3xl p-6 w-full max-w-lg shadow-[0_0_80px_rgba(164,147,247,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A493F7] to-transparent animate-pulse" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#A493F7]/10 animate-ping" />
                <Logo size={80} glow={true} className="relative z-10 animate-spin-slow" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-sans">ATLAS Decoupled Core Scan</h4>
                <p className="text-xs font-mono text-[#A493F7] uppercase tracking-widest mt-1">
                  Scanning system perimeter telemetry...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Progress Ratio</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                  <div
                    className="h-full bg-gradient-to-r from-[#A493F7] to-indigo-500 shadow-[0_0_10px_#A493F7] transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              {/* Log Messages Feed inside Modal */}
              <div className="w-full bg-black border border-zinc-850 rounded-xl p-4 font-mono text-[10px] text-zinc-400 text-left h-36 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-850">
                {scanLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#A493F7]">✓</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-zinc-500 font-mono">
                System telemetry secured via military-grade TLS node connections.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUBMIT IN-CONTEXT QUESTION MODAL ==================== */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0B0B0F] border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(164,147,247,0.25)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A493F7] to-transparent animate-pulse" />

            {questionSubmitted ? (
              <div className="flex flex-col items-center text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center rounded-full text-emerald-400">
                  <CheckCircle size={36} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Question Submitted!</h4>
                  <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                    Your inquiry has been successfully recorded in the audit logs. Administrators can view and action this in the Audit Logs page.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="text-[#A493F7]" size={20} />
                    <h3 className="text-lg font-bold text-white">Submit Question</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="text-zinc-500 hover:text-white transition font-mono text-xs cursor-pointer p-1"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Current Tab Context Badge */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Active View Context</label>
                    <div className="inline-flex items-center px-3 py-1 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 font-mono capitalize">
                      <span className="w-2 h-2 bg-[#A493F7] rounded-full mr-2 animate-pulse" />
                      {activeTab === 'home' ? 'Command Center' : activeTab === 'mindmap' ? 'JV Mind Map' : activeTab === 'federal' ? 'Contracting Timeline' : activeTab === 'hub' ? 'Document Hub' : activeTab} View
                    </div>
                  </div>

                  {/* Section Selector */}
                  {PAGE_SECTIONS[activeTab] && PAGE_SECTIONS[activeTab].length > 0 ? (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Select Page Section</label>
                      <select
                        value={selectedSection}
                        onChange={(e) => {
                          setSelectedSection(e.target.value);
                          if (e.target.value !== 'custom') {
                            setCustomSection('');
                          }
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#A493F7] focus:ring-1 focus:ring-[#A493F7] rounded-lg px-3 py-2 text-sm text-white outline-none transition cursor-pointer"
                      >
                        {PAGE_SECTIONS[activeTab].map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                        <option value="custom">Other / Specify Custom Section...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="hidden" />
                  )}

                  {/* Custom Section Text Field */}
                  {(selectedSection === 'custom' || !PAGE_SECTIONS[activeTab]) && (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Specify Section Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Side Navigation Bar, Site Footer, or Custom Area..."
                        value={customSection}
                        onChange={(e) => setCustomSection(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#A493F7] focus:ring-1 focus:ring-[#A493F7] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition"
                      />
                    </div>
                  )}

                  {/* Question Text Area */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Your Question / Inquiry</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Ask any question about this section's compliance, regulations, or operations..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#A493F7] focus:ring-1 focus:ring-[#A493F7] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#A493F7] text-black font-semibold text-xs rounded-lg hover:shadow-[0_0_15px_rgba(164,147,247,0.4)] hover:bg-[#b2a4f9] active:scale-95 transition cursor-pointer"
                  >
                    <Send size={12} />
                    Submit Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-zinc-900 bg-[#070709] mt-24 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-8 items-start">

            {/* Brand column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <Logo size={40} glow={false} />
                <div>
                  <span className="font-sans font-extrabold text-lg tracking-widest text-white block leading-none">
                    ATLAS
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase block mt-1">
                    Sovereign Systems
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ATLAS is a premier managed intelligence IT & sovereign systems provider, delivering Zero-Trust defense postures, GovCloud solutions, and certified 8(a) Joint Venture contracting architectures.
              </p>
              <div className="flex flex-col gap-2 text-xs font-mono text-zinc-500">
                <span>© 2026 ATLAS, LLC. All rights reserved.</span>
              </div>
            </div>

            {/* Quick Navigation column */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-mono text-[#A493F7] uppercase tracking-widest">Active Workspace</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <button onClick={() => setActiveTab('home')} className="hover:text-white transition cursor-pointer">
                    Command Center
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('mindmap')} className="hover:text-white transition cursor-pointer">
                    Mind Map Playground
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('federal')} className="hover:text-white transition cursor-pointer">
                    8(a) Contracting Route
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('hub')} className="hover:text-white transition cursor-pointer">
                    Document Hub
                  </button>
                </li>
              </ul>
            </div>

            {/* Security Compliance column */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-mono text-[#A493F7] uppercase tracking-widest">Compliance</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <Check className="text-emerald-400" size={12} />
                  <span>8(a) SBA Certified</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="text-emerald-400" size={12} />
                  <span>SBE Certified</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="text-emerald-400" size={12} />
                  <span>NIST SP 800-171</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="text-emerald-400" size={12} />
                  <span>ITAR Compliant</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom credit line */}
          <div className="border-t border-zinc-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[10px] font-mono text-zinc-600">
              SECURE CLOUD-NATIVE DECOUPLED NODE // HOST: CLOUD RUN CORE
            </span>
            <div className="flex gap-4 text-xs text-zinc-500 items-center">
              {currentUser?.role === 'SysAdmin' && (
                <>
                  <a
                    href="/download-app"
                    download
                    className="text-[#A493F7] hover:text-[#A493F7]/80 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer"
                  >
                    <Download size={13} />
                    DOWNLOAD APP
                  </a>
                  <span className="text-zinc-800">|</span>
                </>
              )}

              {/* Theme Toggle Button next to Download App */}
              <button
                onClick={toggleTheme}
                className="text-[#A493F7] hover:text-[#A493F7]/80 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer border border-zinc-800/80 hover:border-[#A493F7]/40 bg-zinc-950/40 rounded-lg px-2.5 py-1"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={13} className="text-amber-400" />
                    <span>LIGHT MODE</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} className="text-[#A493F7]" />
                    <span>DARK MODE</span>
                  </>
                )}
              </button>

              <span className="text-zinc-800">|</span>
              <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-zinc-300 cursor-pointer">SLA Agreement</span>
              <span className="hover:text-zinc-300 cursor-pointer">NOC Telemetry</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Inject custom Tailwind v4 animations */}
      <style>{`
        @keyframes scanline {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }
        .animate-blink-cursor {
          animation: blink 0.8s step-end infinite;
        }
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
