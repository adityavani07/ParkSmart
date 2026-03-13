import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🅿️</span>
            <span className="font-bold text-xl text-blue-700">ParkSmart</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/occupancy" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Live Status
            </Link>

            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Register</Link>
              </>
            ) : (
              <>
                {user.role === 'user' && (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">My Vehicles</Link>
                    <Link to="/register-vehicle" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Add Vehicle</Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link to="/admin" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Dashboard</Link>
                    <Link to="/scanner" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Scanner</Link>
                    <Link to="/search" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Search</Link>
                    {isSuperAdmin && (
                      <>
                        <Link to="/zones" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">Zones</Link>
                        <Link to="/history" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">History</Link>
                      </>
                    )}
                  </>
                )}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
                  <span className="text-sm text-gray-500">
                    {user.name}
                    <span className="ml-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{user.role}</span>
                  </span>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm font-medium">Logout</button>
                </div>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 fade-in">
            <Link to="/occupancy" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">Live Status</Link>
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-blue-600 font-medium">Register</Link>
              </>
            ) : (
              <>
                {user.role === 'user' && (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">My Vehicles</Link>
                    <Link to="/register-vehicle" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">Add Vehicle</Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">Dashboard</Link>
                    <Link to="/scanner" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">Scanner</Link>
                    <Link to="/search" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">Search</Link>
                    <Link to="/zones" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">Zones</Link>
                    <Link to="/history" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600">History</Link>
                  </>
                )}
                <button onClick={handleLogout} className="block py-2 text-red-500 font-medium">Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;