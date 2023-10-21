const express = require('express');
const controller = require('../controllers/chatsControllers.js');

const router = express.Router();

router.post('/chat', (req, res)=>{controller.getChat(req, res)});
router.post('/save', (req, res)=>{controller.saveMessage(req, res)});
router.post('/user', (req, res)=>{controller.getUser(req, res)});
router.post('/password', (req,res)=>{controller.changePassword(req, res)});
router.post('/picture', (req,res)=>{controller.updatePicture(req, res)});

module.exports = router;