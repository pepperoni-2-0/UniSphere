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

export const ROLE_REGISTRY = {
  platform_admin: {
    id: "platform_admin",
    name: "UniSphere Administrator",
    level: 110,
    colorClass: "role-platform-admin",
    badgeLabel: "Platform Admin",
    description: "Global platform operator with root access.",
    permissions: ["post_announcements", "manage_discussions", "pin_messages", "manage_channels", "manage_roles"]
  },
  platform_support: {
    id: "platform_support",
    name: "Platform Support",
    level: 105,
    colorClass: "role-platform-support",
    badgeLabel: "Support",
    description: "Global helpdesk support staff.",
    permissions: ["manage_discussions"]
  },
  inst_admin: {
    id: "inst_admin",
    name: "Institution Administrator",
    level: 100,
    colorClass: "role-inst-admin",
    badgeLabel: "Inst Admin",
    description: "Full administrative access to all campus resources, roles, and settings.",
    permissions: ["post_announcements", "manage_discussions", "pin_messages", "manage_channels", "manage_roles"]
  },
  campus_director: {
    id: "campus_director",
    name: "Campus Director",
    level: 95,
    colorClass: "role-campus-director",
    badgeLabel: "Director",
    description: "Senior campus leadership. Oversees institutional operations.",
    permissions: ["post_announcements", "manage_discussions", "pin_messages", "manage_channels"]
  },
  academic_coordinator: {
    id: "academic_coordinator",
    name: "Academic Coordinator",
    level: 90,
    colorClass: "role-academic-coord",
    badgeLabel: "Coordinator",
    description: "Curriculum oversight and department coordination.",
    permissions: ["post_announcements", "manage_discussions", "pin_messages", "manage_channels"]
  },
  professor: {
    id: "professor",
    name: "Professor",
    level: 85,
    colorClass: "role-professor",
    badgeLabel: "Professor",
    description: "Tenured or adjunct teaching staff leading courses.",
    permissions: ["post_announcements", "manage_discussions", "pin_messages"]
  },
  faculty: {
    id: "faculty",
    name: "Faculty Member",
    level: 80,
    colorClass: "role-faculty",
    badgeLabel: "Faculty",
    description: "Academic faculty, teachers, and lecturers.",
    permissions: ["post_announcements", "manage_discussions", "pin_messages"]
  },
  ta: {
    id: "ta",
    name: "Teaching Assistant",
    level: 50,
    colorClass: "role-ta",
    badgeLabel: "TA",
    description: "Graduate or upperclassman assistant supporting discussions and grading.",
    permissions: ["manage_discussions", "pin_messages"]
  },
  club_president: {
    id: "club_president",
    name: "Club President",
    level: 45,
    colorClass: "role-club-lead",
    badgeLabel: "Club Lead",
    description: "Elected student lead for campus clubs and organisations.",
    permissions: ["manage_channels"]
  },
  club_core: {
    id: "club_core",
    name: "Club Core Team",
    level: 40,
    colorClass: "role-club-lead",
    badgeLabel: "Club Core",
    description: "Executive committee members of student clubs.",
    permissions: []
  },
  placement_coordinator: {
    id: "placement_coordinator",
    name: "Placement Coordinator",
    level: 42,
    colorClass: "role-placement-coord",
    badgeLabel: "Placement Coord",
    description: "Student representative coordinating corporate recruitment.",
    permissions: ["post_announcements"]
  },
  event_coordinator: {
    id: "event_coordinator",
    name: "Event Coordinator",
    level: 35,
    colorClass: "role-club-lead",
    badgeLabel: "Events Coord",
    description: "Organises student events, hackathons, and guest lectures.",
    permissions: []
  },
  student: {
    id: "student",
    name: "Student",
    level: 10,
    colorClass: "role-student",
    badgeLabel: "Student",
    description: "Enrolled university student.",
    permissions: []
  },
  alumni: {
    id: "alumni",
    name: "Alumni",
    level: 12,
    colorClass: "role-alumni",
    badgeLabel: "Alumni",
    description: "Graduated alumni supporting networking and recruitment.",
    permissions: []
  },
  prospective: {
    id: "prospective",
    name: "Prospective Student",
    level: 5,
    colorClass: "role-student",
    badgeLabel: "Prospective",
    description: "Visiting student inquiring about programs and admissions.",
    permissions: []
  }
};

export const initialUsers = [
  {
    id: "user_rahul",
    email: "rahul@nst.edu",
    name: "Rahul Sharma",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul",
    role: "student",
    roleIds: ["student", "club_president"],
    branch: "Computer Science & Engineering",
    batch: "2026",
    interests: ["Coding", "Robotics", "Web3", "Hackathons"],
    status: "online",
    customStatusText: "Coding in progress...",
    workspaces: ["nst", "bits"],
    club: "Developers Club"
  },
  {
    id: "user_priya",
    email: "priya@nst.edu",
    name: "Priya Patel",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    role: "student",
    roleIds: ["student", "placement_coordinator"],
    branch: "Artificial Intelligence & Machine Learning",
    batch: "2027",
    interests: ["AI/ML", "Design", "Music", "Reading"],
    status: "online",
    customStatusText: "Analyzing datasets",
    workspaces: ["nst"],
    club: "Competitive Programming Hub"
  },
  {
    id: "user_prasad",
    email: "dr.prasad@nst.edu",
    name: "Dr. A. K. Prasad",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Dr+Prasad",
    role: "faculty",
    roleIds: ["professor", "faculty", "academic_coordinator"],
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
    roleIds: ["inst_admin"],
    branch: "Administration",
    batch: "Staff",
    interests: ["Operations", "Events", "Moderation"],
    status: "online",
    customStatusText: "UniSphere Coordinator",
    workspaces: ["nst", "iitd", "bits"]
  },
  {
    id: "user_aarav",
    email: "aarav@nst.edu",
    name: "Aarav Mehta",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    role: "student",
    roleIds: ["student", "ta"],
    branch: "Computer Science & Engineering",
    batch: "2026",
    interests: ["Data Structures", "Open Source", "Teaching"],
    status: "online",
    customStatusText: "Grading lab assignments",
    workspaces: ["nst"],
    club: "Developers Club"
  },
  {
    id: "user_vikram",
    email: "vikram@alumni.edu",
    name: "Vikram Malhotra",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Vikram",
    role: "student",
    roleIds: ["alumni"],
    branch: "Computer Science & Engineering",
    batch: "2024",
    interests: ["Software Engineering", "Mentorship", "Startups"],
    status: "offline",
    customStatusText: "SDE at Microsoft",
    workspaces: ["nst"]
  },
  {
    id: "user_director",
    email: "director@nst.edu",
    name: "Dr. Sandeep Verma",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sandeep+Verma",
    role: "faculty",
    roleIds: ["campus_director", "faculty"],
    branch: "Executive Office",
    batch: "Staff",
    interests: ["Policy", "Funding", "Education Innovation"],
    status: "away",
    customStatusText: "Meeting with board",
    workspaces: ["nst"]
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

export const initialAnnouncements = [
  {
    id: "ann_1",
    title: "Mid-Semester Examination Schedule Released",
    sender: "Dean Academics Office",
    role: "Admin",
    date: "2026-06-01",
    tag: "Academics",
    content: "The mid-semester examination timetable for all UG and PG programs has been officially uploaded. Exams will commence from June 15, 2026. Please check the student portal for detailed slot mappings and seating arrangements. Reach out to the Controller of Examinations for any clash reports."
  },
  {
    id: "ann_2",
    title: "NST Summer Hackathon 2026 Registrations Open",
    sender: "NST Developers Club",
    role: "Club Lead",
    date: "2026-06-01",
    tag: "Events",
    content: "Registrations are now open for the annual NST Summer Hackathon happening on June 10th! Solve real-world campus problems and win exciting cash prizes up to $2,500. Form teams of 2-4. Registrations close on June 8th at 11:59 PM."
  },
  {
    id: "ann_3",
    title: "Placement Workshop: Technical Resume & Portfolio Reviews",
    sender: "Career Cell Desk",
    role: "Placement Admin",
    date: "2026-05-31",
    tag: "Placements",
    content: "Join us this Friday at 3:00 PM in Seminar Hall 2 for a comprehensive resume writing and GitHub portfolio review workshop. Dr. Prasad and senior placement mentors will be sharing feedback. Mandatory for CSE and AIML students eligible for Summer 2027 internships."
  }
];

export const initialEvents = [
  {
    id: "evt_1",
    title: "ICPC Preparation & Advanced Graphs Session",
    organizer: "Competitive Programming Hub",
    date: "June 3, 2026",
    time: "4:00 PM - 6:00 PM",
    location: "Lab Room 402",
    tag: "Coding",
    rsvps: 45,
    joined: false
  },
  {
    id: "evt_2",
    title: "Hands-on Arduino & Sensor Calibration Workshop",
    organizer: "Robotics & Hardware Club",
    date: "June 5, 2026",
    time: "2:00 PM - 5:00 PM",
    location: "Makerspace Hall A",
    tag: "Hardware",
    rsvps: 28,
    joined: false
  },
  {
    id: "evt_3",
    title: "Collegiate Career Fair & Networking Summit",
    organizer: "Career Services & Placements",
    date: "June 8, 2026",
    time: "10:00 AM - 4:00 PM",
    location: "Main Exhibition Arena",
    tag: "Careers",
    rsvps: 180,
    joined: true
  }
];

export const initialCommunities = [
  {
    id: "comm_1",
    name: "Robotics & Hardware Club",
    description: "Designing autonomous UAVs, IoT sensors, and micro-controlled nodes.",
    members: 142,
    activity: "9+ updates today",
    avatar: "🤖"
  },
  {
    id: "comm_2",
    name: "Google Developer Student Clubs (GDSC)",
    description: "Official developer chapter on campus. Workshops, cloud studies, and solutions.",
    members: 318,
    activity: "4+ updates today",
    avatar: "⚡"
  },
  {
    id: "comm_3",
    name: "Competitive Programming Hub",
    description: "Weekly contests, DSA walkthroughs, and code optimizations.",
    members: 195,
    activity: "15+ updates today",
    avatar: "📈"
  }
];

export const initialActivityFeed = [
  {
    id: "feed_1",
    userName: "Priya Patel",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    userRole: "Student",
    userTag: "AIML '27",
    time: "2 hours ago",
    content: "Just finished implementing a custom Graph Convolutional Network (GCN) for class recommendation. The accuracy on the college course dataset hit 84%! Huge thanks to Dr. Prasad for steering me away from over-parameterized layers. 🚀",
    likes: 24,
    comments: 6,
    hasLiked: false
  },
  {
    id: "feed_2",
    userName: "Dr. A. K. Prasad",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Dr+Prasad",
    userRole: "Faculty",
    userTag: "Professor",
    time: "5 hours ago",
    content: "Reminder to all students enrolled in CSE-202 (Data Structures & Algorithms): Your mid-term assignments must be committed to your university GitHub repositories by tomorrow night. Ensure your tests pass, and do not copy-paste code. We run automated plagiarism checkers.",
    likes: 38,
    comments: 11,
    hasLiked: false
  },
  {
    id: "feed_3",
    userName: "Newton School Developers Club",
    userAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=NSTAdmin",
    userRole: "Club",
    userTag: "Clubs",
    time: "1 day ago",
    content: "Congrats to our student team for securing 3rd place in the National Smart India Hackathon! They built a decentralized ledger tool to verify academic transcripts in under 3 seconds. Check out their demo at our next dev show-and-tell this Thursday.",
    likes: 52,
    comments: 4,
    hasLiked: true
  }
];

export const initialSchedule = [
  { id: "sch_1", time: "09:30 AM", title: "Artificial Intelligence & Logic", subtitle: "Lec - Dr. Prasad", room: "Room 301" },
  { id: "sch_2", time: "11:00 AM", title: "Data Structures & Algorithms Lab", subtitle: "Lab - Room 402", room: "Lab A" },
  { id: "sch_3", time: "02:30 PM", title: "Robotics Club Project Sync", subtitle: "Club meeting", room: "Makerspace" }
];

export const initialDeadlines = [
  { id: "dead_1", title: "DBMS Assignment 2", course: "Database Systems", due: "In 2 days", severity: "high" },
  { id: "dead_2", title: "GNN Project Draft", course: "AI/ML Elective", due: "In 4 days", severity: "medium" },
  { id: "dead_3", title: "Hackathon Registration", course: "NST Club Devs", due: "In 6 days", severity: "low" }
];

export const initialTrending = [
  { id: "tr_1", name: "hackathon-2026", count: 86 },
  { id: "tr_2", name: "dsa-questions", count: 54 },
  { id: "tr_3", name: "placement-cell", count: 49 },
  { id: "tr_4", name: "memes", count: 32 }
];

export const initialMoments = [
  {
    id: "moment_robotics",
    title: "Robotics Club",
    club: "Robotics Club",
    avatar: "🤖",
    coverBg: "linear-gradient(135deg, #1e293b, #0f172a)",
    description: "Sneak peek into our new autonomous UAV drone test flights! Team calibrating LIDAR sensors in the courtyard. Recruitment interviews start Monday at 4 PM in Makerspace.",
    views: 124
  },
  {
    id: "moment_gdsc",
    title: "GDSC Chapter",
    club: "GDSC Chapter",
    avatar: "⚡",
    coverBg: "linear-gradient(135deg, #0284c7, #075985)",
    description: "Reliving highlights from yesterday's Android Compose workshop. Over 120+ attendees built their first reactive UI. Resource slide deck uploaded in #web-development channel!",
    views: 245
  },
  {
    id: "moment_career",
    title: "Placement Cell",
    club: "Placement Desk",
    avatar: "💼",
    coverBg: "linear-gradient(135deg, #581c87, #3b0764)",
    description: "Official statistics snapshot for the 2026 graduating batch! BITS, NST, and IIT Delhi workspaces are reporting a combined 88% placement achievement with 14 active corporate drives this week.",
    views: 412
  },
  {
    id: "moment_fest",
    title: "NST Fest 2026",
    club: "Cultural Cell",
    avatar: "🎉",
    coverBg: "linear-gradient(135deg, #b45309, #78350f)",
    description: "NST Summer Fest teaser is officially out! 3 days of hackathons, music concerts, and tech debates. Guest speaker registrations opening on the portal tonight.",
    views: 386
  },
  {
    id: "moment_spotlight",
    title: "Student Spotlight",
    club: "Student Council",
    avatar: "🌟",
    coverBg: "linear-gradient(135deg, #065f46, #022c22)",
    description: "Student Spotlight of the week: Priya Patel! Securing an AI Research fellowship at Google Labs. Read her interview on resume building and GitHub portfolio review on the Placement Cell tab.",
    views: 198
  }
];

export const initialFeedPosts = [
  {
    id: "feed_post_1",
    userId: "user_rahul",
    userName: "Rahul Sharma",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul",
    userRoleIds: ["student", "club_president"],
    department: "Computer Science & Engineering",
    time: "2 hours ago",
    content: "Qualified for ICPC Regionals! We ranked 7th overall in the preliminary rounds. Big thanks to Aarav and Priya for debugging tree-partitioning optimizations under intense pressure. CP Hub solutions draft is on my GitHub. #ICPC2026 #algorithms",
    type: "achievement",
    image: null,
    likes: 42,
    commentsCount: 2,
    shares: 12,
    hasLiked: false,
    hasSaved: false,
    comments: [
      {
        id: "c_1",
        userName: "Dr. A. K. Prasad",
        userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Dr+Prasad",
        text: "Exceptional work, Rahul! Your tree-decomposition optimization saved crucial milliseconds. Keep this focus for the regionals.",
        time: "1 hour ago"
      },
      {
        id: "c_2",
        userName: "Aarav Mehta",
        userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
        text: "Dijkstra optimization under pressure! Proud of our team. Let's practice bipartite matching next.",
        time: "45 mins ago"
      }
    ]
  },
  {
    id: "feed_post_2",
    userId: "user_admin",
    userName: "Google DSC NST",
    userAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=NSTAdmin",
    userRoleIds: ["inst_admin"],
    department: "Campus Chapter",
    time: "4 hours ago",
    content: "registrations are officially open for HackSprint 2026! 36 hours of hacking, building, and free pizza. Open to all students, teams of 2-4. Link in bio to apply! #HackSprint #hackathon",
    type: "event",
    image: null,
    likes: 78,
    commentsCount: 1,
    shares: 24,
    hasLiked: true,
    hasSaved: false,
    comments: [
      {
        id: "c_3",
        userName: "Priya Patel",
        userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
        text: "Teaming up with Rahul for campus navigation booking app. Excited!",
        time: "3 hours ago"
      }
    ]
  },
  {
    id: "feed_post_3",
    userId: "user_aarav",
    userName: "Aarav Mehta",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    userRoleIds: ["student", "ta"],
    department: "Computer Science & Engineering",
    time: "6 hours ago",
    content: "calibrated the drone evasion sensors in the courtyard today! evasion logic uses a custom tree-partitioning algorithm. check the clip below! robotics club recruitment starts next week - if you're into firmware or drones, come say hi in the makerspace. #robotics #drone #diy",
    type: "club",
    image: "/assets/robotics_drone.png",
    likes: 29,
    commentsCount: 1,
    shares: 4,
    hasLiked: false,
    hasSaved: false,
    comments: [
      {
        id: "c_4",
        userName: "Rahul Sharma",
        userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul",
        text: "High recommendation! The makerspace labs have incredible testing gear.",
        time: "5 hours ago"
      }
    ]
  },
  {
    id: "feed_post_4",
    userId: "user_neha",
    userName: "Neha Kapoor",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Neha",
    userRoleIds: ["student"],
    department: "Electronics & Communication",
    time: "1 day ago",
    content: "spent the last 6 hours trying to optimize indexing schemas with B+ Trees for Prasad's DBMS lab. my localhost database is crying. anyone else working on this tonight? study session in the library? #csestudent #dbms #help",
    type: "faculty",
    image: null,
    likes: 38,
    commentsCount: 1,
    shares: 2,
    hasLiked: false,
    hasSaved: false,
    comments: [
      {
        id: "c_5",
        userName: "Aarav Mehta",
        userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
        text: "I will host a schema design workshop in lab room 402 this Friday to help with indexing guidelines.",
        time: "20 hours ago"
      }
    ]
  },
  {
    id: "feed_post_5",
    userId: "user_priya",
    userName: "Priya Patel",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    userRoleIds: ["student", "placement_coordinator"],
    department: "Placement Cell",
    time: "1 day ago",
    content: "Google software engineering intern applications are finally live. CGPA cut-off is 8.0. I'll be in the placement cell coordinator room tomorrow if anyone needs resume reviews or mock link prep. Good luck everyone! #google #internship #careers",
    type: "placement",
    image: null,
    likes: 84,
    commentsCount: 0,
    shares: 31,
    hasLiked: false,
    hasSaved: true,
    comments: []
  },
  {
    id: "feed_post_6",
    userId: "user_cultural",
    userName: "Cultural NST",
    userAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=NSTCulture",
    userRoleIds: ["student", "club_president"],
    department: "Cultural Cell",
    time: "1 hour ago",
    content: "sound checks are done and the stage is set! NST Summer Fest kicks off tonight at 7:00 PM on the main lawn. electronic set tonight is going to be insane. tag your group! #NSTFest #campuslife #livemusic",
    type: "social",
    image: "/assets/campus_festival.png",
    likes: 152,
    commentsCount: 0,
    shares: 54,
    hasLiked: false,
    hasSaved: false,
    comments: []
  },
  {
    id: "feed_post_7",
    userId: "user_memecell",
    userName: "Dev Club Memes",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Meme",
    userRoleIds: ["student"],
    department: "Meme Cell",
    time: "3 hours ago",
    content: "local IDE vs production reality check... tag that classmate whose code compiles perfectly in 1ms on localhost but explodes on git push 💀 #codinglife #git #meme",
    type: "meme",
    image: "/assets/coder_meme.png",
    likes: 245,
    commentsCount: 2,
    shares: 88,
    hasLiked: false,
    hasSaved: false,
    comments: [
      {
        id: "c_6",
        userName: "Aarav Mehta",
        userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
        text: "Too close to home... deployment failed at stack trace line 193 💀",
        time: "2 hours ago"
      },
      {
        id: "c_7",
        userName: "Rahul Sharma",
        userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul",
        text: "Classic git push to production on a Friday afternoon! 😂",
        time: "1 hour ago"
      }
    ]
  },
  {
    id: "feed_post_8",
    userId: "user_aarav",
    userName: "Aarav Mehta",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    userRoleIds: ["student", "ta"],
    department: "Computer Science & Engineering",
    time: "5 hours ago",
    content: "demoing our smart agriculture IoT watering array in the makerspace today! adjusted soil moisture threshold sensors dynamically. wiring diagrams and source code are on my github page. drop by room 405 if you want to see it in action! #smartcampus #makerspace #arduino #iot",
    type: "social",
    image: "/assets/project_showcase.png",
    likes: 112,
    commentsCount: 0,
    shares: 19,
    hasLiked: false,
    hasSaved: false,
    comments: []
  }
];

export const initialRecommendedClubs = [
  { id: "club_rec_1", name: "Google Developer Student Clubs", logo: "⚡", members: 318, joined: false },
  { id: "club_rec_2", name: "Competitive Programming Hub", logo: "📈", members: 195, joined: true },
  { id: "club_rec_3", name: "Robotics & Hardware Club", logo: "🤖", members: 142, joined: false }
];

export const initialCampusStats = {
  onlineCount: 142,
  activeClubs: 8,
  placementsSuccess: 88,
  upcomingEvents: 3
};

export const initialNotifications = [
  {
    id: "notif_1",
    type: "like",
    userName: "Aarav Mehta",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    detail: "liked your project showcase post.",
    time: "2h ago",
    postId: "feed_post_8"
  },
  {
    id: "notif_2",
    type: "comment",
    userName: "Priya Patel",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    detail: "commented: 'this is so cool, let's collab!'",
    time: "4h ago",
    postId: "feed_post_8"
  },
  {
    id: "notif_3",
    type: "follow",
    userName: "Neha Kapoor",
    userAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Neha",
    detail: "started following you.",
    time: "1d ago"
  },
  {
    id: "notif_4",
    type: "like",
    userName: "Kabir Sen",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kabir",
    detail: "liked your localhost coder meme.",
    time: "2d ago",
    postId: "feed_post_7"
  }
];

export const initialStories = [
  {
    id: "story_1",
    userId: "user_aarav",
    userName: "Aarav",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    media: [
      { id: "s1_m1", type: "image", url: "https://images.unsplash.com/photo-1506744626753-1fa44df31c7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "2h ago" },
      { id: "s1_m2", type: "image", url: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "1h ago" }
    ]
  },
  {
    id: "story_2",
    userId: "user_priya",
    userName: "Priya",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    media: [
      { id: "s2_m1", type: "image", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "4h ago" }
    ]
  },
  {
    id: "story_3",
    userId: "user_kabir",
    userName: "Kabir",
    userAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kabir",
    media: [
      { id: "s3_m1", type: "image", url: "https://images.unsplash.com/photo-1470071131384-001b85755536?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "5h ago" },
      { id: "s3_m2", type: "image", url: "https://images.unsplash.com/photo-1444464666168-49b626f86a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "3h ago" },
      { id: "s3_m3", type: "image", url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "2h ago" }
    ]
  },
  {
    id: "story_4",
    userId: "user_robotics",
    userName: "Robotics Club",
    userAvatar: "🤖",
    media: [
      { id: "s4_m1", type: "image", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "12h ago" }
    ]
  },
  {
    id: "story_5",
    userId: "user_gdsc",
    userName: "GDSC Chapter",
    userAvatar: "⚡",
    media: [
      { id: "s5_m1", type: "image", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", duration: 5000, timestamp: "1d ago" }
    ]
  }
];
