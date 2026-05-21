import React from "react";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  // Colors,
} from "chart.js";
import { Chart } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Tooltip,
  Legend
  // Colors
);
const color = [
  "#dde4e4",
  "#dde4e4",
  // "#bff0f3",
  "#80e0e8",
  "#80e0e8",
  "#2bccd8",
  "#2bccd8",
  "#aaefcb",
  "#aaefcb",
  "#2bd87c",
  "#2bd87c",
  // "#6be4a3",
  "#aaefcb",
  "#eafbf2",
];
export default function GraphDashboard(props) {
  const { labels, datalist, statusList } = props;

  const options = {
    plugins: {
      title: {
        display: true,
        text: "着信状況",
      },
      colors: {
        forceOverride: true,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  const data = {
    labels,
    datasets: statusList.map((status, index) => {
      return {
        type: "bar",
        label: status,
        backgroundColor: color[index],
        borderColor: "#d5d8d8",
        borderWidth: 0.5,
        fill: false,
        data: datalist[status],
      };
    }),
  };
  return (
    <Paper
      elevation={0}
      style={{ width: "95%", margin: "0 auto", display: "flex" }}
    >
      <Grid container direction="column">
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            padding: 15,
            textAlign: "center",
          }}
        >
          <Chart type="bar" data={data} options={options} />
        </div>
      </Grid>
    </Paper>
  );
}
