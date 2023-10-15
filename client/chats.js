//import io from 'socket.io-client';
const usersList = document.querySelector('.connected-users');
const chatContainer = document.querySelector('.chat');
const messageInput = document.querySelector('.message-input');
const messageForm = document.querySelector('.message-form');
const userName = document.querySelector('.user-name');
const sendButton = document.querySelector('.send-button');
const callButton = document.querySelector('.call-button');
const videoCallContainer = document.querySelector('.videocall-wrapper');
const chatsWrapper = document.querySelector('.chats-wrapper');
const userInfo = document.querySelector('.user-info');
const linebreak = document.querySelector('.linebreak');
const linebreakBottom = document.querySelector('.linebreak-bottom');
const bottomWrapper = document.querySelector('.bottom-wrapper');
const bottomBottomWrapper = document.querySelector('.bottom-bottom-wrapper');
const video1 = document.querySelector('.video-container1');
const video2 = document.querySelector('.video-container2');
const closeCallButton = document.querySelector('.close-call');
const modal = document.querySelector('.modal-wrapper');
const answerButton = document.querySelector('.answer-button');
const declineButton = document.querySelector('.ignore-button');

const urlParams = new URLSearchParams(window.location.search);
const URL = 'http://localhost:3500/';
const socket = io(URL);
const mediaDevices = navigator.mediaDevices;
let room;
let userID;
let user2ID;
let user;
let profilePicture;
getUserInfo();

socket.on('incoming-message', (message)=>{
    appendMessage(message, 'incoming');
});

socket.on('new-ring', async (id)=>{
    modal.classList.add('open');
    answerButton.addEventListener('click', (event)=>{
        modal.classList.remove('open');
        event.preventDefault();
        socket.emit('answer', id);
    });
    
    declineButton.addEventListener('click', (event)=>{
        event.preventDefault();
        socket.emit('cancel', id);
        modal.classList.remove('open');
    });

    //modal.classList.add('open');
    /*const timeout = setTimeout(()=>{
        alert('removed');
        modal.classList.remove('open');
    },30000);
    if(response){
        socket.emit('answer', id);
    }else{

        ///////cambiar a cancel
        socket.emit('answer', id);
    };*/
});

socket.on('new-connection', async (id)=>{
    hideElements();
    const peer = new Peer(userID);
    console.log('Invite recieved! Created a new peer!');
    const connection = peer.connect(id);
    console.log('Connection stablished to peer id: ', id);
    const localStream = await getMediaStream();
    closeCallButton.addEventListener('click', (event)=>{
        closeTracks(localStream);
        socket.emit('closed-call', id);
        event.preventDefault();
        showElements();
        peer.disconnect();
        console.log('Peer disconnected');
    });
    socket.on('call-ended', ()=>{
        closeTracks(localStream);
        peer.disconnect();
        console.log('Peer disconnected');
        showElements();
    });
    video1.srcObject = localStream;
    peer.on('call', (call)=>{
        console.log('Call recieved');
        call.answer(localStream);
        call.on('stream', (remoteStream)=>{
            console.log('Remote stream recieved.');
            video2.srcObject = remoteStream;
        });
    });
});

function appendMessage(string, type){
    const message = document.createElement('div');
    if(type==='incoming'){
        message.classList.add('incoming-message');
    }else{
        message.classList.add('outbound-message');
    };
    message.innerHTML = string;
    chatContainer.appendChild(message);
};

async function getUserInfo(){
    try{
        const response = await fetch(URL + 'auth/test', {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
        });
        const userInfo = await response.json();
        userID = userInfo.userID;
        socket.userID = userID;
        socket.emit('new-connection', userID);
        user = `${userInfo.name} ${userInfo.surname}`;
        profilePicture = 'https://cdn.wealthygorilla.com/wp-content/uploads/2022/09/Anuel-AA-Net-Worth.jpg';
        userName.innerHTML = user;
        populateContacts(userInfo.contacts, userInfo.userID, socket);
    }catch(error){
        console.log(error)
    }; 
};

function populateChat(conversation, userID){
    const users = conversation.users;
    user2ID = users.filter((user)=>{
        if(user !== userID){return true};
    })[0];
    chatContainer.innerHTML = '';
    conversation.messages.forEach((chat)=>{
        let message = document.createElement('div');
        if(conversation.len === 0){
            chatContainer.innerHTML = '';
        }else{
            if(chat.userID === userID){
                message.classList.add('outbound-message');
                message.innerHTML = chat.message;
            }else{
                message.classList.add('incoming-message');
                message.innerHTML = chat.message;
            };
            chatContainer.appendChild(message);
        };        
    });
    callButton.addEventListener('click', async (event)=>{
        event.preventDefault();
        const id = userID;
        hideElements();
        const peer = new Peer(userID);
        socket.emit('ring', user2ID, id);
        const timeout = setTimeout(()=>{
            peer.disconnect();
            showElements();
        },30000);
        socket.on('answered', async ()=>{
            peer.connect(user2ID);
            clearTimeout(timeout);
            socket.emit('connect-to-peer', user2ID, id);
            const localStream = await getMediaStream();
            socket.on('call-ended', ()=>{
                //funcion 1
                console.log('******************************')
                closeTracks(localStream);
                peer.disconnect();
                showElements();
                //funcion 1
            });
            closeCallButton.addEventListener('click', (event)=>{
                event.preventDefault();
                //funcion 1
                closeTracks(localStream);
                showElements();
                peer.disconnect();
                //funcion 1
                socket.emit('closed-call', user2ID);
            });
            const call = peer.call(user2ID, localStream);
            call.on('stream', (remoteStream)=>{
                video2.srcObject = remoteStream;
            });
        });
        
        socket.on('cancelled', ()=>{
            peer.disconnect();
            showElements();
        });
    });
};

async function getMediaStream(){
    const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: true
    });
    video1.srcObject = stream;
    return stream;
};

async function populateContacts(contacts, userID, name, surname){
    let promises = contacts.map(async (contact)=>{
        const response = await fetch(URL + 'chats/user', {
            method: 'POST',
            body: JSON.stringify({ username: contact.username }),
            headers: 
            {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
        });
        const userInfo = await response.json();
        return `
            <button class="contact-wrapper" value="${contact.chatID}">
                <div class="user-profile-image">
                    <img class="profile-picture" src="https://cdn.wealthygorilla.com/wp-content/uploads/2022/09/Anuel-AA-Net-Worth.jpg">
                </div>
                <div class="user-info-wrapper">
                    <div class="user">
                        ${userInfo.name} ${userInfo.surname}
                    </div>
                    <div class="status">online</div>
                </div>
            </button>
            <div class="contact-linebreak"></div>`;
    });
    const buttons = await Promise.all(promises);
    usersList.innerHTML = buttons.join('');

    document.querySelectorAll('.contact-wrapper').forEach((button)=>{
        const chatID = button.value;
        button.addEventListener('click', async (event)=>{
            sendButton.value = chatID;
            socket.emit('leave-current-room',room);
            event.preventDefault();
            try{
                const response = await fetch(URL + 'chats/chat', {
                    method: 'POST',
                    withCredentials: true,
                    credentials: 'include',
                    body: JSON.stringify({ chatID: chatID }),
                    headers:
                    {
                        'Content-Type': 'application/json'
                    }
                });
                const conversation = await response.json();
                socket.emit('chat-connection', chatID);
                room = chatID;
                populateChat(conversation, userID);
            }catch(error){
                console.error(error);
            };
        });
    });

    sendButton.addEventListener('click', (event)=>{
        messageInput.placeholder = 'Your message here';
        const chatID = sendButton.value;
        event.preventDefault();
        socket.emit('new-message', userID, chatID, messageInput.value);
        appendMessage(messageInput.value, 'outbound');
        try{
            fetch(URL + 'chats/save', {
                method: 'POST',
                withCredentials: true,
                credentials: 'include',
                body: JSON.stringify( {chatID: chatID, message: messageInput.value} ),
                headers: 
                {
                    'Content-Type': 'application/json'
                }
            });
        }catch(error){
            console.error(error);
        };
        messageInput.value = '';
    });
};

function hideElements(){
    console.log('Hide elements');
    chatsWrapper.style.display = 'none';
    videoCallContainer.style.display = 'grid';
    userInfo.style.backgroundColor = 'rgb(26, 32, 36)';
    bottomWrapper.style.backgroundColor = 'rgb(26, 32, 36)';
    linebreak.style.backgroundColor = 'rgb(61, 61, 61)';
    linebreakBottom.style.backgroundColor = 'rgb(61, 61, 61)';
    userName.style.color = 'rgb(80, 80, 80)';
    closeCallButton.style.display = 'flex';
    callButton.style.display = 'none';
    messageForm.style.display = 'none';
    sendButton.style.display = 'none';
};

function showElements(){
    console.log('Show elements');
    chatsWrapper.style.display = 'inline';
    videoCallContainer.style.display = 'none';
    userInfo.style.backgroundColor = 'transparent';
    bottomWrapper.style.backgroundColor = 'transparent';
    linebreak.style.backgroundColor = 'rgb(206, 206, 206)';
    linebreakBottom.style.backgroundColor = 'rgb(206, 206, 206)';
    userName.style.color = 'rgba(29, 29, 29, 0.753)';
    closeCallButton.style.display = 'none';
    callButton.style.display = 'inline'
    messageForm.style.display = 'flex';
    sendButton.style.display = 'inline';
};

function closeTracks(localStream){
    localStream.getTracks().forEach((track)=>{
        track.stop();
        console.log('Track stopped');
    });
};



