

const mongoose = require('mongoose');

const pointHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },

    userName: {
        type: String,
        required: true
    },

    pointsClaimed: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },

    timeStamp: {
        type: Date,
        default: Date.now
    }
});

const PointHistory = mongoose.model('PointHistory', pointHistorySchema);
module.exports = PointHistory