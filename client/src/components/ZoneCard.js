import React from 'react';

const ZoneCard = ({ zone }) => {
  const percent = zone.totalCapacity > 0
    ? Math.round((zone.currentOccupancy / zone.totalCapacity) * 100)
    : 0;

  const getColor = () => {
    if (percent >= 90) return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' };
    if (percent >= 70) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200' };
    return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' };
  };

  const color = getColor();

  return (
    <div className={`${color.light} border ${color.border} rounded-xl p-5 fade-in`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{zone.name}</h3>
          <p className="text-sm text-gray-500">{zone.location}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          zone.vehicleType === '2-wheeler' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {zone.vehicleType === '2-wheeler' ? '🏍️ 2W' : '🚗 4W'}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className={color.text + ' font-medium'}>{zone.currentOccupancy} / {zone.totalCapacity}</span>
          <span className={color.text + ' font-medium'}>{percent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`${color.bg} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percent, 100)}%` }}></div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          Available: <strong className={color.text}>{zone.totalCapacity - zone.currentOccupancy}</strong>
        </span>
        {percent >= 90 && <span className="text-red-600 font-medium pulse-dot">● FULL</span>}
      </div>
    </div>
  );
};

export default ZoneCard;