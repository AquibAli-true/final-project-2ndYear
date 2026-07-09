const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express()
const usermodel = require('./models/userModel.js')
const authRouter=require('./auth/auth.js')
const profileRouter=require('./profiles/profile.js')
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: 'http://localhost:5173' ,
    credentials: true
};
app.use(cors(corsOptions));
const port= 3333
app.use('/',authRouter)
app.use('/',profileRouter)


module.exports = app