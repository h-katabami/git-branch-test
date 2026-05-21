import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import moment from "moment";

function countMonthDay(rows, searchFlag) {
  var month =
    searchFlag === "lastMonth"
      ? moment().month()
      : moment().subtract(-1, "month").month();

  var countMonthDay = [];
  for (var i = 1; i < 32; i++) {
    var day = [];
    for (var j = 0; j < 24; j++) {
      var hour = rows.reduce(
        (result, e) =>
          new Date(e["start_time"]).getDate() === i &&
          new Date(e["start_time"]).getHours() === j
            ? ++result
            : result,
        0
      );
      day.push(hour);
    }
    var sum = day.reduce((result, e) => result + e, 0);
    day.push(sum);

    var checkDay = getdoubleDigestNumer(month) + "-" + getdoubleDigestNumer(i);
    day.unshift(checkDay);
    countMonthDay.push(day);
  }
  return countMonthDay;
}

function getdoubleDigestNumer(number) {
  return ("0" + number).slice(-2);
}

export default function TableDashboard(props) {
  const { rows, searchFlag } = props;
  const countRows = countMonthDay(rows, searchFlag);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        日付×時間
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead style={{ backgroundColor: "#e6f6f8" }}>
            <TableRow>
              <TableCell align="right"></TableCell>
              {[...Array(24)].map((_, i) => (
                <TableCell key={i} align="right">
                  {i}
                </TableCell>
              ))}
              <TableCell align="center">計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {countRows.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                style={{
                  marginLeft: "10px",
                  padding: "5px",
                  whiteSpace: "pre",
                }}
              >
                {row.map((v, i) => (
                  <TableCell
                    key={i}
                    component="th"
                    scope="row"
                    align="right"
                    style={{ padding: "5px" }}
                  >
                    {v}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
