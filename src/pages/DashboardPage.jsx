import React, { useState } from "react";
import ClientDaysPieChart from "../visuals/ClientDaysPieChart";
import HorizontalBarChart from "../visuals/HorizontalBarChart";
import VerticalBarChart from "../visuals/VerticalBarChart";
import GraphChart from "../visuals/GraphChart";
 
 
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
 
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
 
 
const DashboardPage = () => {
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [topFilter, setTopFilter] = useState("5");
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="p-6 w-full h-full">
        <Box sx={{
          display:"flex",
          alignItems:"end",
          gap:4
        }}>
          <Box>
            <Typography fontSize={14} fontWeight="600" mb={0.5}>
              Start Month
            </Typography>
            <DatePicker
              views={["year", "month"]}
              format="MMMM YYYY"
              value={startMonth ? dayjs(startMonth) : null}
              onChange={(newValue) => {
                if (newValue) {
                  setStartMonth(dayjs(newValue).format("YYYY-MM"));
                } else {
                  setStartMonth(null);
                }
              }}
 
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 180,
                   
                  },
                },
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={14} fontWeight="600" mb={0.5}>
              End Month
            </Typography>
            <DatePicker
              views={["year", "month"]}
              format="MMMM YYYY"
              value={endMonth ? dayjs(endMonth) : null}
              onChange={(newValue) => {
                if (newValue) {
                  setEndMonth(dayjs(newValue).format("YYYY-MM"));
                } else {
                  setStartMonth(null);
                }
              }}
 
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 180,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography fontSize={14} fontWeight="600" mb={0.5}>
              Top Filter
            </Typography>
 
            <FormControl size="small">
              <Select
                value={topFilter}
                onChange={(e) => setTopFilter(e.target.value)}
                sx={{
                  width: 150,
                  fontWeight: 600,
                }}
              >
                <MenuItem value="5">Top 5</MenuItem>
                <MenuItem value="10">Top 10</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{display:"flex",alignItems:"center"}}>
            <Button variant="outlined" color="error" onClick={()=>{
setStartMonth(null)
setEndMonth(null)
setTopFilter("5")
            }}>
Clear
            </Button>
          </Box>
 
        </Box>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full ">
          <div className="relative p-2 w-full">
            <ClientDaysPieChart
              startMonth={startMonth}
              endMonth={endMonth}
              topFilter={topFilter}
            />
          </div>
          <div className=" p-6 w-full">
            <GraphChart
              startMonth={startMonth}
              endMonth={endMonth}
            />
          </div>
           </div>
          <div className=" p-6 w-full">
            <VerticalBarChart
              startMonth={startMonth}
              endMonth={endMonth}
              topFilter={topFilter}
            />
          </div>
          <div className="relative rounded-xl p-6 w-full">
            <HorizontalBarChart
              startMonth={startMonth}
              endMonth={endMonth}
              topFilter={topFilter}
            />
          </div>
      </div>
    </LocalizationProvider>
  );
};
 
export default DashboardPage;
 
 