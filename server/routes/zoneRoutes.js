const express = require('express');
const router = express.Router();
const { getAllZones, createZone, updateZone, deleteZone } = require('../controllers/zoneController');
const { protect, superAdminOnly } = require('../middleware/auth');

router.get('/', getAllZones);
router.post('/', protect, superAdminOnly, createZone);
router.put('/:id', protect, superAdminOnly, updateZone);
router.delete('/:id', protect, superAdminOnly, deleteZone);

module.exports = router;