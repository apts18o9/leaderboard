//schema to define the user 

const mongoose = require('mongoose')

//defining schema for user model

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        rquired: true,
        trim: true //to remove whitespaces from start and end
    },

    totalPoints: {
        type: Number,
        default: 0,
        min: 0 //to prevent negative values
    },

    //timestamps to check when doc was create and update
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
});


userSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next();
});

//create and export user model
const User = mongoose.model('User', userSchema);
module.exports = User;