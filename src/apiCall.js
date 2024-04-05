// File made with the assistance of Chat-GPT
const mongoose = require('mongoose');

const apiCallSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    apiCallsCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('ApiCall', apiCallSchema);