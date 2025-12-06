import axios from "axios";
import useAppStore from "@/hooks/useAppStore";
import { getCookie } from "@/lib/utils";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    try {
      const accessToken = useAppStore.getState().accessToken;
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      const xsrf = getCookie("XSRF-TOKEN");
      if (xsrf && config.headers) {
        config.headers["X-XSRF-TOKEN"] = xsrf;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (!originalRequest) return Promise.reject(err);

    if (err.response?.status === 401 && !originalRequest._retry) {
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
        const refreshUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/refresh-token";
        // Read XSRF token from cookie and include it in header for the refresh call
        const xsrfToken = getCookie("XSRF-TOKEN");
        // send both common header names as a fallback (some servers expect X-CSRF-TOKEN)
        const xsrfHeaders = xsrfToken
          ? { "X-XSRF-TOKEN": xsrfToken, "X-CSRF-TOKEN": xsrfToken }
          : undefined;

        const refreshResponse = await axios.post(
          refreshUrl,
          {},
          {
            withCredentials: true,
            headers: xsrfHeaders,
          }
        );
        const newToken = refreshResponse.data.data;

        useAppStore.getState().setAccessToken(newToken);

        processQueue(null, newToken);

        if (newToken && originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (e) {
        processQueue(e, null);
        try {
          useAppStore.getState().clear();
        } catch (ex) {}
        if (typeof window !== "undefined")
          window.dispatchEvent(new Event("auth-changed"));
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default apiClient;
