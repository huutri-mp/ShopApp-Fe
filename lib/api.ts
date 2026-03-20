import axios from "axios";
import useAppStore from "@/hooks/useAppStore";
import { getCookie, parseJwtPayload } from "@/lib/utils";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const DEFAULT_REFRESH_INTERVAL_MS = 290000;
const MIN_REFRESH_INTERVAL_MS = 10000;
const AUTH_DEBUG = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

const authDebug = (message: string, extra?: Record<string, unknown>) => {
  if (!AUTH_DEBUG || typeof window === "undefined") return;
  const now = new Date().toISOString();
  if (extra) {
    console.info(`[auth-refresh][${now}] ${message}`, extra);
    return;
  }
  console.info(`[auth-refresh][${now}] ${message}`);
};

type FailedQueueItem = {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
};

type RefreshState = {
  refreshIntervalId: ReturnType<typeof setTimeout> | null;
  isRefreshing: boolean;
  failedQueue: FailedQueueItem[];
};

declare global {
  var __shopAppRefreshState__: RefreshState | undefined;
}

const refreshState: RefreshState =
  globalThis.__shopAppRefreshState__ ??
  (globalThis.__shopAppRefreshState__ = {
    refreshIntervalId: null,
    isRefreshing: false,
    failedQueue: [],
  });

const resolveRefreshIntervalMs = (token?: string | null): number => {
  const payload = parseJwtPayload<{ exp?: number; expirationTime?: number }>(
    token,
  );
  const rawExpiry = payload?.exp ?? payload?.expirationTime;

  if (typeof rawExpiry === "number") {
    const expirationMs =
      rawExpiry < 1_000_000_000_000 ? rawExpiry * 1000 : rawExpiry;
    const remainingMs = expirationMs - Date.now();
    const intervalMs = Math.max(
      Math.min(remainingMs, DEFAULT_REFRESH_INTERVAL_MS),
      MIN_REFRESH_INTERVAL_MS,
    );
    authDebug("Resolved refresh interval from token", {
      rawExpiry,
      expirationMs,
      remainingMs,
      intervalMs,
    });
    return intervalMs;
  }

  authDebug(
    "Fallback to default refresh interval because token expiry is missing",
  );

  return DEFAULT_REFRESH_INTERVAL_MS;
};

const processQueue = (error: any, token: string | null = null) => {
  refreshState.failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshState.failedQueue = [];
};

const refreshAccessToken = async () => {
  const xsrfToken = getCookie("XSRF-TOKEN");
  if (!xsrfToken) {
    if (refreshState.refreshIntervalId) {
      clearTimeout(refreshState.refreshIntervalId);
      refreshState.refreshIntervalId = null;
    }
    authDebug("Skip refresh call: missing XSRF-TOKEN cookie");
    throw new Error("Missing XSRF-TOKEN");
  }

  const refreshUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/refresh-token";
  const xsrfHeaders = {
    "X-XSRF-TOKEN": xsrfToken,
    "X-CSRF-TOKEN": xsrfToken,
  };

  authDebug("Calling refresh token endpoint");
  const refreshResponse = await axios.post(
    refreshUrl,
    {},
    {
      withCredentials: true,
      headers: xsrfHeaders,
    },
  );
  const newToken = refreshResponse.data.data;
  authDebug("Refresh token call succeeded", {
    hasToken: Boolean(newToken),
  });
  useAppStore.getState().setAccessToken(newToken);
  scheduleRefreshFromToken(newToken, true);
  return newToken;
};

const scheduleRefreshFromToken = (
  token?: string | null,
  force: boolean = false,
) => {
  if (typeof window === "undefined") return;
  const { accessToken } = useAppStore.getState();
  const effectiveToken = token ?? accessToken;

  if (!effectiveToken) {
    if (refreshState.refreshIntervalId) {
      clearTimeout(refreshState.refreshIntervalId);
      refreshState.refreshIntervalId = null;
    }
    authDebug("Clear refresh timer: no access token");
    return;
  }
  if (refreshState.refreshIntervalId && !force) {
    authDebug("Skip scheduling: timer already exists");
    return;
  }
  if (!getCookie("XSRF-TOKEN")) {
    authDebug("Skip scheduling: missing XSRF-TOKEN cookie");
    return;
  }

  if (refreshState.refreshIntervalId) {
    clearTimeout(refreshState.refreshIntervalId);
    refreshState.refreshIntervalId = null;
  }

  const intervalMs = resolveRefreshIntervalMs(effectiveToken);
  authDebug("Scheduling refresh timer", {
    intervalMs,
    force,
  });

  refreshState.refreshIntervalId = setTimeout(() => {
    if (refreshState.isRefreshing) {
      authDebug("Timer fired while refresh in progress, rescheduling");
      scheduleRefreshFromToken(token, true);
      return;
    }
    refreshState.isRefreshing = true;
    authDebug("Timer fired, starting refresh");
    void refreshAccessToken()
      .then((token) => {
        processQueue(null, token);
        authDebug("Refresh flow completed successfully");
      })
      .catch((e) => {
        processQueue(e, null);
        authDebug("Refresh flow failed from timer", {
          message: e instanceof Error ? e.message : String(e),
        });
        try {
          useAppStore.getState().clear();
        } catch {}
        if (typeof window !== "undefined")
          window.dispatchEvent(new Event("auth-changed"));
      })
      .finally(() => {
        refreshState.isRefreshing = false;
        refreshState.refreshIntervalId = null;
      });
  }, intervalMs);
};

apiClient.interceptors.request.use(
  (config) => {
    try {
      const { accessToken } = useAppStore.getState();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      const xsrf = getCookie("XSRF-TOKEN");
      if (xsrf && config.headers) {
        config.headers["X-XSRF-TOKEN"] = xsrf;
      }
      if (accessToken) {
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
    const originalRequest = err.config as any;
    if (!originalRequest) return Promise.reject(err);

    const { isAuthenticated, accessToken } = useAppStore.getState();
    if (!isAuthenticated && !accessToken) return Promise.reject(err);

    const status = err?.response?.status;
    const isRefreshRequest =
      typeof originalRequest?.url === "string" &&
      originalRequest.url.includes("/auth/refresh-token");

    if (status !== 401 || isRefreshRequest || originalRequest._retry) {
      authDebug("Skip response-refresh path", {
        status,
        isRefreshRequest,
        retried: Boolean(originalRequest._retry),
      });
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    const xsrfTokenPresent = Boolean(getCookie("XSRF-TOKEN"));
    if (!xsrfTokenPresent) {
      authDebug("Cannot refresh on 401: missing XSRF-TOKEN");
      try {
        useAppStore.getState().clear();
      } catch {}
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("auth-changed"));
      return Promise.reject(err);
    }

    if (refreshState.isRefreshing) {
      authDebug("Refresh already in progress, queueing request");
      return new Promise(function (resolve, reject) {
        refreshState.failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token && originalRequest.headers)
            originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((e) => Promise.reject(e));
    }

    refreshState.isRefreshing = true;
    authDebug("401 received, starting refresh before retry");

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);

      if (newToken && originalRequest.headers)
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (e) {
      processQueue(e, null);
      authDebug("401 refresh attempt failed", {
        message: e instanceof Error ? e.message : String(e),
      });
      try {
        useAppStore.getState().clear();
      } catch {}
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("auth-changed"));
      return Promise.reject(e);
    } finally {
      refreshState.isRefreshing = false;
    }

    return Promise.reject(err);
  },
);

export default apiClient;
