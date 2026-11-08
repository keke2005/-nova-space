
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register the first creator account
router.post('/register', async (req, res) => {
    try {
        const userCount = await User.countDocuments();

        if (userCount > 0) {
            return res.status(403).json({
                message: 'Creator registration is closed.'
            });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({
                message: 'Provide a name, email and password of at least 8 characters.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'Creator account created successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Creator login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
