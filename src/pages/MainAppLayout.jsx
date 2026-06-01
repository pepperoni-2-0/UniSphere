import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
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
  CornerDownRight
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
    sendThreadReply
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('Home'); // Home, Announcements, Events, Placements, Communities, Messages, Profile, Settings, Channel
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelCategory, setNewChannelCategory] = useState('Academic');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  
  // Message composing state
  const [chatInput, setChatInput] = useState('');
  
  // Thread input state
  const [threadInput, setThreadInput] = useState('');
  
  // Feed publisher state
  const [feedInput, setFeedInput] = useState('');

  // Search filter
  const [dashboardSearch, setDashboardSearch] = useState('');

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

  // Publish Campus Feed Update
  const handlePublishFeed = (e) => {
    e.preventDefault();
    if (!feedInput.trim()) return;

    const newFeedPost = {
      id: `feed_${Date.now()}`,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role === 'student' ? 'Student' : currentUser.role === 'faculty' ? 'Faculty' : 'Admin',
      userTag: currentUser.role === 'student' ? `${currentUser.branch || 'CSE'} '${currentUser.batch || '26'}` : currentUser.branch || 'Faculty',
      time: 'Just now',
      content: feedInput,
      likes: 0,
      comments: 0,
      hasLiked: false
    };

    setActivityFeed(prev => [newFeedPost, ...prev]);
    setFeedInput('');
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="7" r="4.5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
            <circle cx="6" cy="16" r="4.5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
            <circle cx="18" cy="16" r="4.5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
            <line x1="12" y1="11.5" x2="8.5" y2="13.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="11.5" x2="15.5" y2="13.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
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
              style={{ background: ws.logoBg }}
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
        <div className="sidebar-header">
          <h2 className="college-title">{currentWorkspace?.name}</h2>
          <span className="college-sub">{currentUser?.role === 'admin' ? 'Admin Access' : currentUser?.role === 'faculty' ? 'Faculty Portal' : 'Student Hub'}</span>
        </div>

        {/* Global Hub Navigation Tabs */}
        <div className="nav-tabs-group">
          <button className={`nav-tab-link ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => setActiveTab('Home')}>
            <Home size={16} className="nav-tab-icon" />
            <span>Home</span>
          </button>
          <button className={`nav-tab-link ${activeTab === 'Announcements' ? 'active' : ''}`} onClick={() => setActiveTab('Announcements')}>
            <Megaphone size={16} className="nav-tab-icon" />
            <span>Announcements</span>
          </button>
          <button className={`nav-tab-link ${activeTab === 'Events' ? 'active' : ''}`} onClick={() => setActiveTab('Events')}>
            <Calendar size={16} className="nav-tab-icon" />
            <span>Events</span>
          </button>
          <button className={`nav-tab-link ${activeTab === 'Placements' ? 'active' : ''}`} onClick={() => setActiveTab('Placements')}>
            <Briefcase size={16} className="nav-tab-icon" />
            <span>Placements</span>
          </button>
          <button className={`nav-tab-link ${activeTab === 'Communities' ? 'active' : ''}`} onClick={() => setActiveTab('Communities')}>
            <Users size={16} className="nav-tab-icon" />
            <span>Communities</span>
          </button>
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

        {/* User profile capsule at sidebar bottom */}
        <div className="sidebar-user-footer">
          <img src={currentUser?.avatar} alt={currentUser?.name} className="user-footer-avatar" />
          <div className="user-footer-info">
            <span className="user-footer-name">{currentUser?.name}</span>
            <span className="user-footer-status">● {currentUser?.customStatusText || 'Online'}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER (MIDDLE COLUMN) */}
      <div className="main-content-column">
        
        {/* Dynamic Header */}
        <div className="content-nav-header">
          <div className="header-left">
            <span className="view-title-breadcrumb">NST Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <span className="view-title-active">{activeTab === 'Channel' ? `#${activeChannel?.name}` : activeTab}</span>
          </div>
          <div className="header-search">
            <Search size={16} className="search-box-icon" />
            <input 
              type="text" 
              placeholder="Search announcements, events, feeds..." 
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
              className="search-box-input"
            />
          </div>
        </div>

        {/* Dynamic body switches between Home Dashboard and specific list/chat views */}
        <div className="content-scrollable-body">
          
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
                    return (
                      <div key={msg.id} className="chat-message-row">
                        <img src={msgUser.avatar} alt={msgUser.name} className="chat-msg-avatar" />
                        <div className="chat-msg-body">
                          <div className="chat-msg-header">
                            <span className="chat-msg-author">{msgUser.name}</span>
                            <span className="chat-msg-role-badge">{msgUser.role}</span>
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
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Composer */}
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
            </div>
          )}

        </div>
      </div>

      {/* 4. QUICK GLANCE SIDEBAR (RIGHT COLUMN) */}
      <div className="right-quick-glance-panel">
        
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

        {/* Recent DMs / Direct Chats */}
        <div className="quick-glance-section">
          <div className="section-title-row">
            <MessageSquare size={16} className="glance-title-icon" />
            <span className="glance-title-text">Recent DMs</span>
          </div>
          <div className="glance-dms-list">
            {users.filter(u => u.id !== currentUser.id).slice(0, 3).map(u => (
              <button 
                key={u.id} 
                onClick={() => handleDMSelect(u.id)}
                className="glance-dm-item-row"
              >
                <div className="avatar-status-wrapper">
                  <img src={u.avatar} alt={u.name} className="glance-dm-avatar" />
                  <span className={`status-indicator-dot ${u.status}`}></span>
                </div>
                <div className="glance-dm-details">
                  <span className="glance-dm-name">{u.name}</span>
                  <span className="glance-dm-desc">{u.customStatusText || u.branch || 'Offline'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Channels */}
        <div className="quick-glance-section">
          <div className="section-title-row">
            <TrendingUp size={16} className="glance-title-icon" />
            <span className="glance-title-text">Trending Channels</span>
          </div>
          <div className="trending-channels-list">
            {trending.map(tr => (
              <div key={tr.id} className="trending-channel-row">
                <div className="tr-chan-left">
                  <Hash size={14} className="tr-hash" />
                  <span className="tr-name">{tr.name}</span>
                </div>
                <span className="tr-count">{tr.count} active</span>
              </div>
            ))}
          </div>
        </div>
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

    </div>
  );
};

export default MainAppLayout;
