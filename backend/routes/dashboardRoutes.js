const express = require('express');
const router = express.Router();

const Content = require('../models/Content');
const Comment = require('../models/Comment');
const protect = require('../middleware/authMiddleware');

// Get dashboard statistics
router.get('/stats', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const totalContent = await Content.countDocuments({
            createdBy: userId
        });

        const publishedContent = await Content.countDocuments({
            createdBy: userId,
            status: 'Published'
        });

        const draftContent = await Content.countDocuments({
            createdBy: userId,
            status: 'Draft'
        });

        const scheduledContent = await Content.countDocuments({
            createdBy: userId,
            status: 'Scheduled'
        });

        const contentIds = await Content.find({
            createdBy: userId
        }).distinct('_id');

        const totalComments = await Comment.countDocuments({
            contentId: { $in: contentIds }
        });

        res.status(200).json({
            totalContent,
            publishedContent,
            draftContent,
            scheduledContent,
            totalComments
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;