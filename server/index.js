require('dotenv').config();
const  getUser2SocketID = require('./utilities.js');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');
const chatsRoutes = require('./routes/chats.js')
const connect = require('./config/db.js');
const cookieParser = require('cookie-parser');

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

io.on('connection', (socket) => {
    
    socket.on('new-connection', (userID)=>{
        connectedSockets.push({ socketID:socket.id, userID:userID });
        //console.log(connectedSockets);
    });

    socket.on('disconnect', ()=>{
        connectedSockets = connectedSockets.filter((value)=>{
            if(value.socketID !== socket.id){
                return true;
            };
        });
        //console.log(connectedSockets);
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

    socket.on('ring', (user2ID, userID, timeout)=>{
        const user2SocketID = getUser2SocketID(connectedSockets, user2ID);
        if(user2SocketID){ 
            console.log('New ring event emitted');
            socket.to(user2SocketID.socketID).emit('new-ring', userID, timeout); 
        }else{ 
            console.log('Error'); 
        }; 
    });

    socket.on('answer', (user2ID, timeout)=>{
        const user2SocketID = getUser2SocketID(connectedSockets, user2ID);
        if(user2SocketID){ 
            console.log('New ring event emitted');
            socket.to(user2SocketID.socketID).emit('answered', timeout); 
        }else{ 
            console.log('Error'); 
        }; 
    });

    socket.on('request', (user2ID, id)=>{
        const user2SocketID = getUser2SocketID(connectedSockets, user2ID);
        if(user2SocketID){ 
            console.log('New request event emitted');
            socket.to(user2SocketID.socketID).emit('new-request', id); 
        }else{ 
            console.log('Error'); 
        }; 
    });

    socket.on('close-call', (id)=>{
        const user2SocketID = getUser2SocketID(connectedSockets, id);
        if(user2SocketID){ 
            console.log('New close call event emitted');
            socket.to(user2SocketID.socketID).emit('closed-call'); 
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
