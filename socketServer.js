const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to your Next.js dev server URL
    methods: ["GET", "POST"]
  }
});

// Store connected users
const users = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user joins a room (identified by their user ID)
  socket.on('joinRoom', (userId) => {
    if (userId) {
      users[socket.id] = userId;
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  // Handle sending messages
  socket.on('sendMessage', (message) => {
    const senderId = users[socket.id];
    if (senderId && message && message.receiverId) {
      // Send the message to the receiver's room
      io.to(message.receiverId).emit('newMessage', message);
      console.log(`Message sent from ${senderId} to ${message.receiverId}: ${message.content || '[attachment]'}`);
    }
  });

  // Handle marking messages as read
  socket.on('markRead', ({ partnerId, readerId, messageIds }) => {
    // Broadcast to the sender that their messages have been read
    io.to(partnerId).emit('messagesRead', { readerId, messageIds });
    console.log(`Messages marked as read by ${readerId} from ${partnerId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userId = users[socket.id];
    if (userId) {
      console.log(`User ${userId} disconnected`);
      delete users[socket.id];
    }
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});