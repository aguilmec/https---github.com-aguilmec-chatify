const { Schema, model } = require('mongoose');

const chatSchema = new Schema({
    chatID: {
        type: String,
        required: true,
        unique: true
    },
    messages: {
        type: Array
    },
    users: {
        type: Array,
        required: true
    }
});

const Chat = model('Chat',chatSchema);

module.exports = { Chat };