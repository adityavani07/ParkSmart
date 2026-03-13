const express = require('express');
const router = express.Router();
const { search, getVehicleDetails } = require('../controllers/searchController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, search);
router.get('/vehicle/:id', protect, adminOnly, getVehicleDetails);

module.exports = router;