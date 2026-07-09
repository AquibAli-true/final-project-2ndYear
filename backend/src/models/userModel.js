const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    age:{
        type:Number,
        required:true,
        min:0,
        max:130,
    },
    sex:{
        type:String,
        required:true,
        enum:["male","female"]
    },
    weight:{
        type:Number,
        min:0,
        max:650,
        required:true
    },
    height:{
        type:Number,
        min:0,
        max:250,
        required:true
    },
    token:{
        type:String,
        default:null
    }
},{
    timestamps:true
}
)

const userModel = mongoose.model('user',userSchema)
module.exports = userModel