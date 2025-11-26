import React from "react";
import ClientDaysPieChart from "../visuals/ClientDaysPieChart";

const DashboardPage = () => {
  return (
    <div className="p-6 w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full h-full">
        <div className="relative p-2 h-[340px] w-full">
          <ClientDaysPieChart/>
        </div>
        <div className="bg-blue-400 rounded-xl p-6 h-[340px] w-full"></div>
        <div className="bg-indigo-500 rounded-xl p-6 h-[340px] w-full"></div>
        <div className="bg-amber-400 rounded-xl p-6 h-[340px] w-full"></div>
      </div>
    </div>
  );
};

export default DashboardPage;
