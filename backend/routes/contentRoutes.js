
const express = require('express');
const router = express.Router();

const Content = require('../models/Content');
const protect = require('../middleware/authMiddleware');

// GET all content belonging to the logged-in creator
router.get('/manage/all', protect, async (req, res) => {
    try {
        const contents = await Content.find({
            createdBy: req.user.id
        }).sort({ createdAt: -1 });

        res.json(contents);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET published content for public viewers
router.get('/', async (req, res) => {
    try {
        const contents = await Content.find({
            status: 'Published',
            $or: [
                { publicationDate: { $lte: new Date() } },
                { publicationDate: null }
            ]
        }).sort({ createdAt: -1 });

        res.json(contents);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET one published content item and increase views
router.get('/:id', async (req, res) => {
    try {
        const content = await Content.findOneAndUpdate(
            {
                _id: req.params.id,
                status: 'Published',
                $or: [
                    { publicationDate: { $lte: new Date() } },
                    { publicationDate: null }
                ]
            },
            {
                $inc: { views: 1 }
            },
            {
                new: true
            }
        );

        if (!content) {
            return res.status(404).json({
                message: 'Content not found.'
            });
        }

        res.json(content);
    } catch (error) {
        res.status(400).json({
            message: 'Invalid content ID.'
        });
    }
});

// CREATE content (creator only)
router.post('/', protect, async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            contentType,
            thumbnail,
            mediaUrl,
            articleContent,
            status,
            publicationDate
        } = req.body;

        const contentStatus = status || 'Draft';

        if (
            contentStatus === 'Scheduled' &&
            (
                !publicationDate ||
                new Date(publicationDate) <= new Date()
            )
        ) {
            return res.status(400).json({
                message: 'Choose a future publication date.'
            });
        }

        const content = await Content.create({
            title,
            description,
            category,
            contentType,
            thumbnail,
            mediaUrl,
            articleContent,
            status: contentStatus,
            publicationDate: publicationDate || null,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: 'Content created successfully.',
            content
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// UPDATE content (creator only)
router.put('/:id', protect, async (req, res) => {
    try {
        const allowedFields = [
            'title',
            'description',
            'category',
            'contentType',
            'thumbnail',
            'mediaUrl',
            'articleContent',
            'status',
            'publicationDate'
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const existing = await Content.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!existing) {
            return res.status(404).json({
                message: 'Content not found.'
            });
        }

        const newStatus = updates.status || existing.status;

        const newDate =
            updates.publicationDate !== undefined
                ? updates.publicationDate
                : existing.publicationDate;

        if (
            newStatus === 'Scheduled' &&
            (
                !newDate ||
                new Date(newDate) <= new Date()
            )
        ) {
            return res.status(400).json({
                message: 'Choose a future publication date.'
            });
        }

        const content = await Content.findByIdAndUpdate(
            existing._id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            message: 'Content updated successfully.',
            content
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE content (creator only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const content = await Content.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!content) {
            return res.status(404).json({
                message: 'Content not found.'
            });
        }

        res.json({
            message: 'Content deleted successfully.'
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

module.exports = router;
