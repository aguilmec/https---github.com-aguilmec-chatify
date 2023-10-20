require('dotenv').config();
const { Chat } = require('../Models/Chat.js');
const { User } = require('../Models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

async function getChat(req, res){
    const { chatID } = req.body;
    try{
        const chat = await Chat.findOne({ chatID: chatID });
        res.status(200).json({ messages: chat.messages, users: chat.users });
    }catch(error){
        //handle errors
        res.status(400).end('');
        console.error(error);
    }; 
};

async function saveMessage(req, res){
    const { chatID, message } = req.body;
    const token = req.cookies.jwt
    const userID = jwt.verify(token, process.env.SECRET);
    try{
        await Chat.findOneAndUpdate( {chatID: chatID}, {$push: {messages: {message: message, userID: userID.id}}} );
        res.status(200).end('updated!');
        console.log('updated!');
    }catch(error){
       console.log(error); 
    }
};

async function getUser(req, res){
    const { username } = req.body;
    try{
        const user = await User.findOne({ username: username });
        res.status(200).json({ name: user.name, surname: user.surname });
    }catch(error){
        res.status(400).end('');
        console.log(error);
    };
};

async function changePassword(req, res){
    try{
        if(req.cookies.jwt){
            const token = req.cookies.jwt;
            const userID = jwt.verify(token, process.env.SECRET).id;
            try{
                const user = await User.findById(userID);
                const newPassword = req.body.newPassword;
                const oldPassword = req.body.oldPassword;
                const result = await bcrypt.compare(oldPassword, user.password);
                if(result){
                    const salt = await bcrypt.genSalt();
                    const hashedPassword = await bcrypt.hash(newPassword, salt);
                    try{       
                        await User.updateOne({ _id: userID }, { password: hashedPassword });
                        res.status(200).json({status: 'ok'});
                    }catch(error){
                        throw new Error('Update error');
                    };
                };
                }catch(error){
                    throw new Error('User not found');
            };
        };
    }catch(error){
        if(error.message === 'Update error'){
            res.status(400).json({error: error.message});
        }else{
            res.status(404).json({error: error.message});
        };
    };
};

module.exports = { getChat, saveMessage, getUser, changePassword };