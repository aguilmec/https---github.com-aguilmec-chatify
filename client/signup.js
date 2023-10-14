const signupForm = document.querySelector('.signup-form');
const usernameInput = document.querySelector('.username-input');
const passwordInput = document.querySelector('.password-input');
const nameInput = document.querySelector('.name-input');
const surnameInput = document.querySelector('.surname-input');

const URL = 'http://localhost:3500/auth/';

signupForm.addEventListener('submit', async (event)=>{
    event.preventDefault();

    try{
        const response = await fetch(URL + 'signup', {
            method:'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            withCredentials: true,
            body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value, name: nameInput.value, surname: surnameInput.value })
        });
        const data = await response.json();
        if(response.status === 200){
            if(data.userID){
                console.log('User created succesfully!');
                location.assign('/chats');
            };
        }else{
            console.log(data.error);
            console.log('User NOT created!');
        };
    }catch(error){
        console.log(error);
    };
    
})