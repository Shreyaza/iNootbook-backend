const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        requried: true
    },
    email:{
        type: String,
        requried: true,
        unique: true
    },
    password:{
        type: String,
        requried: true
    },
    date:{
        type: Date,
        default: Date.now
    },
});

const User = mongoose.model('user', UserSchema);
module.exports = User;