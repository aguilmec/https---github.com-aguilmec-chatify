const express = require('express');
const controller = require('../controllers/authControllers'); 

const router = express.Router();

router.post('/login', (req, res)=>{controller.login(req, res)});
router.post('/signup', (req, res)=>{controller.register(req, res)});
router.get('/test', (req, res)=>{controller.getUserInfo(req,res)});
router.get('/logout', (req, res)=>{controller.logout(req, res)});

module.exports = router;