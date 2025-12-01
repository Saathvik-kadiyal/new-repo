import React from "react";
import ClientDaysPieChart from "../visuals/ClientDaysPieChart";
import HorizontalBarChart from "../visuals/HorizontalBarChart";
import VerticalBarChart from "../visuals/VerticalBarChart";
import GraphChart from "../visuals/GraphChart";

const data = {
  mar:{ },
  apr:{}
}

const DashboardPage = () => {
  return (
    <div className="p-6 w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full h-full">
        <div className="relative p-2 h-[400px] w-full">
          <ClientDaysPieChart/>
        </div>
        <div className="rounded-xl p-6 h-[400px] w-full"><VerticalBarChart/></div>
        <div className="relative rounded-xl p-6 h-[400px] w-full"><HorizontalBarChart/></div>
        <div className="rounded-xl p-6 h-[400px] w-full"><GraphChart/></div>
      </div>
    </div>
  );
};

export default DashboardPage;
