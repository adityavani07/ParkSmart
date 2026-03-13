import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [zones, setZones] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const newSocket = io('https://parksmart-g4ir.onrender.com');
    newSocket.on('connect', () => console.log('Socket connected'));
    newSocket.on('occupancy-update', (updatedZones) => setZones(updatedZones));
    newSocket.on('new-activity', (activity) => setActivities(prev => [activity, ...prev].slice(0, 50)));
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, zones, setZones, activities }}>
      {children}
    </SocketContext.Provider>
  );
};