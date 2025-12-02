import axios from "axios";

const backendApi = import.meta.env.VITE_BACKEND_API;

const token = localStorage.getItem("auth_token")

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
  searchBy = null,
  searchQuery = "",
}) => {
  if (!token) throw new Error("Not authenticated");

  let url = `${backendApi}/display/?start=${start}&limit=${limit}`;

  if (searchBy && searchQuery.trim().length > 0) {
    const params = new URLSearchParams();
    if (searchBy === "Emp ID") params.append("emp_id", searchQuery);
    if (searchBy === "Account Manager") params.append("account_manager", searchQuery);
    url = `${backendApi}/employee-details/Search?${params.toString()}`;
  }

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
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

// Upload file to backend
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


export const fetchClientSummary = async (token,month="") => {
  if (!token) throw new Error("Not authenticated");
 console.log(month)
  try {
    const response = await axios.get(`${backendApi}/shift/interval-summary`, {
      params:{start_month:month},
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch summary data.");
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

    console.log("Month range response:", response.data);

    if (!Array.isArray(response.data) || response.data.length === 0) {
      return [];
    }

    return response.data;
  } catch (err) {
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
    return error;
  }
};

export const getMonthString = (monthIndex) => {
  return dayjs().month(monthIndex).format("YYYY-MM");
};

export const getClientsAndDepartments = async()=>{
  try {
    const response = await axios.get(`${backendApi}/client-departments`,{
      headers: { Authorization: `Bearer ${token}` },
    })
    return response
  } catch (error) {
    return error
  }
}