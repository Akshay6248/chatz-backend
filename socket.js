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

    // On disconnect: clear socketId
    socket.on("disconnect", async () => {
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: "" }
      );
      if (user) {
        console.log(`🔴 ${user.username} disconnected`);
      }
    });
  });

  return io;
}

// Export functions
module.exports = { setupSocket, getIO: () => io };
