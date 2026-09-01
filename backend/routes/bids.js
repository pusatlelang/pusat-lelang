const express = require('express');
const authMiddleware = require('../middleware/auth');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

const router = express.Router();

// Place a bid
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Lelang tidak ditemukan' });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ error: 'Lelang sudah ditutup' });
    }

    if (bidAmount <= auction.currentHighestBid) {
      return res.status(400).json({ error: 'Penawaran harus lebih tinggi dari penawaran tertinggi' });
    }

    const bid = new Bid({
      auction: auctionId,
      bidder: req.userId,
      bidAmount,
      bidTime: new Date()
    });

    await bid.save();

    auction.currentHighestBid = bidAmount;
    auction.highestBidder = req.userId;
    auction.bids.push(bid._id);
    await auction.save();

    res.status(201).json({
      message: 'Penawaran berhasil dicatat',
      bid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bids for auction
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'fullName')
      .sort({ bidAmount: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's bids
router.get('/user/mybids', authMiddleware, async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.userId })
      .populate('auction')
      .sort({ bidTime: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
