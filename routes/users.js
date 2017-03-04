const express = require('express');
const router = express.Router();
const User = require('../models/users');
const config = require('../config/database');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res, next)=>{
	console.log("Name : ", req.body.name);
	let newUser = new User({
		name : req.body.name,
		email : req.body.email,
		username : req.body.username,
		password : req.body.password
	});

	User.addUser(newUser, (err, user) =>{
		if(err){
			res.json({
				success : false,
				message : 'Failed to register user.'
			});
		} else {
			res.json({
				success : true,
				message : 'User registered successfully.'
			});
		}
	});
	//res.send("Register");
});

router.post('/authenticate', (req, res, next)=>{
	const username = req.body.username;
	const password = req.body.password;

	User.getUserByUsername(username, (err, user)=>{
		if(err) throw err;
		if(!user){
			return res.json({success : false, message : "User not found"});
		}
		User.comparePassword(password,  user.password, (err, isMatch)=>{
			if(err) throw err;
			if(isMatch){
				const token = jwt.sign(user, config.secret, {
					expiresIn : 604800,
				});
				res.json({
					success : true,
					token : "JWT "+token,
					user : user,
				});
			}else{
				res.json({success : false, message : "Wrong password"});
			}
		});
	});
});

router.get('/profile', passport.authenticate("jwt", {session:false}) ,(req, res, next)=>{
	res.json({user : req.user});
});

router.get('/validate', (req, res, next)=>{
	res.send("Validate");
});

module.exports = router;
