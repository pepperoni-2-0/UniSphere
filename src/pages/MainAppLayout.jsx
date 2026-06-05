import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { initialStories } from '../data/mockData';
import { 
  Home, 
  Megaphone, 
  MessageSquare, 
  Calendar, 
  Briefcase, 
  Users, 
  User, 
  Settings, 
  LogOut, 
  Hash, 
  Plus, 
  Send, 
  Heart, 
  ThumbsUp, 
  MessageCircle,
  Clock, 
  MapPin, 
  Bell, 
  BookOpen, 
  Search,
  CheckCircle,
  FileText,
  TrendingUp,
  Smile,
  CornerDownRight,
  Sun,
  Moon,
  Shield,
  Filter,
  Lock,
  Pin,
  Trash2,
  Bookmark,
  X
} from 'lucide-react';
import './MainAppLayout.css';

const MainAppLayout = () => {
  const { 
    currentUser, 
    logoutUser, 
    workspaces, 
    currentWorkspace, 
    currentWorkspaceId, 
    switchWorkspace, 
    channels, 
    createChannel,
    messages, 
    sendMessage, 
    addReaction,
    directMessages, 
    getOrCreateDM,
    activeChannelId, 
    setActiveChannelId, 
    activeChannelType, 
    setActiveChannelType,
    users,
    announcements,
    events,
    setEvents,
    communities,
    activityFeed,
    setActivityFeed,
    schedule,
    deadlines,
    trending,
    activeThreadParentId,
    setActiveThreadParentId,
    threadReplies,
    sendThreadReply,
    theme,
    toggleTheme,
    roles,
    hasPermission,
    updateUserRoles,
    updateRolePermissions,
    updateUserIdentity,
    togglePinMessage,
    feedPosts,
    moments,
    recommendedClubs,
    campusStats,
    likeFeedPost,
    saveFeedPost,
    addCommentToPost,
    createFeedPost,
    toggleJoinClub,
    notifications
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('Home'); // Home, Announcements, Events, Placements, Communities, Messages, Profile, Settings, Channel, Directory, Console
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelCategory, setNewChannelCategory] = useState('Academic');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersSearch, setMembersSearch] = useState('');
  
  // Campus Feed specific states
  const [appMode, setAppMode] = useState('workspace'); // workspace, social
  const [activeSocialTab, setActiveSocialTab] = useState('feed'); // feed, explore, messages, profile
  const [profileViewUser, setProfileViewUser] = useState(null);
  
  // Story Viewer State
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [viewedStories, setViewedStories] = useState(() => {
    try {
      const stored = localStorage.getItem('unisphere_viewed_stories');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const storyTimerRef = useRef(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [composerAttachedImage, setComposerAttachedImage] = useState(null); // url path
  const [selectedSocialPeerId, setSelectedSocialPeerId] = useState('user_aarav'); // default message peer
  const [socialChatInput, setSocialChatInput] = useState('');
  const [socialDMMessages, setSocialDMMessages] = useState([
    { id: "sm_1", fromId: "user_aarav", toId: "user_rahul", text: "Hey Rahul, did you check the drone telemetry data?", time: "10 mins ago" },
    { id: "sm_2", fromId: "user_rahul", toId: "user_aarav", text: "Yeah, the evasion sensor index is solid. Pushed index changes!", time: "8 mins ago" },
    { id: "sm_3", fromId: "user_priya", toId: "user_rahul", text: "Congrats on ICPC regionals, Rahul!", time: "2 hours ago" },
    { id: "sm_4", fromId: "user_rahul", toId: "user_priya", text: "Thanks Priya! Couldn't have done it without your debug reviews.", time: "1 hour ago" }
  ]);
  const [followingIds, setFollowingIds] = useState(['user_aarav', 'user_priya']);
  const [feedFilter, setFeedFilter] = useState('');
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [composerType, setComposerType] = useState('update'); // update, achievement, event, placement
  const [composerTitle, setComposerTitle] = useState('');
  const [composerSubtitle, setComposerSubtitle] = useState('');
  const [expandedComments, setExpandedComments] = useState({}); // postId -> boolean
  const [commentInputs, setCommentInputs] = useState({}); // postId -> string
  
  // Message composing state
  const [chatInput, setChatInput] = useState('');
  
  // Thread input state
  const [threadInput, setThreadInput] = useState('');
  
  // Feed publisher state
  const [feedInput, setFeedInput] = useState('');

  // Search filter
  const [dashboardSearch, setDashboardSearch] = useState('');

  // User Profile Popover State
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  // Member Directory Filters State
  const [dirSearch, setDirSearch] = useState('');
  const [dirRole, setDirRole] = useState('all');
  const [dirDept, setDirDept] = useState('all');
  const [dirBatch, setDirBatch] = useState('all');
  const [dirClub, setDirClub] = useState('all');
  const [dirWorkspace, setDirWorkspace] = useState('all');

  // Campus Console State
  const [consoleTab, setConsoleTab] = useState('tree'); // tree, matrix, members
  const [activeRolePopoverUserId, setActiveRolePopoverUserId] = useState(null);
  const [rolesEditedList, setRolesEditedList] = useState([]);

  // Helper to fetch user's highest role definition
  const getUserPrimaryRole = (user) => {
    if (!user) return null;
    const userRoles = user.roleIds || [user.role] || [];
    let highestRole = null;
    userRoles.forEach(roleId => {
      const roleDef = roles[roleId];
      if (roleDef) {
        if (!highestRole || roleDef.level > highestRole.level) {
          highestRole = roleDef;
        }
      }
    });
    return highestRole;
  };

  // Story Viewer Logic
  useEffect(() => {
    if (activeStoryIndex !== null) {
      const currentStory = initialStories[activeStoryIndex];
      const currentMedia = currentStory.media[activeMediaIndex];
      
      // Mark current story as viewed
      setViewedStories(prev => {
        const next = { ...prev, [currentStory.id]: true };
        localStorage.setItem('unisphere_viewed_stories', JSON.stringify(next));
        return next;
      });

      if (!isStoryPaused) {
        storyTimerRef.current = setTimeout(() => {
          handleNextStoryMedia();
        }, currentMedia.duration || 5000);
      }
    }
    return () => {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    };
  }, [activeStoryIndex, activeMediaIndex, isStoryPaused]);

  const handleNextStoryMedia = () => {
    if (activeStoryIndex === null) return;
    const currentStory = initialStories[activeStoryIndex];
    if (activeMediaIndex < currentStory.media.length - 1) {
      setActiveMediaIndex(activeMediaIndex + 1);
    } else if (activeStoryIndex < initialStories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setActiveMediaIndex(0);
    } else {
      closeStoryViewer();
    }
  };

  const handlePrevStoryMedia = () => {
    if (activeStoryIndex === null) return;
    if (activeMediaIndex > 0) {
      setActiveMediaIndex(activeMediaIndex - 1);
    } else if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      const prevStory = initialStories[activeStoryIndex - 1];
      setActiveMediaIndex(prevStory.media.length - 1);
    }
  };

  const closeStoryViewer = () => {
    setActiveStoryIndex(null);
    setActiveMediaIndex(0);
    setIsStoryPaused(false);
  };

  // Helper to render badges
  const renderUserBadges = (user) => {
    if (!user) return null;
    const userRoles = user.roleIds || [user.role] || [];
    const sortedRoles = [...userRoles]
      .map(roleId => roles[roleId])
      .filter(Boolean)
      .sort((a, b) => b.level - a.level);

    return (
      <div className="profile-card-roles-list" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25rem', verticalAlign: 'middle' }}>
        {sortedRoles.map(role => (
          <span key={role.id} className={`academic-badge-chip ${role.colorClass}`}>
            {role.id === 'professor' || role.id === 'faculty' ? '🎓' : 
             role.id === 'ta' ? '🔬' : 
             role.id === 'inst_admin' ? '🛡️' : 
             role.id === 'club_president' ? '🔑' : 
             role.id === 'placement_coordinator' ? '💼' : '🎒'} {role.badgeLabel}
          </span>
        ))}
      </div>
    );
  };

  // Handle Event RSVP toggle
  const handleRegisterEvent = (eventId) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          joined: !evt.joined,
          rsvps: evt.joined ? evt.rsvps - 1 : evt.rsvps + 1
        };
      }
      return evt;
    }));
  };

  // Handle Feed Post Like
  const handleLikePost = (postId) => {
    setActivityFeed(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasLiked: !post.hasLiked,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleFollowUser = (userId) => {
    setFollowingIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const getProfileStats = (user) => {
    if (!user) return { followers: 0, following: 0 };
    if (user.id === 'user_rahul') return { followers: 412, following: 195 };
    if (user.id === 'user_aarav') return { followers: 345, following: 210 };
    if (user.id === 'user_priya') return { followers: 512, following: 180 };
    const hash = user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      followers: (hash % 300) + 120,
      following: (hash % 150) + 80
    };
  };

  const viewUser = profileViewUser || currentUser;

  // Format post content with clickable hashtags
  const formatPostContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#') && part.length > 1) {
        // Clean up punctuation at the end of the hashtag if any
        const cleanHashtag = part.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        return (
          <span 
            key={index} 
            className="post-hashtag-link" 
            onClick={() => {
              setActiveTab('Feed');
              setFeedFilter(cleanHashtag);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Submit Comments for Feed Posts
  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId] || '';
    if (!commentText.trim()) return;
    addCommentToPost(postId, commentText);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Toggle comments card section collapse
  const toggleCommentsSection = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Publish Campus Feed Update from Rich Composer
  const handlePublishFeed = (e) => {
    e.preventDefault();
    if (!feedInput.trim()) return;

    let bannerColor = null;
    let bannerEmoji = null;
    let bannerTitle = null;
    let bannerSubtitle = null;

    if (composerType === 'achievement') {
      bannerColor = "linear-gradient(135deg, #1e3a8a, #0f172a)";
      bannerEmoji = "🏆";
      bannerTitle = composerTitle.trim() || "Student Achievement";
      bannerSubtitle = composerSubtitle.trim() || "Newton School of Technology Spotlight";
    } else if (composerType === 'event') {
      bannerColor = "linear-gradient(135deg, #0284c7, #0f172a)";
      bannerEmoji = "📅";
      bannerTitle = composerTitle.trim() || "Campus Activity";
      bannerSubtitle = composerSubtitle.trim() || "All coordinates check details below";
    } else if (composerType === 'placement') {
      bannerColor = "linear-gradient(135deg, #7c3aed, #1e1b4b)";
      bannerEmoji = "💼";
      bannerTitle = composerTitle.trim() || "Placement Opportunity";
      bannerSubtitle = composerSubtitle.trim() || "Active cell registration drive";
    }

    createFeedPost({
      content: feedInput,
      type: composerType,
      bannerColor,
      bannerEmoji,
      bannerTitle,
      bannerSubtitle,
      image: composerAttachedImage
    });

    // Reset Composer states
    setFeedInput('');
    setComposerTitle('');
    setComposerSubtitle('');
    setComposerType('update');
    setComposerAttachedImage(null);
  };

  // Send Direct Message in Social Mode
  const handleSendSocialDM = (e) => {
    e.preventDefault();
    if (!socialChatInput.trim() || !selectedSocialPeerId) return;
    const newMsg = {
      id: `sm_${Date.now()}`,
      fromId: "user_rahul",
      toId: selectedSocialPeerId,
      text: socialChatInput.trim(),
      time: "Just now"
    };
    setSocialDMMessages(prev => [...prev, newMsg]);
    setSocialChatInput('');
  };

  // Handle Chat message submit
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  // Handle Thread reply submit
  const handleSendThreadReply = (e) => {
    e.preventDefault();
    if (!threadInput.trim()) return;
    sendThreadReply(threadInput);
    setThreadInput('');
  };

  // Create Channel Submit
  const handleCreateChannelSubmit = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    createChannel(newChannelName, newChannelCategory, `Discuss ${newChannelName}`);
    setNewChannelName('');
    setShowCreateChannel(false);
    setActiveTab('Channel');
  };

  // Navigation handlers
  const handleChannelSelect = (chanId) => {
    setActiveChannelId(chanId);
    setActiveChannelType('channel');
    setActiveTab('Channel');
    setActiveThreadParentId(null);
  };

  const handleDMSelect = (targetUserId) => {
    const dmId = getOrCreateDM(targetUserId);
    if (dmId) {
      setActiveTab('Channel');
      setActiveThreadParentId(null);
    }
  };

  // Helper filters
  const filteredAnnouncements = announcements.filter(ann => 
    ann.title.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
    ann.content.toLowerCase().includes(dashboardSearch.toLowerCase())
  );

  const filteredEvents = events.filter(evt =>
    evt.title.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
    evt.organizer.toLowerCase().includes(dashboardSearch.toLowerCase())
  );

  const filteredFeed = activityFeed.filter(post =>
    post.content.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
    post.userName.toLowerCase().includes(dashboardSearch.toLowerCase())
  );

  const filteredFeedPosts = feedPosts.filter(post => {
    const matchesSearch = dashboardSearch.trim() === '' || 
      post.content.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
      post.userName.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
      (post.bannerTitle && post.bannerTitle.toLowerCase().includes(dashboardSearch.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (feedFilter.trim() === '') return true;
    
    const filter = feedFilter.toLowerCase();
    if (filter === '#achievement' && post.type === 'achievement') return true;
    if (filter === '#event' && post.type === 'event') return true;
    if (filter === '#placement' && post.type === 'placement') return true;
    if (filter === '#club' && post.type === 'club') return true;
    
    return post.content.toLowerCase().includes(filter);
  });

  // Active channel details
  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeChannelMessages = messages.filter(m => m.channelId === activeChannelId);

  // Active Thread Parent Details
  const threadParentMessage = messages.find(m => m.id === activeThreadParentId);
  const parentMessageReplies = threadReplies.filter(r => r.parentMessageId === activeThreadParentId);

  return (
    <div className="workspace-layout">
      
      {/* 1. WORKSPACE SELECTOR VERTICAL STRIP (Far Left) */}
      <div className="workspace-switcher-strip">
        <div className="logo-strip-top">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="7" r="4.5" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <circle cx="6" cy="16" r="4.5" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <circle cx="18" cy="16" r="4.5" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <line x1="12" y1="11.5" x2="8.5" y2="13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="11.5" x2="15.5" y2="13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="workspace-icons-container">
          {workspaces.map(ws => (
            <button 
              key={ws.id} 
              className={`workspace-btn ${currentWorkspaceId === ws.id ? 'active' : ''}`}
              onClick={() => {
                switchWorkspace(ws.id);
                setActiveTab('Home');
              }}
              title={ws.name}
            >
              {ws.shortName}
            </button>
          ))}
          <button className="workspace-btn add-btn" title="Add College Workspace">
            <Plus size={20} />
          </button>
        </div>
        <div className="strip-bottom">
          <button className="logout-btn" onClick={logoutUser} title="Log Out">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 2. SIDEBAR NAVIGATION & CATEGORIZED CHANNELS */}
      <div className="sidebar-nav-panel">
        {/* Top-level Campus Hub Selector */}
        <div className="sidebar-header" style={{ position: 'relative' }}>
          <div className="campus-hub-dropdown-container" style={{ width: '100%' }}>
            <button 
              type="button"
              className="campus-hub-dropdown-trigger" 
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              style={{
                width: '100%',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.6rem 0.75rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campus Hub</span>
                <span style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>{appMode === 'workspace' ? '🏫 Workspace Mode' : '✨ Social Mode'}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>▼</span>
            </button>
            {showModeDropdown && (
              <div 
                className="campus-hub-dropdown-menu" 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 99,
                  marginTop: '0.25rem',
                  overflow: 'hidden'
                }}
              >
                <button 
                  type="button"
                  className="mode-menu-item"
                  onClick={() => {
                    setAppMode('workspace');
                    setShowModeDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    background: appMode === 'workspace' ? 'var(--accent-subtle)' : 'transparent',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: appMode === 'workspace' ? 'var(--accent-primary)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  🏫 Workspace Mode
                </button>
                <button 
                  type="button"
                  className="mode-menu-item"
                  onClick={() => {
                    setAppMode('social');
                    setShowModeDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    background: appMode === 'social' ? 'var(--accent-subtle)' : 'transparent',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: appMode === 'social' ? 'var(--accent-primary)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  ✨ Social Mode
                </button>
              </div>
            )}
          </div>
        </div>

        {appMode === 'workspace' ? (
          <>
            {/* Global Hub Navigation Tabs */}
            <div className="nav-tabs-group">
              <button className={`nav-tab-link ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => { setActiveTab('Home'); setFeedFilter(''); }}>
                <Home size={16} className="nav-tab-icon" />
                <span>Home</span>
              </button>
              <button className={`nav-tab-link ${activeTab === 'Feed' ? 'active' : ''}`} onClick={() => { setActiveTab('Feed'); setFeedFilter(''); }}>
                <MessageSquare size={16} className="nav-tab-icon" />
                <span>Campus Feed</span>
              </button>
              <button className={`nav-tab-link ${activeTab === 'Announcements' ? 'active' : ''}`} onClick={() => { setActiveTab('Announcements'); setFeedFilter(''); }}>
                <Megaphone size={16} className="nav-tab-icon" />
                <span>Announcements</span>
              </button>
              <button className={`nav-tab-link ${activeTab === 'Events' ? 'active' : ''}`} onClick={() => { setActiveTab('Events'); setFeedFilter(''); }}>
                <Calendar size={16} className="nav-tab-icon" />
                <span>Events</span>
              </button>
              <button className={`nav-tab-link ${activeTab === 'Placements' ? 'active' : ''}`} onClick={() => { setActiveTab('Placements'); setFeedFilter(''); }}>
                <Briefcase size={16} className="nav-tab-icon" />
                <span>Placements</span>
              </button>
              <button className={`nav-tab-link ${activeTab === 'Communities' ? 'active' : ''}`} onClick={() => { setActiveTab('Communities'); setFeedFilter(''); }}>
                <Users size={16} className="nav-tab-icon" />
                <span>Clubs</span>
              </button>
              <button className={`nav-tab-link ${activeTab === 'Directory' ? 'active' : ''}`} onClick={() => { setActiveTab('Directory'); setFeedFilter(''); }}>
                <Search size={16} className="nav-tab-icon" />
                <span>Member Directory</span>
              </button>
              {hasPermission(currentUser, 'manage_roles') && (
                <button className={`nav-tab-link ${activeTab === 'Console' ? 'active' : ''}`} onClick={() => { setActiveTab('Console'); setFeedFilter(''); }}>
                  <Shield size={16} className="nav-tab-icon" />
                  <span>Campus Console</span>
                </button>
              )}
            </div>

            {/* Categories & Channel Lists */}
            <div className="sidebar-channels-section">
              <div className="section-header-row">
                <span className="channels-section-label">CHANNELS</span>
                <button className="add-channel-icon-btn" onClick={() => setShowCreateChannel(true)} title="Create Channel">
                  <Plus size={14} />
                </button>
              </div>

              {/* OFFICIAL CATEGORY */}
              <div className="category-group">
                <span className="category-label">OFFICIAL</span>
                <div className="channels-list">
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_announcements' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_announcements')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>announcements</span>
                  </button>
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_placement_cell' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_placement_cell')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>placement-cell</span>
                  </button>
                </div>
              </div>

              {/* ACADEMICS CATEGORY */}
              <div className="category-group">
                <span className="category-label">ACADEMICS</span>
                <div className="channels-list">
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_ds_algorithms' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_ds_algorithms')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>ds-and-algorithms</span>
                  </button>
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_web_dev' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_web_dev')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>web-development</span>
                  </button>
                </div>
              </div>

              {/* COMMUNITY CATEGORY */}
              <div className="category-group">
                <span className="category-label">COMMUNITY</span>
                <div className="channels-list">
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_cse_2026' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_cse_2026')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>cse-2026</span>
                  </button>
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_aiml_2027' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_aiml_2027')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>aiml-2027</span>
                  </button>
                </div>
              </div>

              {/* CLUBS CATEGORY */}
              <div className="category-group">
                <span className="category-label">CLUBS</span>
                <div className="channels-list">
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_club_robotics' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_club_robotics')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>robotics-club</span>
                  </button>
                  <button 
                    className={`channel-link ${activeTab === 'Channel' && activeChannelId === 'nst_club_devs' ? 'active' : ''}`}
                    onClick={() => handleChannelSelect('nst_club_devs')}
                  >
                    <Hash size={14} className="channel-hash" />
                    <span>developers-club</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Shortcuts */}
            <div className="sidebar-shortcuts-section">
              <span className="shortcuts-section-label">Quick Shortcuts</span>
              <div className="shortcuts-list">
                <button className="shortcut-link" onClick={() => { setActiveTab('Feed'); setFeedFilter('#club'); }}>
                  <span className="shortcut-bullet bg-accent"></span>
                  <span>Trending Clubs</span>
                </button>
                <button className="shortcut-link" onClick={() => { setActiveTab('Events'); setFeedFilter(''); }}>
                  <span className="shortcut-bullet bg-blue"></span>
                  <span>Upcoming Events</span>
                </button>
                <button className="shortcut-link" onClick={() => { setActiveTab('Feed'); setFeedFilter('#hackathon'); }}>
                  <span className="shortcut-bullet bg-orange"></span>
                  <span>Hackathons</span>
                </button>
                <button className="shortcut-link" onClick={() => { setActiveTab('Placements'); setFeedFilter(''); }}>
                  <span className="shortcut-bullet bg-purple"></span>
                  <span>Placement Drives</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Social Mode Navigation */}
            <div className="nav-tabs-group" style={{ margin: '1rem 0' }}>
              <button 
                type="button"
                className={`nav-tab-link ${activeSocialTab === 'feed' ? 'active' : ''}`} 
                onClick={() => { setActiveSocialTab('feed'); setFeedFilter(''); }}
              >
                <Home size={18} className="nav-tab-icon" />
                <span>Home</span>
              </button>
              <button 
                type="button"
                className={`nav-tab-link ${activeSocialTab === 'explore' ? 'active' : ''}`} 
                onClick={() => { setActiveSocialTab('explore'); setFeedFilter(''); }}
              >
                <Search size={18} className="nav-tab-icon" />
                <span>Explore</span>
              </button>
              <button 
                type="button"
                className={`nav-tab-link ${activeSocialTab === 'messages' ? 'active' : ''}`} 
                onClick={() => { setActiveSocialTab('messages'); setFeedFilter(''); }}
              >
                <MessageCircle size={18} className="nav-tab-icon" />
                <span>Messages</span>
              </button>
              <button 
                type="button"
                className={`nav-tab-link ${activeSocialTab === 'notifications' ? 'active' : ''}`} 
                onClick={() => { setActiveSocialTab('notifications'); setFeedFilter(''); }}
              >
                <Bell size={18} className="nav-tab-icon" />
                <span>Notifications</span>
              </button>
              <button 
                type="button"
                className={`nav-tab-link ${activeSocialTab === 'profile' ? 'active' : ''}`} 
                onClick={() => { 
                  setProfileViewUser(currentUser);
                  setActiveSocialTab('profile'); 
                  setFeedFilter(''); 
                }}
              >
                <User size={18} className="nav-tab-icon" />
                <span>Profile</span>
              </button>
            </div>
          </>
        )}

        {/* User profile capsule at sidebar bottom */}
        <div 
          className="sidebar-user-footer" 
          style={{ justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => {
            if (appMode === 'social') {
              setProfileViewUser(currentUser);
              setActiveSocialTab('profile');
              setFeedFilter('');
            } else {
              setSelectedProfileUser(currentUser);
            }
          }}
        >
          <div className="user-footer-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <img src={currentUser?.avatar} alt={currentUser?.name} className="user-footer-avatar" />
            <div className="user-footer-info" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span className="user-footer-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser?.name}</span>
              <span className="user-footer-status" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>● {currentUser?.customStatusText || 'Online'}</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }} 
            className="theme-toggle-btn-sidebar"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER (MIDDLE COLUMN) */}
      <div className="main-content-column">
        
        {/* Dynamic Header */}
        <div className="content-nav-header">
          <div className="header-left">
            <span className="view-title-breadcrumb">{appMode === 'social' ? '✨ UniSphere Social' : 'NST Workspace'}</span>
            <span className="breadcrumb-divider">/</span>
            <span className="view-title-active">
              {appMode === 'social' 
                ? (activeSocialTab === 'feed' ? '📱 Social Feed' : activeSocialTab === 'explore' ? '🔍 Explore Hub' : activeSocialTab === 'messages' ? '💬 Direct Messages' : '👤 Student Profile')
                : (activeTab === 'Channel' ? `#${activeChannel?.name}` : activeTab)}
            </span>
          </div>
          <div className="header-right-container">
            {appMode !== 'social' && activeTab === 'Channel' && (
              <button className="members-btn-pill" onClick={() => setShowMembersModal(true)}>
                <div className="members-avatars-overlap">
                  {users.slice(0, 3).map((u, i) => (
                    <img key={u.id} src={u.avatar} alt={u.name} className="overlap-avatar" style={{ zIndex: 3 - i }} />
                  ))}
                </div>
                <span className="members-count">{users.length}</span>
              </button>
            )}
            <div className="header-search">
              <Search size={16} className="search-box-icon" />
              <input 
                type="text" 
                placeholder={appMode === 'social' ? "Search peers, posts, hashtags..." : "Search announcements, events, feeds..."} 
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                className="search-box-input"
              />
            </div>
          </div>
        </div>

        {/* Dynamic body switches between Home Dashboard and specific list/chat views */}
        {/* Dynamic body switches between Home Dashboard and specific list/chat views */}
        <div className="content-scrollable-body">

          {appMode === 'social' ? (
            <div className="social-mode-container" style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {activeSocialTab === 'feed' && (
                <div className="social-feed-tab-view">
                  
                  {/* Active Filter Indicator */}
                  {feedFilter && (
                    <div className="active-filter-banner" style={{ marginBottom: '1rem' }}>
                      <div className="filter-badge-info">
                        <Filter size={14} />
                        <span>Showing posts matching <strong>{feedFilter}</strong></span>
                      </div>
                      <button type="button" className="clear-filter-btn" onClick={() => setFeedFilter('')} title="Clear filter">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Circular Instagram Stories */}
                  <div className="instagram-stories-container">
                    <div className="instagram-stories-track">
                      {/* Your Story */}
                      <div className="instagram-story-item">
                        <div className="instagram-story-ring your-story">
                          <img src={currentUser?.avatar} alt="Your Story" className="instagram-story-avatar" />
                          <span className="instagram-story-plus">+</span>
                        </div>
                        <span className="instagram-story-label">Your Story</span>
                      </div>

                      {initialStories.map((story, index) => {
                        const isViewed = viewedStories[story.id];
                        return (
                          <div 
                            key={story.id} 
                            className="instagram-story-item" 
                            onClick={() => {
                              setActiveStoryIndex(index);
                              setActiveMediaIndex(0);
                            }}
                          >
                            <div className={`instagram-story-ring ${isViewed ? 'viewed' : 'close-friend'}`}>
                              {story.userAvatar.startsWith('http') ? (
                                <img src={story.userAvatar} alt={story.userName} className="instagram-story-avatar" />
                              ) : (
                                <span className="instagram-story-avatar-emoji">{story.userAvatar}</span>
                              )}
                            </div>
                            <span className="instagram-story-label">{story.userName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual Post Composer (Instagram style) */}
                  <div className="instagram-create-post-card">
                    <form onSubmit={handlePublishFeed} className="instagram-create-post-form">
                      <div className="instagram-composer-header">
                        <img src={currentUser?.avatar} alt="Me" className="instagram-composer-avatar" />
                        <textarea 
                          placeholder="What's happening on campus? Share a project, event, or memory..." 
                          value={feedInput} 
                          onChange={(e) => setFeedInput(e.target.value)}
                          className="instagram-composer-textarea"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div className="instagram-composer-attachment-row">
                        <div className="composer-template-selector-box">
                          <span className="composer-template-selector-label">Attach Graphic:</span>
                          <div className="template-graphic-pills">
                            {[
                              { label: "🛸 Drone", img: "/assets/robotics_drone.png" },
                              { label: "🎉 Fest", img: "/assets/campus_festival.png" },
                              { label: "💻 Code Meme", img: "/assets/coder_meme.png" },
                              { label: "⚙️ Project", img: "/assets/project_showcase.png" }
                            ].map(item => (
                              <button 
                                key={item.label}
                                type="button"
                                className={`template-graphic-pill ${composerAttachedImage === item.img ? 'active' : ''}`}
                                onClick={() => setComposerAttachedImage(composerAttachedImage === item.img ? null : item.img)}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <button type="submit" className="instagram-composer-submit-btn" disabled={!feedInput.trim() && !composerAttachedImage}>
                          Post
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Centered Instagram Feed Card stream */}
                  <div className="instagram-feed-container">
                    {filteredFeedPosts.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>No social posts found matching search.</p>
                      </div>
                    ) : (
                      filteredFeedPosts.map(post => {
                        const isExpanded = expandedComments[post.id];
                        const commentText = commentInputs[post.id] || '';
                        const hasLiked = post.hasLiked;
                        const hasSaved = post.hasSaved;
                        return (
                          <div key={post.id} className="instagram-feed-card">
                            
                            {/* Card Header */}
                            <div className="instagram-card-header">
                              <div className="instagram-card-author-info">
                                <img 
                                  src={post.userAvatar} 
                                  alt={post.userName} 
                                  className="instagram-card-author-avatar" 
                                  onClick={() => {
                                    const authorUser = users.find(u => u.id === post.userId) || { name: post.userName, avatar: post.userAvatar, role: 'student', branch: post.department };
                                    setSelectedProfileUser(authorUser);
                                  }}
                                />
                                <div className="instagram-card-author-text">
                                  <span 
                                    className="instagram-card-author-name"
                                    onClick={() => {
                                      const authorUser = users.find(u => u.id === post.userId) || { name: post.userName, avatar: post.userAvatar, role: 'student', branch: post.department };
                                      setSelectedProfileUser(authorUser);
                                    }}
                                  >
                                    {post.userName}
                                  </span>
                                  <span className="instagram-card-author-sub">{post.department} • Batch {post.userId === 'user_rahul' || post.userName.includes('Rahul') ? "'26" : "'27"}</span>
                                </div>
                              </div>
                              <span className="instagram-card-timestamp">{post.time}</span>
                            </div>

                            {/* Media content */}
                            {post.image ? (
                              <div className="instagram-card-media">
                                <img src={post.image} alt="Visual Attachment" className="instagram-media-img" />
                              </div>
                            ) : (
                              <div className="instagram-card-text-fallback">
                                <p>{post.content}</p>
                              </div>
                            )}

                            {/* Actions Row */}
                            <div className="instagram-card-actions-bar">
                              <div className="instagram-actions-left">
                                <button 
                                  type="button" 
                                  className={`instagram-action-btn ${hasLiked ? 'liked' : ''}`}
                                  onClick={() => likeFeedPost(post.id)}
                                  title="Like"
                                >
                                  <Heart size={20} fill={hasLiked ? "var(--error)" : "none"} color={hasLiked ? "var(--error)" : "currentColor"} />
                                </button>
                                <button 
                                  type="button" 
                                  className="instagram-action-btn"
                                  onClick={() => toggleCommentsSection(post.id)}
                                  title="Comment"
                                >
                                  <MessageCircle size={20} />
                                </button>
                                <button 
                                  type="button" 
                                  className="instagram-action-btn"
                                  onClick={() => {
                                    navigator.clipboard.writeText(post.content);
                                    alert('Post content copied!');
                                  }}
                                  title="Share"
                                >
                                  <Send size={20} />
                                </button>
                              </div>
                              <button 
                                type="button" 
                                className={`instagram-action-btn ${hasSaved ? 'saved' : ''}`}
                                onClick={() => saveFeedPost(post.id)}
                                title="Save"
                              >
                                <Bookmark size={20} fill={hasSaved ? "var(--accent-primary)" : "none"} color={hasSaved ? "var(--accent-primary)" : "currentColor"} />
                              </button>
                            </div>

                            {/* Likes count */}
                            <div className="instagram-card-likes-count">
                              <span>{post.likes} likes</span>
                            </div>

                            {/* Caption (Username + Content) - only for posts with images */}
                            {post.image && (
                              <div className="instagram-card-caption">
                                <span className="instagram-caption-username">{post.userName}</span>
                                <span className="instagram-caption-text">{post.content}</span>
                              </div>
                            )}

                            {/* View Comments toggle */}
                            <div className="instagram-card-comments-toggle" onClick={() => toggleCommentsSection(post.id)}>
                              {post.commentsCount > 0 ? (
                                <span>View all {post.commentsCount} comments</span>
                              ) : (
                                <span>No comments yet. Write one below</span>
                              )}
                            </div>

                            {/* Nested Comments Drawer */}
                            {isExpanded && (
                              <div className="instagram-card-comments-section">
                                <div className="instagram-comments-list">
                                  {(post.comments || []).map(comment => (
                                    <div key={comment.id} className="instagram-comment-item">
                                      <img src={comment.userAvatar} alt={comment.userName} className="instagram-comment-avatar" />
                                      <div className="instagram-comment-text-block">
                                        <p className="instagram-comment-text-row">
                                          <span className="instagram-comment-username">{comment.userName}</span>
                                          <span className="instagram-comment-text">{comment.text}</span>
                                        </p>
                                        <span className="instagram-comment-time">{comment.time}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="instagram-comment-composer">
                                  <input 
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    value={commentText} 
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="instagram-comment-input"
                                    required
                                  />
                                  <button type="submit" className="instagram-comment-submit-btn">
                                    Post
                                  </button>
                                </form>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

              {/* TAB: EXPLORE HUB */}
              {activeSocialTab === 'explore' && (
                <div className="social-explore-tab-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Explore Campus Clubs */}
                  <div className="discovery-section">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recommended Campus Clubs</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="explore-clubs-grid">
                      {recommendedClubs.map(club => (
                        <div key={club.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '10px', backgroundColor: 'var(--bg-surface-elevated)' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>{club.logo}</span>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{club.name}</h4>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
                              {club.id === 'club_rec_1' ? 'Building campus productivity applications and hosting HackSprint hackathons.' :
                               club.id === 'club_rec_2' ? 'Algorithmic problem solving, graph theory matching, and ICPC prep.' :
                               'Hardware fabrication arrays, IoT sensory nodes, makerspace drone evasions.'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{club.members} Members</span>
                            <button 
                              type="button" 
                              className={`club-join-btn ${club.joined ? 'club-joined' : ''}`}
                              onClick={() => toggleJoinClub(club.id)}
                            >
                              {club.joined ? 'Joined' : 'Join'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explore Student Peers (Followers/Following setup) */}
                  <div className="discovery-section">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Discover Peer Students</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }} className="explore-peers-grid">
                      {[
                        { id: "user_aarav", name: "Aarav Mehta", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav", dept: "CSE (Batch '26)", badge: "🔬 TA" },
                        { id: "user_priya", name: "Priya Patel", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya", dept: "CSE (Batch '27)", badge: "🌟 Spotlight" },
                        { id: "user_neha", name: "Neha Kapoor", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Neha", dept: "ECE (Batch '26)", badge: "🎒 Student" }
                      ].map(peer => (
                        <div key={peer.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '10px', backgroundColor: 'var(--bg-surface-elevated)', textAlign: 'center' }}>
                          <img src={peer.avatar} alt={peer.name} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.5px solid var(--border-subtle)', marginBottom: '0.5rem' }} />
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.15rem 0', color: 'var(--text-primary)' }}>{peer.name}</h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>{peer.dept}</span>
                          <span className="academic-badge-chip emerald" style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', marginBottom: '0.75rem' }}>{peer.badge}</span>
                          <button 
                            type="button" 
                            onClick={() => toggleFollowUser(peer.id)}
                            style={{
                              width: '100%',
                              padding: '0.35rem 0',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              background: followingIds.includes(peer.id) ? 'var(--bg-deep)' : 'var(--accent-primary)',
                              color: followingIds.includes(peer.id) ? 'var(--text-secondary)' : '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {followingIds.includes(peer.id) ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explore Campus Events */}
                  <div className="discovery-section">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Active Social Events</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {[
                        { id: "e_1", title: "NST Summer Fest DJ Concert", date: "Tonight 7:00 PM", host: "Cultural Cell", rsvps: 152 },
                        { id: "e_2", title: "HackSprint 2026 Evasion Telemetry Hackathon", date: "June 15-17", host: "GDSC Chapter", rsvps: 78 }
                      ].map(evt => (
                        <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', backgroundColor: 'var(--bg-surface-elevated)' }}>
                          <div>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.2rem 0' }}>{evt.title}</h4>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>📅 {evt.date} • Host: <strong>{evt.host}</strong></span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', background: 'var(--accent-subtle)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{evt.rsvps} attending</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: PEER DMS (SOCIAL DIRECT CHAT) */}
              {activeSocialTab === 'messages' && (
                <div className="social-messages-tab-view" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden', height: '480px', backgroundColor: 'var(--bg-surface-elevated)' }}>
                  
                  {/* Chat sidebar list */}
                  <div className="messages-peers-sidebar" style={{ borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-deep)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CHAT CHANNELS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                      {[
                        { id: "user_aarav", name: "Aarav Mehta", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav", badge: "🔬 TA" },
                        { id: "user_priya", name: "Priya Patel", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya", badge: "🌟 Spotlight" }
                      ].map(peer => (
                        <div 
                          key={peer.id} 
                          onClick={() => setSelectedSocialPeerId(peer.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 0.75rem',
                            cursor: 'pointer',
                            backgroundColor: selectedSocialPeerId === peer.id ? 'var(--bg-surface-hover)' : 'transparent',
                            borderBottom: '1px solid var(--border-subtle)'
                          }}
                        >
                          <img src={peer.avatar} alt={peer.name} style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{peer.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{peer.badge}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Messaging panel */}
                  <div className="messages-chat-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-elevated)' }}>
                    
                    {/* Chat Header */}
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img 
                        src={selectedSocialPeerId === 'user_aarav' ? "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav" : "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya"} 
                        alt="Peer avatar" 
                        style={{ width: '28px', height: '28px', borderRadius: '50%' }} 
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selectedSocialPeerId === 'user_aarav' ? "Aarav Mehta" : "Priya Patel"}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#22c55e', marginLeft: '0.25rem' }}>● online</span>
                    </div>

                    {/* Chat History */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {socialDMMessages
                        .filter(m => (m.fromId === 'user_rahul' && m.toId === selectedSocialPeerId) || (m.fromId === selectedSocialPeerId && m.toId === 'user_rahul'))
                        .map(msg => {
                          const isMe = msg.fromId === 'user_rahul';
                          return (
                            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                              <div style={{
                                padding: '0.55rem 0.85rem',
                                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                backgroundColor: isMe ? 'var(--accent-primary)' : 'var(--bg-deep)',
                                color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                                fontSize: '0.8rem',
                                lineHeight: 1.4
                              }}>
                                {msg.text}
                              </div>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>{msg.time}</span>
                            </div>
                          );
                        })
                      }
                    </div>

                    {/* Chat Composer */}
                    <form onSubmit={handleSendSocialDM} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-deep)' }}>
                      <input 
                        type="text" 
                        placeholder={`Message ${selectedSocialPeerId === 'user_aarav' ? 'Aarav' : 'Priya'}...`}
                        value={socialChatInput} 
                        onChange={(e) => setSocialChatInput(e.target.value)}
                        style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
                        required
                      />
                      <button type="submit" style={{ background: 'var(--accent-primary)', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        Send
                      </button>
                    </form>

                  </div>

                </div>
              )}
              {/* TAB: NOTIFICATIONS */}
              {activeSocialTab === 'notifications' && (
                <div className="instagram-notifications-tab-view" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Notifications</h3>
                  
                  <div className="instagram-notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="instagram-notification-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease', cursor: notif.postId ? 'pointer' : 'default' }} onClick={() => {
                          if (notif.postId) {
                            setActiveSocialTab('feed');
                            setFeedFilter(notif.postId);
                          }
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <img src={notif.userAvatar} alt={notif.userName} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                              <strong style={{ fontWeight: 700, marginRight: '0.25rem' }}>{notif.userName}</strong>
                              <span style={{ color: 'var(--text-secondary)' }}>{notif.detail}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>{notif.time}</span>
                            </div>
                          </div>
                          {notif.postId && (
                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', border: '1px solid var(--border-subtle)', flexShrink: 0, overflow: 'hidden' }}>
                              {feedPosts.find(p => p.id === notif.postId)?.image ? (
                                <img src={feedPosts.find(p => p.id === notif.postId).image} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span>💬</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeSocialTab === 'profile' && (
                <div className="student-profile-tab-view" style={{ maxWidth: '750px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Instagram-style Profile Header */}
                  <div className="instagram-profile-header" style={{ display: 'flex', gap: '2.5rem', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={viewUser?.avatar} alt={viewUser?.name} style={{ width: '96px', height: '96px', borderRadius: '50%', border: '3px solid var(--accent-primary)', padding: '2px', background: 'var(--bg-card)' }} />
                      <span style={{ position: 'absolute', bottom: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2.5px solid var(--bg-surface-elevated)' }}></span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{viewUser?.name}</h2>
                        {viewUser?.id === 'user_rahul' && <span className="academic-badge-chip orange" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Club President</span>}
                        {viewUser?.id === 'user_aarav' && <span className="academic-badge-chip emerald" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>🔬 TA</span>}
                        {viewUser?.id === 'user_priya' && <span className="academic-badge-chip blue" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>🌟 Spotlight</span>}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '2rem' }} className="profile-stats-row">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{getProfileStats(viewUser).followers}</strong> followers</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{getProfileStats(viewUser).following}</strong> following</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{feedPosts.filter(p => p.userId === viewUser?.id || p.userName === viewUser?.name).length}</strong> posts</span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{viewUser?.branch || 'Computer Science & Engineering'} • Batch {viewUser?.id === 'user_rahul' || viewUser?.name?.includes('Rahul') ? "'26" : "'27"}</span>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
                          {viewUser?.id === 'user_rahul' ? "Competitive coder, drone builder, and tea lover. Building the future of campus tech on UniSphere." :
                           viewUser?.id === 'user_aarav' ? "Hardware fabrication arrays, IoT sensory nodes, and makerspace drone flight mechanics." :
                           viewUser?.id === 'user_priya' ? "Google AI Residency Fellow. Love to talk about neural architecture design, data models, and research papers." :
                           "NST student | Connecting and learning | Creative explorer."}
                        </p>
                      </div>

                      {viewUser?.id !== currentUser?.id && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => toggleFollowUser(viewUser.id)}
                            style={{
                              padding: '0.4rem 1.2rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: followingIds.includes(viewUser.id) ? 'var(--bg-deep)' : 'var(--accent-primary)',
                              color: followingIds.includes(viewUser.id) ? 'var(--text-secondary)' : '#FFFFFF',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {followingIds.includes(viewUser.id) ? 'Following' : 'Follow'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSocialPeerId(viewUser.id);
                              setActiveSocialTab('messages');
                            }}
                            style={{
                              padding: '0.4rem 1.2rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              background: 'transparent',
                              color: 'var(--text-primary)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Post Portfolio Grid */}
                  <div style={{ padding: '0.5rem 0' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Posts</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }} className="profile-portfolio-grid">
                      {feedPosts
                        .filter(post => post.userId === viewUser?.id || post.userName === viewUser?.name)
                        .map(post => {
                          const isImage = !!post.image;
                          return (
                            <div 
                              key={post.id} 
                              onClick={() => {
                                setActiveSocialTab('feed');
                                setFeedFilter(post.id); // highlight/filter to this specific post!
                              }}
                              style={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '100%',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: isImage ? `url(${post.image}) center/cover no-repeat` : 'var(--bg-deep)',
                                border: '1px solid var(--border-subtle)'
                              }}
                              className="portfolio-item-tile"
                              title={post.content}
                            >
                              {!isImage && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', textAlign: 'center', backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</span>
                                </div>
                              )}
                              
                              {/* Hover overlay with likes */}
                              <div className="portfolio-tile-hover-overlay">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.commentsCount || 0}</span>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <>
              {/* TAB: HOME (CAMPUS OVERVIEW DASHBOARD) */}
              {activeTab === 'Home' && (
            <div className="dashboard-content-wrapper">
              
              {/* Welcome Banner */}
              <div className="welcome-banner-card">
                <div className="welcome-message-row">
                  <h1 className="welcome-greeting">Good Morning, {currentUser?.name.split(' ')[0]}</h1>
                  <span className="academic-badge">Academic Year 2026/27</span>
                </div>
                <p className="welcome-summary">
                  You have <strong className="highlight-green">{announcements.length} announcements</strong>, <strong className="highlight-green">{events.filter(e => !e.joined).length} upcoming events</strong>, and <strong className="highlight-green">14 unread messages</strong> on campus today.
                </p>
              </div>

              {/* Grid of Announcements & Events */}
              <div className="dashboard-grid-row">
                
                {/* Important Announcements */}
                <div className="dashboard-card-column flex-2">
                  <div className="column-title-row">
                    <Megaphone size={18} className="column-title-icon" />
                    <h2 className="column-title-text">Important Announcements</h2>
                  </div>
                  <div className="announcements-stack">
                    {filteredAnnouncements.slice(0, 3).map(ann => (
                      <div key={ann.id} className="announcement-item-card">
                        <div className="ann-item-header">
                          <span className="ann-item-tag">{ann.tag}</span>
                          <span className="ann-item-date">{ann.date}</span>
                        </div>
                        <h3 className="ann-item-title">{ann.title}</h3>
                        <p className="ann-item-desc">{ann.content}</p>
                        <div className="ann-item-footer">
                          <span className="ann-item-author">By {ann.sender} ({ann.role})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="dashboard-card-column flex-1-5">
                  <div className="column-title-row">
                    <Calendar size={18} className="column-title-icon" />
                    <h2 className="column-title-text">Upcoming Events</h2>
                  </div>
                  <div className="events-stack">
                    {filteredEvents.map(evt => (
                      <div key={evt.id} className="event-item-card">
                        <div className="event-date-badge">
                          <span className="event-badge-day">{evt.date.split(' ')[1].replace(',', '')}</span>
                          <span className="event-badge-month">{evt.date.split(' ')[0].substring(0, 3).toUpperCase()}</span>
                        </div>
                        <div className="event-card-details">
                          <h3 className="event-title">{evt.title}</h3>
                          <span className="event-org">{evt.organizer}</span>
                          <div className="event-meta-info">
                            <span className="event-meta-item"><Clock size={12} /> {evt.time}</span>
                            <span className="event-meta-item"><MapPin size={12} /> {evt.location}</span>
                          </div>
                          <div className="event-actions-row">
                            <span className="event-rsvps-count">{evt.rsvps} attending</span>
                            <button 
                              onClick={() => handleRegisterEvent(evt.id)} 
                              className={`btn-event-rsvp ${evt.joined ? 'registered' : ''}`}
                            >
                              {evt.joined ? 'Registered' : 'Register'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Communities Row */}
              <div className="dashboard-section-wrapper">
                <div className="column-title-row">
                  <Users size={18} className="column-title-icon" />
                  <h2 className="column-title-text">Active Communities</h2>
                </div>
                <div className="communities-horizontal-grid">
                  {communities.map(comm => (
                    <div key={comm.id} className="community-grid-card">
                      <div className="comm-avatar-box">{comm.avatar}</div>
                      <h3 className="comm-card-title">{comm.name}</h3>
                      <p className="comm-card-desc">{comm.description}</p>
                      <div className="comm-card-footer">
                        <span className="comm-member-count">{comm.members} Members</span>
                        <span className="comm-activity-indicator">{comm.activity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Activity Feed */}
              <div className="dashboard-section-wrapper">
                <div className="column-title-row">
                  <MessageSquare size={18} className="column-title-icon" />
                  <h2 className="column-title-text">Campus Activity Feed</h2>
                </div>

                {/* Micro Publisher */}
                <form onSubmit={handlePublishFeed} className="feed-publisher-box">
                  <img src={currentUser?.avatar} alt={currentUser?.name} className="publisher-avatar" />
                  <div className="publisher-inputs">
                    <textarea 
                      placeholder="Share an update, link, or class question with the campus..." 
                      value={feedInput}
                      onChange={(e) => setFeedInput(e.target.value)}
                      rows={2}
                      className="publisher-textarea"
                    />
                    <div className="publisher-actions-row">
                      <span className="publisher-tip">Posting as {currentUser?.name}</span>
                      <button type="submit" className="publisher-submit-btn">
                        <span>Share</span>
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Stack of Activity Items */}
                <div className="activity-feed-stack">
                  {filteredFeed.map(post => (
                    <div key={post.id} className="feed-item-card">
                      <div className="feed-item-header">
                        <img src={post.userAvatar} alt={post.userName} className="feed-item-avatar" />
                        <div className="feed-item-meta">
                          <div className="feed-author-row">
                            <span className="feed-author-name">{post.userName}</span>
                            <span className={`feed-author-badge ${post.userRole.toLowerCase()}`}>{post.userRole}</span>
                            <span className="feed-author-tag">{post.userTag}</span>
                          </div>
                          <span className="feed-item-time">{post.time}</span>
                        </div>
                      </div>
                      <div className="feed-item-body">
                        <p>{post.content}</p>
                      </div>
                      <div className="feed-item-actions">
                        <button 
                          onClick={() => handleLikePost(post.id)} 
                          className={`feed-action-btn ${post.hasLiked ? 'liked' : ''}`}
                        >
                          <ThumbsUp size={14} />
                          <span>{post.likes} Likes</span>
                        </button>
                        <button className="feed-action-btn">
                          <MessageCircle size={14} />
                          <span>{post.comments} Comments</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: CAMPUS FEED (SOCIAL LAYER & DISCOVERY FEED) */}
          {activeTab === 'Feed' && (
            <div className="campus-feed-view-wrapper" style={{ padding: '0 0.5rem' }}>
              
              {/* Active Filter Indicator */}
              {feedFilter && (
                <div className="active-filter-banner">
                  <div className="filter-badge-info">
                    <Filter size={14} />
                    <span>Showing posts matching <strong>{feedFilter}</strong></span>
                  </div>
                  <button className="clear-filter-btn" onClick={() => setFeedFilter('')} title="Clear filter">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Campus Moments (Horizontal rectangular stories) */}
              <div className="moments-container">
                <h3 className="moments-header-title">Campus Moments</h3>
                <div className="moments-track">
                  {moments.map(moment => (
                    <div 
                      key={moment.id} 
                      className="moment-card-wrapper" 
                      onClick={() => setSelectedMoment(moment)}
                      style={{ background: moment.coverBg }}
                    >
                      <div className="moment-gradient-overlay"></div>
                      <div className="moment-content">
                        <div className="moment-avatar-badge">{moment.avatar}</div>
                        <div className="moment-meta">
                          <h4 className="moment-title">{moment.title}</h4>
                          <span className="moment-views">👁️ {moment.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Post Card */}
              <div className="create-post-card">
                <div className="create-post-tabs">
                  <button 
                    type="button"
                    className={`create-post-tab-btn ${composerType === 'update' ? 'active' : ''}`} 
                    onClick={() => setComposerType('update')}
                  >
                    💬 Update
                  </button>
                  <button 
                    type="button"
                    className={`create-post-tab-btn ${composerType === 'achievement' ? 'active' : ''}`} 
                    onClick={() => setComposerType('achievement')}
                  >
                    🏆 Achievement
                  </button>
                  <button 
                    type="button"
                    className={`create-post-tab-btn ${composerType === 'event' ? 'active' : ''}`} 
                    onClick={() => setComposerType('event')}
                  >
                    📅 Event
                  </button>
                  <button 
                    type="button"
                    className={`create-post-tab-btn ${composerType === 'placement' ? 'active' : ''}`} 
                    onClick={() => setComposerType('placement')}
                  >
                    💼 Placement
                  </button>
                </div>

                <form onSubmit={handlePublishFeed} className="create-post-form">
                  {composerType !== 'update' && (
                    <div className="composer-banner-inputs">
                      <input 
                        type="text" 
                        placeholder={`${composerType.charAt(0).toUpperCase() + composerType.slice(1)} Title (e.g. ICPC Regionals)`} 
                        value={composerTitle} 
                        onChange={(e) => setComposerTitle(e.target.value)}
                        className="composer-input-field"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Sub-text (e.g. Rank #7 Qualified / Monday 4:00 PM)" 
                        value={composerSubtitle} 
                        onChange={(e) => setComposerSubtitle(e.target.value)}
                        className="composer-input-field"
                        required
                      />
                    </div>
                  )}
                  
                  <textarea 
                    placeholder={
                      composerType === 'achievement' ? "Describe your achievement... e.g. We qualified for regionals! #Coding" :
                      composerType === 'event' ? "Share your event details... e.g. Join the developers club in Makerspace! #GDSC" :
                      composerType === 'placement' ? "Placement cell announcement details... eligibility, links, stipends. #Placement" :
                      "What's happening on campus today? Use #hashtags to help others discover..."
                    }
                    value={feedInput}
                    onChange={(e) => setFeedInput(e.target.value)}
                    className="composer-textarea"
                    required
                  />

                  <div className="composer-bottom-row">
                    <span className="composer-info-text">
                      Posting as <strong>{currentUser?.name}</strong> • {getUserPrimaryRole(currentUser)?.badgeLabel || 'Student'}
                    </span>
                    <button type="submit" className="composer-submit-btn">
                      <span>Post to Feed</span>
                      <Plus size={14} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Social Feed Container */}
              <div className="social-feed-container">
                {filteredFeedPosts.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No posts match your filters or search criteria.</p>
                    <button onClick={() => { setFeedFilter(''); setDashboardSearch(''); }} className="clear-filter-btn" style={{ margin: '0.75rem auto 0 auto', textDecoration: 'underline', fontSize: '0.8rem', fontWeight: 600 }}>
                      Reset filters
                    </button>
                  </div>
                ) : (
                  filteredFeedPosts.map(post => {
                    const isExpanded = expandedComments[post.id];
                    const commentText = commentInputs[post.id] || '';
                    return (
                      <div key={post.id} className="feed-post-card">
                        <div className="post-header-row">
                          <div className="post-author-block">
                            <img 
                              src={post.userAvatar} 
                              alt={post.userName} 
                              className="post-author-avatar" 
                              onClick={() => {
                                const authorUser = users.find(u => u.id === post.userId) || { name: post.userName, avatar: post.userAvatar, role: 'student', branch: post.department };
                                setSelectedProfileUser(authorUser);
                              }}
                            />
                            <div className="post-author-meta">
                              <div className="post-author-name-row">
                                <span 
                                  className="post-author-name"
                                  onClick={() => {
                                    const authorUser = users.find(u => u.id === post.userId) || { name: post.userName, avatar: post.userAvatar, role: 'student', branch: post.department };
                                    setSelectedProfileUser(authorUser);
                                  }}
                                >
                                  {post.userName}
                                </span>
                                <div className="post-role-badges">
                                  {(post.userRoleIds || []).map(rId => {
                                    const rDef = roles[rId];
                                    if (!rDef) return null;
                                    return (
                                      <span key={rId} className={`academic-badge-chip ${rDef.colorClass}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                                        {rDef.badgeLabel}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="post-dept-row">
                                {post.department}
                              </div>
                            </div>
                          </div>
                          <span className="post-time-stamp">{post.time}</span>
                        </div>

                        {/* Body Content */}
                        <div className="post-body-content">
                          <p style={{ whiteSpace: 'pre-wrap' }}>{formatPostContent(post.content)}</p>
                        </div>

                        {/* Banner Render */}
                        {post.bannerTitle && (
                          <div className="premium-post-banner" style={{ background: post.bannerColor || 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}>
                            <div className="banner-emoji-box">
                              {post.bannerEmoji || '🏆'}
                            </div>
                            <div className="banner-text-details">
                              <span className="banner-title-label">{post.bannerTitle}</span>
                              <span className="banner-subtitle-label">{post.bannerSubtitle}</span>
                            </div>
                          </div>
                        )}

                        <div className="post-actions-divider"></div>

                        {/* Action Buttons */}
                        <div className="post-actions-row">
                          <button 
                            type="button"
                            className={`post-action-button ${post.hasLiked ? 'active-liked' : ''}`}
                            onClick={() => likeFeedPost(post.id)}
                          >
                            <ThumbsUp size={14} />
                            <span>{post.likes} Likes</span>
                          </button>
                          <button 
                            type="button"
                            className="post-action-button"
                            onClick={() => toggleCommentsSection(post.id)}
                          >
                            <MessageCircle size={14} />
                            <span>{post.commentsCount || 0} Comments</span>
                          </button>
                          <button 
                            type="button"
                            className="post-action-button"
                            onClick={() => {
                              navigator.clipboard.writeText(post.content);
                              alert('Post content copied to clipboard!');
                            }}
                          >
                            <Send size={14} />
                            <span>Share</span>
                          </button>
                          <button 
                            type="button"
                            className={`post-action-button ${post.hasSaved ? 'active-saved' : ''}`}
                            onClick={() => saveFeedPost(post.id)}
                          >
                            <Clock size={14} />
                            <span>{post.hasSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>

                        {/* Comments Block */}
                        {isExpanded && (
                          <div className="post-comments-container">
                            <div className="comments-list-stack">
                              {(post.comments || []).length === 0 ? (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0.5rem 0' }}>
                                  No comments yet. Be the first to reply!
                                </div>
                              ) : (
                                (post.comments || []).map(comment => (
                                  <div key={comment.id} className="comment-row-item">
                                    <img src={comment.userAvatar} alt={comment.userName} className="comment-user-avatar" />
                                    <div className="comment-bubble-box">
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="comment-author-name">{comment.userName}</span>
                                        <span className="comment-time-stamp">{comment.time}</span>
                                      </div>
                                      <p className="comment-bubble-text">{comment.text}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                            <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="comment-composer-form">
                              <input 
                                type="text" 
                                placeholder="Write a comment..." 
                                value={commentText} 
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                className="comment-composer-input"
                                required
                              />
                              <button type="submit" className="comment-submit-btn">
                                Reply
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB: ANNOUNCEMENTS (FULL DETAILED STACK) */}
          {activeTab === 'Announcements' && (
            <div className="announcements-full-view">
              <h2 className="view-section-title">Official Announcements</h2>
              <div className="announcements-stack">
                {filteredAnnouncements.map(ann => (
                  <div key={ann.id} className="announcement-item-card large">
                    <div className="ann-item-header">
                      <span className="ann-item-tag">{ann.tag}</span>
                      <span className="ann-item-date">{ann.date}</span>
                    </div>
                    <h3 className="ann-item-title">{ann.title}</h3>
                    <p className="ann-item-desc">{ann.content}</p>
                    <div className="ann-item-footer">
                      <span className="ann-item-author">By {ann.sender} ({ann.role})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EVENTS (FULL GRID) */}
          {activeTab === 'Events' && (
            <div className="events-full-view">
              <h2 className="view-section-title">Campus Events Calendars</h2>
              <div className="events-grid">
                {filteredEvents.map(evt => (
                  <div key={evt.id} className="event-item-card detailed">
                    <div className="event-date-badge">
                      <span className="event-badge-day">{evt.date.split(' ')[1].replace(',', '')}</span>
                      <span className="event-badge-month">{evt.date.split(' ')[0].substring(0, 3).toUpperCase()}</span>
                    </div>
                    <div className="event-card-details">
                      <h3 className="event-title">{evt.title}</h3>
                      <span className="event-org">Organized by {evt.organizer}</span>
                      <p className="event-desc-sub">Advanced training and discussions. Open to all students.</p>
                      <div className="event-meta-info">
                        <span className="event-meta-item"><Clock size={12} /> {evt.time}</span>
                        <span className="event-meta-item"><MapPin size={12} /> {evt.location}</span>
                      </div>
                      <div className="event-actions-row">
                        <span className="event-rsvps-count">{evt.rsvps} registered</span>
                        <button 
                          onClick={() => handleRegisterEvent(evt.id)} 
                          className={`btn-event-rsvp ${evt.joined ? 'registered' : ''}`}
                        >
                          {evt.joined ? 'Registered' : 'Register'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PLACEMENTS VIEW */}
          {activeTab === 'Placements' && (
            <div className="placements-full-view">
              <h2 className="view-section-title">Career & Placements Cell</h2>
              <p className="section-intro">Active listings, training workshops, and company schedule updates.</p>
              
              <div className="announcement-item-card large active-drive">
                <div className="ann-item-header">
                  <span className="ann-item-tag drive">Active Internship</span>
                  <span className="ann-item-date">Deadline: June 5, 2026</span>
                </div>
                <h3 className="ann-item-title">Google Summer Internships (Batch 2027)</h3>
                <p className="ann-item-desc">
                  Google Software Engineering internship roles are open for submission. Requirements include proficiency in C++, Java, or Python, deep understanding of Data Structures and Algorithms, and a CGPA above 8.0. Review mock files in placement desk before applying.
                </p>
                <div className="drive-actions">
                  <a href="https://careers.google.com/internships" target="_blank" rel="noopener noreferrer" className="btn-drive-apply">Apply on Portal</a>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMMUNITIES */}
          {activeTab === 'Communities' && (
            <div className="communities-full-view">
              <h2 className="view-section-title">Clubs & Student Societies</h2>
              <div className="communities-grid">
                {communities.map(comm => (
                  <div key={comm.id} className="community-grid-card detailed">
                    <div className="comm-avatar-box large">{comm.avatar}</div>
                    <h3 className="comm-card-title">{comm.name}</h3>
                    <p className="comm-card-desc">{comm.description}</p>
                    <div className="comm-card-footer">
                      <span className="comm-member-count">{comm.members} Members</span>
                      <button className="btn-join-comm">Join Group</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MEMBER DIRECTORY */}
          {activeTab === 'Directory' && (
            <div className="directory-view-wrapper">
              <div className="directory-header-section">
                <h2 className="view-section-title">Campus Member Directory</h2>
                <p className="directory-subtitle">Find and connect with students, faculty, and coordinators across UniSphere.</p>
              </div>

              {/* Filters Panel */}
              <div className="directory-filters-panel">
                <div className="directory-search-row">
                  <div className="directory-search-box">
                    <Search size={18} className="directory-search-icon-pos" />
                    <input 
                      type="text" 
                      placeholder="Search members by name, email or interests..." 
                      value={dirSearch}
                      onChange={(e) => setDirSearch(e.target.value)}
                      className="directory-search-input-field"
                    />
                  </div>
                  {(dirSearch || dirRole !== 'all' || dirDept !== 'all' || dirBatch !== 'all' || dirClub !== 'all' || dirWorkspace !== 'all') && (
                    <button 
                      onClick={() => {
                        setDirSearch('');
                        setDirRole('all');
                        setDirDept('all');
                        setDirBatch('all');
                        setDirClub('all');
                        setDirWorkspace('all');
                      }}
                      className="directory-clear-filters-btn"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="directory-dropdowns-row">
                  {/* Role Group Filter */}
                  <div className="filter-dropdown-group">
                    <label className="filter-dropdown-label">Role Category</label>
                    <select 
                      value={dirRole} 
                      onChange={(e) => setDirRole(e.target.value)}
                      className="filter-select-element"
                    >
                      <option value="all">All Roles</option>
                      {Object.values(roles).map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div className="filter-dropdown-group">
                    <label className="filter-dropdown-label">Department / Branch</label>
                    <select 
                      value={dirDept} 
                      onChange={(e) => setDirDept(e.target.value)}
                      className="filter-select-element"
                    >
                      <option value="all">All Departments</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Artificial Intelligence & Machine Learning">AI & ML</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Administration">Administration</option>
                      <option value="Executive Office">Executive Office</option>
                    </select>
                  </div>

                  {/* Batch Filter */}
                  <div className="filter-dropdown-group">
                    <label className="filter-dropdown-label">Academic Batch</label>
                    <select 
                      value={dirBatch} 
                      onChange={(e) => setDirBatch(e.target.value)}
                      className="filter-select-element"
                    >
                      <option value="all">All Batches</option>
                      <option value="2024">Batch of 2024</option>
                      <option value="2026">Batch of 2026</option>
                      <option value="2027">Batch of 2027</option>
                      <option value="Faculty Core">Faculty Core</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  {/* Club Filter */}
                  <div className="filter-dropdown-group">
                    <label className="filter-dropdown-label">Student Club</label>
                    <select 
                      value={dirClub} 
                      onChange={(e) => setDirClub(e.target.value)}
                      className="filter-select-element"
                    >
                      <option value="all">All Clubs</option>
                      <option value="Developers Club">Developers Club</option>
                      <option value="Competitive Programming Hub">CP Hub</option>
                      <option value="Robotics & Hardware Club">Robotics Club</option>
                      <option value="None">No Club</option>
                    </select>
                  </div>

                  {/* Workspace Filter */}
                  <div className="filter-dropdown-group">
                    <label className="filter-dropdown-label">Institution</label>
                    <select 
                      value={dirWorkspace} 
                      onChange={(e) => setDirWorkspace(e.target.value)}
                      className="filter-select-element"
                    >
                      <option value="all">All Campuses</option>
                      {workspaces.map(ws => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Members Directory Grid */}
              <div className="directory-grid">
                {users
                  .filter(u => {
                    // Search Text Filter
                    const nameMatch = u.name.toLowerCase().includes(dirSearch.toLowerCase());
                    const emailMatch = u.email.toLowerCase().includes(dirSearch.toLowerCase());
                    const interestMatch = u.interests?.some(i => i.toLowerCase().includes(dirSearch.toLowerCase()));
                    const textMatch = nameMatch || emailMatch || interestMatch;

                    // Role Filter
                    const uRoleIds = u.roleIds || [u.role] || [];
                    const roleMatch = dirRole === 'all' || uRoleIds.includes(dirRole);

                    // Department Filter
                    const deptMatch = dirDept === 'all' || u.branch === dirDept;

                    // Batch Filter
                    const batchMatch = dirBatch === 'all' || u.batch === dirBatch;

                    // Club Filter
                    const clubMatch = dirClub === 'all' || (dirClub === 'None' ? !u.club : u.club === dirClub);

                    // Workspace Filter
                    const wsMatch = dirWorkspace === 'all' || u.workspaces?.includes(dirWorkspace);

                    return textMatch && roleMatch && deptMatch && batchMatch && clubMatch && wsMatch;
                  })
                  .map(u => {
                    return (
                      <div key={u.id} className="directory-member-card">
                        <div className="directory-member-header">
                          <div className="directory-avatar-container">
                            <img 
                              src={u.avatar} 
                              alt={u.name} 
                              className="directory-member-avatar" 
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedProfileUser(u)}
                            />
                            <span className={`directory-status-dot ${u.status || 'offline'}`}></span>
                          </div>
                          <div className="directory-member-info">
                            <h3 
                              className="directory-member-name" 
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedProfileUser(u)}
                            >
                              {u.name}
                            </h3>
                            <span className="directory-member-status-text">
                              {u.customStatusText || (u.status === 'online' ? 'Online' : 'Offline')}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="directory-badges-row">
                          {renderUserBadges(u)}
                        </div>

                        {/* Academic Details list */}
                        <div className="directory-academic-details">
                          <div className="directory-detail-row">
                            <span className="label">Department:</span>
                            <span className="val" title={u.branch}>{u.branch || 'General'}</span>
                          </div>
                          <div className="directory-detail-row">
                            <span className="label">Batch Year:</span>
                            <span className="val">{u.batch || 'Staff'}</span>
                          </div>
                          {u.club && (
                            <div className="directory-detail-row">
                              <span className="label">Club:</span>
                              <span className="val">{u.club}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="directory-member-actions">
                          <button 
                            className="btn-view-profile" 
                            onClick={() => setSelectedProfileUser(u)}
                          >
                            Profile
                          </button>
                          {currentUser.id !== u.id && (
                            <button 
                              className="btn-dm" 
                              onClick={() => handleDMSelect(u.id)}
                            >
                              Message
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB: CAMPUS CONSOLE (ADMIN CONTROL INTERFACE) */}
          {activeTab === 'Console' && hasPermission(currentUser, 'manage_roles') && (
            <div className="console-view-wrapper">
              <div className="console-header-section">
                <div>
                  <h2 className="view-section-title">Campus Administrative Console</h2>
                  <p className="directory-subtitle">Configure institutional role hierarchy, modify permissions, and assign campus roles.</p>
                </div>
              </div>

              {/* Sub tabs switcher */}
              <div className="console-tab-buttons-row">
                <button 
                  className={`console-tab-btn ${consoleTab === 'tree' ? 'active' : ''}`}
                  onClick={() => setConsoleTab('tree')}
                >
                  Role Hierarchy
                </button>
                <button 
                  className={`console-tab-btn ${consoleTab === 'matrix' ? 'active' : ''}`}
                  onClick={() => setConsoleTab('matrix')}
                >
                  Permissions Matrix
                </button>
                <button 
                  className={`console-tab-btn ${consoleTab === 'members' ? 'active' : ''}`}
                  onClick={() => setConsoleTab('members')}
                >
                  Member Management
                </button>
              </div>

              {/* SUB TAB: ROLE TREE */}
              {consoleTab === 'tree' && (
                <div className="role-hierarchy-container">
                  {Object.values(roles)
                    .sort((a, b) => b.level - a.level)
                    .map((role, rIdx) => {
                      const depth = Math.max(0, 5 - Math.floor(role.level / 20));
                      const showConnector = rIdx > 0;
                      return (
                        <div 
                          key={role.id} 
                          className="role-tree-node"
                          style={{ 
                            '--tree-depth': depth,
                            '--show-connector': showConnector ? 'block' : 'none'
                          }}
                        >
                          <div className="role-tree-node-left">
                            <div className="role-tree-level-badge">{role.level}</div>
                            <div className="role-tree-node-info">
                              <div className="role-tree-node-header">
                                <span className={`academic-badge-chip ${role.colorClass}`}>{role.badgeLabel}</span>
                                <span className="role-tree-node-title">{role.name}</span>
                              </div>
                              <p className="role-tree-node-desc">{role.description}</p>
                              
                              <div className="role-tree-node-permissions-summary">
                                {role.permissions && role.permissions.length > 0 ? (
                                  role.permissions.map(p => (
                                    <span key={p} className="role-tree-perm-tag">
                                      {p.replace('_', ' ')}
                                    </span>
                                  ))
                                ) : (
                                  <span className="role-tree-perm-tag" style={{ fontStyle: 'italic', opacity: 0.6 }}>No admin privileges</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="role-tree-node-right">
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                              {users.filter(u => (u.roleIds || [u.role]).includes(role.id)).length} assigned
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* SUB TAB: PERMISSIONS MATRIX */}
              {consoleTab === 'matrix' && (
                <div className="permissions-matrix-card">
                  <div className="matrix-table-container">
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th>Role Definitions</th>
                          <th className="matrix-perm-header-th">Post Announcements</th>
                          <th className="matrix-perm-header-th">Manage Discussions</th>
                          <th className="matrix-perm-header-th">Pin Messages</th>
                          <th className="matrix-perm-header-th">Manage Channels</th>
                          <th className="matrix-perm-header-th">Manage Roles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(roles)
                          .sort((a, b) => b.level - a.level)
                          .map(role => {
                            const isGlobalAdmin = role.id === 'inst_admin' || role.id === 'platform_admin';
                            return (
                              <tr key={role.id}>
                                <td>
                                  <div className="matrix-role-th">
                                    <span className={`academic-badge-chip ${role.colorClass}`}>{role.badgeLabel}</span>
                                    <span>{role.name}</span>
                                  </div>
                                </td>
                                {['post_announcements', 'manage_discussions', 'pin_messages', 'manage_channels', 'manage_roles'].map(perm => {
                                  const hasPerm = role.permissions?.includes(perm);
                                  return (
                                    <td key={perm} className="matrix-checkbox-td">
                                      <input 
                                        type="checkbox" 
                                        checked={hasPerm || isGlobalAdmin}
                                        disabled={isGlobalAdmin}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          let updatedPerms = [...(role.permissions || [])];
                                          if (checked) {
                                            updatedPerms.push(perm);
                                          } else {
                                            updatedPerms = updatedPerms.filter(p => p !== perm);
                                          }
                                          updateRolePermissions(role.id, updatedPerms);
                                        }}
                                        className="matrix-permission-switch"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  <div className="matrix-info-banner">
                    <Lock size={14} />
                    <span>Institution Administrators and Platform Administrators possess full global overrides and cannot have permissions revoked. Changes apply immediately across campus workspaces.</span>
                  </div>
                </div>
              )}

              {/* SUB TAB: MEMBER ROLES MANAGER */}
              {consoleTab === 'members' && (
                <div className="member-roles-assign-layout">
                  <div className="console-search-row">
                    <input 
                      type="text" 
                      placeholder="Find campus members by name or email..."
                      value={membersSearch}
                      onChange={(e) => setMembersSearch(e.target.value)}
                      className="console-search-input"
                    />
                  </div>

                  <table className="console-members-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Department</th>
                        <th>Academic Batch</th>
                        <th>Roles & Badges</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(u => u.name.toLowerCase().includes(membersSearch.toLowerCase()) || u.email.toLowerCase().includes(membersSearch.toLowerCase()))
                        .map(u => {
                          const userRoles = u.roleIds || [u.role] || [];
                          return (
                            <tr key={u.id}>
                              <td>
                                <div className="console-member-cell-user">
                                  <img 
                                    src={u.avatar} 
                                    alt={u.name} 
                                    className="console-member-cell-avatar" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedProfileUser(u)}
                                  />
                                  <div className="console-member-cell-details">
                                    <span 
                                      className="console-member-cell-name" 
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => setSelectedProfileUser(u)}
                                    >
                                      {u.name}
                                    </span>
                                    <span className="console-member-cell-email">{u.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <select 
                                  value={u.branch || 'Unassigned'} 
                                  onChange={(e) => updateUserIdentity(u.id, { branch: e.target.value })}
                                  className="console-academic-select"
                                >
                                  <option value="Computer Science & Engineering">CS & Engineering</option>
                                  <option value="Artificial Intelligence & Machine Learning">AI & ML</option>
                                  <option value="Computer Science">Computer Science</option>
                                  <option value="Administration">Administration</option>
                                  <option value="Executive Office">Executive Office</option>
                                  <option value="Unassigned">Unassigned</option>
                                </select>
                              </td>
                              <td>
                                <select 
                                  value={u.batch || '2026'} 
                                  onChange={(e) => updateUserIdentity(u.id, { batch: e.target.value })}
                                  className="console-academic-select"
                                >
                                  <option value="2024">Batch 2024</option>
                                  <option value="2026">Batch 2026</option>
                                  <option value="2027">Batch 2027</option>
                                  <option value="Faculty Core">Faculty Core</option>
                                  <option value="Staff">Staff</option>
                                </select>
                              </td>
                              <td>
                                <div className="console-member-cell-roles">
                                  {renderUserBadges(u)}
                                </div>
                              </td>
                              <td style={{ textAlign: 'right', position: 'relative' }}>
                                <button 
                                  className="console-roles-edit-trigger"
                                  onClick={() => {
                                    if (activeRolePopoverUserId === u.id) {
                                      setActiveRolePopoverUserId(null);
                                    } else {
                                      setActiveRolePopoverUserId(u.id);
                                      setRolesEditedList(userRoles);
                                    }
                                  }}
                                >
                                  Edit Roles
                                </button>

                                {/* Roles selector Popover */}
                                {activeRolePopoverUserId === u.id && (
                                  <div className="roles-popover-card" style={{ right: '10px', top: '40px' }}>
                                    <div className="roles-popover-header">Manage Roles: {u.name.split(' ')[0]}</div>
                                    <div className="roles-popover-list">
                                      {Object.values(roles).map(role => {
                                        const isChecked = rolesEditedList.includes(role.id);
                                        return (
                                          <div 
                                            key={role.id} 
                                            className="roles-popover-item"
                                            onClick={() => {
                                              let newList = [...rolesEditedList];
                                              if (isChecked) {
                                                if (newList.length > 1) {
                                                  newList = newList.filter(rId => rId !== role.id);
                                                }
                                              } else {
                                                newList.push(role.id);
                                              }
                                              setRolesEditedList(newList);
                                            }}
                                          >
                                            <div className="roles-popover-item-left">
                                              <input 
                                                type="checkbox" 
                                                checked={isChecked}
                                                readOnly
                                                className="roles-popover-checkbox"
                                              />
                                              <span className="roles-popover-item-label">{role.name}</span>
                                            </div>
                                            <span className={`academic-badge-chip ${role.colorClass}`} style={{ fontSize: '0.55rem', padding: '0.05rem 0.25rem' }}>
                                              {role.badgeLabel}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="roles-popover-footer">
                                      <button 
                                        className="roles-popover-btn-done"
                                        onClick={() => {
                                          updateUserRoles(u.id, rolesEditedList);
                                          setActiveRolePopoverUserId(null);
                                        }}
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: CHAT INTERFACE (CHANNEL) */}
          {activeTab === 'Channel' && (
            <div className="chat-interface-wrapper">
              
              {/* Channel metadata */}
              <div className="chat-channel-description-bar">
                <p className="channel-desc-text"><strong>Description:</strong> {activeChannel?.description}</p>
                <span className="channel-stats-badge">{activeChannelMessages.length} Messages</span>
              </div>

              {/* Messages list */}
              <div className="chat-messages-container">
                {activeChannelMessages.length === 0 ? (
                  <div className="chat-empty-state">
                    <Hash size={36} className="empty-hash-icon" />
                    <h3>Welcome to #{activeChannel?.name}!</h3>
                    <p>This is the start of the #{activeChannel?.name} channel.</p>
                  </div>
                ) : (
                  activeChannelMessages.map(msg => {
                    const msgUser = users.find(u => u.id === msg.userId) || currentUser;
                    const primary = getUserPrimaryRole(msgUser);
                    return (
                      <div key={msg.id} className={`chat-message-row ${msg.isPinned ? 'pinned-message' : ''}`}>
                        <img 
                          src={msgUser.avatar} 
                          alt={msgUser.name} 
                          className="chat-msg-avatar" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedProfileUser(msgUser)}
                        />
                        <div className="chat-msg-body">
                          <div className="chat-msg-header">
                            <span 
                              className={`chat-msg-author ${primary?.colorClass || ''}`}
                              style={{ cursor: 'pointer', fontWeight: 700 }}
                              onClick={() => setSelectedProfileUser(msgUser)}
                            >
                              {msgUser.name}
                            </span>
                            {renderUserBadges(msgUser)}
                            {msg.isPinned && (
                              <span className="pinned-badge-indicator">
                                <Pin size={10} /> Pinned
                              </span>
                            )}
                            <span className="chat-msg-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="chat-msg-text">
                            <p>{msg.text}</p>
                          </div>
                          
                          {/* Message Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="chat-reactions-row">
                              {msg.reactions.map((react, rIdx) => (
                                <button 
                                  key={rIdx} 
                                  onClick={() => addReaction(msg.id, react.emoji)}
                                  className="chat-reaction-pill"
                                >
                                  <span>{react.emoji}</span>
                                  <span className="react-count">{react.count}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Quick Message Actions */}
                          <div className="chat-msg-actions">
                            <button onClick={() => addReaction(msg.id, '👍')} className="chat-msg-action-btn" title="Like">👍</button>
                            <button onClick={() => addReaction(msg.id, '🔥')} className="chat-msg-action-btn" title="Fire">🔥</button>
                            <button onClick={() => addReaction(msg.id, '🚀')} className="chat-msg-action-btn" title="Rocket">🚀</button>
                            <button 
                              onClick={() => setActiveThreadParentId(msg.id)} 
                              className="chat-msg-action-btn replies-toggle-btn"
                            >
                              <MessageSquare size={12} />
                              <span>{msg.repliesCount || 0} Replies</span>
                            </button>
                            
                            {/* Pin / Unpin Action (requires permission) */}
                            {hasPermission(currentUser, 'pin_message', activeChannel) && (
                              <button 
                                onClick={() => togglePinMessage(msg.id)} 
                                className={`chat-msg-action-btn ${msg.isPinned ? 'active-pin' : ''}`}
                                title={msg.isPinned ? "Unpin message" : "Pin message"}
                              >
                                <Pin size={12} />
                              </button>
                            )}

                            {/* Delete Action (requires permission or creator) */}
                            {(hasPermission(currentUser, 'manage_discussions', activeChannel) || currentUser.id === msg.userId) && (
                              <button 
                                onClick={() => deleteMessage(msg.id)} 
                                className="chat-msg-action-btn delete-message-btn"
                                title="Delete message"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Composer */}
              {hasPermission(currentUser, 'send_message', activeChannel) ? (
                <form onSubmit={handleSendChatMessage} className="chat-composer-box">
                  <input 
                    type="text" 
                    placeholder={`Message #${activeChannel?.name}`} 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="chat-composer-input"
                  />
                  <button type="submit" className="chat-composer-send-btn" disabled={!chatInput.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              ) : (
                <div className="composer-locked-notice">
                  <Lock size={16} />
                  <span>Only verified Faculty, Administrators, or Coordinators can post announcements in #{activeChannel?.name}.</span>
                </div>
              )}
            </div>
          )}
          </>
          )}
        </div>
      </div>

      {/* 4. QUICK GLANCE SIDEBAR (RIGHT COLUMN) */}
      <div className="right-quick-glance-panel">
        
        {appMode === 'social' ? (
          <div className="discovery-panel-container instagram-right-sidebar">
            {/* Suggested Students */}
            <div className="instagram-sidebar-section">
              <div className="instagram-section-header">
                <span>Suggested Students</span>
                <button type="button" className="see-all-btn" onClick={() => setActiveSocialTab('explore')}>See All</button>
              </div>
              <div className="instagram-suggestions-list">
                {[
                  { id: "user_aarav", name: "Aarav Mehta", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav", dept: "CSE '26" },
                  { id: "user_priya", name: "Priya Patel", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya", dept: "CSE '27" },
                  { id: "user_kabir", name: "Kabir Sen", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kabir", dept: "ECE '26" }
                ].map(peer => {
                  const isFollowing = followingIds.includes(peer.id);
                  return (
                    <div key={peer.id} className="instagram-suggestion-row">
                      <div className="suggestion-user-info" onClick={() => {
                        const peerUser = users.find(u => u.id === peer.id) || { id: peer.id, name: peer.name, avatar: peer.avatar, role: 'student', branch: peer.dept };
                        setProfileViewUser(peerUser);
                        setActiveSocialTab('profile');
                      }} style={{ cursor: 'pointer' }}>
                        <img src={peer.avatar} alt={peer.name} className="suggestion-avatar" />
                        <div className="suggestion-text">
                          <span className="suggestion-username">{peer.name}</span>
                          <span className="suggestion-subtext">{peer.dept}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className={`suggestion-action-btn ${isFollowing ? 'following' : ''}`}
                        onClick={() => toggleFollowUser(peer.id)}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggested Clubs */}
            <div className="instagram-sidebar-section">
              <div className="instagram-section-header">
                <span>Suggested Clubs</span>
                <button type="button" className="see-all-btn" onClick={() => setActiveSocialTab('explore')}>See All</button>
              </div>
              <div className="instagram-suggestions-list">
                {recommendedClubs.slice(0, 2).map(club => (
                  <div key={club.id} className="instagram-suggestion-row">
                    <div className="suggestion-user-info">
                      <div className="suggestion-club-logo">{club.logo}</div>
                      <div className="suggestion-text">
                        <span className="suggestion-username">{club.name}</span>
                        <span className="suggestion-subtext">{club.members} members</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className={`suggestion-action-btn ${club.joined ? 'joined' : ''}`}
                      onClick={() => toggleJoinClub(club.id)}
                    >
                      {club.joined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Communities */}
            <div className="instagram-sidebar-section">
              <div className="instagram-section-header">
                <span>Suggested Communities</span>
              </div>
              <div className="instagram-suggestions-list">
                {[
                  { id: "comm_ai", name: "AI-ML Circle", members: "184 members", icon: "🧠" },
                  { id: "comm_music", name: "Music Cell", members: "125 members", icon: "🎸" }
                ].map(comm => (
                  <div key={comm.id} className="instagram-suggestion-row">
                    <div className="suggestion-user-info">
                      <div className="suggestion-club-logo" style={{ background: 'var(--bg-deep)' }}>{comm.icon}</div>
                      <div className="suggestion-text">
                        <span className="suggestion-username">{comm.name}</span>
                        <span className="suggestion-subtext">{comm.members}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingRight: '0.5rem' }}>Active</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent DMs */}
            <div className="instagram-sidebar-section">
              <div className="instagram-section-header">
                <span>Recent DMs</span>
                <button type="button" className="see-all-btn" onClick={() => setActiveSocialTab('messages')}>All Messages</button>
              </div>
              <div className="instagram-suggestions-list">
                {[
                  { id: "user_aarav", name: "Aarav Mehta", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav", lastMsg: "Yeah, the evasion sensor index..." },
                  { id: "user_priya", name: "Priya Patel", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya", lastMsg: "Congrats on ICPC regionals, Rahul!" }
                ].map(peer => (
                  <div key={peer.id} className="instagram-suggestion-row" style={{ cursor: 'pointer' }} onClick={() => {
                    setSelectedSocialPeerId(peer.id);
                    setActiveSocialTab('messages');
                  }}>
                    <div className="suggestion-user-info">
                      <img src={peer.avatar} alt={peer.name} className="suggestion-avatar" />
                      <div className="suggestion-text">
                        <span className="suggestion-username">{peer.name}</span>
                        <span className="suggestion-subtext" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }}>{peer.lastMsg}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>●</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'Feed' ? (
          <div className="discovery-panel-container">
            
            {/* Trending Topics */}
            <div className="discovery-section-card">
              <div className="discovery-card-header">
                <TrendingUp size={14} className="discovery-card-icon" />
                <span style={{ fontSize: '0.78rem' }}>Trending Topics</span>
              </div>
              <div className="trending-tags-cloud">
                {[
                  { tag: '#ICPCRegionals', count: 42 },
                  { tag: '#HackSprint2026', count: 78 },
                  { tag: '#GoogleInternship', count: 84 },
                  { tag: '#RoboticsClubRecruitment', count: 29 },
                  { tag: '#DBMSProject', count: 38 }
                ].map(item => (
                  <button 
                    key={item.tag}
                    type="button"
                    className={`trending-tag-item ${feedFilter === item.tag ? 'active-tag-filter' : ''}`}
                    onClick={() => setFeedFilter(feedFilter === item.tag ? '' : item.tag)}
                  >
                    <span className="trending-tag-name">{item.tag}</span>
                    <span className="trending-tag-count">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Student Spotlight */}
            <div className="discovery-section-card">
              <div className="discovery-card-header">
                <Smile size={14} className="discovery-card-icon" />
                <span style={{ fontSize: '0.78rem' }}>Student Spotlight</span>
              </div>
              <div className="spotlight-card-content">
                <span className="spotlight-achievement-badge">Trophy Highlight</span>
                <h4 className="spotlight-title">Priya Patel secures fellowship</h4>
                <p className="spotlight-description">
                  Congratulations to Priya Patel (CSE Batch '27) for securing the AI Research fellowship at Google Labs! Her resume review and Github setup guides are shared on #placement-cell.
                </p>
                <span 
                  className="spotlight-profile-link"
                  onClick={() => {
                    const priyaUser = users.find(u => u.name.includes("Priya")) || { name: "Priya Patel", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya", role: "student", branch: "Computer Science" };
                    setSelectedProfileUser(priyaUser);
                  }}
                >
                  View Profile →
                </span>
              </div>
            </div>

            {/* Recommended Clubs */}
            <div className="discovery-section-card">
              <div className="discovery-card-header">
                <Users size={14} className="discovery-card-icon" />
                <span style={{ fontSize: '0.78rem' }}>Recommended Clubs</span>
              </div>
              <div className="recommended-clubs-list">
                {recommendedClubs.map(club => (
                  <div key={club.id} className="recommended-club-item">
                    <div className="club-item-left">
                      <div className="club-item-avatar">{club.logo}</div>
                      <div className="club-item-text">
                        <span className="club-item-name">{club.name}</span>
                        <span className="club-item-members">{club.members} members</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className={`club-join-btn ${club.joined ? 'club-joined' : ''}`}
                      onClick={() => toggleJoinClub(club.id)}
                    >
                      {club.joined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Statistics */}
            <div className="discovery-section-card">
              <div className="discovery-card-header">
                <Clock size={14} className="discovery-card-icon" />
                <span style={{ fontSize: '0.78rem' }}>Campus Pulse</span>
              </div>
              <div className="campus-stats-grid">
                <div className="campus-stat-tile">
                  <span className="campus-stat-value">● {campusStats.onlineCount}</span>
                  <span className="campus-stat-label">Online Now</span>
                </div>
                <div className="campus-stat-tile">
                  <span className="campus-stat-value">{campusStats.activeClubs}</span>
                  <span className="campus-stat-label">Active Clubs</span>
                </div>
                <div className="campus-stat-tile">
                  <span className="campus-stat-value">{campusStats.placementsSuccess}%</span>
                  <span className="campus-stat-label">Placements</span>
                </div>
                <div className="campus-stat-tile">
                  <span className="campus-stat-value">{campusStats.upcomingEvents}</span>
                  <span className="campus-stat-label">New Events</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <>
            {/* Today's Schedule */}
            <div className="quick-glance-section">
              <div className="section-title-row">
                <Clock size={16} className="glance-title-icon" />
                <span className="glance-title-text">Today's Schedule</span>
              </div>
              <div className="schedule-timeline">
                {schedule.map(sch => (
                  <div key={sch.id} className="schedule-timeline-item">
                    <span className="sch-item-time">{sch.time}</span>
                    <div className="sch-item-card">
                      <h4 className="sch-item-title">{sch.title}</h4>
                      <span className="sch-item-subtitle">{sch.subtitle}</span>
                      <span className="sch-item-room">{sch.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="quick-glance-section">
              <div className="section-title-row">
                <FileText size={16} className="glance-title-icon" />
                <span className="glance-title-text">Upcoming Deadlines</span>
              </div>
              <div className="deadlines-stack">
                {deadlines.map(dead => (
                  <div key={dead.id} className="deadline-item-card">
                    <div className="dead-left">
                      <h4 className="dead-title">{dead.title}</h4>
                      <span className="dead-course">{dead.course}</span>
                    </div>
                    <span className={`dead-urgency-badge ${dead.severity}`}>
                      {dead.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      {/* 5. RIGHT SIDEBAR THREAD DRAWER (Toggled when a message thread is open) */}
      {activeThreadParentId && threadParentMessage && (
        <div className="thread-drawer-panel">
          <div className="thread-drawer-header">
            <h3>Thread Discussion</h3>
            <button className="thread-close-btn" onClick={() => setActiveThreadParentId(null)}>×</button>
          </div>
          
          <div className="thread-drawer-scrollable">
            {/* Parent message */}
            <div className="thread-parent-msg-card">
              <div className="thread-msg-header">
                <img 
                  src={users.find(u => u.id === threadParentMessage.userId)?.avatar || currentUser?.avatar} 
                  alt="Avatar" 
                  className="thread-msg-avatar" 
                />
                <div className="thread-msg-meta">
                  <span className="thread-msg-author">{users.find(u => u.id === threadParentMessage.userId)?.name || currentUser?.name}</span>
                  <span className="thread-msg-time">
                    {new Date(threadParentMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <p className="thread-parent-text">{threadParentMessage.text}</p>
            </div>

            <div className="thread-replies-divider">
              <span>{parentMessageReplies.length} Replies</span>
            </div>

            {/* Replies List */}
            <div className="thread-replies-stack">
              {parentMessageReplies.map(reply => {
                const replyUser = users.find(u => u.id === reply.userId) || currentUser;
                return (
                  <div key={reply.id} className="thread-reply-item-row">
                    <img src={replyUser.avatar} alt={replyUser.name} className="thread-msg-avatar" />
                    <div className="thread-msg-body">
                      <div className="thread-msg-header">
                        <span className="thread-msg-author">{replyUser.name}</span>
                        <span className="thread-msg-time">
                          {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="thread-reply-text">{reply.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thread composer */}
          <form onSubmit={handleSendThreadReply} className="thread-composer-box">
            <input 
              type="text" 
              placeholder="Reply to thread..." 
              value={threadInput}
              onChange={(e) => setThreadInput(e.target.value)}
              className="thread-composer-input"
            />
            <button type="submit" className="thread-composer-send-btn" disabled={!threadInput.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* 6. CREATE CHANNEL DIALOG (MODAL) */}
      {showCreateChannel && (
        <div className="modal-overlay flex-center">
          <div className="modal-card">
            <h3 className="modal-title">Create New Channel</h3>
            <form onSubmit={handleCreateChannelSubmit} className="modal-form">
              <div className="form-field-group">
                <label className="form-field-label">CHANNEL NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. hackathon-sync" 
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  required
                  className="form-field-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">CATEGORY</label>
                <select 
                  value={newChannelCategory}
                  onChange={(e) => setNewChannelCategory(e.target.value)}
                  className="form-field-input"
                >
                  <option value="Academic">Academic</option>
                  <option value="Community">Community</option>
                  <option value="Clubs">Clubs</option>
                  <option value="Announcements">Announcements</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateChannel(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MEMBERS MODAL */}
      {showMembersModal && (
        <div className="modal-overlay flex-center">
          <div className="modal-card members-modal">
            <div className="members-modal-header">
              <div>
                <h3 className="modal-title"># {activeChannel?.name}</h3>
                <div className="members-modal-tabs">
                  <span className="members-tab-active">Members {users.length}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowMembersModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="members-search-bar">
              <Search size={16} className="search-box-icon" />
              <input 
                type="text"
                placeholder="Find members"
                value={membersSearch}
                onChange={(e) => setMembersSearch(e.target.value)}
                className="members-search-input"
              />
            </div>
            
            <div className="members-list-scrollable">
              <div className="add-people-row">
                <div className="add-people-icon"><Users size={16} /></div>
                <span>Add people</span>
              </div>
              {users.filter(u => u.name.toLowerCase().includes(membersSearch.toLowerCase())).map(u => (
                <div key={u.id} className="member-list-item">
                  <img src={u.avatar} alt={u.name} className="member-list-avatar" />
                  <div className="member-list-info">
                    <span className="member-list-name">{u.name}</span>
                    <span className="member-list-desc">{u.role === 'student' ? 'Student' : u.role === 'faculty' ? 'Faculty' : 'Admin'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. USER PROFILE POPOVER MODAL */}
      {selectedProfileUser && (
        <div className="profile-popover-overlay" onClick={() => setSelectedProfileUser(null)}>
          <div className="profile-popover-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-card-banner"></div>
            <div className="profile-card-avatar-row">
              <img src={selectedProfileUser.avatar} alt={selectedProfileUser.name} className="profile-card-avatar" />
              <span className={`profile-card-status-dot ${selectedProfileUser.status || 'offline'}`}></span>
            </div>

            <div className="profile-card-body">
              <div className="profile-card-name-section">
                <h3 className="profile-card-name">{selectedProfileUser.name}</h3>
                <span className="profile-card-email">{selectedProfileUser.email}</span>
              </div>

              {selectedProfileUser.customStatusText && (
                <p className="profile-card-bio">
                  <strong>Status:</strong> {selectedProfileUser.customStatusText}
                </p>
              )}

              <div className="profile-card-details-grid">
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Department</span>
                  <span className="profile-detail-value">{selectedProfileUser.branch || 'General'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Batch Year</span>
                  <span className="profile-detail-value">{selectedProfileUser.batch || 'Staff'}</span>
                </div>
                {selectedProfileUser.club && (
                  <div className="profile-detail-item" style={{ gridColumn: 'span 2', marginTop: '0.25rem' }}>
                    <span className="profile-detail-label">Student Club</span>
                    <span className="profile-detail-value">{selectedProfileUser.club}</span>
                  </div>
                )}
              </div>

              <div className="profile-card-roles-section">
                <span className="profile-card-roles-label">Campus Roles & Badges</span>
                <div className="profile-card-roles-list">
                  {renderUserBadges(selectedProfileUser)}
                </div>
              </div>

              <div className="profile-card-actions">
                {currentUser.id !== selectedProfileUser.id && (
                  <button 
                    className="btn-message"
                    onClick={() => {
                      handleDMSelect(selectedProfileUser.id);
                      setSelectedProfileUser(null);
                    }}
                  >
                    Send Message
                  </button>
                )}
                <button className="btn-close" onClick={() => setSelectedProfileUser(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 9. CAMPUS MOMENT DETAILS MODAL */}
      {selectedMoment && (
        <div className="moment-popover-backdrop" onClick={() => setSelectedMoment(null)}>
          <div className="moment-popover-card" onClick={(e) => e.stopPropagation()}>
            <div className="moment-popover-banner" style={{ background: selectedMoment.coverBg }}>
              <div className="moment-popover-banner-overlay"></div>
              <div className="moment-popover-banner-text">
                <span className="moment-popover-club-badge">{selectedMoment.club}</span>
                <h3 className="moment-popover-title">{selectedMoment.title}</h3>
              </div>
            </div>
            <div className="moment-popover-body">
              <p className="moment-popover-desc">{selectedMoment.description}</p>
              <div className="moment-popover-footer">
                <span>👁️ {selectedMoment.views} views this week</span>
                <button 
                  type="button"
                  className="moment-popover-close-btn" 
                  onClick={() => setSelectedMoment(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Story Viewer Overlay */}
      {activeStoryIndex !== null && (
        <div className="story-viewer-overlay">
          <div className="story-viewer-backdrop" onClick={closeStoryViewer}></div>
          <button className="story-viewer-close" onClick={closeStoryViewer}>
            <X size={24} />
          </button>
          
          <div className="story-viewer-container">
            {/* Previous button overlay area */}
            <div className="story-nav-area prev" onClick={handlePrevStoryMedia}></div>
            
            {/* Next button overlay area */}
            <div className="story-nav-area next" onClick={handleNextStoryMedia}></div>
            
            <div className="story-content" 
                 onMouseDown={() => setIsStoryPaused(true)} 
                 onMouseUp={() => setIsStoryPaused(false)}
                 onTouchStart={() => setIsStoryPaused(true)}
                 onTouchEnd={() => setIsStoryPaused(false)}
            >
              <div className="story-progress-container">
                {initialStories[activeStoryIndex].media.map((m, idx) => (
                  <div key={m.id} className="story-progress-bar-bg">
                    <div 
                      className={`story-progress-bar-fill ${idx < activeMediaIndex ? 'completed' : ''} ${idx === activeMediaIndex && !isStoryPaused ? 'active' : ''}`}
                      style={{ 
                        animationDuration: `${m.duration}ms`,
                        animationPlayState: isStoryPaused ? 'paused' : 'running'
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              
              <div className="story-header">
                <div className="story-header-left">
                  {initialStories[activeStoryIndex].userAvatar.startsWith('http') ? (
                    <img src={initialStories[activeStoryIndex].userAvatar} alt="" className="story-header-avatar" />
                  ) : (
                    <span className="story-header-emoji">{initialStories[activeStoryIndex].userAvatar}</span>
                  )}
                  <span className="story-header-name">{initialStories[activeStoryIndex].userName}</span>
                  <span className="story-header-time">{initialStories[activeStoryIndex].media[activeMediaIndex].timestamp}</span>
                </div>
              </div>

              <img 
                src={initialStories[activeStoryIndex].media[activeMediaIndex].url} 
                alt="Story content" 
                className="story-media" 
              />
              
              <div className="story-footer">
                <div className="story-reply-container">
                  <input type="text" placeholder={`Reply to ${initialStories[activeStoryIndex].userName}...`} className="story-reply-input" />
                </div>
                <button className="story-action-btn"><Heart size={24} /></button>
                <button className="story-action-btn"><Send size={24} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainAppLayout;
