import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialWorkspaces,
  initialUsers,
  initialChannels,
  initialMessages,
  initialThreadReplies,
  initialDirectMessages,
  initialAnnouncements,
  initialEvents,
  initialCommunities,
  initialActivityFeed,
  initialSchedule,
  initialDeadlines,
  initialTrending
} from "../data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Helper to load state from localStorage or fallback
  const getStored = (key, fallback) => {
    try {
      const item = localStorage.getItem(`unisphere_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.error(`Error reading localStorage for ${key}`, e);
      return fallback;
    }
  };

  // State initialization
  const [workspaces, setWorkspaces] = useState(() => getStored("workspaces", initialWorkspaces));
  const [users, setUsers] = useState(() => getStored("users", initialUsers));
  const [channels, setChannels] = useState(() => getStored("channels", initialChannels));
  const [messages, setMessages] = useState(() => getStored("messages", initialMessages));
  const [threadReplies, setThreadReplies] = useState(() => getStored("threadReplies", initialThreadReplies));
  const [directMessages, setDirectMessages] = useState(() => getStored("directMessages", initialDirectMessages));
  
  const [currentUser, setCurrentUser] = useState(() => getStored("currentUser", null));
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(() => getStored("currentWorkspaceId", "nst"));
  const [activeChannelId, setActiveChannelId] = useState(() => getStored("activeChannelId", "nst_announcements"));
  const [activeChannelType, setActiveChannelType] = useState(() => getStored("activeChannelType", "channel")); // 'channel' or 'dm'
  const [activeThreadParentId, setActiveThreadParentId] = useState(() => getStored("activeThreadParentId", null));
  const [searchQuery, setSearchQuery] = useState("");
  const [systemAccent, setSystemAccent] = useState(() => getStored("systemAccent", "emerald")); // emerald, teal, mint, steel

  // Dark/Light Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const storedTheme = localStorage.getItem("unisphere_theme");
      if (storedTheme) return JSON.parse(storedTheme);
    } catch (e) {
      console.error(e);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Sync theme class on body and storage
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    try {
      localStorage.setItem("unisphere_theme", JSON.stringify(theme));
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Dashboard & Collegiate States
  const [announcements, setAnnouncements] = useState(() => getStored("announcements", initialAnnouncements));
  const [events, setEvents] = useState(() => getStored("events", initialEvents));
  const [communities, setCommunities] = useState(() => getStored("communities", initialCommunities));
  const [activityFeed, setActivityFeed] = useState(() => getStored("activityFeed", initialActivityFeed));
  const [schedule, setSchedule] = useState(() => getStored("schedule", initialSchedule));
  const [deadlines, setDeadlines] = useState(() => getStored("deadlines", initialDeadlines));
  const [trending, setTrending] = useState(() => getStored("trending", initialTrending));

  // Sync collegiate states to localStorage
  useEffect(() => { localStorage.setItem("unisphere_announcements", JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem("unisphere_events", JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem("unisphere_communities", JSON.stringify(communities)); }, [communities]);
  useEffect(() => { localStorage.setItem("unisphere_activityFeed", JSON.stringify(activityFeed)); }, [activityFeed]);
  useEffect(() => { localStorage.setItem("unisphere_schedule", JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem("unisphere_deadlines", JSON.stringify(deadlines)); }, [deadlines]);
  useEffect(() => { localStorage.setItem("unisphere_trending", JSON.stringify(trending)); }, [trending]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("unisphere_workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem("unisphere_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("unisphere_channels", JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem("unisphere_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("unisphere_threadReplies", JSON.stringify(threadReplies));
  }, [threadReplies]);

  useEffect(() => {
    localStorage.setItem("unisphere_directMessages", JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    localStorage.setItem("unisphere_currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("unisphere_currentWorkspaceId", JSON.stringify(currentWorkspaceId));
  }, [currentWorkspaceId]);

  useEffect(() => {
    localStorage.setItem("unisphere_activeChannelId", JSON.stringify(activeChannelId));
  }, [activeChannelId]);

  useEffect(() => {
    localStorage.setItem("unisphere_activeChannelType", JSON.stringify(activeChannelType));
  }, [activeChannelType]);

  useEffect(() => {
    localStorage.setItem("unisphere_activeThreadParentId", JSON.stringify(activeThreadParentId));
  }, [activeThreadParentId]);

  useEffect(() => {
    localStorage.setItem("unisphere_systemAccent", JSON.stringify(systemAccent));
  }, [systemAccent]);

  // Auth Handlers
  const loginUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      // Pick first workspace and channel that the user is in
      const defaultWs = user.workspaces[0] || "nst";
      setCurrentWorkspaceId(defaultWs);
      const wsChannels = channels.filter((c) => c.workspaceId === defaultWs);
      if (wsChannels.length > 0) {
        setActiveChannelId(wsChannels[0].id);
        setActiveChannelType("channel");
      }
      setActiveThreadParentId(null);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setActiveThreadParentId(null);
  };

  const onboardUser = (profileData) => {
    const newUser = {
      id: `user_${Date.now()}`,
      email: profileData.email,
      name: profileData.name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileData.name.replace(/\s+/g, "")}`,
      role: profileData.role || "student",
      branch: profileData.branch || "Unassigned",
      batch: profileData.batch || "2026",
      interests: profileData.interests || [],
      status: "online",
      customStatusText: "Just joined UniSphere!",
      workspaces: [currentWorkspaceId]
    };
    
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  // Workspace Switcher
  const switchWorkspace = (workspaceId) => {
    setCurrentWorkspaceId(workspaceId);
    // Find first channel in that workspace
    const wsChannels = channels.filter((c) => c.workspaceId === workspaceId);
    if (wsChannels.length > 0) {
      setActiveChannelId(wsChannels[0].id);
      setActiveChannelType("channel");
    } else {
      setActiveChannelId(null);
    }
    setActiveThreadParentId(null);
    setSearchQuery("");
  };

  const createWorkspace = (name, code) => {
    const shortName = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 4);

    const colors = [
      "linear-gradient(135deg, #6366f1, #3b82f6)",
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #ec4899, #8b5cf6)",
      "linear-gradient(135deg, #f59e0b, #d97706)",
      "linear-gradient(135deg, #ef4444, #b91c1c)"
    ];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    const newWorkspace = {
      id: `ws_${Date.now()}`,
      name,
      shortName,
      logoBg: randomBg,
      code: code || `WS-${Math.floor(1000 + Math.random() * 9000)}`
    };

    // Add workspace
    setWorkspaces((prev) => [...prev, newWorkspace]);

    // Create standard default channels for it
    const defaultChannels = [
      {
        id: `chan_ann_${Date.now()}`,
        workspaceId: newWorkspace.id,
        name: "announcements",
        category: "Announcements",
        description: `Official announcements for ${name}`,
        isReadOnlyForStudents: true
      },
      {
        id: `chan_gen_${Date.now()}`,
        workspaceId: newWorkspace.id,
        name: "general",
        category: "Academic",
        description: "General discussion board",
        isReadOnlyForStudents: false
      }
    ];

    setChannels((prev) => [...prev, ...defaultChannels]);

    // Join current user to the workspace
    if (currentUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, workspaces: [...u.workspaces, newWorkspace.id] }
            : u
        )
      );
      setCurrentUser((prev) => ({
        ...prev,
        workspaces: [...prev.workspaces, newWorkspace.id]
      }));
    }

    // Switch to it
    switchWorkspace(newWorkspace.id);
  };

  // Channels
  const createChannel = (name, category, description) => {
    const formattedName = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    const newChannel = {
      id: `chan_${Date.now()}`,
      workspaceId: currentWorkspaceId,
      name: formattedName,
      category: category || "Academic",
      description: description || `Welcome to #${formattedName}!`,
      isReadOnlyForStudents: category === "Announcements" || category === "Placements"
    };

    setChannels((prev) => [...prev, newChannel]);
    setActiveChannelId(newChannel.id);
    setActiveChannelType("channel");
    setActiveThreadParentId(null);
  };

  const deleteChannel = (channelId) => {
    setChannels((prev) => prev.filter((c) => c.id !== channelId));
    // Reset active channel if we deleted the current one
    if (activeChannelId === channelId) {
      const remaining = channels.filter((c) => c.workspaceId === currentWorkspaceId && c.id !== channelId);
      if (remaining.length > 0) {
        setActiveChannelId(remaining[0].id);
      } else {
        setActiveChannelId(null);
      }
    }
  };

  // Messaging (Channel and DMs)
  const sendMessage = (text, attachment = null) => {
    if (!currentUser || !activeChannelId) return;

    if (activeChannelType === "channel") {
      const newMessage = {
        id: `msg_${Date.now()}`,
        channelId: activeChannelId,
        userId: currentUser.id,
        text,
        timestamp: new Date().toISOString(),
        reactions: [],
        repliesCount: 0,
        attachment: attachment // { name, type, url }
      };

      setMessages((prev) => [...prev, newMessage]);
    } else if (activeChannelType === "dm") {
      // Find or create the DM group messages
      setDirectMessages((prev) =>
        prev.map((dm) => {
          if (dm.id === activeChannelId) {
            return {
              ...dm,
              messages: [
                ...dm.messages,
                {
                  id: `dm_msg_${Date.now()}`,
                  userId: currentUser.id,
                  text,
                  timestamp: new Date().toISOString(),
                  attachment: attachment
                }
              ]
            };
          }
          return dm;
        })
      );
    }
  };

  // Thread Replies
  const sendThreadReply = (text) => {
    if (!currentUser || !activeThreadParentId) return;

    const newReply = {
      id: `reply_${Date.now()}`,
      parentMessageId: activeThreadParentId,
      userId: currentUser.id,
      text,
      timestamp: new Date().toISOString()
    };

    setThreadReplies((prev) => [...prev, newReply]);

    // Increment repliesCount on the parent message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === activeThreadParentId
          ? { ...msg, repliesCount: (msg.repliesCount || 0) + 1 }
          : msg
      )
    );
  };

  // Emoji Reactions
  const addReaction = (messageId, emoji) => {
    if (!currentUser) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReaction = msg.reactions?.find((r) => r.emoji === emoji);

        let newReactions = [...(msg.reactions || [])];

        if (existingReaction) {
          const userIndex = existingReaction.users.indexOf(currentUser.id);
          if (userIndex > -1) {
            // User already reacted with this emoji -> toggle it off (remove reaction)
            const updatedUsers = existingReaction.users.filter((uid) => uid !== currentUser.id);
            if (updatedUsers.length === 0) {
              newReactions = newReactions.filter((r) => r.emoji !== emoji);
            } else {
              newReactions = newReactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, users: updatedUsers }
                  : r
              );
            }
          } else {
            // User has not reacted with this emoji yet -> add reaction
            newReactions = newReactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] }
                : r
            );
          }
        } else {
          // No one has reacted with this emoji yet -> create reaction
          newReactions.push({
            emoji,
            count: 1,
            users: [currentUser.id]
          });
        }

        return { ...msg, reactions: newReactions };
      })
    );
  };

  // Delete message (Admin/Faculty or message creator)
  const deleteMessage = (messageId) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    // Clear replies
    setThreadReplies((prev) => prev.filter((r) => r.parentMessageId !== messageId));
    if (activeThreadParentId === messageId) {
      setActiveThreadParentId(null);
    }
  };

  // Direct Message Switcher / Creator
  const getOrCreateDM = (targetUserId) => {
    if (!currentUser) return;

    // Check if DM thread already exists in this workspace
    const existing = directMessages.find(
      (dm) =>
        dm.workspaceId === currentWorkspaceId &&
        dm.participants.includes(currentUser.id) &&
        dm.participants.includes(targetUserId)
    );

    if (existing) {
      setActiveChannelId(existing.id);
      setActiveChannelType("dm");
      setActiveThreadParentId(null);
      return existing.id;
    } else {
      // Create new DM thread
      const newDM = {
        id: `dm_${Date.now()}`,
        workspaceId: currentWorkspaceId,
        participants: [currentUser.id, targetUserId],
        messages: []
      };

      setDirectMessages((prev) => [...prev, newDM]);
      setActiveChannelId(newDM.id);
      setActiveChannelType("dm");
      setActiveThreadParentId(null);
      return newDM.id;
    }
  };

  // Update Status
  const updateUserStatus = (status, customText = "") => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      status,
      customStatusText: customText
    };

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
  };

  // Get active workspace details
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        workspaces,
        currentWorkspace,
        currentWorkspaceId,
        channels,
        messages,
        threadReplies,
        directMessages,
        activeChannelId,
        activeChannelType,
        activeThreadParentId,
        searchQuery,
        systemAccent,
        setSearchQuery,
        setSystemAccent,
        loginUser,
        logoutUser,
        onboardUser,
        switchWorkspace,
        createWorkspace,
        createChannel,
        deleteChannel,
        sendMessage,
        sendThreadReply,
        addReaction,
        deleteMessage,
        getOrCreateDM,
        updateUserStatus,
        setActiveThreadParentId,
        setActiveChannelId,
        setActiveChannelType,
        announcements,
        setAnnouncements,
        events,
        setEvents,
        communities,
        setCommunities,
        activityFeed,
        setActivityFeed,
        schedule,
        setSchedule,
        deadlines,
        setDeadlines,
        trending,
        setTrending,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
