import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, historyRes] = await Promise.all([api.get('/vehicles'), api.get('/parking/my-history')]);
      setVehicles(vehiclesRes.data);
      setHistory(historyRes.data);
    } catch (error) { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const downloadQR = (vehicle) => {
    const link = document.createElement('a');
    link.download = `parking-qr-${vehicle.vehicleNumber}.png`;
    link.href = vehicle.qrCode;
    link.click();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-500">Welcome, {user.name} • {user.department} • {user.userType}</p>
        </div>
        <Link to="/register-vehicle" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">+ Add Vehicle</Link>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Vehicles ({vehicles.length})</h2>
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center mb-8">
          <span className="text-5xl block mb-4">🚗</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No vehicles registered</h3>
          <Link to="/register-vehicle" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Register Vehicle</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {vehicles.map(vehicle => (
            <div key={vehicle._id} className="bg-white rounded-xl shadow-md p-6 fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{vehicle.vehicleType === '2-wheeler' ? '🏍️' : '🚗'}</span>
                    <h3 className="text-xl font-bold text-gray-800">{vehicle.vehicleNumber}</h3>
                  </div>
                  <p className="text-gray-500 text-sm">{vehicle.make} {vehicle.model} • {vehicle.color} • {vehicle.vehicleType}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <img src={vehicle.qrCode} alt="QR" className="w-24 h-24" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-3">Show this QR code at the gate</p>
                  <button onClick={() => downloadQR(vehicle)} className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium">📥 Download QR</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Parking History</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No parking history yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(session => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{session.vehicle?.vehicleNumber}</td>
                    <td className="px-4 py-3 text-sm">{session.zone?.name}</td>
                    <td className="px-4 py-3 text-sm">{new Date(session.checkInTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{session.checkOutTime ? new Date(session.checkOutTime).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {session.status === 'active' ? '🟢 Parked' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;