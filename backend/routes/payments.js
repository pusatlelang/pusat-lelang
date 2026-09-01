const express = require('express');
const authMiddleware = require('../middleware/auth');
const Payment = require('../models/Payment');

const router = express.Router();

// Create payment for auction win
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { auctionId, amount } = req.body;

    const payment = new Payment({
      user: req.userId,
      auction: auctionId,
      amount,
      status: 'pending',
      method: 'transfer'
    });

    await payment.save();

    res.status(201).json({
      message: 'Pembayaran dibuat',
      paymentId: payment._id,
      amount: payment.amount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
router.patch('/:paymentId/confirm', authMiddleware, async (req, res) => {
  try {
    const { proof } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { status: 'confirmed', proof, confirmedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Pembayaran dikonfirmasi', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment status
router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
