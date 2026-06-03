# 🌌 UniSphere — The Campus Collaboration & Social Network Hub

**UniSphere** is a premium, high-fidelity React application designed as the "Operating System for Modern Campus Communities." It brings official announcements, student communities, academics, faculty communication, events, clubs, and placement drives into a unified, interactive workspace.

UniSphere is built with **React 19**, **Vite 8**, **Lucide Icons**, and custom utility-driven **CSS3 Variables**. It supports full responsive design, fluid transitions, and a state-of-the-art **Dark Mode / Light Mode** theme system.

---

## 🎨 Design System & Aesthetics

UniSphere features a highly customized, premium visual design crafted to represent academic spaces with a modern digital twist:

*   **Color Palette (Light Mode):** Soft, warm tones reminiscent of premium paper and library spaces:
    *   `--bg-deep`: `#F7F4EE` (Warm Ivory)
    *   `--bg-surface`: `#FBF9F4` (Warm Cream White)
    *   `--accent-primary`: `#3D6B4A` (Deep Forest Green)
    *   `--accent-sage`: `#6B8E72` (Muted Sage)
    *   `--text-primary`: `#1F2933` (Deep Charcoal)
*   **Color Palette (Dark Mode):** Sleek, developer-focused workspace theme (similar to Notion/Linear):
    *   `--bg-deep`: `#0F1115` (Deep Slate Black)
    *   `--bg-surface`: `#151922` (Sidebar Grey-Blue)
    *   `--accent-primary`: `#4E8B62` (Accent Green)
    *   `--text-primary`: `#F5F7FA` (Off-white)
*   **Typography:** Modern Sans-Serif font combos:
    *   `--font-display`: `'Outfit'` for headings, badges, and titles.
    *   `--font-sans`: `'Inter'` for UI details, lists, chat inputs, and paragraphs.
    *   `--font-serif`: `'Lora'` for italic accents and headers.
*   **Micro-Animations:** Fluid scaling on card hovers, subtle 3D rotational perspective shifts on dashboard mockups (`perspective(1000px)`), smooth CSS variables-based transition slides (theme fading), and custom scrollbar styles.

---

## 🚀 Key Features & Pillars

### 1. Multi-Workspace Switcher
*   Allows switching between multiple campus network nodes (e.g., **Newton School of Technology**, **IIT Delhi**, **BITS Pilani**).
*   Create new custom workspaces dynamically with automated, randomized logo backgrounds and shortnames.
*   Joining a new workspace automatically provisions standard channels (e.g., `#announcements`, `#general`).

### 2. Categorized Channels & Messaging
*   Channels are grouped neatly by categories: `OFFICIAL`, `ACADEMICS`, `COMMUNITY`, and `CLUBS`.
*   Real-time chat functionality supporting message formatting, emoji reactions (quick reaction buttons like 👍, 🔥, 🚀), and deletion.
*   **Thread Discussion Drawer:** Side-drawer sliding layout that supports isolated threaded discussions (replies) on specific messages, avoiding channel clutter.
*   **Channel Read-Only Guard:** Student roles are prevented from publishing in `#announcements` or `#placement-cell` channels.

### 3. Social Campus Activity Feed
*   A LinkedIn/Facebook-style university wall where students, faculty, or clubs publish updates, milestones, code achievements, and announcements.
*   Supports live post liking (with animation state) and counts comments dynamically.

### 4. Interactive Events & RSVP Calendar
*   Overview of campus activities (e.g., Competitive Programming session, Arduino workshops, Collegiate Career Fair).
*   Dynamic RSVP system: users can register/unregister on cards with instant attending count updates.

### 5. Placements & Careers Desk
*   Dedicated workspace dashboards showing active internship and job drives (e.g., Google Summer Internships) with quick-apply portal links.

### 6. Quick-Glance Utility Sidepanel
*   **Academic Timetable:** Time-bound schedule showing current classes, professors, and room numbers.
*   **Deadlines Tracker:** Tasks categorized by severity (`high` in red, `medium` in yellow, `low` in green) with live countdown notices (e.g. *DBMS Assignment 2 - Due in 2 days*).

### 7. Rich Profile Onboarding & Statuses
*   Pre-loaded user avatars seeded using the **Dicebear API**.
*   Custom user statuses (Online, Away, Do Not Disturb, Offline) and editable custom status text strings.

### 8. Full Client-Side LocalStorage Persistence
*   All additions (workspaces, channels, messages, threads, post likes, event RSVPs, theme modes) are fully synchronized and persisted using React context and `localStorage` hooks (`unisphere_*` namespaces).

---

## 📂 Project Architecture

```
UniSphere/
├── index.html              # Entry HTML markup with typography imports, styling links, and SEO tags
├── vite.config.js          # Vite config bundling assets via @vitejs/plugin-react
├── eslint.config.js        # React standard code standards and lint rules
├── package.json            # React 19, Lucide React, and developer configuration
├── public/                 # Favicons and static assets
└── src/
    ├── main.jsx            # React root mount script, wraps App in AppProvider context
    ├── App.jsx             # Top-level routing logic (decides AuthScreen vs. MainAppLayout)
    ├── index.css           # Core styling system (CSS3 variable sets, light/dark variables, buttons)
    ├── App.css             # Main container boundaries and basic wrapper sizing
    ├── context/
    │   └── AppContext.jsx  # Global React Context API managing all state, functions, and LocalStorage sync
    ├── data/
    │   └── mockData.js     # Rich initial mock database (users, channels, messages, schedules, deadlines)
    └── pages/
        ├── AuthScreen.jsx        # Login split page with pillars and quick demo login trigger buttons
        ├── AuthScreen.css        # Multi-column login grid styles, custom inputs, and gradients
        ├── MainAppLayout.jsx     # Main workspace structure, dashboards, modally driven forms, and chat UI
        └── MainAppLayout.css     # CSS rules for sidebar, switcher, quick glance panels, feeds, and channels
```
---

## 🛠️ Setup & Local Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Steps
1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```
    *The app will be running locally at `http://localhost:5173/`.*

3.  **Build for production:**
    ```bash
    npm run build
    ```
    *The optimized build bundle will be written to the `/dist` directory.*

4.  **Run the linter:**
    ```bash
    npm run lint
    ```

---

## 🔒 License & Verification

*   **Design & Engineering:** Developed with custom hand-crafted UI variables and layout structure.
*   **Verification:** Verified production build compatibility under Node compiler profiles.
