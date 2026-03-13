const express = require('express');
const router = express.Router();
const { checkIn, checkOut, validateQR, getActiveSessions, getHistory, getMyHistory, getStats } = require('../controllers/parkingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/check-in', protect, adminOnly, checkIn);
router.post('/check-out', protect, adminOnly, checkOut);
router.post('/validate-qr', protect, adminOnly, validateQR);
router.get('/active', protect, adminOnly, getActiveSessions);
router.get('/history', protect, adminOnly, getHistory);
router.get('/my-history', protect, getMyHistory);
router.get('/stats', protect, getStats);

module.exports = router;