import axios from "axios";

const backendApi = import.meta.env.VITE_BACKEND_API;

// Generic debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Fetch employees (paginated, with optional search)
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
  console.log(url)
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Fetch individual employee details
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

  console.log(response.data)
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
    if (err.response) {
      const { status, data } = err.response;
      if ((status === 400 || status === 422) && data?.detail) {
        throw new Error(data.detail);
      }
      if (status === 500 && data?.detail) {
        throw new Error(data.detail);
      }
      if (data?.message) {
        throw new Error(data.message);
      }
      throw new Error(data?.detail || "Something went wrong while uploading");
    }
    if (err.request) {
      throw new Error("No response from server. Please try again later.");
    }
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


export const fetchClientSummary = async (token, payrollMonth) => {
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.get(
      `${backendApi}/summary/client-shift-summary`,
      {
        params: { payroll_month: payrollMonth },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;

  } catch (err) {
    if (err?.response?.data?.detail) {
      throw new Error(err.response.data.detail); 
    }

    if (err?.message) {
      throw new Error(err.message);
    }

    throw new Error("Unable to fetch summary data.");
  }
};


export const fetchEmployeesByMonthRange = async (token, startMonth, endMonth) => {
  if (!token) throw new Error("Not authenticated");

  const url = `${backendApi}/monthly/search`;

  try {
    const response = await axios.get(url, {
      params: {
        start_month: startMonth,
        end_month: endMonth,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // Full list (no pagination)
  } catch (err) {
    if (err?.response?.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error("Failed to fetch month range data");
  }
};


export const fetchClientSummaryRange = async (token, startMonth, endMonth) => {
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.get(`${backendApi}/interval/get_interval_summary`, {
      params: { start_month: startMonth, end_month: endMonth },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data || {};
  } catch (err) {
    if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
    if (err?.message) throw new Error(err.message);
    throw new Error("Unable to fetch summary range.");
  }
};

export const fetchHorizontalBarData = async (month) => {
  try {
    const response = await axios.get(`${backendApi}/horizontal-bar`, {
      params: { payroll_month: month },
    });
    return response.data.horizontal_bar;
  } catch (error) {
    console.error("Error fetching horizontal bar data:", error);
    return {};
  }
};

// Helper to get month string format YYYY-MM
export const getMonthString = (monthIndex) => {
  return dayjs().month(monthIndex).format("YYYY-MM");
};