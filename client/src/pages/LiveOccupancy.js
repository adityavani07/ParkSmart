import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import ZoneCard from '../components/ZoneCard';

const LiveOccupancy = () => {
  const { zones: socketZones } = useSocket();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchZones(); }, []);
  useEffect(() => { if (socketZones.length > 0) setZones(socketZones); }, [socketZones]);

  const fetchZones = async () => {
    try { const { data } = await api.get('/zones'); setZones(data); } catch (error) { console.error('Failed to fetch zones'); }
    setLoading(false);
  };

  const twoWheelerZones = zones.filter(z => z.vehicleType === '2-wheeler');
  const fourWheelerZones = zones.filter(z => z.vehicleType === '4-wheeler');
  const totalCapacity = zones.reduce((s, z) => s + z.totalCapacity, 0);
  const totalOccupancy = zones.reduce((s, z) => s + z.currentOccupancy, 0);
  const overallPercent = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Live Parking Status</h1>
        <p className="text-gray-500">Real-time occupancy across all campus zones <span className="text-green-500 ml-2">● Live</span></p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Overall Campus Occupancy</h2>
          <span className="text-2xl font-bold text-blue-600">{overallPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div className={`h-4 rounded-full transition-all duration-500 ${overallPercent >= 90 ? 'bg-red-500' : overallPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${overallPercent}%` }}></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{totalOccupancy} vehicles parked</span>
          <span>{totalCapacity - totalOccupancy} spots available</span>
          <span>{totalCapacity} total capacity</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">🏍️ Two-Wheeler Zones</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {twoWheelerZones.map(zone => <ZoneCard key={zone._id} zone={zone} />)}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">🚗 Four-Wheeler Zones</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fourWheelerZones.map(zone => <ZoneCard key={zone._id} zone={zone} />)}
      </div>

      <div className="flex justify-center gap-8 mt-8 text-sm text-gray-500">
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Available (&lt;70%)</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Filling Up (70-90%)</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Almost Full (&gt;90%)</span>
      </div>
    </div>
  );
};

export default LiveOccupancy;