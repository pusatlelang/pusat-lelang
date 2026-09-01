const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, address, city, province } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, phone, address, city, province },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profil diperbarui', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's auctions
router.get('/auctions/my-auctions', authMiddleware, async (req, res) => {
  try {
    const Auction = require('../models/Auction');
    const auctions = await Auction.find({ seller: req.userId });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
