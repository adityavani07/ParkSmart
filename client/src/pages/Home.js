import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/parking/stats');
        setStats(data);
      } catch (err) {}
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Smart Campus<br />
            <span className="text-blue-300">Parking System</span>
          </h1>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Digitizing the parking ecosystem for 3000+ daily vehicles with
            QR-based registration, real-time tracking, and instant owner lookup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link to="/register" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 text-lg">Register Vehicle</Link>
                <Link to="/login" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 text-lg">Login</Link>
              </>
            ) : user.role === 'user' ? (
              <>
                <Link to="/dashboard" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 text-lg">My Dashboard</Link>
                <Link to="/register-vehicle" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 text-lg">Add Vehicle</Link>
              </>
            ) : (
              <>
                <Link to="/admin" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 text-lg">Admin Dashboard</Link>
                <Link to="/scanner" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 text-lg">Open Scanner</Link>
              </>
            )}
            <Link to="/occupancy" className="border-2 border-blue-300 text-blue-200 font-bold px-8 py-3 rounded-xl hover:bg-white/10 text-lg">Live Status</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: '📝', title: 'Register', desc: 'Register your vehicle and get a unique QR code' },
            { icon: '📱', title: 'Scan', desc: 'QR code scanned at entry gate for check-in' },
            { icon: '📊', title: 'Track', desc: 'Real-time zone occupancy tracking across campus' },
            { icon: '🔍', title: 'Search', desc: 'Instantly find any vehicle owner with contact info' }
          ].map((f, i) => (
            <div key={i} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <span className="text-5xl mb-4 block">{f.icon}</span>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {stats && (
        <div className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Live Campus Parking</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow">
                <p className="text-4xl font-bold text-blue-600">{stats.totalVehicles}</p>
                <p className="text-gray-500 mt-1">Registered Vehicles</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow">
                <p className="text-4xl font-bold text-green-600">{stats.totalActive}</p>
                <p className="text-gray-500 mt-1">Currently Parked</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow">
                <p className="text-4xl font-bold text-yellow-600">{stats.availableSpots}</p>
                <p className="text-gray-500 mt-1">Available Spots</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow">
                <p className="text-4xl font-bold text-purple-600">{stats.zones?.length || 0}</p>
                <p className="text-gray-500 mt-1">Parking Zones</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p>🅿️ ParkSmart — Smart Campus Parking System</p>
        <p className="text-sm mt-2">Built with React, Node.js, MongoDB, Socket.IO</p>
      </footer>
    </div>
  );
};

export default Home;