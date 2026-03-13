import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const VehicleSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.length < 2) return toast.error('Enter at least 2 characters');
    setLoading(true);
    setSelectedVehicle(null);
    setVehicleDetails(null);
    try {
      const { data } = await api.get(`/search?q=${query}`);
      setResults(data.results);
      if (data.results.length === 0) toast('No vehicles found');
    } catch (error) { toast.error('Search failed'); }
    setLoading(false);
  };

  const viewDetails = async (vehicleId) => {
    try {
      const { data } = await api.get(`/search/vehicle/${vehicleId}`);
      setVehicleDetails(data);
      setSelectedVehicle(vehicleId);
    } catch (error) { toast.error('Failed to load details'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vehicle Search</h1>
        <p className="text-gray-500">Search by vehicle number, owner name, or phone</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search: GJ05AB1234, Rahul, 9876..."
            className="flex-1 px-5 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
        </div>
      </form>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Results {results.length > 0 && `(${results.length})`}</h2>
          <div className="space-y-3">
            {results.map(vehicle => (
              <div key={vehicle._id} onClick={() => viewDetails(vehicle._id)}
                className={`bg-white rounded-xl shadow p-4 cursor-pointer transition-all hover:shadow-md ${selectedVehicle === vehicle._id ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{vehicle.vehicleType === '2-wheeler' ? '🏍️' : '🚗'}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{vehicle.vehicleNumber}</h3>
                      <p className="text-sm text-gray-500">{vehicle.user?.name} • {vehicle.user?.phone}</p>
                    </div>
                  </div>
                  {vehicle.isCurrentlyParked ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">🟢 Parked</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">Not parked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {vehicleDetails && (
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 fade-in">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Vehicle Details</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">VEHICLE</h3>
                  <p className="text-xl font-bold text-gray-800">{vehicleDetails.vehicle.vehicleNumber}</p>
                  <p className="text-sm text-gray-600">{vehicleDetails.vehicle.make} {vehicleDetails.vehicle.model} • {vehicleDetails.vehicle.color}</p>
                  <p className="text-sm text-gray-600">{vehicleDetails.vehicle.vehicleType}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-600 mb-2">OWNER</h3>
                  <p className="font-bold text-gray-800">{vehicleDetails.vehicle.user?.name}</p>
                  <p className="text-sm text-gray-600">📧 {vehicleDetails.vehicle.user?.email}</p>
                  <p className="text-sm text-gray-600">📞 {vehicleDetails.vehicle.user?.phone}</p>
                  <p className="text-sm text-gray-600">🏢 {vehicleDetails.vehicle.user?.department} • {vehicleDetails.vehicle.user?.userType}</p>
                  <a href={`tel:${vehicleDetails.vehicle.user?.phone}`}
                    className="inline-block mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">📞 Call Owner</a>
                </div>
                <div className={`${vehicleDetails.isCurrentlyParked ? 'bg-yellow-50' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">PARKING STATUS</h3>
                  {vehicleDetails.isCurrentlyParked ? (
                    <>
                      <p className="font-bold text-yellow-700">🟡 Currently Parked</p>
                      <p className="text-sm text-gray-600">Zone: {vehicleDetails.activeSession?.zone?.name}</p>
                      <p className="text-sm text-gray-600">Since: {new Date(vehicleDetails.activeSession?.checkInTime).toLocaleString()}</p>
                    </>
                  ) : <p className="text-gray-500">Not currently parked</p>}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">RECENT HISTORY</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {vehicleDetails.recentSessions?.map(session => (
                      <div key={session._id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{session.zone?.name}</span>
                        <span className="text-gray-500">{new Date(session.checkInTime).toLocaleDateString()}</span>
                        <span className={session.status === 'active' ? 'text-green-600' : 'text-gray-400'}>{session.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleSearch;