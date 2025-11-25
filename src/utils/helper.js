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
export const fetchEmployeeDetail = async (token, id) => {
  if (!token) throw new Error("Not authenticated");

  const response = await axios.get(`${backendApi}/display/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Upload file to backend
export const uploadFile = async (token, file) => {
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${backendApi}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Partial update employee (shift data)
export const updateEmployeeShift = async (token, id, payload) => {
  if (!token) throw new Error("Not authenticated");

  const response = await axios.patch(
    `${backendApi}/display/shift/partial-update/${id}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};
