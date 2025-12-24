import axios from "axios";
import dayjs from "dayjs";
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
  limit = 0,
  params = {},  
}) => {
  if (!token) throw new Error("Not authenticated");
  const hasParams = Object.keys(params).length > 0;

  let url;
  let requestParams = {};

  if (!hasParams) {
    url = `${backendApi}/employee-details/search`;
    requestParams = { start, limit };
  } else {
    url = `${backendApi}/employee-details/search`;
    requestParams = { ...params};
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
   
    if (err.response) {
      const { status, data } = err.response;
      const error = new Error(
        typeof data?.detail === "string"
          ? data.detail
          : data?.message || "File upload failed"
      );

      error.status = status;
      error.detail = data?.detail;
      throw error;
    }

   
    if (err.request) {
      throw new Error("No response from server. Please try again later.");
    }

   
    throw new Error(err.message || "File upload failed");
  }
}; 




// export const uploadFile = async (token, file) => {
//   if (!token) throw new Error("Not authenticated");

//   // Read Excel file
//   const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];
//   let data = XLSX.utils.sheet_to_json(sheet);

//   // Convert month fields
//   data = data.map(row => ({
//     ...row,
//     duration_month: toBackendMonthFormat(row.duration_month),
//     payroll_month: toBackendMonthFormat(row.payroll_month),
//   }));

//   // Convert JSON back to Excel
//   const newSheet = XLSX.utils.json_to_sheet(data);
//   const newWorkbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
//   const blob = await XLSX.write(newWorkbook, { type: "blob", bookType: "xlsx" });

//   // Send processed file to backend
//   const formData = new FormData();
//   formData.append("file", blob, file.name);

//   try {
//     const response = await axios.post(`${backendApi}/upload`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (err) {
//     if (err.response) {
//       const { status, data } = err.response;
//       const error = new Error(
//         typeof data?.detail === "string" ? data.detail : data?.message || "File upload failed"
//       );
//       error.status = status;
//       error.detail = data?.detail;
//       throw error;
//     }
//     if (err.request) throw new Error("No response from server. Please try again later.");
//     throw new Error(err.message || "File upload failed");
//   }
// };

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
  const yyyy = "20" + year; 
  return `${yyyy}-${months[mon]}`;
};


export const toFrontendMonthFormat = (monthStr) => {
  if (!monthStr) return "";

  const [year, month] = monthStr.split("-");
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return `${months[parseInt(month, 10) - 1]}'${year.slice(2)}`;
};




export const correctEmployeeRows = async (token, correctedRows) => {
  if (!token) throw new Error("Not authenticated");

  const payload = correctedRows.map(({ reason, ...row }) => row);

  try {
    const response = await axios.post(
      `${backendApi}/upload/correct_error_rows`,
      { corrected_rows: payload },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    if (err.response) {
      console.error("Backend error:", err.response.data);
      throw err.response.data;
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

export const downloadClientSummary = async (payload) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");

  const response = await axios.post(
    `${backendApi}/client-summary/download`,
    payload,
    {
      responseType: "blob", 
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data; // this is a Blob
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
 
export const fetchDashboardClientSummary = async (
  payload
) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.post(
      `${backendApi}/dashboard/client-allowance-summary`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to fetch summary data."
    );
  }
};



// export const fetchEmployeesByMonthRange = async (token, startMonth, endMonth) => {
//   if (!token) throw new Error("Not authenticated");

//   const url = `${backendApi}/monthly/search`;

//   try {
//     const response = await axios.get(url, {
//       params: { start_month: startMonth, end_month: endMonth },
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     console.log("Month range response:", response.data)
//     if (!Array.isArray(response.data) || response.data.length === 0) {
//       return [];
//     }

//     return response.data;
//   } catch (err) {
//     console.error(err);
//     if (err?.response?.data?.detail) {
//       throw new Error(err.response.data.detail);
//     }
//     throw new Error(`No data found for month range ${startMonth} to ${endMonth}`);
//   }
// };


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
export const fetchClientDepartments = async () => {
  const token = localStorage.getItem("access_token");
  try {
    const reponse = await axios.get(`${backendApi}/client-departments`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });
    return reponse.data;
  } catch (error) {
    return error
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
  // eslint-disable-next-line no-useless-catch
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