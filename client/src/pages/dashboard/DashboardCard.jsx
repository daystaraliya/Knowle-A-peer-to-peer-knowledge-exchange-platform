
import React from 'react';

const DashboardCard = ({ title, value }) => {
  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-textSecondary">{title}</h3>
      <p className="text-4xl font-bold text-primary mt-2">{value}</p>
    </div>
  );
};

export default DashboardCard;
