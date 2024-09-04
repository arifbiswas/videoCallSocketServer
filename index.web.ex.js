const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { PeerServer } = require('peer');
const cors = require('cors');
const Turn = require('node-turn');
const PORT = process.env.PORT || 9090

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // Your client URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());



const peerServer = PeerServer({ port: PORT + 1, path: '/' });

const allUser = [];

peerServer.on('connection', (client) => {
  // console.log(`New user connected with ID: ${client.id}`);
});


// Socket connection handling
// console.log();
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.id, 'Reason:', reason);
      // send all user
      socket.emit("user",allUser);
      // Remove the disconnected user from the list of all users
      allUser.forEach((user, index) => {
          if(user.id === socket.id){
              allUser.splice(index, 1);
          }
      });
  });
  
  socket.on('error', (error) => {
      console.error('Socket error:', error);
  });

  socket.on('login', (id) => {
    console.log('User logged in:', id);
  
    // Check if the callerID already exists
    const userExists = allUser.some(user => user.callerID === id);
  
    if (!userExists) {
      // If the callerID does not exist, add the new user
      allUser.push({ callerID: id, id: socket.id });
      // console.log('User added:', { callerID: id, id: socket.id });
    } else {
      console.log('User already exists, not adding again:', id);
    }
  
    // Emit the updated list of users
    io.emit('user', allUser);
  });
});

// Set up TURN server with node-turn
const turnServer = new Turn({
  authMech: 'long-term',  // TURN authentication mechanism
  credentials: {
    username: "123456" , // Replace with your credentials
    password: "123456"  // Replace with your credentials
  },
  listeningPort: PORT + 2,  // Set TURN server port
  debugLevel: 'INFO'  // Debugging level (can be set to 'OFF' to disable logging)
});

turnServer.start();

// Start the server
server.listen(PORT, () => {
  console.log('3 Server [Socket , Peer, Stun] is running on' + " " + [PORT , PORT + 1,PORT + 2]);
  console.log('TURN server is running on port ' + (PORT + 2));
});
