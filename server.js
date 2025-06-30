const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/messages");
const botRoute = require("./routes/bot");
const adminRoutes = require("./routes/admin");

const User = require("./models/User");
const Message = require("./models/Message");

// Load environment variables
require("dotenv").config();

// Init Express and HTTP server
const app = express();
const server = http.createServer(app);

const { setupSocket } = require("./socket");

// CORS origin (frontend)
const CLIENT_ORIGIN = process.env.CORS_ORIGIN || "https://akchat.surge.sh";

// Init Socket.IO
const io = socketio(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middlewares
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/bot", botRoute);
app.use("/api/admin", adminRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ DB Error:", err));

// Socket.IO Events
io.on("connection", socket => {
  console.log("🔌 Socket connected");

  socket.on("user_online", async username => {
    const user = await User.findOneAndUpdate(
      { username },
      { isOnline: true, lastSeen: new Date() }
    );
    socket.userId = user?._id;
    io.emit("update_user_status");
  });

  socket.on("send_message", async data => {
    try {
      const { sender, text, receiver, replyTo } = data;
      const newMsg = await Message.create({
        sender,
        text,
        receiver: receiver || null,
        replyTo: replyTo || null,
        time: new Date()
      });
      io.emit("receive_message", newMsg);
    } catch (err) {
      console.error("❌ Message error:", err);
    }
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
      io.emit("update_user_status");
    }
    console.log("❌ Socket disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
