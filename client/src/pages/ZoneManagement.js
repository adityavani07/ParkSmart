import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', vehicleType: '2-wheeler', totalCapacity: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    try { const { data } = await api.get('/zones'); setZones(data); } catch (error) { toast.error('Failed to load zones'); }
    setLoading(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/zones/${editingId}`, form); toast.success('Zone updated'); }
      else { await api.post('/zones', { ...form, totalCapacity: parseInt(form.totalCapacity) }); toast.success('Zone created'); }
      setShowForm(false); setEditingId(null);
      setForm({ name: '', code: '', vehicleType: '2-wheeler', totalCapacity: '', location: '' });
      fetchZones();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to save zone'); }
  };

  const startEdit = (zone) => {
    setForm({ name: zone.name, code: zone.code, vehicleType: zone.vehicleType, totalCapacity: zone.totalCapacity.toString(), location: zone.location });
    setEditingId(zone._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this zone?')) return;
    try { await api.delete(`/zones/${id}`); toast.success('Zone deactivated'); fetchZones(); }
    catch (error) { toast.error('Failed to delete zone'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Zone Management</h1>
          <p className="text-gray-500">Manage parking zones and capacity</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', code: '', vehicleType: '2-wheeler', totalCapacity: '', location: '' }); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">
          {showForm ? 'Cancel' : '+ Add Zone'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 fade-in">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Zone' : 'Create New Zone'}</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Zone A - Main Gate" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone Code</label>
              <input name="code" value={form.code} onChange={handleChange} required disabled={!!editingId}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase" placeholder="A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="2-wheeler">2-Wheeler</option>
                <option value="4-wheeler">4-Wheeler</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
              <input name="totalCapacity" type="number" value={form.totalCapacity} onChange={handleChange} required min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Near Main Gate" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700">
                {editingId ? 'Update Zone' : 'Create Zone'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zones.map(zone => {
                const percent = Math.round((zone.currentOccupancy / zone.totalCapacity) * 100);
                return (
                  <tr key={zone._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-blue-600">{zone.code}</td>
                    <td className="px-4 py-3 text-sm font-medium">{zone.name}</td>
                    <td className="px-4 py-3 text-sm">{zone.vehicleType === '2-wheeler' ? '🏍️ 2W' : '🚗 4W'}</td>
                    <td className="px-4 py-3 text-sm">{zone.totalCapacity}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${percent}%` }}></div>
                        </div>
                        <span>{zone.currentOccupancy}/{zone.totalCapacity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{zone.location}</td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => startEdit(zone)} className="text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => handleDelete(zone._id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ZoneManagement;