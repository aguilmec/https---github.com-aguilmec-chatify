//import io from 'socket.io-client';
const usersList = document.querySelector('.connected-users');
const chatContainer = document.querySelector('.chat');
const messageInput = document.querySelector('.message-input');
const messageForm = document.querySelector('.message-form');
const userName = document.querySelector('.user-name');
const sendButton = document.querySelector('.send-button');
let but = document.getElementById("but");
let video = document.getElementById("vid");

let mediaDevices = navigator.mediaDevices;
video.muted = true;

but.addEventListener('click',(event)=>{
    event.preventDefault();
    mediaDevices.getUserMedia({
        video:true,
        audio: true,
    }).then((stream)=>{
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', ()=>{
            video.play()
        })
    })
})

console.log(mediaDevices);

const urlParams = new URLSearchParams(window.location.search);
const URL = 'http://localhost:3500/';
const socket = io(URL);
let room;
getUserInfo();

socket.on('incoming-message', (message)=>{
    appendMessage(message, 'incoming');
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
    let userID;
    try{
        const response = await fetch(URL + 'auth/test', {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
        });
        const userInfo = await response.json();
        console.log(userInfo)
        userID = userInfo.userID;
        userName.innerHTML = `${userInfo.name} ${userInfo.surname}`;
        populateContacts(userInfo.contacts, userInfo.userID, socket);
    }catch(error){
        console.log(error)
    }; 
};

function populateChat(conversation, userID){
    chatContainer.innerHTML = '';
    conversation.forEach((chat)=>{
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
};

async function populateContacts(contacts, userID, name, surname){
    let promises = contacts.map(async (contact)=>{
        console.log(contact)
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
        sendButton.value = chatID;
        button.addEventListener('click', async (event)=>{
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
                populateChat(conversation.messages, userID);
                
                //sacar
                /*messageForm.addEventListener('submit', (event)=>{
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
                        console.log('mierda')
                    }catch(error){
                        console.error(error);
                    };
                });*/
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
            console.log('mierda')
        }catch(error){
            console.error(error);
        };
        messageInput.value = '';
    });
};


