import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import RegisterVehicle from './pages/RegisterVehicle';
import AdminDashboard from './pages/AdminDashboard';
import GateScanner from './pages/GateScanner';
import VehicleSearch from './pages/VehicleSearch';
import LiveOccupancy from './pages/LiveOccupancy';
import ZoneManagement from './pages/ZoneManagement';
import ParkingHistory from './pages/ParkingHistory';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'user' ? '/dashboard' : '/admin'} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/occupancy" element={<LiveOccupancy />} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/register-vehicle" element={<ProtectedRoute><RegisterVehicle /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute adminOnly><GateScanner /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute adminOnly><VehicleSearch /></ProtectedRoute>} />
          <Route path="/zones" element={<ProtectedRoute adminOnly><ZoneManagement /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute adminOnly><ParkingHistory /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: { background: '#333', color: '#fff', borderRadius: '10px' }
          }} />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;