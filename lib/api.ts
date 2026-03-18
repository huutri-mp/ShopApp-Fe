import axios from "axios";
import useAppStore from "@/hooks/useAppStore";
import { getCookie, parseJwtPayload } from "@/lib/utils";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const DEFAULT_REFRESH_INTERVAL_MS = 290000;
const MIN_REFRESH_INTERVAL_MS = 10000;
let refreshIntervalId: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const resolveRefreshIntervalMs = (token?: string | null): number => {
  const payload = parseJwtPayload(token);
  const expirationTime = payload?.expirationTime;

  if (typeof expirationTime === "number") {
    const remainingMs = expirationTime - Date.now();
    return Math.max(
      Math.min(remainingMs, DEFAULT_REFRESH_INTERVAL_MS),
      MIN_REFRESH_INTERVAL_MS,
    );
  }

  return DEFAULT_REFRESH_INTERVAL_MS;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const xsrfToken = getCookie("XSRF-TOKEN");
  if (!xsrfToken) {
    if (refreshIntervalId) {
      clearTimeout(refreshIntervalId);
      refreshIntervalId = null;
    }
    throw new Error("Missing XSRF-TOKEN");
  }

  const refreshUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/refresh-token";
  const xsrfHeaders = {
    "X-XSRF-TOKEN": xsrfToken,
    "X-CSRF-TOKEN": xsrfToken,
  };

  const refreshResponse = await axios.post(
    refreshUrl,
    {},
    {
      withCredentials: true,
      headers: xsrfHeaders,
    },
  );
  const newToken = refreshResponse.data.data;
  useAppStore.getState().setAccessToken(newToken);
  scheduleRefreshFromToken(newToken, true);
  return newToken;
};

const scheduleRefreshFromToken = (
  token?: string | null,
  force: boolean = false,
) => {
  if (typeof window === "undefined") return;
  const { isAuthenticated } = useAppStore.getState();
  console.log("Scheduling token refresh, isAuthenticated:", isAuthenticated);
  if (!isAuthenticated) {
    if (refreshIntervalId) {
      clearTimeout(refreshIntervalId);
      refreshIntervalId = null;
    }
    return;
  }
  if (refreshIntervalId && !force) return;
  if (!getCookie("XSRF-TOKEN")) return;

  if (refreshIntervalId) {
    clearTimeout(refreshIntervalId);
    refreshIntervalId = null;
  }

  const intervalMs = resolveRefreshIntervalMs(
    token ?? useAppStore.getState().accessToken,
  );

  refreshIntervalId = setTimeout(() => {
    if (isRefreshing) return;
    isRefreshing = true;
    void refreshAccessToken()
      .then((token) => {
        processQueue(null, token);
      })
      .catch((e) => {
        processQueue(e, null);
        try {
          useAppStore.getState().clear();
        } catch {}
        if (typeof window !== "undefined")
          window.dispatchEvent(new Event("auth-changed"));
      })
      .finally(() => {
        isRefreshing = false;
      });
  }, intervalMs);
};

apiClient.interceptors.request.use(
  (config) => {
    try {
      const { accessToken, isAuthenticated } = useAppStore.getState();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      const xsrf = getCookie("XSRF-TOKEN");
      if (xsrf && config.headers) {
        config.headers["X-XSRF-TOKEN"] = xsrf;
      }
      if (isAuthenticated) {
        scheduleRefreshFromToken(accessToken);
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (!originalRequest) return Promise.reject(err);

    const { isAuthenticated } = useAppStore.getState();
    if (!isAuthenticated) return Promise.reject(err);

    originalRequest._retry = true;

    const xsrfTokenPresent = Boolean(getCookie("XSRF-TOKEN"));
    if (!xsrfTokenPresent) {
      try {
        useAppStore.getState().clear();
      } catch {}
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("auth-changed"));
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token && originalRequest.headers)
            originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((e) => Promise.reject(e));
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);

      if (newToken && originalRequest.headers)
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (e) {
      processQueue(e, null);
      try {
        useAppStore.getState().clear();
      } catch {}
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("auth-changed"));
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }

    return Promise.reject(err);
  },
);

export default apiClient;
