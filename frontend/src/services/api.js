const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API request failed");
  }

  return result;
};
