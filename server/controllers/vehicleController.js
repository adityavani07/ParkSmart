const Vehicle = require('../models/Vehicle');
const QRCode = require('qrcode');
const crypto = require('crypto');

const generateQR = async (vehicle) => {
  const payload = JSON.stringify({
    id: vehicle._id,
    vn: vehicle.vehicleNumber,
    vt: vehicle.vehicleType,
    hash: crypto.createHash('md5')
      .update(vehicle._id.toString() + process.env.QR_SECRET)
      .digest('hex').substring(0, 8)
  });
  const qrImage = await QRCode.toDataURL(payload, {
    width: 300, margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  });
  return { qrData: payload, qrImage };
};

exports.registerVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, make, model, color } = req.body;
    const exists = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Vehicle already registered' });

    const vehicle = await Vehicle.create({
      user: req.user._id, vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType, make, model, color
    });

    const { qrData, qrImage } = await generateQR(vehicle);
    vehicle.qrCode = qrImage;
    vehicle.qrData = qrData;
    await vehicle.save();

    const populated = await Vehicle.findById(vehicle._id)
      .populate('user', 'name email phone department userType');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id, isActive: true })
      .populate('user', 'name email phone department userType');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isActive: true })
      .populate('user', 'name email phone department userType')
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('user', 'name email phone department userType');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    vehicle.isActive = false;
    await vehicle.save();
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};