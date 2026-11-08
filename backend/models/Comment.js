
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        required: true
    },
    viewerName: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Hidden'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
