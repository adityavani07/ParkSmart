const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const ParkingZone = require('./models/ParkingZone');
const ParkingSession = require('./models/ParkingSession');
const QRCode = require('qrcode');
const crypto = require('crypto');

dotenv.config();

const generateQR = async (vehicle) => {
  const payload = JSON.stringify({
    id: vehicle._id, vn: vehicle.vehicleNumber, vt: vehicle.vehicleType,
    hash: crypto.createHash('md5').update(vehicle._id.toString() + process.env.QR_SECRET).digest('hex').substring(0, 8)
  });
  const qrImage = await QRCode.toDataURL(payload, { width: 300, margin: 2 });
  return { qrData: payload, qrImage };
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await ParkingZone.deleteMany({});
    await ParkingSession.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({ name: 'Admin User', email: 'admin@campus.edu', phone: '9999999999', password: 'admin123', role: 'admin', department: 'Administration', userType: 'staff' });
    console.log('Admin created: admin@campus.edu / admin123');

    const guard = await User.create({ name: 'Gate Guard', email: 'guard@campus.edu', phone: '9999999998', password: 'guard123', role: 'guard', department: 'Security', userType: 'staff' });
    console.log('Guard created: guard@campus.edu / guard123');

    const zones = await ParkingZone.insertMany([
      { name: 'Zone A - Main Gate', code: 'A', vehicleType: '2-wheeler', totalCapacity: 800, location: 'Near Main Gate', currentOccupancy: 0 },
      { name: 'Zone B - East Block', code: 'B', vehicleType: '2-wheeler', totalCapacity: 600, location: 'Near East Academic Block', currentOccupancy: 0 },
      { name: 'Zone C - West Parking', code: 'C', vehicleType: '4-wheeler', totalCapacity: 400, location: 'West Side Faculty Area', currentOccupancy: 0 },
      { name: 'Zone D - Visitor Lot', code: 'D', vehicleType: '4-wheeler', totalCapacity: 300, location: 'Near Reception', currentOccupancy: 0 },
      { name: 'Zone E - South Campus', code: 'E', vehicleType: '2-wheeler', totalCapacity: 700, location: 'Near Hostel Block', currentOccupancy: 0 },
      { name: 'Zone F - Staff Parking', code: 'F', vehicleType: '4-wheeler', totalCapacity: 200, location: 'Behind Admin Building', currentOccupancy: 0 }
    ]);
    console.log('6 Parking zones created');

    const sampleUsers = [
      { name: 'Rahul Sharma', email: 'rahul@student.edu', phone: '9876543210', department: 'Computer Science', userType: 'student' },
      { name: 'Priya Patel', email: 'priya@student.edu', phone: '9876543211', department: 'Electronics', userType: 'student' },
      { name: 'Amit Singh', email: 'amit@student.edu', phone: '9876543212', department: 'Mechanical', userType: 'student' },
      { name: 'Neha Gupta', email: 'neha@faculty.edu', phone: '9876543213', department: 'Computer Science', userType: 'faculty' },
      { name: 'Dr. Rajesh Kumar', email: 'rajesh@faculty.edu', phone: '9876543214', department: 'Physics', userType: 'faculty' }
    ];

    const sampleVehicles = [
      { vehicleNumber: 'GJ05AB1234', vehicleType: '2-wheeler', make: 'Honda', model: 'Activa', color: 'White' },
      { vehicleNumber: 'GJ05CD5678', vehicleType: '2-wheeler', make: 'TVS', model: 'Jupiter', color: 'Blue' },
      { vehicleNumber: 'GJ05EF9012', vehicleType: '4-wheeler', make: 'Maruti', model: 'Swift', color: 'Red' },
      { vehicleNumber: 'GJ05GH3456', vehicleType: '4-wheeler', make: 'Hyundai', model: 'i20', color: 'Silver' },
      { vehicleNumber: 'GJ05IJ7890', vehicleType: '4-wheeler', make: 'Honda', model: 'City', color: 'White' }
    ];

    for (let i = 0; i < sampleUsers.length; i++) {
      const user = await User.create({ ...sampleUsers[i], password: 'password123', role: 'user' });
      const vehicle = await Vehicle.create({ ...sampleVehicles[i], user: user._id });
      const { qrData, qrImage } = await generateQR(vehicle);
      vehicle.qrCode = qrImage;
      vehicle.qrData = qrData;
      await vehicle.save();

      if (i < 3) {
        const zoneIndex = sampleVehicles[i].vehicleType === '2-wheeler' ? 0 : 2;
        await ParkingSession.create({ vehicle: vehicle._id, zone: zones[zoneIndex]._id, checkInTime: new Date(Date.now() - Math.random() * 3600000 * 5), status: 'active', checkedInBy: guard._id });
        zones[zoneIndex].currentOccupancy += 1;
        await zones[zoneIndex].save();
      }
    }

    console.log('5 sample users with vehicles created');
    console.log('3 vehicles checked in');
    console.log('\n--- SEED COMPLETE ---');
    console.log('Admin: admin@campus.edu / admin123');
    console.log('Guard: guard@campus.edu / guard123');
    console.log('User: rahul@student.edu / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();