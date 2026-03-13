import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GateScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');

  const handleScan = async (decodedText) => {
    setScanning(false);
    setLoading(true);
    try {
      const { data } = await api.post('/parking/validate-qr', { qrData: decodedText });
      setResult(data);
      if (data.availableZones?.length > 0) setSelectedZone(data.availableZones[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid QR Code');
      resetScanner();
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!selectedZone) return toast.error('Please select a zone');
    setLoading(true);
    try {
      const { data } = await api.post('/parking/check-in', { vehicleId: result.vehicle._id, zoneId: selectedZone });
      toast.success(data.message);
      resetScanner();
    } catch (error) { toast.error(error.response?.data?.message || 'Check-in failed'); }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/parking/check-out', { vehicleId: result.vehicle._id });
      toast.success(`${data.message} (Duration: ${data.duration} min)`);
      resetScanner();
    } catch (error) { toast.error(error.response?.data?.message || 'Check-out failed'); }
    setLoading(false);
  };

  const resetScanner = () => { setResult(null); setSelectedZone(''); setScanning(true); };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gate Scanner</h1>
        <p className="text-gray-500">Scan vehicle QR code for check-in/check-out</p>
      </div>

      {scanning && (
        <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
          <QRScanner onScan={handleScan} />
          <p className="text-center text-sm text-gray-500 mt-4">Position the QR code within the scanner frame</p>
        </div>
      )}

      {loading && !result && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Validating QR code...</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{result.vehicle.vehicleType === '2-wheeler' ? '🏍️' : '🚗'}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{result.vehicle.vehicleNumber}</h2>
                <p className="text-gray-500">{result.vehicle.make} {result.vehicle.model} • {result.vehicle.color} • {result.vehicle.vehicleType}</p>
              </div>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">OWNER DETAILS</h3>
            <p className="font-semibold text-gray-800">{result.vehicle.user?.name}</p>
            <p className="text-sm text-gray-500">📧 {result.vehicle.user?.email}</p>
            <p className="text-sm text-gray-500">📞 {result.vehicle.user?.phone}</p>
            <p className="text-sm text-gray-500">🏢 {result.vehicle.user?.department} • {result.vehicle.user?.userType}</p>
          </div>

          {result.isParked ? (
            <div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-yellow-800 font-medium">🟡 Vehicle is currently parked</p>
                <p className="text-sm text-yellow-600">Zone: {result.activeSession?.zone?.name}<br />Since: {new Date(result.activeSession?.checkInTime).toLocaleString()}</p>
              </div>
              <button onClick={handleCheckOut} disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 text-lg">
                {loading ? 'Processing...' : '⬅️ Check Out'}
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-800 font-medium">🟢 Vehicle is not currently parked</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Parking Zone</label>
                <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">-- Select Zone --</option>
                  {result.availableZones?.map(zone => (
                    <option key={zone._id} value={zone._id}>
                      {zone.name} ({zone.vehicleType}) — {zone.totalCapacity - zone.currentOccupancy} spots available
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={handleCheckIn} disabled={loading || !selectedZone}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 text-lg">
                {loading ? 'Processing...' : '➡️ Check In'}
              </button>
            </div>
          )}
          <button onClick={resetScanner} className="w-full mt-3 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200">Scan Another Vehicle</button>
        </div>
      )}
    </div>
  );
};

export default GateScanner;