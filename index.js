const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 9000

// Create an Express server
const server = app.listen(PORT, () => {
  console.log('PeerJS server running on [~~ http://localhost:9000 ~~]');
});

// Create a PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});

// Use the PeerJS server in your Express app
app.use('/peerjs', peerServer);

// Track connected users
let allUsers = [];

// Function to read users from the JSON file
// Listen for new connections
// Track connected users
const connectedUsers = new Set();

peerServer.on('connection', (client) => {
  console.log(`New user connected with ID: ${client.id}`);
  connectedUsers.add(client.id);
  allUsers.push(client.id);
  
});

peerServer.on('disconnect', (client) => {
  console.log(`User disconnected with ID: ${client.id}`);
  connectedUsers.delete(client.id);
  allUsers = allUsers.filter((user) => user!== client.id);
  // Optionally, perform additional cleanup or notifications
});


// Serve the index.html file
app.get('/', (req, res) => {
  res.send(allUsers)
});


  