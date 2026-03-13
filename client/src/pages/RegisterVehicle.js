import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const RegisterVehicle = () => {
  const [form, setForm] = useState({ vehicleNumber: '', vehicleType: '2-wheeler', make: '', model: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [registeredVehicle, setRegisteredVehicle] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/vehicles', form);
      setRegisteredVehicle(data);
      toast.success('Vehicle registered! QR code generated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const downloadQR = () => {
    if (!registeredVehicle) return;
    const link = document.createElement('a');
    link.download = `parking-qr-${registeredVehicle.vehicleNumber}.png`;
    link.href = registeredVehicle.qrCode;
    link.click();
  };

  if (registeredVehicle) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center fade-in">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Registered!</h2>
          <p className="text-gray-500 mb-6">{registeredVehicle.vehicleNumber} — {registeredVehicle.vehicleType}</p>
          <div className="bg-gray-50 rounded-xl p-6 mb-6 inline-block">
            <img src={registeredVehicle.qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Print this QR code and attach it to your vehicle.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={downloadQR} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">📥 Download QR</button>
            <button onClick={() => navigate('/dashboard')} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200">Go to Dashboard</button>
            <button onClick={() => { setRegisteredVehicle(null); setForm({ vehicleNumber: '', vehicleType: '2-wheeler', make: '', model: '', color: '' }); }}
              className="bg-green-50 text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-100">+ Add Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Register Vehicle</h2>
        <p className="text-gray-500 mt-2">Add your vehicle to get a parking QR code</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
            <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              placeholder="GJ05AB1234" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
            <div className="grid grid-cols-2 gap-4">
              {['2-wheeler', '4-wheeler'].map(type => (
                <label key={type} className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  form.vehicleType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="vehicleType" value={type} checked={form.vehicleType === type} onChange={handleChange} className="hidden" />
                  <span className="text-2xl mr-2">{type === '2-wheeler' ? '🏍️' : '🚗'}</span>
                  <span className="font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input name="make" value={form.make} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Honda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input name="model" value={form.model} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Activa" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input name="color" value={form.color} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="White" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Registering...' : 'Register & Generate QR Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterVehicle;