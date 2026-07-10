const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express()
const usermodel = require('./models/userModel.js')
const authRouter=require('./auth/auth.js')
const profileRouter=require('./profiles/profile.js')
const dashboardModel = require('./models/dashboardModel.js')
const dashboardRouter=require('./dashboard/dashboard.js')
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: ['http://localhost:5173', 'https://final-project-2nd-year-1ro9.vercel.app'],
    credentials: true
};
app.use(cors(corsOptions));
const port= 3333
app.use('/',authRouter)
app.use('/',profileRouter)
app.use('/',dashboardRouter)

module.exports = app