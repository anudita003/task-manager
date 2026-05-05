// ================= CONFIG =================

// ✅ VITE ENV VARIABLE (correct for Vite)
const API =
  import.meta.env.VITE_API_URL ||
  "https://task-manager-production-fcdb.up.railway.app/api";

// ================= COMMON REQUEST =================

const request = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      let err;
      try {
        err = await res.json();
      } catch {
        err = { message: "Server error" };
      }

      return {
        message: err.message || "Error",
        status: res.status,
      };
    }

    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return {
      message: "Server error",
      error: err.message,
    };
  }
};

// ================= AUTH HEADER =================

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

// ================= AUTH =================

export const loginUser = (data) =>
  request(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const registerUser = (data) =>
  request(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getUsers = (token) =>
  request(`${API}/auth/users`, {
    headers: authHeader(token),
  });

// ================= TASKS =================

export const getTasks = (token) =>
  request(`${API}/tasks`, {
    headers: authHeader(token),
  });

export const createTask = (data, token) =>
  request(`${API}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(data),
  });

export const updateTask = (id, status, token) =>
  request(`${API}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ status }),
  });

export const deleteTask = (id, token) =>
  request(`${API}/tasks/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });

// ================= STATS =================

export const getStats = (token) =>
  request(`${API}/stats`, {
    headers: authHeader(token),
  });

// ================= PROJECTS =================

export const getProjects = (token) =>
  request(`${API}/projects`, {
    headers: authHeader(token),
  });

export const createProject = (name, token) =>
  request(`${API}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ name }),
  });

export const addMemberToProject = (projectId, userId, token) =>
  request(`${API}/projects/${projectId}/add`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ userId }),
  });