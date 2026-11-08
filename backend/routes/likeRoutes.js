const express = require('express');
const router = express.Router();

const Like = require('../models/Like');
const Content = require('../models/Content');

// Like or unlike content
router.post('/:contentId', async (req, res) => {
    try {
        const { viewerId } = req.body;

        if (!viewerId) {
            return res.status(400).json({
                message: 'Viewer ID is required.'
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

        const existingLike = await Like.findOne({
            contentId: content._id,
            viewerId
        });

        if (existingLike) {
            await Like.findByIdAndDelete(existingLike._id);

            return res.status(200).json({
                message: 'Like removed.',
                liked: false
            });
        }

        await Like.create({
            contentId: content._id,
            viewerId
        });

        res.status(201).json({
            message: 'Content liked successfully.',
            liked: true
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get total likes for content
router.get('/:contentId', async (req, res) => {
    try {
        const totalLikes = await Like.countDocuments({
            contentId: req.params.contentId
        });

        res.status(200).json({ totalLikes });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;