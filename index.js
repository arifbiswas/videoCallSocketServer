const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

const server = require("http").createServer(app);

const PORT = process.env.PORT || 9090;

// WebSocket setup
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const allUser = [];

// Socket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', (reason) => {
        console.log('User disconnected:', socket.id, 'Reason:', reason);
        allUser.forEach((user, index) => {
            if(user.id === socket.id){
                allUser.splice(index, 1);
            }
        });
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('login', (id)=>{
        console.log('User logged in:', id);

        allUser.push({callerID : id, id : socket.id});
        io.emit('allUsers', allUser);
    });
   

   
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
