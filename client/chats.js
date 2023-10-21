const usersList = document.querySelector('.connected-users');
const chatContainer = document.querySelector('.chat');
const messageInput = document.querySelector('.message-input');
const messageForm = document.querySelector('.message-form');
const userName = document.querySelector('.user-name');
const userStatus = document.querySelector('.user-status');
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
const video1Name = document.querySelector('.video1-name');
const video2Name = document.querySelector('.video2-name');
const mainMessage = document.querySelector('.main-message');
const chatButton = document.querySelector('.chat-button');
const logoutButton = document.querySelector('.logout-button');
const userProfile = document.querySelector('.user-profile-wrapper');
const profileButton = document.querySelector('.profile-button');
const usersWrapper = document.querySelector('.users-list');
const returnButton = document.querySelector('.return-button');
const pictureSelector = document.querySelector('.profile-picture-wrapper');
const profilePicture2 = document.querySelector('.profile-picture');
const changePasswordButton = document.querySelector('.change-password-button');
const passwordChangeWrapper = document.querySelector('.bottom-password-wrapper');
const savePaswordButton = document.querySelector('.save-password-button');
const newPasswordInput = document.querySelector('.new-password-form-input');
const confirmPasswordInput = document.querySelector('.confirm-password-form-input');
const oldPasswordInput = document.querySelector('.password-form-input');
const passwordChangeMessage = document.querySelector('.password-change-message');

const urlParams = new URLSearchParams(window.location.search);
const URL = 'http://localhost:3500/';
const socket = io(URL);
const mediaDevices = navigator.mediaDevices;
let room;
let userID;
let user2ID;
let user;
let user2;
let profilePicture;
let base64String;

function validatePasswords(){
    if(newPasswordInput.value === confirmPasswordInput.value){
        return true;
    }else{
        return false;
    };
};

savePaswordButton.addEventListener('click', async (event)=>{
    passwordChangeMessage.innerHTML = '';
    console.log(newPasswordInput.value);
    console.log(oldPasswordInput.value);
    event.preventDefault();
    const validation = validatePasswords();
    if(validation){
        const res = await fetch(URL + 'chats/password', {
            withCredentials: true,
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({ newPassword: newPasswordInput.value, oldPassword: oldPasswordInput.value }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(res.status === 200){
            passwordChangeMessage.style.display = 'inline';
            passwordChangeMessage.innerHTML = 'Password successfully changed!';
            passwordChangeMessage.style.color = 'rgb(0, 104, 5)';
            hidePasswordMessage('success');

            //log out the user
  
        }else{
            passwordChangeMessage.style.display = 'inline';
            passwordChangeMessage.innerHTML = 'Password is not correct!';
            passwordChangeMessage.style.color = 'rgb(167, 0, 0)';
            hidePasswordMessage('failed');
        };
    }else{
        passwordChangeMessage.style.display = 'inline';
        passwordChangeMessage.innerHTML = 'Passwords dont match!';
        passwordChangeMessage.style.color = 'rgb(167, 0, 0)';
        hidePasswordMessage('failed');
    };
});

function hidePasswordMessage(status){
    setTimeout(()=>{
        passwordChangeMessage.style.display = 'none';
        if(status === 'success'){
            passwordChangeWrapper.style.display = 'none';
        };
    },5000);
}

changePasswordButton.addEventListener('click', ()=>{
    passwordChangeWrapper.style.display = 'inline';
});

pictureSelector.addEventListener('click', (event)=>{
    event.preventDefault();
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e) => { 
        const file = e.target.files[0]; 
        console.log(typeof file)
        const reader = new FileReader();
        reader.onloadend = async (e)=>{
            base64String = reader.result;
            const res = await fetch(URL + 'chats/picture', {
                method: 'POST',
                body: JSON.stringify({ picture: base64String }),
                headers:{
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include',
            });
            if(res.status === 200){

                //handle large files, code: 413
                console.log('bien');
                document.querySelector('.user-profile-picture').src = base64String;
                profilePicture2.src = base64String;
                console.log(base64String)
            };
        };
        reader.readAsDataURL(file);
    };

    input.click();
    
});

profileButton.addEventListener('click', (event)=>{
    event.preventDefault();
    usersWrapper.style.display = 'none';
    userProfile.style.display = 'grid';
});

returnButton.addEventListener('click', (event)=>{
    event.preventDefault();
    usersWrapper.style.display = 'grid';
    userProfile.style.display = 'none';
});

const res = await fetch(URL + 'auth/verify', {
    credentials: 'include',
    withCredentials: true
});

if(res.status === 200){

    getUserInfo();

    chatButton.style.color = 'rgb(206, 206, 206)';
    chatsWrapper.style.display = 'none';

    logoutButton.addEventListener('click', async (event)=>{
        console.log('mierdas');
        event.preventDefault();
        try{
            const res = await fetch(URL + 'auth/logout',{
                withCredentials: 'true',
                credentials: 'include'
            });
            if(res.status === 200){
                location.assign('/login')
            }
        }catch(error){
            console.log('There was an error loging you out, please try again.');
        };
        

    });

    socket.on('incoming-message', (message)=>{
        appendMessage(message, 'incoming');
    });

    socket.on('new-ring', (id, timeout)=>{

        function decline(event){
            event.preventDefault();
            console.log('Declined call');
            modal.classList.remove('open');
            declineButton.removeEventListener('click', decline);
            showElements();
        };

        function answer(event){
            event.preventDefault();
            console.log('Answered call');
                socket.emit('answer', id, timeout);
                modal.classList.remove('open');
                answerButton.removeEventListener('click', answer)
        };

        modal.classList.add('open');
        answerButton.addEventListener('click', answer);
        declineButton.addEventListener('click', decline);
    });

    socket.on('new-request', async (id)=>{
        console.log('New request');
        const localStream = await getMediaStream();
        video1.srcObject = localStream;
        video1Name.innerHTML = user;
        video2Name.innerHTML = user2;
        hideElements();
        const peer = new Peer(userID);
        peer.on('open', ()=>{
            console.log('Peer ready and connected to the server');
            const call = peer.call(id, localStream);
            call.on('stream', (stream)=>{
                video2.srcObject = stream;
                console.log('Stream set to remote video tag'); 
            });
        });

        const handleCloseCallWrapper = (peer, localStream, id) => {
            return (event) => {
                event.preventDefault();
                console.log('Clicked the end call button');
                handleCloseCall(peer, localStream, id);
            };
        };
        const closeCallButtonClickHandler = handleCloseCallWrapper(peer, localStream, id);
        closeCallButton.addEventListener('click', closeCallButtonClickHandler);

        peer.on('close', ()=>{
            console.log('Peer closed');
            closeCallButton.removeEventListener('click', closeCallButtonClickHandler);
        });
    });

    function handleCloseCall(peer, localStream, id){
        showElements();
        //socket.emit('close-call', id);
        peer.destroy();
        closeTracks(localStream);
        console.log('Stopped the stream');
        
    };

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
            profilePicture2.src = userInfo.picture;
            document.querySelector('.user-profile-picture').src = userInfo.picture;
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
                <button class="contact-wrapper" data-object='{ "chatID": "${contact.chatID}", "name": "${userInfo.name} ${userInfo.surname}" }'>
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
            const dataString = button.dataset.object;
            const data = JSON.parse(dataString);
            const chatID = data.chatID;
            user2 = data.name;
            button.addEventListener('click', ()=>{
                if(mainMessage.style.display !== 'none'){
                    mainMessage.style.display = 'none';
                    chatsWrapper.style.display = 'inline';
                    userInfo.style.display = 'grid'
                }; 
                userName.innerHTML = data.name; 
                userStatus.innerHTML = 'online';          
            });
            
            
            button.addEventListener('click', async (event)=>{
                sendButton.value = chatID;
                socket.emit('leave-current-room',room);
                event.preventDefault();
                try{
                    if(room !== button.value){
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
                    };                
                }catch(error){
                    console.error(error);
                };
            });
        });

        sendButton.addEventListener('click', (event)=>{
            event.preventDefault();
            if(messageInput.value !== '' && room !== ''){
                messageInput.placeholder = 'Your message here';
                const chatID = sendButton.value;
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
            }; 
        });
    };

    socket.on('answered', async (timeout)=>{
        console.log('Call answered');
        clearTimeout(timeout);
        const localStream = await getMediaStream();
        video1.srcObject = localStream;
        hideElements();
        const localPeer = new Peer(userID);
        localPeer.on('close',()=>{
            closeCallButton.removeEventListener('click', closeCallButtonClickHandler);
        });
        const handleCloseCallWrapper = (localPeer, localStream) => {
            return (event) => {
                event.preventDefault();
                console.log('Clicked the end call button');
                closeTracks(localStream);
                localPeer.destroy();
                showElements();
            };
        };
        const closeCallButtonClickHandler = handleCloseCallWrapper(localPeer, localStream);
        closeCallButton.addEventListener('click', closeCallButtonClickHandler);

        localPeer.on('open', (id)=>{
            console.log('Peer ready and connected to the server');
            socket.emit('request', user2ID, id);
            localPeer.on('call', (call)=>{
                console.log('Call recieved');        
                call.answer(localStream);
                call.on('stream', (stream)=>{
                    video2.srcObject = stream;
                    console.log('Stream set to the remote video tag');
                });
            });
        });
    });

    callButton.addEventListener('click', ()=>{
        const timeout = setTimeout(()=>{
            showElements();
            console.log('Call not answered');
        },30000);
        video1Name.innerHTML = user;
        video2Name.innerHTML = user2;
        socket.emit('ring', user2ID, userID, timeout);
        hideElements();
    });

    function handleAnswer(event, userID, user2ID){
        event.preventDefault();
        const id = userID;
        socket.emit('answer', user2ID, id);
        modal.classList.remove('open');
    };

    function handleDecline(event, userID, user2ID){
        event.preventDefault();
        socket.emit('declined', user2ID);
        modal.classList.remove('open');
    };

    function hideElements(){
        console.log('Hide elements');
        chatsWrapper.style.display = 'none';
        videoCallContainer.style.display = 'grid';
        userInfo.style.backgroundColor = 'rgba(15, 18, 20, 0.959)';
        bottomWrapper.style.backgroundColor = 'rgba(15, 18, 20, 0.959)';
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

    async function getMediaStream(){
        const constraints = {
            audio: true,
            video: true
        };
        const stream = await mediaDevices.getUserMedia(constraints);
        return stream;
    };

}else{
    window.location = '/login';
    alert('Please login with your account!');
};