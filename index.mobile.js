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

// interface 



// Socket connection handling
// console.log();
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on("newUser", (name) => {
    const data = { name, id: socket.id , created_at: new Date()};
    const existUser =  allUser?.find(user => user.id === data.id);
    if (existUser) {
      socket.emit("error","User already exists")
      return console.log("User already exists");
    }
    else{
      allUser.push(data);
      io.to(data.id).emit("me",data);
      io.emit("user",allUser);
    console.log(allUser);
    }
  })

  socket.on("cancel",(id) =>{
  //  console.log("User cancelled", id);
    io.to(id).emit("cancel");
  })
  socket.on("sendOffer",({offers,  receiverId,senderId}) =>{
    // console.log({offers, id,senderId});
    io.to(receiverId).emit("sendOffer",{offers, receiverId,senderId});
  })
  socket.on("sendAnswer",({answer,receiverId,senderId}) =>{
    // console.log("Answer sent", answer);
    io.to(senderId).emit("sendAnswer",{answer, receiverId,senderId});
  })
  socket.on("ice_candidate",({candidate,receiverId,senderId}) =>{
    console.log({candidate});
    io.emit("ice_candidate",{candidate})
    // io.to(senderId).emit("sendAnswer",{candidate,receiverId,senderId});
  })

  socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.id, 'Reason:', reason);
      // Remove the disconnected user from the list of all users
      allUser.forEach((user, index) => {
        if(user.id === socket.id){
          allUser.splice(index, 1);
        }
      });
      // send all user
      io.emit("user",allUser);
  });

  
  socket.on('error', (error) => {
      console.error('Socket error:', error);
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
