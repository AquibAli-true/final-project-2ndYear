const express = require('express')
const router = express.Router();
const userModel = require('../models/userModel.js');

router.post('/sign-up', async (req, res) => {
    try{
        const token = 'token_' + Math.random().toString(36).substring(2) + Date.now()
        const newUser = await userModel.create({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            age: req.body.age,
            sex: req.body.sex,
            weight: req.body.weight,
            height: req.body.height,
            token: token
        })
        res.cookie('user_session', token, { 
    maxAge: 7*24 * 60 * 60 * 1000, 
    httpOnly: true,
    secure: true,
    sameSite: 'none'
});
        res.status(201).json({ message: 'User created', user: { id: newUser._id, name: newUser.name } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}).post('/log-in', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = 'token_' + Math.random().toString(36).substring(2) + Date.now();
        user.token = token;
        await user.save();
        res.cookie('user_session', token, { 
    maxAge: 7*24 * 60 * 60 * 1000, 
    httpOnly: true,
    secure: true,
    sameSite: 'none'
});
        res.status(200).json({ message: 'Login successful', user: { id: user._id, name: user.name } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}).get('/verify', async (req, res) => {
    try {
        const token = req.cookies.user_session; 
        if (!token) {
            return res.status(401).json({ authenticated: false });
        }
        const user = await userModel.findOne({ token:token });
        if (!user) {
            return res.status(401).json({ authenticated: false });
        }
        res.status(200).json({ authenticated: true, user: { id: user._id, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}).post('/log-out', async (req, res) => {
    try {
        const token = req.cookies.user_session;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await userModel.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        user.token = null;
        await user.save();
        res.clearCookie('user_session', { secure: true, sameSite: 'none' });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;