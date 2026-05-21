import axios from "axios";
import { useCallback, useState } from "react";
import { useAuth } from "./use-auth";

const useProxyApi = () => {
  const defaultBaseUrl =
    process.env.REACT_APP_PROXY_BASE_URL;
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = useCallback(
    async (method, url, data = {}, config = {}) => {
      setLoading(true);
      setError(null);

      try {
        const token = auth?.user?.signInUserSession?.idToken?.jwtToken;
        const isFullUrl = url.startsWith("http");
        const activeBaseUrl =
          config.baseUrl !== undefined ? config.baseUrl : defaultBaseUrl;
        const requestUrl = isFullUrl ? url : `${activeBaseUrl}${url}`;

        const headers = { ...config?.headers };
        if (!config.skipAuth && token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios({
          method: method.toLowerCase(),
          url: requestUrl,
          data,
          headers,
          ...config,
        });

        return response.data;
      } catch (err) {
        console.error("API Error:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [auth, defaultBaseUrl]
  );

  const get = useCallback((url, config = {}) => api("get", url, {}, config), [
    api,
  ]);
  const post = useCallback(
    (url, data, config = {}) => api("post", url, data, config),
    [api]
  );
  const put = useCallback(
    (url, data, config = {}) => api("put", url, data, config),
    [api]
  );
  const del = useCallback(
    (url, config = {}) => api("delete", url, {}, config),
    [api]
  );

  return { get, post, put, delete: del, loading, error };
};

export default useProxyApi;
