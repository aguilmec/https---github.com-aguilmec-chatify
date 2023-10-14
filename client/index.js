const loginForm = document.querySelector('.login-form');
const loginButton = document.querySelector('.login-button');
const passwordInput = document.querySelector('.password-input');
const usernameInput = document.querySelector('.username-input');
const signUpForm = document.querySelector('.signup-form');
const signupButton = document.querySelector('.signup-button');
const passwordSignup = document.querySelector('.password-signup');
const usernameSignup = document.querySelector('.username-signup');
const test = document.querySelector('.test');
const message = document.querySelector('.error');

const URL = 'http://localhost:3500/auth/';

test.addEventListener('click', ()=>{
    fetch(URL+'test',{
        method: 'GET',
        credentials: 'include',
        withCredentials: true
    })
    .then((res)=>{
        console.log('mierda');
    })
    .catch((err)=>{
        console.error(err);
    });
});

loginForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    console.log({username: usernameInput.value, password: passwordInput.value});
    fetch(URL + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        withCredentials: true,
        body: JSON.stringify({username: usernameInput.value, password: passwordInput.value})
    })
    .then(async (res)=> {
        if(res.status === 200){
            const data = await res.json();
            console.log(data)
            if(data.userID){
                location.assign('/chats');
            };
            //window.location = `http://localhost:8080/chats?user=${usernameInput.value}`;
        }else{
            console.log('User not autorized!');
        }; 
    })
    .catch((err)=>{console.log(err)});
});

signUpForm.addEventListener('submit', async (event)=>{
    message.innerHTML = '';
    event.preventDefault();
    try{
        const res = await fetch(URL + 'signup', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username: usernameSignup.value, password: passwordSignup.value })
        });
        const data = await res.json();
        if(res.status === 200){
            console.log('User created successfully!');
            if(data.userID){
                location.assign('/chats.html');
            };
        }else{
            console.log(data.error)
            message.innerHTML = data.error.username;
        };
    }catch(error){
        console.error(error);
    };
});
