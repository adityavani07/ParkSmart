const express = require('express');
const router = express.Router();
const { registerVehicle, getMyVehicles, getAllVehicles, getVehicleById, deleteVehicle } = require('../controllers/vehicleController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, registerVehicle);
router.get('/', protect, getMyVehicles);
router.get('/all', protect, adminOnly, getAllVehicles);
router.get('/:id', protect, getVehicleById);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;