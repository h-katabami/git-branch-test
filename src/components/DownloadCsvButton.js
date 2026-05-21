import React, { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment";
import useApi from "../hooks/useApi";

// データをCSV形式に変換する関数を修正
const convertToCsv = (data, headers, columns) => {
  if (!data || data.length === 0) {
    return "";
  }

  const csvHeaders = headers.join(",");

  const csvRows = data.map((row) => {
    return columns
      .map((columnKey) => {
        let value = row[columnKey];

        // start_timeのフォーマット
        if (columnKey === "start_time") {
          value = moment(value).format("YYYY/MM/DD HH:mm:ss");
        }

        // 電話番号の加工
        if (columnKey === "call_to" || columnKey === "call_from") {
          // +81で始まる場合、0に置き換える
          if (typeof value === "string" && value.startsWith("+81")) {
            value = "0" + value.substring(3);
          }
        }

        // 値を文字列に変換し、ダブルクォートで囲む
        return `"${value}"`;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};

const DownloadCsvButton = ({
  apiPath,
  params,
  headers,
  columns,
  startDate,
  endDate,
  fileNamePrefix,
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleDownload = async () => {
    setLoading(true);

    try {
      const response = await api.get(apiPath, { params: params });
      let results = response.results;
      results.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

      // headersとcolumnsを渡してCSVを生成
      const csvString = convertToCsv(results, headers, columns);

      const formattedStartDate = moment(startDate).format("YYYYMMDD");
      const formattedEndDate = moment(endDate).format("YYYYMMDD");
      const fileName = `${fileNamePrefix}_${formattedStartDate}_${formattedEndDate}.csv`;

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("データのダウンロードに失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button variant="contained" color="primary" disabled>
        <CircularProgress size={24} />
      </Button>
    );
  }

  return React.cloneElement(children, { onClick: handleDownload });
};

export default DownloadCsvButton;
