const ParkingSession = require('../models/ParkingSession');
const ParkingZone = require('../models/ParkingZone');
const Vehicle = require('../models/Vehicle');
const crypto = require('crypto');

exports.checkIn = async (req, res) => {
  try {
    const { vehicleId, zoneId } = req.body;
    const vehicle = await Vehicle.findById(vehicleId).populate('user', 'name email phone');
    if (!vehicle || !vehicle.isActive) return res.status(404).json({ message: 'Vehicle not registered or inactive' });

    const activeSession = await ParkingSession.findOne({ vehicle: vehicleId, status: 'active' }).populate('zone');
    if (activeSession) return res.status(409).json({ message: 'Vehicle already checked in', zone: activeSession.zone.name, since: activeSession.checkInTime });

    const zone = await ParkingZone.findById(zoneId);
    if (!zone || !zone.isActive) return res.status(404).json({ message: 'Zone not found' });
    if (zone.vehicleType !== vehicle.vehicleType) return res.status(400).json({ message: `This zone is for ${zone.vehicleType} only` });

    if (zone.currentOccupancy >= zone.totalCapacity) {
      const alternatives = await ParkingZone.find({ vehicleType: vehicle.vehicleType, isActive: true, $expr: { $lt: ['$currentOccupancy', '$totalCapacity'] } });
      return res.status(400).json({ message: 'Zone is full', alternatives });
    }

    const session = await ParkingSession.create({ vehicle: vehicleId, zone: zoneId, checkInTime: new Date(), status: 'active', checkedInBy: req.user._id });
    zone.currentOccupancy += 1;
    await zone.save();

    const populatedSession = await ParkingSession.findById(session._id)
      .populate({ path: 'vehicle', populate: { path: 'user', select: 'name email phone' } }).populate('zone');

    const io = req.app.get('io');
    const allZones = await ParkingZone.find({ isActive: true });
    io.emit('occupancy-update', allZones);
    io.emit('new-activity', { type: 'check-in', vehicleNumber: vehicle.vehicleNumber, zoneName: zone.name, time: new Date(), userName: vehicle.user.name });

    res.status(201).json({ message: `${vehicle.vehicleNumber} checked into ${zone.name}`, session: populatedSession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const session = await ParkingSession.findOne({ vehicle: vehicleId, status: 'active' })
      .populate('zone').populate({ path: 'vehicle', populate: { path: 'user', select: 'name email phone' } });
    if (!session) return res.status(404).json({ message: 'No active parking session found' });

    session.checkOutTime = new Date();
    session.status = 'completed';
    session.checkedOutBy = req.user._id;
    session.duration = Math.round((session.checkOutTime - session.checkInTime) / 60000);
    await session.save();

    const zone = await ParkingZone.findById(session.zone._id);
    zone.currentOccupancy = Math.max(0, zone.currentOccupancy - 1);
    await zone.save();

    const io = req.app.get('io');
    const allZones = await ParkingZone.find({ isActive: true });
    io.emit('occupancy-update', allZones);
    io.emit('new-activity', { type: 'check-out', vehicleNumber: session.vehicle.vehicleNumber, zoneName: session.zone.name, time: new Date(), userName: session.vehicle.user.name });

    res.json({ message: `${session.vehicle.vehicleNumber} checked out from ${session.zone.name}`, session, duration: session.duration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    let parsed;
    try { parsed = JSON.parse(qrData); } catch { return res.status(400).json({ message: 'Invalid QR code' }); }

    const expectedHash = crypto.createHash('md5').update(parsed.id + process.env.QR_SECRET).digest('hex').substring(0, 8);
    if (parsed.hash !== expectedHash) return res.status(400).json({ message: 'QR code verification failed' });

    const vehicle = await Vehicle.findById(parsed.id).populate('user', 'name email phone department userType');
    if (!vehicle || !vehicle.isActive) return res.status(404).json({ message: 'Vehicle not found or inactive' });

    const activeSession = await ParkingSession.findOne({ vehicle: vehicle._id, status: 'active' }).populate('zone');
    const availableZones = await ParkingZone.find({ vehicleType: vehicle.vehicleType, isActive: true, $expr: { $lt: ['$currentOccupancy', '$totalCapacity'] } });

    res.json({ vehicle, isParked: !!activeSession, activeSession, availableZones });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await ParkingSession.find({ status: 'active' })
      .populate({ path: 'vehicle', populate: { path: 'user', select: 'name email phone' } })
      .populate('zone').sort({ checkInTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const sessions = await ParkingSession.find()
      .populate({ path: 'vehicle', populate: { path: 'user', select: 'name email phone' } })
      .populate('zone').sort({ createdAt: -1 })
      .limit(limit * 1).skip((page - 1) * limit);
    const total = await ParkingSession.countDocuments();
    res.json({ sessions, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyHistory = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id });
    const vehicleIds = vehicles.map(v => v._id);
    const sessions = await ParkingSession.find({ vehicle: { $in: vehicleIds } })
      .populate('vehicle').populate('zone').sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ isActive: true });
    const totalActive = await ParkingSession.countDocuments({ status: 'active' });
    const zones = await ParkingZone.find({ isActive: true });

    const twoWheelerZones = zones.filter(z => z.vehicleType === '2-wheeler');
    const fourWheelerZones = zones.filter(z => z.vehicleType === '4-wheeler');

    const totalCapacity = zones.reduce((s, z) => s + z.totalCapacity, 0);
    const totalOccupancy = zones.reduce((s, z) => s + z.currentOccupancy, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCheckIns = await ParkingSession.countDocuments({ checkInTime: { $gte: today } });
    const todayCheckOuts = await ParkingSession.countDocuments({ checkOutTime: { $gte: today } });

    res.json({
      totalVehicles, totalActive, totalCapacity, totalOccupancy,
      availableSpots: totalCapacity - totalOccupancy,
      twoWheeler: { parked: twoWheelerZones.reduce((s, z) => s + z.currentOccupancy, 0), capacity: twoWheelerZones.reduce((s, z) => s + z.totalCapacity, 0) },
      fourWheeler: { parked: fourWheelerZones.reduce((s, z) => s + z.currentOccupancy, 0), capacity: fourWheelerZones.reduce((s, z) => s + z.totalCapacity, 0) },
      todayCheckIns, todayCheckOuts, zones
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};