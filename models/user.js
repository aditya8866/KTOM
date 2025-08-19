const mongoose = require("mongoose");

const hisaabSchema = new mongoose.Schema({
    date: {
        type: Date, default: Date.now
    },
    title: {
        type: String,
        required: true
    },
    detail : {
        type: String,
        required: true
    },
    isEncrypted : {
        type:Boolean,
        default : false
    },
    encryptedPassword:{
        type : String,
        default : null
    }
});

const userSchema = new mongoose.Schema({
    email: { 
        type: String,
        required: true,
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    hisaabDetails: {
        type: [hisaabSchema],
        default: [],
    },
});

const User = mongoose.model("User", userSchema);


module.exports = User;
