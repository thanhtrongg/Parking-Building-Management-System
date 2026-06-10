const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("accessToken");
  
  // Clean path
  let cleanPath = path.startsWith("/api/") ? path.slice(4) : path;
  
  // Clean options copy
  let cleanOptions = { ...options };

  // Parse and normalize JSON request payload
  if (cleanOptions.body) {
    try {
      const bodyObj = JSON.parse(cleanOptions.body);
      
      // Clean empty phone number to avoid backend format validation failures
      if (bodyObj.phone === "") {
        delete bodyObj.phone;
      }
      
      // Map frontend role USER to backend role DRIVER if sending role updates
      if (bodyObj.role === "USER") {
        bodyObj.role = "DRIVER";
      }
      
      cleanOptions.body = JSON.stringify(bodyObj);
    } catch (e) {
      // Body not JSON, keep as is
    }
  }

  // Retrieve stored user role for role-based path resolution
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isDriver = user?.role === "USER" || user?.role === "DRIVER";

  // Translate PUT /users/{id} to separate status and role PATCH requests
  if (cleanPath.startsWith("users/") && cleanOptions.method === "PUT") {
    const userId = cleanPath.split("/")[1];
    let payload = {};
    try {
      payload = JSON.parse(options.body || "{}");
    } catch (e) {}

    if (payload.active !== undefined) {
      await apiRequest(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: payload.active }),
        headers: options.headers,
      });
    }

    if (payload.role !== undefined) {
      let backendRole = payload.role;
      if (backendRole === "USER") backendRole = "DRIVER";
      
      return await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: backendRole }),
        headers: options.headers,
      });
    }
    return { success: true, message: "User updated" };
  }

  // Handle DELETE /reservations/{id} -> PATCH /reservations/{id}/cancel
  if (cleanPath.startsWith("reservations/") && cleanOptions.method === "DELETE") {
    const reservationId = cleanPath.split("/")[1];
    cleanPath = `reservations/${reservationId}/cancel`;
    cleanOptions.method = "PATCH";
  }

  // Dynamic path translations for Spring Boot REST API
  if (cleanPath === "users") {
    cleanPath = "admin/users";
  } else if (cleanPath === "user/feedbacks") {
    cleanPath = "feedback/my";
  } else if (cleanPath === "feedbacks") {
    cleanPath = "feedback";
  } else if (cleanPath.startsWith("feedbacks/") && cleanPath.endsWith("/status")) {
    const feedbackId = cleanPath.split("/")[1];
    cleanPath = `feedback/${feedbackId}/status`;
    if (cleanOptions.method === "PUT") cleanOptions.method = "PATCH";
  } else if (cleanPath.startsWith("feedbacks/") && cleanPath.endsWith("/reply")) {
    const feedbackId = cleanPath.split("/")[1];
    cleanPath = `feedback/${feedbackId}/reply`;
  } else if (cleanPath === "parking-slots") {
    cleanPath = "slots";
  } else if (cleanPath === "reservations") {
    cleanPath = isDriver ? "reservations/my" : "reservations";
  } else if (cleanPath === "parking-sessions") {
    cleanPath = isDriver ? "sessions/my" : "sessions/active";
  } else if (cleanPath === "user/parking-sessions") {
    cleanPath = "sessions/my";
  }

  const response = await fetch(`${API_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`, {
    ...cleanOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cleanOptions.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  let result;
  
  if (contentType.includes("application/json")) {
    result = await response.json();
    
    // Normalize response data properties (roles, slots)
    if (result && result.data) {
      const normalizeItem = (item) => {
        if (!item) return;
        if (item.role === "DRIVER") {
          item.role = "USER";
        }
      };

      if (Array.isArray(result.data)) {
        result.data.forEach(normalizeItem);
      } else if (result.data.content && Array.isArray(result.data.content)) {
        result.data.content.forEach(normalizeItem);
      } else {
        normalizeItem(result.data);
      }
    }
  } else {
    const text = await response.text();
    result = { message: text || `HTTP ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(result.message || "API request failed");
  }

  return result;
};
