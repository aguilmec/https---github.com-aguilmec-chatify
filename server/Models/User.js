const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please enter your username'],
        unique: true,
        lowercase: true
    },
    name:{
        type: String,
        required: [true, 'Please enter your name']
    },
    surname:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true, 'Please enter your password']
    },
    chats:{
        type: Array,
    },
    contacts:{
        type: Array
    },
    refreshToken: {
        type: String
    }
});

userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.statics.login = async function (username, password){
    console.log('7')
    const user = await this.findOne({ username });
    console.log('8')
    if(user){
        console.log('9')
        const result = await bcrypt.compare(password, user.password);
        console.log('10')
        if(result){
            console.log('11')
            return user; 
        };
        throw Error('Incorrect password');
    };
    throw Error('Incorrect username');
};

const User = model('User', userSchema);

module.exports = { User };
