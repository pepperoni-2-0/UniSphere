// Mock Data for UniSphere

export const initialWorkspaces = [
  {
    id: "nst",
    name: "Newton School of Technology",
    shortName: "NST",
    logoBg: "linear-gradient(135deg, #10b981, #0f172a)",
    code: "NST-2026"
  },
  {
    id: "iitd",
    name: "IIT Delhi",
    shortName: "IITD",
    logoBg: "linear-gradient(135deg, #14b8a6, #090d16)",
    code: "IITD-MAIN"
  },
  {
    id: "bits",
    name: "BITS Pilani",
    shortName: "BITS",
    logoBg: "linear-gradient(135deg, #059669, #0f172a)",
    code: "BITS-PILA"
  }
];

export const initialUsers = [
  {
    id: "user_rahul",
    email: "rahul@nst.edu",
    name: "Rahul Sharma",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul",
    role: "student", // student, faculty, admin
    branch: "Computer Science & Engineering",
    batch: "2026",
    interests: ["Coding", "Robotics", "Web3", "Hackathons"],
    status: "online", // online, away, dnd, offline
    customStatusText: "Coding in progress...",
    workspaces: ["nst", "bits"]
  },
  {
    id: "user_priya",
    email: "priya@nst.edu",
    name: "Priya Patel",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    role: "student",
    branch: "Artificial Intelligence & Machine Learning",
    batch: "2027",
    interests: ["AI/ML", "Design", "Music", "Reading"],
    status: "online",
    customStatusText: "Analyzing datasets",
    workspaces: ["nst"]
  },
  {
    id: "user_prasad",
    email: "dr.prasad@nst.edu",
    name: "Dr. A. K. Prasad",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Dr+Prasad",
    role: "faculty",
    branch: "Computer Science",
    batch: "Faculty Core",
    interests: ["Algorithms", "Machine Learning", "Research"],
    status: "dnd",
    customStatusText: "In a lecture, DND",
    workspaces: ["nst", "iitd"]
  },
  {
    id: "user_admin",
    email: "admin@nst.edu",
    name: "NST Admin Portal",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=NSTAdmin",
    role: "admin",
    branch: "Administration",
    batch: "Staff",
    interests: ["Operations", "Events", "Moderation"],
    status: "online",
    customStatusText: "UniSphere Moderator",
    workspaces: ["nst", "iitd", "bits"]
  }
];

export const initialChannels = [
  // NST Channels
  {
    id: "nst_announcements",
    workspaceId: "nst",
    name: "announcements",
    category: "Announcements",
    description: "Official campus news, system notifications, and admin alerts.",
    isReadOnlyForStudents: true
  },
  {
    id: "nst_placement_cell",
    workspaceId: "nst",
    name: "placement-cell",
    category: "Placements",
    description: "Job drives, internship openings, interview guides, and resumes reviews.",
    isReadOnlyForStudents: true
  },
  {
    id: "nst_cse_2026",
    workspaceId: "nst",
    name: "cse-2026",
    category: "Batch/Branch",
    description: "Official channel for CSE students of Batch 2026.",
    isReadOnlyForStudents: false
  },
  {
    id: "nst_aiml_2027",
    workspaceId: "nst",
    name: "aiml-2027",
    category: "Batch/Branch",
    description: "Official channel for AI & ML students of Batch 2027.",
    isReadOnlyForStudents: false
  },
  {
    id: "nst_club_devs",
    workspaceId: "nst",
    name: "club-devs",
    category: "Clubs",
    description: "NST Developers Club. Projects, hackathons, and web dev discussions.",
    isReadOnlyForStudents: false
  },
  {
    id: "nst_club_robotics",
    workspaceId: "nst",
    name: "club-robotics",
    category: "Clubs",
    description: "Hardware hacking, Arduino projects, and drone builders.",
    isReadOnlyForStudents: false
  },
  {
    id: "nst_ds_algorithms",
    workspaceId: "nst",
    name: "ds-and-algorithms",
    category: "Academic",
    description: "Curriculum channel for CSE-202 Data Structures & Algorithms.",
    isReadOnlyForStudents: false
  },
  {
    id: "nst_web_dev",
    workspaceId: "nst",
    name: "web-development",
    category: "Academic",
    description: "Full stack engineering discussions, React help, and node queries.",
    isReadOnlyForStudents: false
  },

  // IIT Delhi Channels
  {
    id: "iitd_announcements",
    workspaceId: "iitd",
    name: "announcements",
    category: "Announcements",
    description: "IIT Delhi Official Announcements.",
    isReadOnlyForStudents: true
  },
  {
    id: "iitd_general",
    workspaceId: "iitd",
    name: "iitd-general",
    category: "Batch/Branch",
    description: "General campus-wide chat for IIT Delhi students.",
    isReadOnlyForStudents: false
  },

  // BITS Pilani Channels
  {
    id: "bits_announcements",
    workspaceId: "bits",
    name: "announcements",
    category: "Announcements",
    description: "BITS Pilani General Announcements.",
    isReadOnlyForStudents: true
  },
  {
    id: "bits_general",
    workspaceId: "bits",
    name: "bits-general",
    category: "Batch/Branch",
    description: "General discussions for BITSians.",
    isReadOnlyForStudents: false
  }
];

export const initialMessages = [
  {
    id: "msg_nst_welcome",
    channelId: "nst_announcements",
    userId: "user_admin",
    text: "Welcome to UniSphere, the official digital workspace for Newton School of Technology! Use this platform to connect with peers, coordinate with faculty, check placement updates, and manage student clubs. Get started by updating your status or saying hi in your batch channels!",
    timestamp: "2026-05-29T10:00:00Z",
    reactions: [
      { emoji: "🚀", count: 12, users: ["user_rahul", "user_priya"] },
      { emoji: "👋", count: 8, users: ["user_rahul"] }
    ],
    repliesCount: 0
  },
  {
    id: "msg_nst_placement_1",
    channelId: "nst_placement_cell",
    userId: "user_admin",
    text: "📢 **PLACEMENT DRIVE ALERT** 📢\nGoogle is hiring Summer Interns (2027 batch) for Software Engineering. \n- **Stipend:** Competitive\n- **Eligibility:** CSE, AI & ML, Data Science students with CGPA > 8.0\n- **Deadline:** June 5, 2026\nApply on the UniSphere Placement Portal using the link: https://careers.google.com/internships",
    timestamp: "2026-05-29T11:30:00Z",
    reactions: [
      { emoji: "🔥", count: 15, users: ["user_rahul", "user_priya"] },
      { emoji: "❤️", count: 9, users: ["user_priya"] }
    ],
    repliesCount: 2
  },
  {
    id: "msg_nst_dsa_1",
    channelId: "nst_ds_algorithms",
    userId: "user_rahul",
    text: "Hey everyone! Does anyone have a clear explanation of when to use Floyd-Warshall vs Dijkstra? I'm getting a bit confused with negative weights.",
    timestamp: "2026-05-29T14:15:00Z",
    reactions: [
      { emoji: "👍", count: 3, users: ["user_priya"] }
    ],
    repliesCount: 3
  },
  {
    id: "msg_nst_clubdev_1",
    channelId: "nst_club_devs",
    userId: "user_prasad",
    text: "Hi Developers! We will be hosting the NST Summer Hackathon on June 10th. Start forming teams of up to 4 members. Students from other branches are also welcome to join as designers or business developers.",
    timestamp: "2026-05-29T15:00:00Z",
    reactions: [
      { emoji: "🎉", count: 7, users: ["user_rahul"] },
      { emoji: "🚀", count: 5, users: ["user_priya"] }
    ],
    repliesCount: 0
  }
];

export const initialThreadReplies = [
  // Replies for Google placement announcement
  {
    id: "reply_placement_1",
    parentMessageId: "msg_nst_placement_1",
    userId: "user_rahul",
    text: "Is there any coding round prep material available from previous batches?",
    timestamp: "2026-05-29T11:45:00Z"
  },
  {
    id: "reply_placement_2",
    parentMessageId: "msg_nst_placement_1",
    userId: "user_admin",
    text: "Yes Rahul, check the pinned resources in #placement-cell or contact the Career Cell desk in Block C.",
    timestamp: "2026-05-29T12:00:00Z"
  },

  // Replies for DSA question
  {
    id: "reply_dsa_1",
    parentMessageId: "msg_nst_dsa_1",
    userId: "user_priya",
    text: "Use Dijkstra when you have a single source and **no negative edge weights**. It's much faster: O((V + E) log V). Floyd-Warshall is All-Pairs shortest path, and can handle negative weights (as long as there are no negative cycles), but it is O(V^3).",
    timestamp: "2026-05-29T14:22:00Z"
  },
  {
    id: "reply_dsa_2",
    parentMessageId: "msg_nst_dsa_1",
    userId: "user_prasad",
    text: "Excellent explanation, Priya! Just to add: if there are negative cycles, Floyd-Warshall will detect them (diagonal elements of the distance matrix become negative). Dijkstra will simply fail or loop infinitely depending on implementation.",
    timestamp: "2026-05-29T14:40:00Z"
  },
  {
    id: "reply_dsa_3",
    parentMessageId: "msg_nst_dsa_1",
    userId: "user_rahul",
    text: "Ah, got it! That makes sense now. Thanks Priya and Dr. Prasad! 🙏",
    timestamp: "2026-05-29T14:48:00Z"
  }
];

export const initialDirectMessages = [
  {
    id: "dm_group_nst_rahul_priya",
    workspaceId: "nst",
    participants: ["user_rahul", "user_priya"],
    messages: [
      {
        id: "dm_1",
        userId: "user_rahul",
        text: "Hey Priya, are we teaming up for the NST Summer Hackathon?",
        timestamp: "2026-05-29T16:00:00Z"
      },
      {
        id: "dm_2",
        userId: "user_priya",
        text: "Hey Rahul! Yes, absolutely. I was hoping we could build something around campus navigation or classroom booking.",
        timestamp: "2026-05-29T16:05:00Z"
      },
      {
        id: "dm_3",
        userId: "user_rahul",
        text: "That sounds awesome. I'll setup a GitHub repo and we can brainstorm features tonight.",
        timestamp: "2026-05-29T16:10:00Z"
      }
    ]
  },
  {
    id: "dm_group_nst_rahul_prasad",
    workspaceId: "nst",
    participants: ["user_rahul", "user_prasad"],
    messages: [
      {
        id: "dm_faculty_1",
        userId: "user_rahul",
        text: "Good afternoon Professor, I wanted to ask if you had some time tomorrow to review my research project proposal on Graph Neural Networks?",
        timestamp: "2026-05-29T15:30:00Z"
      },
      {
        id: "dm_faculty_2",
        userId: "user_prasad",
        text: "Hello Rahul. Yes, I can meet you in my cabin between 2:00 PM and 3:00 PM tomorrow. Please bring a printed draft.",
        timestamp: "2026-05-29T15:55:00Z"
      }
    ]
  }
];
