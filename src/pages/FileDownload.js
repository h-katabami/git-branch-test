import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import moment from "moment";
import { useState } from "react";
import useProxyApi from "../hooks/useProxyApi";

const CustomContainer = styled(Container)(({ theme }) => ({
  height: "92vh",
  padding: theme.spacing(5),
  paddingTop: theme.spacing(2),
}));

const downloadStatuses = [
  "切断(定期案内)",
  "今回のみ",
  "定期購入",
  "対応完了",
  "対応完了2",
];

export default function FileDownload() {
  const { post, error: apiError } = useProxyApi();
  const today = moment();
  const [searchDate, setSearchDate] = useState({
    start: today.clone().startOf("day").format("YYYY-MM-DDTHH:mm"),
    end: today.clone().endOf("day").format("YYYY-MM-DDTHH:mm"),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChangeDate = (e) => {
    const { name, value } = e.target;
    setSearchDate((prev) => ({
      ...prev,
      [name === "searchDateStart" ? "start" : "end"]: value,
    }));
  };

  const handleDownload = async () => {
    setMessage(null); // メッセージをリセット
    setIsLoading(true);

    try {
      const payload = {
        start: searchDate.start,
        end: searchDate.end,
        statuses: downloadStatuses,
      };

      const downloadApiBaseUrl = process.env.REACT_APP_EVERLIFE_DOWNLOAD_API_BASE_URL;
      const response = await post("/services/EverlifeOrder/customer-data/download", payload, {
        baseUrl: downloadApiBaseUrl,
      });

      const downloadUrl = response?.downloadUrl || response?.url;
      if (!downloadUrl) {
        throw new Error("ダウンロードURLの取得に失敗しました。");
      }

      // 署名URLには認証ヘッダーを付けずに直接取得する
      const fileRes = await axios.get(downloadUrl, {
        responseType: "blob",
        headers: {},
      });

      const url = URL.createObjectURL(new Blob([fileRes.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        "AIコンシェルジュ受注データ_" +
          moment(searchDate.start).format("YYYYMMDDHHmm") +
          "_" +
          moment(searchDate.end).format("YYYYMMDDHHmm") +
          ".csv"
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage("ダウンロードが完了しました。");
    } catch (err) {
      setMessage("データの取得またはダウンロードに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomContainer>
      <Grid
        container
        justifyContent="space-around"
        style={{ marginBottom: "0.5rem" }}
      >
        <TextField
          label="検索開始日時"
          type="datetime-local"
          name="searchDateStart"
          InputLabelProps={{ shrink: true }}
          variant="standard"
          value={searchDate.start}
          onChange={handleChangeDate}
        />
        〜
        <TextField
          label="検索終了日時"
          type="datetime-local"
          name="searchDateEnd"
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: searchDate.start,
            max: moment()
              .hour(23)
              .minute(59)
              .seconds(59)
              .format("YYYY/MM/DDTHH:mm"),
          }}
          variant="standard"
          value={searchDate.end}
          onChange={handleChangeDate}
        />
        <Button
          variant="contained"
          size="small"
          color="secondary"
          startIcon={<DownloadIcon />}
          style={{ margin: "5px 10px" }}
          onClick={handleDownload} // ボタンクリックで直接ダウンロード処理を呼び出す
          disabled={isLoading}
        >
          ダウンロード
        </Button>
      </Grid>

      {isLoading ? (
        <LinearProgress />
      ) : apiError ? (
        <Typography color="error">データの取得またはダウンロードに失敗しました。</Typography>
      ) : (
        <Typography>
          {message || "日時を選択し、ダウンロードボタンを押してください"}
        </Typography>
      )}
    </CustomContainer>
  );
}
