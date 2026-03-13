import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import StatsCard from '../components/StatsCard';
import ZoneCard from '../components/ZoneCard';

const AdminDashboard = () => {
  const { zones: socketZones, activities } = useSocket();
  const [stats, setStats] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { if (socketZones.length > 0) setZones(socketZones); }, [socketZones]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/parking/stats');
      setStats(data);
      setZones(data.zones);
    } catch (error) { console.error('Failed to fetch stats'); }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Real-time parking overview</p>
        </div>
        <div className="flex gap-3">
          <Link to="/scanner" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">📷 Scanner</Link>
          <Link to="/search" className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200">🔍 Search</Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Registered" value={stats.totalVehicles} icon="🚗" color="blue" />
          <StatsCard title="Currently Parked" value={stats.totalActive} icon="🅿️" color="green" />
          <StatsCard title="Available" value={stats.availableSpots} icon="✅" color="yellow" />
          <StatsCard title="2W Parked" value={stats.twoWheeler.parked} icon="🏍️" color="indigo" subtitle={`of ${stats.twoWheeler.capacity}`} />
          <StatsCard title="4W Parked" value={stats.fourWheeler.parked} icon="🚗" color="purple" subtitle={`of ${stats.fourWheeler.capacity}`} />
          <StatsCard title="Today In/Out" value={`${stats.todayCheckIns}/${stats.todayCheckOuts}`} icon="📊" color="blue" />
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Zone Status <span className="text-sm font-normal text-green-600 ml-2">● Live</span></h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {zones.map(zone => <ZoneCard key={zone._id} zone={zone} />)}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <div className="bg-white rounded-xl shadow-md p-4">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No recent activity — waiting for real-time updates...</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {activities.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{activity.type === 'check-in' ? '➡️' : '⬅️'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.vehicleNumber} <span className="text-gray-400 font-normal">— {activity.userName}</span></p>
                    <p className="text-xs text-gray-500">{activity.zoneName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${activity.type === 'check-in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {activity.type === 'check-in' ? 'IN' : 'OUT'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(activity.time).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { to: '/scanner', icon: '📷', label: 'QR Scanner', desc: 'Check-in / Check-out' },
          { to: '/search', icon: '🔍', label: 'Vehicle Search', desc: 'Find owner info' },
          { to: '/zones', icon: '🗺️', label: 'Zone Management', desc: 'Manage parking zones' },
          { to: '/history', icon: '📋', label: 'Parking History', desc: 'View all logs' }
        ].map((item, i) => (
          <Link key={i} to={item.to} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow text-center">
            <span className="text-3xl block mb-2">{item.icon}</span>
            <h3 className="font-semibold text-gray-800">{item.label}</h3>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;