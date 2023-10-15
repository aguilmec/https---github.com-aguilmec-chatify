require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');
const chatsRoutes = require('./routes/chats.js')
const connect = require('./config/db.js');
const cookieParser = require('cookie-parser');
//const p2p = require('socket.io-p2p-server').Server;

connect();

const PORT = process.env.PORT || 3500;
const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: 'http://localhost:8080'
    }
});


let connectedSockets = [];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

//io.use(p2p);

io.on('connection', (socket) => {
    
    socket.on('new-connection', (userID)=>{
        connectedSockets.push({ socketID:socket.id, userID:userID });
        console.log(connectedSockets);
    });

    socket.on('disconnect', ()=>{
        connectedSockets = connectedSockets.filter((value)=>{
            if(value.socketID !== socket.id){
                return true;
            };
        });
        console.log(connectedSockets);
    });

    socket.on('chat-connection', (chatID)=>{
        socket.join(chatID);
        console.log(`Socket: ${socket.id} is connected to the room: ${chatID}`);
    });

    socket.on('new-message', (userID, chatID, message)=>{
        socket.to(chatID).emit('incoming-message', message);
    });

    socket.on('leave-current-room', (room)=>{
        socket.leave(room);
        console.log(`Socket: ${socket.id} has left room: ${room}`);
    });

    socket.on('connect-to-peer', (user2ID, id)=>{
        const user2SocketID = connectedSockets.filter((value)=>{ 
            if(value.userID === user2ID){return true}; 
        })[0]; 
        if(user2SocketID){ 
            socket.to(user2SocketID.socketID).emit('new-connection', id); 
        }else{ 
            console.log('Error'); 
        }; 
    });

    socket.on('closed-call', (user2ID)=>{
        const user2SocketID = connectedSockets.filter((value)=>{ 
            if(value.userID === user2ID){return true}; 
        })[0]; 
        if(user2SocketID){ 
            socket.to(user2SocketID.socketID).emit('call-ended'); 
        }else{ 
            console.log('Error'); 
        }; 
    });

    socket.on('ring', (user2ID, id)=>{
        const user2SocketID = connectedSockets.filter((value)=>{ 
            if(value.userID === user2ID){return true}; 
        })[0]; 
        if(user2SocketID){ 
            socket.to(user2SocketID.socketID).emit('new-ring', id); 
        }else{ 
            console.log('Error'); 
        }; 
    });

    socket.on('answer', (id)=>{
        const user1SocketID = connectedSockets.filter((value)=>{
            if(value.userID === id){return true};
        })[0];
        if(user1SocketID){ 
            socket.to(user1SocketID.socketID).emit('answered'); 
        }else{ 
            console.log('Error'); 
        }; 
    });

    socket.on('cancel', (id)=>{
        const user1SocketID = connectedSockets.filter((value)=>{
            if(value.userID === id){return true};
        })[0];
        if(user1SocketID){ 
            socket.to(user1SocketID.socketID).emit('cancelled'); 
        }else{ 
            console.log('Error'); 
        }; 
    });

});

mongoose.connection.once('open', ()=>{
    console.log('Connected to MongoDB');
    server.listen(PORT, ()=>{console.log(`Server is listening on port: ${PORT}`)});
});

//routes
app.use('/auth', authRoutes);
app.use('/chats', chatsRoutes);
