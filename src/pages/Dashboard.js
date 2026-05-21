import React, { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { useAuth } from "../hooks/use-auth";
import GraphDashboard from "../components/GraphDashboard";

import moment from "moment";

import useApi from "../hooks/useApi"; // カスタムフック

const CustomContainer = styled(Container)(({ theme }) => ({
  height: "92vh",
  padding: theme.spacing(5),
  paddingTop: theme.spacing(2),
}));

function toCountDict(array, column, searchFlag, status) {
  let dict = [];
  for (let key of column) {
    dict.push(
      array.filter((x) => {
        var dictKey =
          searchFlag === "last7days" ||
          searchFlag === "thisMonth" ||
          searchFlag === "lastMonth"
            ? moment(x.start_time).format("YYYY-MM-DD")
            : new Date(x.start_time).getHours();
        if (status === null) {
          return dictKey === key;
        } else {
          return dictKey === key && x.status === status;
        }
      }).length
    );
  }
  return dict;
}
function toCountDictSum(array) {
  return array.reduce((sum, element) => sum + element, 0);
}

const defaultStatusList = [
  "冒頭切断",
  "冒頭切断2",
  "切断(名前)",
  "切断(住所)",
  "切断(通常案内)",
  "切断(定期案内)",
  "今回のみ",
  "定期購入",
  "対応完了",
  "対応完了2",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  // const token = auth.idToken;
  const [data, setData] = useState([]);
  const [statusList, setStatusList] = useState(defaultStatusList);
  const [list, setList] = useState({});
  const [total, setTotal] = useState({});
  const [searchFlag, setSearchFlag] = useState("today");
  const [column, setColumn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customStatusListState, setCustomStatusListState] = useState([]);
  const api = useApi();

  const handleChangeSearchFlag = (event) => {
    setSearchFlag(event.target.value);
  };
  // const statusList = customStatusList.concat(defaultStatusList);

  const countColumn = useCallback((array, searchFlag, statusList) => {
    let columnValues = [];
    switch (searchFlag) {
      case "today":
      case "yesterday":
        columnValues = [...Array(24).keys()];
        break;
      case "last7days":
      case "thisMonth":
      case "lastMonth":
        if (searchFlag === "last7days") {
          var startDate = moment().add(-6, "d");
          var endDate = moment().add(1, "d");
        } else if (searchFlag === "thisMonth") {
          startDate = moment().startOf("month");
          endDate = moment().endOf("month").add(1, "d");
        } else {
          startDate = moment().subtract(1, "month").startOf("month");
          endDate = moment().subtract(1, "month").endOf("month").add(1, "d");
        }
        for (let d = startDate.clone(); d <= endDate; d.add(1, "d")) {
          // .clone() を使って元の startDate を変更しないようにする
          const formatedDate = d.format("YYYY-MM-DD");
          columnValues.push(formatedDate);
        }
        columnValues.pop(); // 最後の要素（endDate+1日目）を削除
        // setColumn(column);
        break;
      default:
        break;
    }

    const statusCounts = {};
    statusList.forEach((value) => {
      statusCounts[value] = toCountDict(array, columnValues, searchFlag, value);
    });
    statusCounts["all"] = toCountDict(array, columnValues, searchFlag, null);

    return { column: columnValues, list: statusCounts };
  }, []); // 依存配列は空

  // ステータスごとの合計値を算出
  const countStatusTotal = useCallback((list, statusList) => {
    const statusTotal = {};
    statusList.forEach((value) => {
      statusTotal[value] = toCountDictSum(list[value]);
    });
    return statusTotal;
  }, []); // 依存配列は空

  const getCallList = useCallback(
    async (flag, currentToken) => {
      setLoading(true);
      setError(null);
      if (!currentToken) {
        setLoading(false);
        setError("トークンがありません");
        return;
      }

      let start = moment().format("YYYY-MM-DD");
      let end = moment().add(1, "d").format("YYYY-MM-DD");
      switch (flag) {
        case "today":
          start = moment().format("YYYY-MM-DD");
          end = moment().add(1, "d").format("YYYY-MM-DD");
          break;
        case "yesterday":
          start = moment().add(-1, "d").format("YYYY-MM-DD");
          end = moment().format("YYYY-MM-DD");
          break;
        case "last7days":
          start = moment().add(-6, "d").format("YYYY-MM-DD");
          end = moment().add(1, "d").format("YYYY-MM-DD");
          break;
        case "thisMonth":
          start = moment().startOf("month").format("YYYY-MM-DD");
          end = moment().endOf("month").add(1, "d").format("YYYY-MM-DD");
          break;
        case "lastMonth":
          end = moment()
            .subtract(1, "month")
            .endOf("month")
            .add(1, "d")
            .format("YYYY-MM-DD");
          start = moment()
            .subtract(1, "month")
            .startOf("month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }

      try {
        const response = await api.get("/edit/histories", {
          params: {
            start: start,
            end: end,
          },
        });

        const descData = response.results;
        descData.sort(
          (a, b) => new Date(b.start_time) - new Date(a.start_time)
        );
        const customStatus = [...new Set(descData.map((v) => v.status))];
        setCustomStatusListState(customStatus);

        const uniqueCustomStatus = customStatus.filter(
          (status) => !defaultStatusList.includes(status)
        );
        const sortedStatusList = [...defaultStatusList, ...uniqueCustomStatus];
        setStatusList(sortedStatusList);

        // `countColumn` にも修正後のソート済みリストを渡す
        const { column: newColumn, list: newList } = countColumn(
          descData,
          flag,
          sortedStatusList
        );
        const newTotal = countStatusTotal(newList, sortedStatusList);
        setData(descData);
        setColumn(newColumn);
        setList(newList);
        setTotal(newTotal);
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました");
        setList({});
        setTotal({});
      } finally {
        setLoading(false);
      }
    },
    [countColumn, countStatusTotal, defaultStatusList]
  ); // 依存配列にコールバック関数を追加

  // トークンを取得する useEffect
  useEffect(() => {
    if (user && user.signInUserSession && user.signInUserSession.idToken) {
      setToken(user.signInUserSession.idToken.jwtToken);
    } else {
      setToken(null);
      console.warn("IDトークンが見つかりませんでした。");
    }
  }, [user]);

  // searchFlag または token が変更された場合にデータ取得を行う useEffect
  useEffect(() => {
    if (token) {
      getCallList(searchFlag, token);
    }
  }, [searchFlag, token, getCallList]);

  if (loading) {
    return <div>Loading...</div>; // ローディング表示
  }

  if (error) {
    return <div>Error: {error}</div>; // エラー表示
  }

  return (
    <CustomContainer>
      <Paper
        elevation={0}
        style={{ margin: "0 auto", width: "95%", background: "none" }}
      >
        <Grid
          container
          justify="space-around"
          style={{ marginBottom: "0.5rem", justifyContent: "end" }}
        >
          <FormControl
            // variant="standard"
            size="small"
            sx={{ m: 1, minWidth: 120 }}
          >
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={searchFlag}
              onChange={handleChangeSearchFlag}
            >
              <MenuItem value="today">今日</MenuItem>
              <MenuItem value={"yesterday"}>昨日</MenuItem>
              <MenuItem value={"last7days"}>直近7日間</MenuItem>
              <MenuItem value={"thisMonth"}>今月</MenuItem>
              <MenuItem value={"lastMonth"}>先月</MenuItem>
              {/* <MenuItem value={30}></MenuItem> */}
            </Select>
          </FormControl>
        </Grid>
      </Paper>
      <GraphDashboard
        labels={
          searchFlag === "last7days" ||
          searchFlag === "thisMonth" ||
          searchFlag === "lastMonth"
            ? column
            : column.map((v) => {
                return v + ":00";
              })
        }
        datalist={list}
        statusList={statusList}
      />
      <Paper
        elevation={0}
        style={{
          margin: "0 auto",
          width: "95%",
          background: "none",
          marginTop: "1rem",
        }}
      >
        <Grid
          container
          justify="space-around"
          style={{ marginBottom: "0.5rem", justifyContent: "space-between" }}
        >
          <Grid item xs={2}>
            <Card
              variant="outlined"
              // sx={{ minWidth: 195 }}
              style={{ margin: "0 5px 0 0" }}
            >
              <CardContent style={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  着信数
                </Typography>
                <Typography variant="h5" component="div" textAlign="center">
                  {data.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={10}>
            <Card
              variant="outlined"
              style={{
                margin: "0 0px 0 5px",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              {Object.keys(total)
                .filter((v) => !defaultStatusList.includes(v))
                .map((key, index) => {
                  return (
                    <div key={index}>
                      <CardContent
                        sx={{ minWidth: 135 }}
                        style={{ textAlign: "center" }}
                      >
                        <Typography
                          sx={{ fontSize: 14 }}
                          color="text.secondary"
                          gutterBottom
                        >
                          {key}
                        </Typography>
                        <Typography variant="h5" component="div">
                          {total[key]}
                        </Typography>
                      </CardContent>
                    </div>
                  );
                })}
            </Card>
            <Card
              variant="outlined"
              sx={{ minWidth: 135 }}
              style={{
                margin: "0 0px 0 5px",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              {defaultStatusList.map((key, index) => {
                return (
                  <div key={index}>
                    <CardContent
                      sx={{ minWidth: 135 }}
                      style={{ textAlign: "center" }}
                    >
                      <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        {key}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {total[key]}
                      </Typography>
                    </CardContent>
                  </div>
                );
              })}
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </CustomContainer>
  );
}
