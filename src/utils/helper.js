import axios from "axios";

const backendApi = import.meta.env.VITE_BACKEND_API;


export const debounce = (fn, delay) => {
  let timer; 
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};


export const fetchEmployees = async ({
  token,
  start = 0,
  limit = 10,
  params = {},  
}) => {
  if (!token) throw new Error("Not authenticated");
  const hasParams = Object.keys(params).length > 0;

  let url;
  let requestParams = {};

  if (!hasParams) {
    url = `${backendApi}/display/`;
    requestParams = { start, limit };
  } else {
    url = `${backendApi}/employee-details/Search`;
    requestParams = { ...params,start,limit};
  }

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: requestParams, 
  });

  const data = response.data;
  if (Array.isArray(data?.data?.data)) {
    return {
      ...data,
      data: data.data.data,
    };
  }
  if (Array.isArray(data?.data)) {
    return data;
  }
  return data;
};

export const fetchEmployeeDetail = async (token,emp_id,duration_month,payroll_month) => {
  if (!token) throw new Error("Not authenticated");
  const payload = {
    emp_id,
    duration_month,
    payroll_month
  }

  const response = await axios.get(`${backendApi}/display/details`, {
    headers: { Authorization: `Bearer ${token}` },
      params: payload, 
  });
  return response.data;
};

export const uploadFile = async (token, file) => {
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${backendApi}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err) {
    // Backend sent response
    if (err.response) {
      const { status, data } = err.response;

      // Create a proper Error object so UI can catch it correctly
      const error = new Error(
        typeof data?.detail === "string"
          ? data.detail
          : data?.message || "File upload failed"
      );

      error.status = status;
      error.detail = data?.detail;
      throw error;
    }

    // No response from backend
    if (err.request) {
      throw new Error("No response from server. Please try again later.");
    }

    // Any other client-side error
    throw new Error(err.message || "File upload failed");
  }
}; 

export const fetchFilteredEmployees = async ({
  token,
  start = 0,
  limit = 10,
  params = {},
}) => {
  if (!token) throw new Error("Not authenticated");

  const response = await axios.get(
    `${backendApi}/employee-details/Search`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      params: {
        start,
        limit,
        ...params, // emp_id, account_manager, department, client, start_month, end_month
      },
    }
  );

  const data = response.data;

  // Normalize backend response
  if (Array.isArray(data?.data?.data)) {
    return { ...data, data: data.data.data };
  }
  if (Array.isArray(data?.data)) {
    return data;
  }
  return data;
};


export const updateEmployeeShift = async (
  token,
  emp_id,
  duration_month,
  payroll_month,
  payload
) => {
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.put(
      `${backendApi}/display/update`,
      payload,
      {
        params: {
          emp_id,
          payroll_month,
          duration_month,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (err) {
    if (err.response) {
      console.error("Backend error:", err.response.data);
      throw new Error(err.response.data?.detail || "Failed to update shift");
    } else if (err.request) {
      throw new Error("No response from server.");
    } else {
      throw new Error(err.message);
    }
  }
};

// Convert frontend month "Apr'25" to backend "2025-04"
export const toBackendMonthFormat = (monthStr) => {
  if (!monthStr) return "";

  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const match = monthStr.match(/([A-Za-z]{3})'(\d{2})/);
  if (!match) return monthStr;

  const [, mon, year] = match;
  const yyyy = "20" + year; // e.g., '25' -> '2025'
  return `${yyyy}-${months[mon]}`;
};

// Convert backend month "2025-04" to frontend "Apr'25"
export const toFrontendMonthFormat = (monthStr) => {
  if (!monthStr) return "";

  const [year, month] = monthStr.split("-");
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return `${months[parseInt(month, 10) - 1]}'${year.slice(2)}`;
};


// export const correctEmployeeRows = async (token, correctedRows) => {
//   if (!token) throw new Error("Not authenticated");

//   try {
//     const response = await axios.post(
//       // `${backendApi}/upload/correct`,
//       `${backendApi}/upload/correct_error_rows`,
//       { corrected_rows: correctedRows },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return response.data;
//   } catch (err) {
//     if (err.response) {
//       console.error("Backend error:", err.response.data);
//       throw new Error(err.response.data?.detail || "Correction failed");
//     } else if (err.request) {
//       throw new Error("No response from server.");
//     } else {
//       throw new Error(err.message);
//     }
//   }
// };

export const correctEmployeeRows = async (token, correctedRows) => {
  if (!token) throw new Error("Not authenticated");

  const sanitizedRows = correctedRows.map(({ reason, ...row }) => ({
  ...row,

  // 🔢 Numbers
  shift_a_days: Number(row.shift_a_days) || 0,
  shift_b_days: Number(row.shift_b_days) || 0,
  shift_c_days: Number(row.shift_c_days) || 0,
  prime_days: Number(row.prime_days) || 0,

  "# Shift Types(e)": Number(row["# Shift Types(e)"]) || 0,
  total_days: Number(row.total_days) || 0,

  "Timesheet Billable Days": Number(row["Timesheet Billable Days"]) || 0,
  "Timesheet Non Billable Days": Number(row["Timesheet Non Billable Days"]) || 0,

  Diff: Number(row.Diff) || 0,
  "Final Total Days": Number(row["Final Total Days"]) || 0,

  "Shift A Allowances": Number(row["Shift A Allowances"]) || 0,
  "Shift B Allowances": Number(row["Shift B Allowances"]) || 0,
  "Shift C Allowances": Number(row["Shift C Allowances"]) || 0,
  "Prime Allowances": Number(row["Prime Allowances"]) || 0,
  "TOTAL DAYS Allowances": Number(row["TOTAL DAYS Allowances"]) || 0,

  "AM Approval Status(e)": Number(row["AM Approval Status(e)"]) || 0,

  // 🧵 Strings (🔥 THIS FIXES YOUR ISSUE)
  rmg_comments:
    row.rmg_comments === 0 || row.rmg_comments === null
      ? ""
      : String(row.rmg_comments),

  practice_remarks:
    row.practice_remarks === 0 || row.practice_remarks === null
      ? ""
      : String(row.practice_remarks),

  delivery_manager:
    row.delivery_manager === 0 || row.delivery_manager === null
      ? ""
      : String(row.delivery_manager),
}));


  try {
    const response = await axios.post(
      `${backendApi}/upload/correct_error_rows`,
      { corrected_rows: sanitizedRows },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (err) {
    if (err.response) {
      console.error("Backend error:", err.response.data);
      throw new Error(JSON.stringify(err.response.data));
    }
    throw err;
  }
};


export const pieChart = async (token,startMonth,endMonth,topFilter) => {
  if (!token) throw new Error("Not authenticated");
  let params={}
if (startMonth != null && startMonth !== "") params["start_month"] = startMonth;
if (endMonth != null && endMonth !== "") params["end_month"] = endMonth;
if (topFilter != null && topFilter !== "") params["top"] = topFilter;

 
  try {
    const response = await axios.get(`${backendApi}/dashboard/piechart`, {
      params:params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch summary data.");
  }
 
};
 


export const fetchHorizontalBar = async (token, startMonth, endMonth, topFilter) => {
  if (!token) throw new Error("Not authenticated");
 
  const params = {};
  if (startMonth && (!endMonth || startMonth === endMonth)) {
    params.duration_month = startMonth;
  }
  if (startMonth && endMonth && startMonth !== endMonth) {
    params.start_month = startMonth;
    params.end_month = endMonth;
  }
  if (topFilter) {
    params.top = topFilter;  
  }
  try {
    const response = await axios.get(`${backendApi}/dashboard/horizontal-bar`, {
      params: params,
      headers: { Authorization: `Bearer ${token}` },
    });
 
    return response.data;  
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch horizontal bar data.");
  }
};
 

export const fetchClientSummary = async (
  token,
  client = "ALL",
  account_manager = "",
  start_month = "",
  end_month = ""
) => {
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.get(`${backendApi}/client-summary`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        client,
        account_manager,
        start_month,
        end_month,
      },
    });
    console.log(response)
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to fetch summary data."
    );
  }
};

 
// export const fetchClientSummaryRange = async (token, startMonth, endMonth) => {
//   if (!token) throw new Error("Not authenticated");
//   if (!startMonth || !endMonth) {
//     throw new Error("Both startMonth and endMonth are required");
//   }
 
//   const response = await axios.get(`${backendApi}/shift/interval-summary`, {
//     params: { start_month:startMonth, end_month:endMonth },
//     headers: { Authorization: `Bearer ${token}` },
//   });
 
//   return response.data;
// };
 

// export const fetchClientSummaryByAM = async (token, managerName) => {
//   if (!token) throw new Error("Not authenticated");
 
//   try {
//     const response = await axios.get(`${backendApi}/shift/interval-summary`, {
//       params: { account_manager: managerName },
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (err) {
//     if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
//     if (err?.message) throw new Error(err.message);
//     throw new Error("Unable to fetch account manager data.");
//   }
// };
 
// export const fetchClientSummaryByAMMonth = async (token, managerName, month) => {
//   if (!token) throw new Error("Not authenticated");
 
//   try {
//     const response = await axios.get(`${backendApi}/shift/interval-summary`, {
//       params: { account_manager: managerName, payroll_month: month },
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (err) {
//     if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
//     if (err?.message) throw new Error(err.message);
//     throw new Error("Unable to fetch account manager data for month.");
//   }
// };
 
// export const fetchClientSummaryByAMRange = async (token, managerName, startMonth, endMonth) => {
//   if (!token) throw new Error("Not authenticated");
 
//   try {
//     const response = await axios.get(`${backendApi}/shift/interval-summary`, {
//       params: { account_manager: managerName, start_month: startMonth, end_month: endMonth },
//       headers: { Authorization: `Bearer ${token}` },
//     });    
//     return response.data;
//   } catch (err) {
//     if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
//     if (err?.message) throw new Error(err.message);
//     throw new Error("Unable to fetch account manager data for range.");
//   }
// };
 
 


export const fetchEmployeesByMonthRange = async (token, startMonth, endMonth) => {
  if (!token) throw new Error("Not authenticated");

  const url = `${backendApi}/monthly/search`;

  try {
    const response = await axios.get(url, {
      params: { start_month: startMonth, end_month: endMonth },
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Month range response:", response.data)
    if (!Array.isArray(response.data) || response.data.length === 0) {
      return [];
    }

    return response.data;
  } catch (err) {
    console.error(err);
    if (err?.response?.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error(`No data found for month range ${startMonth} to ${endMonth}`);
  }
};


export const fetchHorizontalBarData = async (month) => {
  try {
    const response = await axios.get(`${backendApi}/dashboard/horizontal-bar`, {
      params: { payroll_month: month },
    });
    return response.data.horizontal_bar;
  } catch (error) {
    console.error("Error fetching horizontal bar data:", error);
    return {};
  }
};


export const fetchClientComparison = async (
  searchBy = "",
  startMonth = "",
  endMonth = "",
  client = ""
) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");
  if (!client) throw new Error("Client is required");

  const params = new URLSearchParams();
  params.append("client", client);

  if (startMonth) params.append("start_month", startMonth);
  if (endMonth) params.append("end_month", endMonth);
  if (searchBy) params.append("account_manager", searchBy);

  try {
    const response = await axios.get(
      `${backendApi}/client-comparison?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch client comparison data.");
  }
};


export const fetchClients = async () => {
  const token = localStorage.getItem("access_token");
  try {
    const res = await axios.get("http://localhost:8000/dashboard/clients",
      {
        headers: { Authorization: `Bearer ${token}` },
      });
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const getMonthString = (monthIndex) => {
  return dayjs().month(monthIndex).format("YYYY-MM");
};