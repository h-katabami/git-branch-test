import React, { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import { FixedSizeList } from "react-window";

import DownloadCsvButton from "./DownloadCsvButton";

// import { useAuth } from "../hooks/use-auth";
import useApi from "../hooks/useApi"; // カスタムフック

// スタイル定義
const LogsListContainer = styled(Container)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(5),
  paddingTop: theme.spacing(2),
}));

const SearchGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

const DateInputGrid = styled(Grid)(({ theme }) => ({
  paddingRight: theme.spacing(0.5),
}));
const CallFromInputGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  paddingRight: theme.spacing(0.5),
}));

const StatusSelectGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  paddingRight: theme.spacing(0.5),
}));

const SearchActionsGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  paddingRight: theme.spacing(0.5),
}));

const LogsCountTypography = styled(Typography)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
}));

const LogsListPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
}));

const getChipColor = (label) => {
  switch (label) {
    case "冒頭切断":
    case "冒頭切断2":
      return "#dde4e4";
    case "切断(名前)":
    case "切断(住所)":
    case "切断(通常案内)":
    case "切断(定期案内)":
      return "#bff0f3";
    case "今回のみ":
    case "定期購入":
      return "#2bd87c";
    case "対応完了":
    case "対応完了2":
      return "#6be4a3";
    // case "OP転送":
    // case "エラー時OP転送":
    //   return "#d8d32b";
    default:
      return "#95e6ec";
  }
};

export default function LogsList({
  onRowClick,
  open,
  onEditMode,
  onClose,
  onReload,
  isReloading,
}) {
  // const auth = useAuth();
  // const { user } = auth;
  const [data, setData] = useState([]);
  const [searchDate, setSearchDate] = useState({
    start: moment().format("YYYY-MM-DD"),
    end: moment().format("YYYY-MM-DD"),
  });
  const [searchCallFrom, setSearchCallFrom] = useState("");
  const [searchStatus, setSearchStatus] = useState("全て");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  const csvApiParams = {
    start: moment(searchDate.start).format("YYYY-MM-DD"),
    end: moment(searchDate.end).add(1, "d").format("YYYY-MM-DD"),
    pagination:
      moment(searchDate.end).diff(moment(searchDate.start), "days") + 1,
    ...(searchStatus !== "全て" && { status: searchStatus }),
    ...(searchCallFrom !== "" && { call_from: searchCallFrom }),
  };
  const csvHeaders = [
    "受付番号",
    "着信日時",
    "通話分数",
    "ステータス",
    "着信電話番号",
    "発信者電話番号",
  ];
  const csvColumns = [
    "call_sid",
    "start_time",
    "minutes",
    "status",
    "call_to",
    "call_from",
  ];

  // 電話番号を +81 の国際表記に変換する関数
  const convertToInternationalNumber = (phoneNumber) => {
    if (!phoneNumber) return ""; // 空の場合は空文字を返す
    // 国内の電話番号のパターン (0から始まる10桁または11桁の数字)
    const japanNumberPattern = /^0\d{9,10}$/;
    if (japanNumberPattern.test(phoneNumber)) {
      // 国内番号の場合は +81 を付与
      return "+81" + phoneNumber.substring(1); // 先頭の 0 を削除して +81 を付与
    } else {
      setSearchCallFrom("");
      // それ以外の場合はそのまま返す
      return "";
    }
  };

  const fetchCallList = useCallback(
    async (startDate, endDate, status, callFrom) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/edit/histories", {
          params: {
            start: moment(startDate).format("YYYY-MM-DD"),
            end: moment(endDate).add(1, "d").format("YYYY-MM-DD"),
            pagination: moment(endDate).diff(moment(startDate), "days") + 1,
            ...(status !== "全て" && { status: status }), // status が "全て" ではない場合のみ status プロパティを追加
            ...(convertToInternationalNumber(callFrom) !== "" && {
              call_from: convertToInternationalNumber(callFrom),
            }), // call_from が "" ではない場合のみ call_from プロパティを追加
          },
        });

        let results = response.results;
        results.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        setData(results);
        onClose();
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [api, onClose]
  );
  const fetchLogsWithPagination = useCallback(
    async (startDate, endDate, status, callFrom) => {
      setLoading(true);
      setError(null);
      let allResults = [];
      let lastEvaluatedKey = null;
      let hasMore = true;

      try {
        while (hasMore) {
          const params = {
            start: lastEvaluatedKey || moment(startDate).format("YYYY-MM-DD"), // 初回は startDate, 2回目以降は lastEvaluatedKey
            end: moment(endDate).add(1, "d").format("YYYY-MM-DD"), // end は変更しない
            pagination: moment(endDate).diff(moment(startDate), "days") + 1,
            ...(status !== "全て" && { status: status }), // status が "全て" ではない場合のみ status プロパティを追加
            ...(convertToInternationalNumber(callFrom) !== "" && {
              call_from: convertToInternationalNumber(callFrom),
            }), // call_from が "" ではない場合のみ call_from プロパティを追加
          };

          const response = await api.get("/edit/histories", { params });

          const { results, last_evaluated_key, has_more } = response.data;
          allResults = allResults.concat(results);
          lastEvaluatedKey = last_evaluated_key;
          hasMore = has_more;
        }

        allResults.sort(
          (a, b) => new Date(b.start_time) - new Date(a.start_time)
        );
        setData(allResults);
        onClose();
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [api, onClose]
  );
  useEffect(() => {
    fetchCallList(
      searchDate.start,
      searchDate.end,
      searchStatus,
      searchCallFrom
    );
  }, []);
  // useEffect(() => {
  //   if (user) {
  //     fetchCallList(searchDate.start, searchDate.end, searchStatus);
  //   }
  // }, [searchDate.start, searchDate.end, searchStatus, fetchCallList, user]);

  useEffect(() => {
    if (isReloading) {
      fetchCallList(
        searchDate.start,
        searchDate.end,
        searchStatus,
        searchCallFrom
      );
      onReload();
    }
  }, [
    isReloading,
    fetchCallList,
    searchDate.start,
    searchDate.end,
    searchStatus,
    searchCallFrom,
    onReload,
  ]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSearchDate((prev) => ({ ...prev, [name]: value }));
  };
  const handleCallFromChange = (e) => {
    const value = e.target.value;
    // 電話番号の正規表現パターン (例: ハイフンあり/なし、市外局番あり/なし)
    const phonePattern = /^([0-9-]*)$/;
    // 数字とハイフン以外の文字を削除
    const cleanedValue = value.replace(/[^\d]/g, "");
    if (phonePattern.test(cleanedValue) || cleanedValue === "") {
      if (cleanedValue.length <= 13) {
        setSearchCallFrom(cleanedValue);
      }
    }
  };
  const handleStatusChange = (e) => {
    setSearchStatus(e.target.value);
  };
  const handleClickSearch = () => {
    fetchCallList(
      searchDate.start,
      searchDate.end,
      searchStatus,
      searchCallFrom
    );
  };
  const handleClickRow = useCallback(
    (callSid) => {
      onRowClick(callSid);
      onEditMode(false);
    },
    [onRowClick, onEditMode]
  );

  const onClickReset = () => {
    const today = moment().format("YYYY-MM-DD");
    setSearchDate({ start: today, end: today });
    setSearchStatus("全て");
    fetchCallList(today, today, "全て", "");
  };

  const renderRow = useCallback(
    ({ index, style }) => {
      const item = data[index];
      const callSid = item.call_sid;
      const callStart = new Date(item.start_time).toLocaleString().slice(0, -3);
      const callMemo = item.memo;
      const callStatus = item.status;

      return (
        <List style={style} key={callSid}>
          <ListItem button onClick={() => handleClickRow(callSid)}>
            <ListItemText
              primary={callStart}
              secondary={`メモ : ${callMemo?.substring(0, 18) || ""}`}
            />
            <Chip
              label={callStatus}
              style={{ backgroundColor: getChipColor(callStatus) }}
            />
          </ListItem>
        </List>
      );
    },
    [data, handleClickRow]
  );

  if (loading) {
    return (
      <LogsListContainer>
        <Typography>Loading...</Typography>
      </LogsListContainer>
    );
  }

  if (error) {
    return (
      <LogsListContainer>
        <Typography color="error">{error}</Typography>
      </LogsListContainer>
    );
  }

  return (
    <LogsListContainer>
      <SearchGrid container justify="space-around">
        <DateInputGrid
          container
          justifyContent="space-between"
          alignItems="center"
        >
          <TextField
            label="検索開始日"
            type="date"
            name="start"
            InputLabelProps={{ shrink: true }}
            variant="standard"
            value={searchDate.start}
            onChange={handleDateChange}
            inputProps={{
              max: moment().format("YYYY-MM-DD"), // 終了日の制限はそのまま
              min: moment().subtract(90, "days").format("YYYY-MM-DD"), // 開始日を90日前までに制限
            }}
          />
          〜
          <TextField
            label="検索終了日"
            type="date"
            name="end"
            InputLabelProps={{ shrink: true }}
            variant="standard"
            value={searchDate.end}
            onChange={handleDateChange}
            inputProps={{
              min: searchDate.start,
              max: moment().format("YYYY/MM/DD"),
            }}
          />
        </DateInputGrid>
        <CallFromInputGrid>
          <TextField
            label="発信者番号"
            type="text"
            name="call_from"
            InputLabelProps={{ shrink: true }}
            variant="standard"
            value={searchCallFrom}
            onChange={handleCallFromChange}
          />
        </CallFromInputGrid>

        <StatusSelectGrid container justifyContent="space-between">
          <FormControl>
            <InputLabel variant="standard" htmlFor="uncontrolled-native">
              ステータス
            </InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              label="ステータス"
              value={searchStatus}
              onChange={handleStatusChange}
              style={{ minWidth: "80px" }}
              variant="standard"
            >
              <MenuItem value={"全て"}>全て</MenuItem>
              <MenuItem value={"冒頭切断"}>冒頭切断</MenuItem>
              <MenuItem value={"冒頭切断2"}>冒頭切断2</MenuItem>
              <MenuItem value={"切断(名前)"}>切断(名前)</MenuItem>
              <MenuItem value={"切断(住所)"}>切断(住所)</MenuItem>
              <MenuItem value={"切断(通常案内)"}>切断(通常案内)</MenuItem>
              <MenuItem value={"切断(定期案内)"}>切断(定期案内)</MenuItem>
              <MenuItem value={"今回のみ"}>今回のみ</MenuItem>
              <MenuItem value={"定期購入"}>定期購入</MenuItem>
              <MenuItem value={"対応完了"}>対応完了</MenuItem>
              <MenuItem value={"対応完了2"}>対応完了2</MenuItem>
            </Select>
          </FormControl>
          <SearchActionsGrid
            item
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={handleClickSearch}
              style={{ margin: 4 }}
            >
              検索
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={onClickReset}
              style={{ margin: 4 }}
            >
              クリア
            </Button>
          </SearchActionsGrid>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <DownloadCsvButton
              apiPath="/edit/histories"
              params={csvApiParams}
              headers={csvHeaders}
              columns={csvColumns}
              startDate={searchDate.start}
              endDate={searchDate.end}
              fileNamePrefix="応対ログ"
            >
              <Button
                variant="contained"
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<DownloadIcon />}
                style={{ marginRight: 4 }}
              >
                ダウンロード
              </Button>
            </DownloadCsvButton>
          </div>
        </StatusSelectGrid>
      </SearchGrid>

      <LogsCountTypography>{data.length} 件</LogsCountTypography>
      <LogsListPaper elevation={0} variant="outlined" square>
        <div style={{ width: "100%" }}>
          <FixedSizeList height={531} itemSize={70} itemCount={data.length}>
            {renderRow}
          </FixedSizeList>
        </div>
      </LogsListPaper>
    </LogsListContainer>
  );
}
