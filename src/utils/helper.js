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



export const updateEmployeeShift = async (token , emp_id,
        duration_month,
        payroll_month,payload) => {
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.put(
      `${backendApi}/display/shift/update`,
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
      const { status, data } = err.response;

      if (status === 400 && data?.detail) throw new Error(data.detail);
      if (status === 500 && data?.detail) throw new Error(data.detail);

      throw new Error(data?.detail || "Something went wrong while updating shift");
    } else if (err.request) {
      throw new Error("No response from server. Please try again later.");
    } else {
      throw new Error(err.message);
    }
  }
};


export const pieChart = async (token,start_month,end_month,topFilter) => {
  if (!token) throw new Error("Not authenticated");
  let params={}
  if(start_month!==null && start_month!==undefined && start_month!==""){
params[start_month]=start_month
  }
  if(end_month!==null && end_month!==undefined && end_month!==""){
    params[end_month] = end_month
  }
  if(topFilter!==null && topFilter!==undefined && topFilter!==""){
params["top"]=topFilter
  }
 
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

 
export const fetchClientSummaryRange = async (token, startMonth, endMonth) => {
  if (!token) throw new Error("Not authenticated");
  if (!startMonth || !endMonth) {
    throw new Error("Both startMonth and endMonth are required");
  }
 
  const response = await axios.get(`${backendApi}/shift/interval-summary`, {
    params: { start_month:startMonth, end_month:endMonth },
    headers: { Authorization: `Bearer ${token}` },
  });
 
  return response.data;
};
 
 
// Fetch ALL data for account manager
export const fetchClientSummaryByAM = async (token, managerName) => {
  if (!token) throw new Error("Not authenticated");
 
  try {
    const response = await axios.get(`${backendApi}/shift/interval-summary`, {
      params: { account_manager: managerName },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch account manager data.");
  }
};
 
// Fetch ONE MONTH for account manager
export const fetchClientSummaryByAMMonth = async (token, managerName, month) => {
  if (!token) throw new Error("Not authenticated");
 
  try {
    const response = await axios.get(`${backendApi}/shift/interval-summary`, {
      params: { account_manager: managerName, payroll_month: month },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch account manager data for month.");
  }
};
 
// Fetch RANGE for account manager
export const fetchClientSummaryByAMRange = async (token, managerName, startMonth, endMonth) => {
  if (!token) throw new Error("Not authenticated");
 
  try {
    const response = await axios.get(`${backendApi}/shift/interval-summary`, {
      params: { account_manager: managerName, start_month: startMonth, end_month: endMonth },
      headers: { Authorization: `Bearer ${token}` },
    });    
    return response.data;
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch account manager data for range.");
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