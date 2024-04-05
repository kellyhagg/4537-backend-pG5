// File made with the assistance of Chat-GPT
const mongoose = require('mongoose');

const apiStatsSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true,
        enum: ['GET', 'POST', 'PUT', 'DELETE']
    },
    endpoint: {
        type: String,
        required: true
    },
    requestCount: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('ApiStats', apiStatsSchema);
