const express = require('express');
const router = express.Router();

// POST /api/payment - Simulate payment processing
router.post('/', async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Simulate payment processing with random success/failure (90% success rate)
    const success = Math.random() > 0.1;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    if (success) {
      res.json({
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount,
        paymentMethod,
        message: 'Payment successful'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment failed. Please try again.',
        message: 'Payment gateway error'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

