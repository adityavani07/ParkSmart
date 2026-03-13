const Vehicle = require('../models/Vehicle');
const ParkingSession = require('../models/ParkingSession');
const User = require('../models/User');

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ message: 'Search query must be at least 2 characters' });

    const searchRegex = new RegExp(q, 'i');

    const vehiclesByNumber = await Vehicle.find({ vehicleNumber: searchRegex, isActive: true })
      .populate('user', 'name email phone department userType');

    const users = await User.find({ $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }] }).select('_id');
    const userIds = users.map(u => u._id);
    const vehiclesByOwner = await Vehicle.find({ user: { $in: userIds }, isActive: true })
      .populate('user', 'name email phone department userType');

    const allVehicles = [...vehiclesByNumber, ...vehiclesByOwner];
    const uniqueMap = new Map();
    allVehicles.forEach(v => uniqueMap.set(v._id.toString(), v));
    const results = Array.from(uniqueMap.values());

    const vehicleIds = results.map(v => v._id);
    const activeSessions = await ParkingSession.find({ vehicle: { $in: vehicleIds }, status: 'active' }).populate('zone');
    const sessionMap = {};
    activeSessions.forEach(s => { sessionMap[s.vehicle.toString()] = s; });

    const enrichedResults = results.map(v => ({
      ...v.toObject(),
      isCurrentlyParked: !!sessionMap[v._id.toString()],
      currentSession: sessionMap[v._id.toString()] || null
    }));

    res.json({ results: enrichedResults, count: enrichedResults.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVehicleDetails = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('user', 'name email phone department userType');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const activeSession = await ParkingSession.findOne({ vehicle: vehicle._id, status: 'active' }).populate('zone');
    const recentSessions = await ParkingSession.find({ vehicle: vehicle._id })
      .populate('zone').sort({ createdAt: -1 }).limit(10);

    res.json({ vehicle, isCurrentlyParked: !!activeSession, activeSession, recentSessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};