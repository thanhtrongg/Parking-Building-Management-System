function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getBrowserApiUrl(configuredApiUrl) {
  if (typeof window === "undefined") {
    return configuredApiUrl || "http://localhost:5000";
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
    return "http://localhost:5000";
  }

  return `${protocol}//${hostname}:5000`;
}

export const API_URL = getBrowserApiUrl(import.meta.env.VITE_API_URL);

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("accessToken");

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(`Cannot connect to API server at ${API_URL}`);
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API request failed");
  }

  return result;
};
