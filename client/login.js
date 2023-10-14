const loginForm = document.querySelector('.login-form');
const usernameInput = document.querySelector('.username-input');
const passwordInput = document.querySelector('.password-input');
const passwordError = document.querySelector('.password-error');
const usernameError = document.querySelector('.username-error');

const URL = 'http://localhost:3500/auth/';
let errors = { username: '', password: '' };

function checkPassword(){
    if(passwordInput.value === ''){
        errors.password = 'Please enter a password';
    }else{
        errors.password = '';
    };
};

function checkUsername(){
    if(usernameInput.value === ''){
        errors.username = 'Please enter a username';
    }else{
        errors.username = '';
    };
};

function updateErrors(){
    if(errors.username){
        usernameError.innerHTML = errors.username;
    }
    if(errors.password){
        passwordError.innerHTML = errors.password;
    };
};

function clearErrors(){
    usernameError.innerHTML = '';
    passwordError.innerHTML = '';
};

loginForm.addEventListener('submit', async (event)=>{
    event.preventDefault();
    clearErrors();
    checkUsername();
    checkPassword();
    if(errors.username || errors.password){
        updateErrors();
    }else{
        try{
            const response = await fetch(URL + 'login', {
                method: 'POST',
                body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value }),
                headers: 
                {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                withCredentials: true
            });
            if(response.status === 200){
                const data = await response.json();
                if(data.userID){
                    location.assign('/chats');
                    console.log('aeeee')
                };
            }else{
                console.log('User not authorized!');
            };
        }catch(error){
            console.log(error);
        };
    };
});