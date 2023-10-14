require('dotenv').config();
const { User } = require('../Models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const maxAge = 3*24*60*60;

function handleErrors(err){
    let error = { username: ''};
    
    if(err.code === 11000){
        error.username = 'Username already exists!';
    };
    return error;
};

function createJWT(id){
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: maxAge 
    });
};

async function login(req, res){
    console.log(req.body)
    const { username, password } = req.body;
    try{
        const user = await User.login(username, password);
        const token = createJWT(user._id);
        res.cookie('jwt', token, { sameSite: 'none', maxAge: maxAge*1000, secure: true });
        res.status(200).json({ userID: user._id, name: user.name, surname: user.surname });
    }catch(error){
        handleErrors(error);
        res.status(400).json({});
    };
};

async function getUserInfo(req, res){
    const token = req.cookies.jwt;
    const id = jwt.verify(token, process.env.SECRET).id;
    if(id){
        const user = await User.findById(id);
        const userInfo = { userID: id, chats: user.chats, contacts:user.contacts, name: user.name, surname: user.surname };
        res.status(200).json(userInfo);
    }else{
        res.status(401).end('no');
        throw Error('Need to login!');
    };
};

async function register(req, res){
    const { username, password, name, surname } = req.body;
    try{
        const user = await User.create({ 
            username: username, 
            password: password,
            name: name,
            surname: surname
        });
        const token = createJWT(user._id);
        res.cookie('jwt', token, { sameSite: 'none', maxAge: maxAge*1000, secure: true });
        res.status(200).json({ userID: user._id });
    }catch(err){
        const error = handleErrors(err);
        res.status(400).json({error});
    };
};

module.exports = { getUserInfo, login, register };
