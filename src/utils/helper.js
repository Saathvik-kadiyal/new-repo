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

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch individual employee details
export const fetchEmployeeDetail = async (token, emp_id) => {
  if (!token) throw new Error("Not authenticated");

  const response = await axios.get(`${backendApi}/display/${emp_id}`, {
    headers: { Authorization: `Bearer ${token}` },
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


export const updateEmployeeShift = async (employeeId, payrollMonth, payload, token) => {
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.put(
      `${backendApi}/display/shift/update`,
      payload,
      {
        params: {
          emp_id: employeeId,
          payroll_month: payrollMonth,
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
