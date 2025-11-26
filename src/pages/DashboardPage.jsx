import React from 'react'

const DashboardPage = () => {
  return (
    <div className="p-6 w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full h-full">
        <div className="bg-red-400 rounded-xl p-6 h-[260px] w-full"></div>
        <div className="bg-blue-400 rounded-xl p-6 h-[260px] w-full"></div>
        <div className="bg-indigo-500 rounded-xl p-6 h-[260px] w-full"></div>
        <div className="bg-amber-400 rounded-xl p-6 h-[260px] w-full"></div>
      </div>
    </div>
  );
};
 
export default DashboardPage;
 
