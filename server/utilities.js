function getUser2SocketID(connectedSockets, user2ID){
    const user2SocketID = connectedSockets.filter((value)=>{ 
        if(value.userID === user2ID){return true}; 
    })[0]; 
    return user2SocketID;
};

module.exports = getUser2SocketID;