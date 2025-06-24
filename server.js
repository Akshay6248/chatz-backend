const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const socketio = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/messages");
const adminRoutes = require("./routes/admin");
const User = require("./models/User");
const Message = require("./models/Message");

// Load .env
dotenv.config();

// Init Express & Server
const app = express();
const server = http.createServer(app);

// ✅ Socket.io with dynamic CORS origin
const io = socketio(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// ✅ Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ DB Error:", err));

// ✅ Socket.IO Events
io.on("connection", socket => {
  console.log("🔌 Socket connected");

  // User Online Status
  socket.on("user_online", async username => {
    const user = await User.findOneAndUpdate(
      { username },
      { isOnline: true, lastSeen: new Date() }
    );
    socket.userId = user?._id;
    io.emit("update_user_status");
  });

  // Send Message
  socket.on("send_message", async data => {
    try {
      const { sender, text } = data;
      const newMsg = await Message.create({
        sender,
        text,
        time: new Date()
      });
      io.emit("receive_message", newMsg);
    } catch (err) {
      console.error("❌ Message error:", err);
    }
  });

  // Disconnect
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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
