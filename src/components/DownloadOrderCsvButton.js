import React from "react";
import { convertToCsv } from "./UtilsCsvConvert";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";

const OrderCsvDownloadButton = ({ data, onClickHandler, isLoading }) => {
  const handleDownload = () => {
    // データがすでに親コンポーネントで取得されていることを前提とする
    if (data.results.length === 0) {
      alert("ダウンロードする通話履歴がありません。");
      return;
    }

    const csvData = convertToCsv(data.results);

    // ダウンロード処理
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "AIコンシェルジュ受注データ.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="contained"
      size="small"
      color="secondary"
      startIcon={<DownloadIcon />}
      style={{ margin: "5px 10px" }}
      onClick={handleDownload}
      disabled={isLoading}
    >
      ダウンロード
    </Button>
  );
};

export default OrderCsvDownloadButton;
