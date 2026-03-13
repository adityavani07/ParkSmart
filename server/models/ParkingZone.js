const mongoose = require('mongoose');

const parkingZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Zone code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['2-wheeler', '4-wheeler'],
    required: true
  },
  totalCapacity: {
    type: Number,
    required: [true, 'Total capacity is required'],
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

parkingZoneSchema.virtual('availableSpots').get(function() {
  return this.totalCapacity - this.currentOccupancy;
});

parkingZoneSchema.virtual('occupancyPercent').get(function() {
  return Math.round((this.currentOccupancy / this.totalCapacity) * 100);
});

parkingZoneSchema.set('toJSON', { virtuals: true });
parkingZoneSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ParkingZone', parkingZoneSchema);