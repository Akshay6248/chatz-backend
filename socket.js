// socket.js
const { Server } = require("socket.io");
const User = require("./models/User");

let io;

function setupSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // Register socket with user ID
    socket.on("registerSocket", async (userId) => {
      if (!userId) return;
      await User.findByIdAndUpdate(userId, { socketId: socket.id });
    });

    // Admin actions
    socket.on("admin-action", async ({ userId, action }) => {
      try {
        const targetUser = await User.findById(userId);
        if (targetUser?.socketId) {
          const targetSocket = io.sockets.sockets.get(targetUser.socketId);
          if (targetSocket) {
            if (action === "kick") {
              targetSocket.emit("kicked", { reason: "You have been kicked by admin." });
              targetSocket.disconnect();
            } else if (action === "mute") {
              targetSocket.emit("muted", { duration: 300 });
            } else if (action === "ghost") {
              targetSocket.emit("ghosted");
            }
          }
        }
      } catch (err) {
        console.error("Admin action failed:", err);
      }
    });

    socket.on("disconnect", async () => {
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: "", isOnline: false, lastSeen: new Date() }
      );
      if (user) {
        io.emit("update_user_status");
        console.log(`🔴 ${user.username} disconnected`);
      }
    });
  });

  return io;
}

module.exports = { setupSocket, getIO: () => io };
