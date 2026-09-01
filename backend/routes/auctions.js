const express = require('express');
const authMiddleware = require('../middleware/auth');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const router = express.Router();

// Get all active auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('seller', 'fullName phone')
      .sort({ createdAt: -1 });
    
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auction details
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'fullName phone email')
      .populate({
        path: 'bids',
        populate: { path: 'bidder', select: 'fullName' }
      });
    
    if (!auction) {
      return res.status(404).json({ error: 'Lelang tidak ditemukan' });
    }
    
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new auction (seller only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, startingPrice, endDate, images } = req.body;

    const auction = new Auction({
      title,
      description,
      category,
      startingPrice,
      endDate: new Date(endDate),
      seller: req.userId,
      images,
      status: 'active'
    });

    await auction.save();
    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close auction (seller only)
router.patch('/:id/close', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ error: 'Lelang tidak ditemukan' });
    }

    if (auction.seller.toString() !== req.userId) {
      return res.status(403).json({ error: 'Anda tidak berhak mengubah lelang ini' });
    }

    auction.status = 'closed';
    await auction.save();

    res.json({ message: 'Lelang ditutup', auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
