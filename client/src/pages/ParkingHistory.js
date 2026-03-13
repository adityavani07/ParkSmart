import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ParkingHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchHistory(); }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/parking/history?page=${page}&limit=30`);
      setSessions(data.sessions); setTotalPages(data.totalPages); setTotal(data.total);
    } catch (error) { toast.error('Failed to load history'); }
    setLoading(false);
  };

  const filteredSessions = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Parking History</h1>
          <p className="text-gray-500">{total} total records</p>
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSessions.map(session => (
                    <tr key={session._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {session.vehicle?.vehicleType === '2-wheeler' ? '🏍️' : '🚗'} {session.vehicle?.vehicleNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">{session.vehicle?.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{session.vehicle?.user?.phone || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{session.zone?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(session.checkInTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{session.checkOutTime ? new Date(session.checkOutTime).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-sm">{session.duration ? `${session.duration} min` : '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {session.status === 'active' ? '🟢 Active' : '✅ Done'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-t">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 bg-gray-100 rounded text-sm disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 bg-gray-100 rounded text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParkingHistory;