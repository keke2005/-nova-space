const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment');
const Content = require('../models/Content');
const protect = require('../middleware/authMiddleware');

// Add a comment
router.post('/:contentId', async (req, res) => {
    try {
        const { viewerName, message } = req.body;

        if (!viewerName || !message) {
            return res.status(400).json({
                message: 'Name and comment are required.'
            });
        }

        const content = await Content.findOne({
            _id: req.params.contentId,
            status: 'Published'
        });

        if (!content) {
            return res.status(404).json({
                message: 'Content not found.'
            });
        }

        const comment = await Comment.create({
            contentId: content._id,
            viewerName,
            message
        });

        res.status(201).json({
            message: 'Comment submitted for approval.',
            comment
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get approved comments for content
router.get('/:contentId', async (req, res) => {
    try {
        const comments = await Comment.find({
            contentId: req.params.contentId,
            status: 'Approved'
        }).sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Creator: view all comments for moderation
router.get('/manage/all', protect, async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('contentId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Creator: approve or hide a comment
router.put('/manage/:id', protect, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Approved', 'Hidden', 'Pending'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid comment status.'
            });
        }

        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found.'
            });
        }

        res.status(200).json({
            message: 'Comment updated successfully.',
            comment
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;