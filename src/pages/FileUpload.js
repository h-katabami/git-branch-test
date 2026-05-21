import React, { useState } from "react";
import axios from "axios";

import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";

import { useAuth } from "../hooks/use-auth";

const CustomContainer = styled(Container)(({ theme }) => ({
  height: "90vh",
  padding: theme.spacing(5),
  paddingTop: theme.spacing(2),
}));

export default function FileUpload() {
  const auth = useAuth();
  const token = auth.idToken;
  const [file, setFile] = useState(null);
  const [filename, setFileName] = useState("CSVファイルをご選択ください");
  const [isLoading, setIsLoading] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
  const [open, setOpen] = React.useState(false);

  const handleChangeImportFile = (e) => {
    if (e.target.files) {
      setFileName(e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const url =
        "https://g0sm4s8hn0.execute-api.us-east-1.amazonaws.com/Prod/services/KurumeCity/status";
      const headers = {
        Authorization: `Bearer ${token}`,
        "content-type": "multipart/form-data",
      };
      let formData = new FormData();
      formData.append("file", file);
      axios
        .post(url, formData, { headers: headers })
        .then((res) => {
          console.log(res);
          setErrorFlag(false);
          setOpen(true);
          setFile(null);
          setFileName("CSVファイルをご選択ください");
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setErrorFlag(true);
          setOpen(true);
          setFile(null);
          setFileName("CSVファイルをご選択ください");
          setIsLoading(false);
        });
    } catch (err) {
      console.log(err);
      setErrorFlag(true);
      setOpen(true);
      setFile(null);
      setFileName("CSVファイルをご選択ください");
      setIsLoading(false);
    }
  };
  return (
    <>
      <CustomContainer>
        <Grid
          container
          spacing={2}
          alignItems="center"
          // style={{ marginTop: "1rem" }}
        >
          <Grid
            item
            xs={8}
            style={{ display: "flex", alignItems: "center" }}
            justifyContent="space-around"
          >
            <TextField
              id="standard-basic"
              variant="standard"
              fullWidth
              value={filename}
              InputProps={{
                readOnly: true,
              }}
              style={{ paddingLeft: "12px", paddingRight: "12px" }}
            />
            <Button
              variant="contained"
              style={{ width: 204, backgroundColor: "#818284" }}
              disabled={isLoading}
            >
              ファイルを選択
              <input
                type="file"
                accept=".csv"
                onChange={handleChangeImportFile}
                style={{
                  opacity: 0,
                  appearance: "none",
                  position: "absolute",
                  cursor: "pointer",
                }}
              />
            </Button>
          </Grid>
          <Grid item xs={4} style={{ display: "flex", textAlign: "center" }}>
            <Button
              variant="contained"
              disabled={isLoading || file === null}
              onClick={handleSubmit}
            >
              アップロード
            </Button>
            {isLoading && (
              <CircularProgress size={28} style={{ margin: "auto" }} />
            )}
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Snackbar
            open={open}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            onClose={() => setOpen(false)}
          >
            <Alert
              severity={errorFlag ? "error" : "success"}
              onClose={() => setOpen(false)}
            >
              {errorFlag
                ? "ファイルに誤りがあります。再度アップロードしてください。"
                : "アップロードが完了しました！"}
            </Alert>
          </Snackbar>
        </Grid>
      </CustomContainer>
    </>
  );
}
