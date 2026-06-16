import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import alumniRoutes from "./routes/alumni.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import campusRoutes from "./routes/campus.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import socialPostRoutes from "./routes/socialPost.routes.js";
import storyRoutes from "./routes/story.routes.js";
import eventRoutes from "./routes/event.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import chatMessageRoutes from "./routes/chatMessage.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";
import roleRoutes from "./routes/role.routes.js";
import auditRoutes from "./routes/audit.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/alumni", alumniRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/campuses", campusRoutes);
app.use("/api/v1/channels", channelRoutes);
app.use("/api/v1/social/posts", socialPostRoutes);
app.use("/api/v1/social/stories", storyRoutes);
app.use("/api/v1/social/events", eventRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/chats/:chatId/messages", chatMessageRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/moderation", moderationRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/audit", auditRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "UniSphere API is running." });
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
