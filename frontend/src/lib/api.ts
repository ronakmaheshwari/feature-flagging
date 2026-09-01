import axios from "axios"

declare global {
  interface Window {
    env_?: {
      VITE_API_URL: string;
    };
  }
}

// export async function getConfig() {
//   return {
//     apiUrl: window.env_?.VITE_API_URL ?? import.meta.env.VITE_API_URL,
//     websocketUrl: window.env_?.VITE_WEBSOCKET_URL ?? import.meta.env.VITE_WEBSOCKET_URL,
//   };
// }

export async function getConfig() {
  // Support both build-time VITE_ env and runtime window.env_ (e.g. docker)
  const runtimeUrl = (typeof window !== "undefined" ? (window as any).env_?.VITE_API_URL : undefined);
  const buildUrl = (import.meta as any).env?.VITE_API_URL;
  let apiUrl: string | undefined = runtimeUrl ?? buildUrl;
  // Vite may keep quotes from .env, strip them and trailing slash
  if (apiUrl) {
    apiUrl = String(apiUrl).replace(/^["']|["']$/g, "").replace(/\/$/, "");
  }
  // Fallback to local backend if not configured
  if (!apiUrl) apiUrl = "http://localhost:3000/api/v1";
  return { apiUrl };
}

const api = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(async (config) => {
  const { apiUrl } = await getConfig();
  config.baseURL = apiUrl;

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Always request JSON, never HTML – prevents Vite fallback HTML being handled as download
  config.headers.Accept = "application/json";
  return config;
});

// If backend/Vite returns HTML (e.g. wrong baseURL -> index.html fallback), surface as error instead of triggering download
api.interceptors.response.use(
  (response) => {
    const ct = String(response.headers?.["content-type"] ?? "");
    const dataStr = typeof response.data === "string" ? response.data : "";
    if (ct.includes("text/html") && dataStr.includes("<html") || dataStr.includes("<!doctype html")) {
      return Promise.reject(new Error("Received HTML instead of JSON – check VITE_API_URL (current: " + response.config.baseURL + response.config.url + "). Backend not reachable."));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api