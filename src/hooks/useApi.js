import axios from "axios";
import { useCallback, useState } from "react";
import { useAuth } from "../hooks/use-auth"; // 認証トークンを取得するためのフック

const useApi = () => {
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL;
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = useCallback(
    async (method, url, data = {}, config = {}) => {
      console.log(method);
      console.log(url);
      console.log(data);
      console.log(config);
      setLoading(true);
      setError(null);

      try {
        let token = null;
        if (
          auth.user &&
          auth.user.signInUserSession &&
          auth.user.signInUserSession.idToken
        ) {
          token = auth.user.signInUserSession.idToken.jwtToken;
        }

        const headers = {
          ...config?.headers, // 必要に応じて追加のヘッダーを受け取る
          Authorization: token ? `Bearer ${token}` : undefined, // 認証トークンを設定
        };
        const requestUrl = `${baseUrl}${url}`;

        console.log(headers);
        console.log(requestUrl);

        let response;
        switch (method.toLowerCase()) {
          case "get":
            response = await axios.get(requestUrl, { ...config, headers });
            break;
          case "post":
            response = await axios.post(requestUrl, data, {
              ...config,
              headers,
            });
            break;
          case "put":
            response = await axios.put(requestUrl, data, {
              ...config,
              headers,
            });
            break;
          case "delete":
            response = await axios.delete(requestUrl, {
              ...config,
              headers,
            });
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        return response.data; // レスポンスデータを返す
      } catch (err) {
        console.error(err);
        setError(err.message || "API request failed"); // エラーメッセージを設定
        throw err; // エラーをスローしてコンポーネント側で処理できるようにする
      } finally {
        setLoading(false);
      }
    },
    [auth.user, baseUrl] // auth.user を依存配列に追加
  );

  // 各 HTTP メソッドをラップした関数
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

export default useApi;
