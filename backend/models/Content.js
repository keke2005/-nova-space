
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['Video', 'Article', 'Image', 'Podcast'],
        required: true
    },
    thumbnail: {
        type: String,
        default: ''
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    articleContent: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Scheduled'],
        default: 'Draft'
    },
    publicationDate: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
