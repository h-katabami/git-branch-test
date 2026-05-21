// hooks/useBatchGet.js

import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../hooks/use-auth";
import moment from "moment";

export const useBatchGet = () => {
  const baseUrl = "https://flow.tactinc.jp";
  const auth = useAuth();
  // const token = auth.idToken;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFullData = useCallback(
    async (start, end, statuses) => {
      setIsLoading(true);
      setError(null);
      let allData = [];
      let lastEvaluatedKey = null;

      try {
        let token = null;
        if (
          auth.user &&
          auth.user.signInUserSession &&
          auth.user.signInUserSession.idToken
        ) {
          token = auth.user.signInUserSession.idToken.jwtToken;
        }
        // データを全件取得するまでループ
        while (true) {
          const params = {
            start: moment(start).format("YYYY-MM-DD"),
            end: moment(end).add(1, "d").format("YYYY-MM-DD"),
            pagination: 1,
            ...(lastEvaluatedKey && { last_evaluated_key: lastEvaluatedKey }),
          };

          const headers = {
            Authorization: token ? `Bearer ${token}` : undefined, // 認証トークンを設定
          };

          const response = await axios.get(
            `${baseUrl}${"/edit/histories/batch-get"}`,
            {
              params,
              headers,
            }
          );
          const { results, last_evaluated_key } = response.data;

          allData = allData.concat(results);
          lastEvaluatedKey = last_evaluated_key;

          // last_evaluated_key が存在しない場合はループを終了
          if (!lastEvaluatedKey) {
            break;
          }
        }

        // フロントエンドでのフィルタリング
        const filteredData = allData.filter((item) => {
          const timeRangeMatch = moment(item.start_time).isBetween(
            moment(start),
            moment(end)
          );
          const statusMatch = statuses.includes(item.status);
          return timeRangeMatch && statusMatch;
        });

        // 日付降順にソート
        filteredData.sort(
          (a, b) => new Date(b.start_time) - new Date(a.start_time)
        );

        return filteredData;
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました。");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [auth.user]
  );

  return { getFullData, isLoading, error };
};
