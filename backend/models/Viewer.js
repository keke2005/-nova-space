
const mongoose = require('mongoose');

const viewerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Viewer', viewerSchema);
