const mongoose = require('mongoose')
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function connectDB(){
    try{
    await mongoose.connect('mongodb+srv://aqibali4906_db_user:thewanderer6002@cluster0.nfxcqgz.mongodb.net/Project')
    console.log('Connected to Database')
    }
    catch(e){
        console.log('Error connecting to Database:', e.message)
    }
}

module.exports = connectDB