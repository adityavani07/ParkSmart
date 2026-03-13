const ParkingZone = require('../models/ParkingZone');

exports.getAllZones = async (req, res) => {
  try {
    const zones = await ParkingZone.find({ isActive: true }).sort({ code: 1 });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createZone = async (req, res) => {
  try {
    const { name, code, vehicleType, totalCapacity, location } = req.body;
    const exists = await ParkingZone.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Zone code already exists' });

    const zone = await ParkingZone.create({ name, code: code.toUpperCase(), vehicleType, totalCapacity, location });

    const io = req.app.get('io');
    const allZones = await ParkingZone.find({ isActive: true });
    io.emit('occupancy-update', allZones);

    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateZone = async (req, res) => {
  try {
    const zone = await ParkingZone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });

    const { name, totalCapacity, location, isActive } = req.body;
    if (name) zone.name = name;
    if (totalCapacity) zone.totalCapacity = totalCapacity;
    if (location !== undefined) zone.location = location;
    if (isActive !== undefined) zone.isActive = isActive;
    await zone.save();

    const io = req.app.get('io');
    const allZones = await ParkingZone.find({ isActive: true });
    io.emit('occupancy-update', allZones);

    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteZone = async (req, res) => {
  try {
    const zone = await ParkingZone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    zone.isActive = false;
    await zone.save();
    res.json({ message: 'Zone deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};