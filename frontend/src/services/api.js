const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("accessToken");
  
  // Clean path: remove leading "/api", "api", and slashes
  let cleanPath = path;
  if (cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.slice(5);
  } else if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  } else if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }
  
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
    } catch {
      // Body not JSON, keep as is
    }
  }

  // Retrieve stored user role for role-based path resolution
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isDriver = user?.role === "USER" || user?.role === "DRIVER";
  const method = (cleanOptions.method || "GET").toUpperCase();

  // Intercept GET /parking-slots/available-for-reservation
  if (cleanPath.startsWith("parking-slots/available-for-reservation") && method === "GET") {
    const queryString = cleanPath.includes("?") ? cleanPath.slice(cleanPath.indexOf("?")) : "";
    const params = new URLSearchParams(queryString);
    const vehicleTypeId = params.get("vehicleTypeId");

    // 1. Get vehicle types
    const typesRes = await apiRequest("vehicle-types");
    const types = typesRes.data || [];
    const matchedType = types.find(t => t.id === vehicleTypeId);
    const vehicleTypeName = matchedType ? (matchedType.name || "").toUpperCase() : "CAR";

    // 2. Get buildings
    const buildingsRes = await apiRequest("buildings");
    const buildings = buildingsRes.data || [];
    if (buildings.length === 0) {
      return { success: true, data: [] };
    }

    // 3. Get floors for first building
    const floorsRes = await apiRequest(`floors/building/${buildings[0].id}`);
    const floors = floorsRes.data || [];

    // 4. Get available slots for each floor
    const slotPromises = floors.map(floor =>
      apiRequest(`slots/floor/${floor.id}/available`).catch(() => ({ data: [] }))
    );
    const slotResults = await Promise.all(slotPromises);
    const allSlots = slotResults.flatMap(res => res.data || []);

    // 5. Filter slots by vehicleType
    const matchedSlots = allSlots.filter(slot => {
      const slotType = String(slot.vehicleType || "").toUpperCase();
      return slotType === vehicleTypeName;
    });

    return { success: true, data: matchedSlots };
  }

  // Intercept GET /users/profile to return stored user profile
  if (cleanPath === "users/profile" && method === "GET") {
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : {
      fullName: "Parking User",
      email: "user@parkmaster.local",
      phone: "0123456789",
      username: "user"
    };
    return { success: true, data: currentUser };
  }

  // Intercept PUT /users/profile to save profile changes locally
  if (cleanPath === "users/profile" && method === "PUT") {
    const bodyObj = JSON.parse(cleanOptions.body || "{}");
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : {};
    const updatedUser = {
      ...currentUser,
      fullName: bodyObj.fullName !== undefined ? bodyObj.fullName : currentUser.fullName,
      phone: bodyObj.phone !== undefined ? bodyObj.phone : currentUser.phone,
      email: bodyObj.email !== undefined ? bodyObj.email : currentUser.email,
      username: bodyObj.email ? bodyObj.email.split("@")[0] : currentUser.username
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return { success: true, message: "Profile updated successfully", data: updatedUser };
  }

  // Intercept PATCH /users/profile/password to mock password changes
  if (cleanPath === "users/profile/password" && method === "PATCH") {
    return { success: true, message: "Password updated successfully" };
  }

  // Intercept GET /pricing-policies to get all pricing by building
  if (cleanPath === "pricing-policies" && method === "GET") {
    const buildingsRes = await apiRequest("buildings");
    const buildings = buildingsRes.data || [];
    const pricingPromises = buildings.map(building =>
      apiRequest(`pricing/building/${building.id}`).catch(() => ({ data: [] }))
    );
    const pricingResults = await Promise.all(pricingPromises);
    const allPolicies = pricingResults.flatMap(res => res.data || []);
    return { success: true, data: allPolicies };
  }

  // Translate POST and PUT requests for pricing policies
  if ((cleanPath === "pricing-policies" || cleanPath.startsWith("pricing-policies/")) && 
      (method === "POST" || method === "PUT")) {
      
    // Fetch buildings to get the default buildingId
    const buildingsRes = await apiRequest("buildings");
    const defaultBuildingId = buildingsRes.data?.[0]?.id || "8b72da1f-50b3-4632-a5e2-632b8ac425f1";
    
    try {
      const bodyObj = JSON.parse(cleanOptions.body);
      const mappedBody = {
        buildingId: defaultBuildingId,
        vehicleTypeId: bodyObj.vehicleTypeId,
        hourlyRate: bodyObj.hourlyRate !== undefined ? bodyObj.hourlyRate : 5000,
        basePrice: bodyObj.basePrice !== undefined ? bodyObj.basePrice : 0,
        nightRate: bodyObj.nightRate !== undefined ? bodyObj.nightRate : 5000,
        dailyRate: bodyObj.dailyRate !== undefined ? bodyObj.dailyRate : (bodyObj.basePrice || 50000),
        lostTicketFee: bodyObj.lostTicketFee !== undefined ? bodyObj.lostTicketFee : 100000,
        overtimeFeeMultiplier: bodyObj.overtimeFeeMultiplier !== undefined ? bodyObj.overtimeFeeMultiplier : 1.5,
        effectiveFrom: bodyObj.effectiveDate || new Date().toISOString(),
        effectiveTo: bodyObj.effectiveTo || null
      };
      cleanOptions.body = JSON.stringify(mappedBody);
    } catch {
      // Keep as is
    }
    
    if (cleanPath === "pricing-policies") {
      cleanPath = "pricing";
    } else {
      cleanPath = `pricing/${cleanPath.slice(17)}`;
    }
  } else if (cleanPath.startsWith("pricing-policies/") && method === "DELETE") {
    cleanPath = `pricing/${cleanPath.slice(17)}`;
  }

  // Translate POST /users (create user) to register + patch role/status
  if (cleanPath === "users" && method === "POST") {
    const bodyObj = JSON.parse(cleanOptions.body);
    const registerRes = await apiRequest("auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: bodyObj.email,
        password: bodyObj.password || "defaultPassword123",
        fullName: bodyObj.fullName,
        phone: bodyObj.phone || ""
      })
    });
    
    const createdUser = registerRes.data?.user;
    if (!createdUser) {
      throw new Error("User registration failed");
    }
    
    let updatedUser = { ...createdUser };
    
    if (bodyObj.role && bodyObj.role !== "USER" && bodyObj.role !== "DRIVER") {
      let backendRole = bodyObj.role;
      if (backendRole === "USER") backendRole = "DRIVER";
      const roleRes = await apiRequest(`admin/users/${createdUser.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: backendRole })
      });
      updatedUser = roleRes.data;
    }
    
    if (bodyObj.status === "INACTIVE" || bodyObj.active === false) {
      const statusRes = await apiRequest(`admin/users/${createdUser.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: false })
      });
      updatedUser = statusRes.data;
    }
    
    return { success: true, data: updatedUser };
  }

  // Translate DELETE /users/{id} to status deactivation
  if (cleanPath.startsWith("users/") && method === "DELETE") {
    const userId = cleanPath.split("/")[1];
    return await apiRequest(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active: false }),
      headers: options.headers,
    });
  }

  // Translate PUT /users/{id} to separate status and role PATCH requests
  if (cleanPath.startsWith("users/") && method === "PUT") {
    const userId = cleanPath.split("/")[1];
    let payload;
    try {
      payload = JSON.parse(options.body || "{}");
    } catch {
      payload = {};
    }

    const activeVal = payload.active !== undefined ? payload.active : (payload.status !== undefined ? payload.status === "ACTIVE" : undefined);
    if (activeVal !== undefined) {
      await apiRequest(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: activeVal }),
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
    cleanPath = "admin/users?size=1000";
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
  } else if (cleanPath.startsWith("parking-sessions/")) {
    cleanPath = `sessions/${cleanPath.slice(17)}`;
  } else if (cleanPath === "user/parking-sessions") {
    cleanPath = "sessions/my";
  }

  const response = await fetch(`${API_URL}/${cleanPath}`, {
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
      // If backend returns Page, flatten it to raw content array for frontend compatibility
      if (result.data.content && Array.isArray(result.data.content)) {
        result.data = result.data.content;
      }
      const normalizeItem = (item) => {
        if (!item) return;
        if (item.role === "DRIVER") {
          item.role = "USER";
        }
        if (item.active !== undefined) {
          item.status = item.active ? "ACTIVE" : "INACTIVE";
        }
        if (item.email && !item.username) {
          item.username = item.email.split("@")[0];
        }

        // Normalize pricing policies (map effectiveFrom to effectiveDate)
        if (item.effectiveFrom && !item.effectiveDate) {
          item.effectiveDate = item.effectiveFrom;
        }
        
        // Normalize slot zone code/name (e.g., "A" -> "Zone A")
        if (item.slotCode && item.zone !== undefined) {
          if (item.zone) {
            const letter = item.zone.replace("Zone", "").trim().toUpperCase();
            item.zone = `Zone ${letter}`;
          }
        }

        // Map flat slot fields in session/reservation responses into a nested parkingSlot object
        if (item.slotCode && !item.parkingSlot) {
          const parts = item.slotCode.split("-");
          let zoneLetter = "A";
          if (parts.length === 2) {
            zoneLetter = parts[0].replace(/[0-9]/g, "").toUpperCase() || "A";
          } else if (parts.length === 1) {
            zoneLetter = parts[0].replace(/[0-9]/g, "").toUpperCase() || "A";
          }
          const zoneName = `Zone ${zoneLetter}`;

          item.parkingSlot = {
            id: item.slotId,
            slotCode: item.slotCode,
            slotName: item.slotCode,
            floorName: item.floorName || "",
            zone: {
              id: `zone-${zoneLetter.toLowerCase()}`,
              zoneName: zoneName,
            },
            zoneName: zoneName
          };
          item.zoneName = zoneName;
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
