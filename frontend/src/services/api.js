function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getBrowserApiUrl(configuredApiUrl) {
  if (typeof window === "undefined") {
    return configuredApiUrl || "http://localhost:8080/api/v1";
  }

  const { hostname, protocol } = window.location;

  if (configuredApiUrl) {
    try {
      const parsedUrl = new URL(configuredApiUrl);

      if (isLocalHostname(parsedUrl.hostname) && !isLocalHostname(hostname)) {
        if (protocol === "https:") {
          return "";
        }

        parsedUrl.hostname = hostname;
        return parsedUrl.toString().replace(/\/$/, "");
      }

      return configuredApiUrl.replace(/\/$/, "");
    } catch {
      return configuredApiUrl.replace(/\/$/, "");
    }
  }

  if (!hostname || isLocalHostname(hostname)) {
    return "http://localhost:8080/api/v1";
  }

  return `${protocol}//${hostname}:8080/api/v1`;
}

export const API_URL = getBrowserApiUrl(import.meta.env.VITE_API_URL);

const refineVehicleTypeName = (typeStr) => {
  if (!typeStr) return "N/A";
  const str = String(typeStr).toUpperCase().trim();
  const mapping = {
    "CAR": "Car",
    "MOTORBIKE": "Motorbike",
    "BICYCLE": "Bicycle",
    "ELECTRIC_VEHICLE": "Electric Vehicle",
    "LIGHT_TRUCK": "Light Truck"
  };
  if (mapping[str]) return mapping[str];
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

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
  
  // Separate base path and query parameters
  let basePath = cleanPath;
  let queryString = "";
  if (cleanPath.includes("?")) {
    const questionMarkIndex = cleanPath.indexOf("?");
    basePath = cleanPath.substring(0, questionMarkIndex);
    queryString = cleanPath.substring(questionMarkIndex);
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

      // Map feedback payload keys from frontend to backend DTO
      const method = (cleanOptions.method || "GET").toUpperCase();
      if (basePath === "reservations" && (method === "POST" || method === "PUT")) {
        // 1. Resolve vehicleType enum name from vehicleTypeId
        const typesRes = await apiRequest("vehicle-types");
        const types = typesRes.data || [];
        const matchedType = types.find(t => t.id === bodyObj.vehicleTypeId);
        const vehicleType = matchedType ? (matchedType.name || "").toUpperCase() : "CAR";

        // 2. Fetch slot details to get the buildingId (since it's required)
        let buildingId = bodyObj.buildingId;
        if (!buildingId && bodyObj.parkingSlotId) {
          const slotRes = await apiRequest(`slots/${bodyObj.parkingSlotId}`);
          const slot = slotRes.data;
          if (slot && slot.floorId) {
            const floorRes = await apiRequest(`floors/${slot.floorId}`);
            const floor = floorRes.data;
            if (floor && floor.buildingId) {
              buildingId = floor.buildingId;
            }
          }
        }
        if (!buildingId) {
          const buildingsRes = await apiRequest("buildings");
          buildingId = buildingsRes.data?.[0]?.id || "8b72da1f-50b3-4632-a5e2-632b8ac425f1";
        }

        // 3. Map to backend ReservationRequest DTO
        const mappedBody = {
          slotId: bodyObj.parkingSlotId || null,
          vehicleType: vehicleType,
          reservedFrom: bodyObj.startTime || bodyObj.reservedFrom,
          reservedTo: bodyObj.endTime || bodyObj.reservedTo,
          buildingId: buildingId
        };
        cleanOptions.body = JSON.stringify(mappedBody);
      } else if ((basePath === "user/feedbacks" || basePath === "feedback") && method === "POST") {
        if (bodyObj.subject !== undefined || bodyObj.message !== undefined) {
          const category = bodyObj.subject || "General";
          const bookingInfo = bodyObj.bookingId ? `[Booking ID: ${bodyObj.bookingId}] ` : "";
          const content = bookingInfo + (bodyObj.message || "");
          
          // Construct backend FeedbackRequest payload
          const backendFeedback = {
            category: category,
            content: content,
            sessionId: null // Session is optional
          };
          cleanOptions.body = JSON.stringify(backendFeedback);
        }
      } else {
        cleanOptions.body = JSON.stringify(bodyObj);
      }
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
      const slotType = (slot.vehicleTypeName || slot.vehicleType?.typeName || String(slot.vehicleType || "")).toUpperCase();
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
  if (basePath === "users") {
    basePath = "admin/users";
    if (!queryString.includes("size=")) {
      queryString = queryString ? `${queryString}&size=1000` : "?size=1000";
    }
  } else if (basePath === "user/feedbacks") {
    basePath = (cleanOptions.method || "GET").toUpperCase() === "POST" ? "feedback" : "feedback/my";
  } else if (basePath === "feedbacks") {
    basePath = "feedback";
  } else if (basePath.startsWith("feedbacks/") && basePath.endsWith("/status")) {
    const feedbackId = basePath.split("/")[1];
    basePath = `feedback/${feedbackId}/status`;
    if (cleanOptions.method === "PUT") cleanOptions.method = "PATCH";
  } else if (basePath.startsWith("feedbacks/") && basePath.endsWith("/reply")) {
    const feedbackId = basePath.split("/")[1];
    basePath = `feedback/${feedbackId}/reply`;
  } else if (basePath === "parking-slots") {
    basePath = "slots";
  } else if (basePath === "reservations") {
    basePath = (isDriver && method === "GET") ? "reservations/my" : "reservations";
  } else if (basePath === "parking-sessions") {
    basePath = (isDriver && method === "GET") ? "sessions/my" : "sessions/active";
  } else if (basePath.startsWith("parking-sessions/")) {
    basePath = `sessions/${basePath.slice(17)}`;
  } else if (basePath === "user/parking-sessions") {
    basePath = "sessions/my";
  }

  cleanPath = basePath + queryString;

  let response;
  try {
    response = await fetch(`${API_URL}/${cleanPath}`, {
      ...cleanOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cleanOptions.headers || {}),
      },
    });
  } catch {
    throw new Error(`Cannot connect to API server at ${API_URL}`);
  }

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
        if (!item || typeof item !== "object") return;

        // Universal vehicleType name refinement
        if (item.typeName !== undefined || item.name !== undefined) {
          const rawName = item.typeName || item.name;
          if (rawName) {
            item.typeName = refineVehicleTypeName(rawName);
            item.name = item.typeName;
          }
        }
        if (item.vehicleType && typeof item.vehicleType === "object") {
          const rawName = item.vehicleType.typeName || item.vehicleType.name;
          if (rawName) {
            item.vehicleType.typeName = refineVehicleTypeName(rawName);
            item.vehicleType.name = item.vehicleType.typeName;
            item.vehicleTypeName = item.vehicleType.typeName;
          }
        } else if (item.vehicleType && typeof item.vehicleType === "string") {
          const refined = refineVehicleTypeName(item.vehicleType);
          item.vehicleType = { typeName: refined, name: refined };
          item.vehicleTypeName = refined;
        }
        if (item.vehicle_types && typeof item.vehicle_types === "object") {
          const rawName = item.vehicle_types.type_name || item.vehicle_types.name;
          if (rawName) {
            item.vehicle_types.type_name = refineVehicleTypeName(rawName);
            item.vehicle_types.name = item.vehicle_types.type_name;
            item.vehicleTypeName = item.vehicle_types.type_name;
          }
        }
        if (item.vehicleTypeName) {
          item.vehicleTypeName = refineVehicleTypeName(item.vehicleTypeName);
        }
        if (item.vehicle_type_name) {
          item.vehicle_type_name = refineVehicleTypeName(item.vehicle_type_name);
        }
        if (item.role === "DRIVER") {
          item.role = "USER";
        }
        if (item.active !== undefined) {
          item.status = item.active ? "ACTIVE" : "INACTIVE";
        }
        if (item.email && !item.username) {
          item.username = item.email.split("@")[0];
        }

        // Normalize feedback fields
        if (item.category !== undefined && item.content !== undefined) {
          if (item.subject === undefined) {
            item.subject = item.category;
          }
          if (item.message === undefined) {
            item.message = item.content;
          }
          if (!item.bookingId) {
            if (item.content && item.content.startsWith("[Booking ID: ")) {
              const endIndex = item.content.indexOf("]");
              if (endIndex !== -1) {
                item.bookingId = item.content.substring(13, endIndex);
                // Strip the booking ID prefix from the message displayed to the user
                item.message = item.content.substring(endIndex + 1).trim();
              }
            } else if (item.session) {
              item.bookingId = item.session.ticketCode || item.session.id;
            }
          }
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

        // Normalize parking session fields
        if (item.checkInTime !== undefined) {
          if (item.startTime === undefined) {
            item.startTime = item.checkInTime;
          }
          if (item.entryTime === undefined) {
            item.entryTime = item.checkInTime;
          }
          if (item.endTime === undefined) {
            item.endTime = item.checkOutTime;
          }
          if (item.exitTime === undefined) {
            item.exitTime = item.checkOutTime;
          }
          if (!item.user && item.driverName) {
            item.user = {
              fullName: item.driverName,
              phone: "N/A"
            };
          }
          if (item.vehicleType && (typeof item.vehicleType === "string" || !item.vehicleType.typeName)) {
            const typeStr = typeof item.vehicleType === "string" 
              ? item.vehicleType 
              : (item.vehicleType.name || item.vehicleType.typeName || String(item.vehicleType));
            const formattedType = refineVehicleTypeName(typeStr);
            item.vehicleType = {
              typeName: formattedType
            };
            item.vehicleTypeName = formattedType;
          }
          if (!item.slotName && item.slotCode) {
            item.slotName = item.slotCode;
          }
          if (item.entryTime) {
            const exit = item.exitTime || new Date().toISOString();
            const hours = Math.max(1, Math.ceil((new Date(exit) - new Date(item.entryTime)) / (1000 * 60 * 60)));
            item.parkingHours = item.parkingHours || hours;
          }
          if (item.payment) {
            item.paymentStatus = item.payment.status;
            item.paymentMethod = item.payment.method;
          }
        }

        // Normalize reservation fields
        if (item.reservedFrom !== undefined) {
          if (item.expectedStartTime === undefined) {
            item.expectedStartTime = item.reservedFrom;
          }
          if (item.expectedEndTime === undefined) {
            item.expectedEndTime = item.reservedTo;
          }
          if (item.startTime === undefined) {
            item.startTime = item.reservedFrom;
          }
          if (item.endTime === undefined) {
            item.endTime = item.reservedTo;
          }
          if (item.customerName === undefined && item.driverName) {
            item.customerName = item.driverName;
          }
          if (!item.user && item.driverName) {
            item.user = {
              fullName: item.driverName,
              email: item.driverEmail || "No email",
              phone: item.driverPhone || "N/A"
            };
          }
          if (item.vehicleType && (typeof item.vehicleType === "string" || !item.vehicleType.typeName)) {
            const typeStr = typeof item.vehicleType === "string" 
              ? item.vehicleType 
              : (item.vehicleType.name || item.vehicleType.typeName || String(item.vehicleType));
            const formattedType = refineVehicleTypeName(typeStr);
            item.vehicleType = {
              typeName: formattedType
            };
            item.vehicleTypeName = formattedType;
          }
          if (!item.slotName && item.slotCode) {
            item.slotName = item.slotCode;
          }
        }

        // Normalize payment fields
        if (item.amount !== undefined && item.sessionId !== undefined) {
          const status = item.status === "PAID" ? "SUCCESS" : item.status;
          item.status = status;
          item.paymentMethod = item.paymentMethod || item.method;
          item.paymentTime = item.paymentTime || item.paidAt;
          
          if (!item.parkingSession) {
            let zoneLetter = "A";
            if (item.slotCode) {
              const parts = item.slotCode.split("-");
              if (parts.length === 2) {
                zoneLetter = parts[0].replace(/[0-9]/g, "").toUpperCase() || "A";
              } else if (parts.length === 1) {
                zoneLetter = parts[0].replace(/[0-9]/g, "").toUpperCase() || "A";
              }
            }
            const zoneName = `Zone ${zoneLetter}`;
            const typeStr = typeof item.vehicleType === "string" 
              ? item.vehicleType 
              : (item.vehicleType ? (item.vehicleType.name || item.vehicleType.typeName || String(item.vehicleType)) : "N/A");
            const formattedType = refineVehicleTypeName(typeStr);

            item.parkingSession = {
              id: item.sessionId,
              ticketCode: item.ticketCode || (item.reservationId ? `RSV-${item.reservationId.slice(0, 8)}` : "No ticket"),
              licensePlate: item.licensePlate || "N/A",
              entryTime: item.checkInTime,
              exitTime: item.checkOutTime,
              status: item.checkOutTime ? "COMPLETED" : "ACTIVE",
              user: {
                fullName: item.driverName || "Guest User",
                email: item.driverEmail || "No email"
              },
              vehicleType: {
                typeName: formattedType
              },
              parkingSlot: {
                slotName: item.slotCode || "No slot",
                zoneName: zoneName
              }
            };
          }
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

  if (!response.ok || (result && result.success === false)) {
    throw new Error(result?.message || result?.errors?.join(", ") || "API request failed");
  }

  return result;
};
