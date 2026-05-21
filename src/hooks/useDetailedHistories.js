import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../hooks/use-auth";
import moment from "moment";
import { mergeDeeply } from "../components/mergeDeeply"; // 適切なパスに修正してください

export const useDetailedHistories = () => {
  const baseUrl = "https://flow.tactinc.jp";
  const auth = useAuth();
  // const token = auth.idToken;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 個別の通話履歴詳細を取得する関数
  const getCallDetails = async (row) => {
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
        Authorization: token ? `Bearer ${token}` : undefined, // 認証トークンを設定
      };
      const res = await axios.get(
        `${baseUrl}${"/edit/histories/"}${row.call_sid}`,
        {
          headers,
        }
      );
      const detail = res.data;

      const temp = mergeDeeply(row, detail);
      const user_input_temp = {};
      if (temp.user_inputs) {
        temp.user_inputs.forEach((input) => {
          user_input_temp[input.question_id] = input.input;
        });
      }
      temp.user_inputs = user_input_temp;

      if (temp.api) {
        const id = temp.api.find((u) => u.question_id === "start");
        temp.id = id?.result?.result ?? null;
      } else {
        temp.id = null;
      }
      return temp;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // 通話履歴リストとその詳細を一括取得する関数
  const getFullData = useCallback(
    async (start, end, searchNumber, statuses) => {
      setIsLoading(true);
      setError(null);
      let token = null;
      if (
        auth.user &&
        auth.user.signInUserSession &&
        auth.user.signInUserSession.idToken
      ) {
        token = auth.user.signInUserSession.idToken.jwtToken;
      }
      try {
        const headers = {
          Authorization: token ? `Bearer ${token}` : undefined, // 認証トークンを設定
        };
        const pstart = moment(start).format("YYYY-MM-DD");
        const pend = moment(end).add(1, "d").format("YYYY-MM-DD");

        const res = await axios.get(
          `${baseUrl}${"/edit/histories?start="}${pstart}${"&end="}${pend}${"&pagination=1"}`,
          { headers }
        );

        const filteredList = res.data.results.filter((row) => {
          const check = moment(row.start_time);
          const numberMatch =
            searchNumber === "all" || row.call_to === searchNumber;
          const timeRangeMatch = check.isBetween(moment(start), moment(end));
          return numberMatch && timeRangeMatch && "minutes" in row;
        });

        // Promise.all を使用して詳細取得リクエストを並列化
        const withDetails = await Promise.all(
          filteredList.map(async (row) => await getCallDetails(row))
        );

        // null値を除外して、指定されたステータスで最終フィルタリング
        const finalData = withDetails
          .filter((item) => item !== null && statuses.includes(item.status))
          .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

        return finalData;
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました。");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [auth.user, getCallDetails]
  );

  return { getFullData, isLoading, error };
};
