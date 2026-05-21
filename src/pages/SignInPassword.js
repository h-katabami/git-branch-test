import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

import { styled } from "@mui/material/styles";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logo from "../logo.svg";
const path = process.env.REACT_APP_PATH_TEXT;

const CustomContainer = styled(Container)(({ theme }) => ({
  height: "100vh",
  padding: theme.spacing(5),
  paddingTop: theme.spacing(2),
  backgroundColor: "#f8fbfb",
}));

export default function SignInPassword() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [errorFlag, setErrorFlag] = useState(false);

  const executeSignIn = async (event) => {
    event.preventDefault();
    if (password === "") {
      alert("入力されていない項目があります");
      return;
    }
    const result = await auth.passwordRequired(auth.user, password);
    console.log(result);
    if (result.success) {
      if (!result.passwordRequired) {
        navigate(`/${path}`, { replace: true });
      } else {
        navigate(`/${path}/passwordrequired`, { replace: true });
      }
    } else {
      setErrorFlag(true);
      // alert(result.message);
    }
  };
  return (
    <CustomContainer>
      <div style={{ margin: "0 auto", marginTop: "3rem" }}>
        <div
          style={{ width: "210px", margin: "0 auto", marginBottom: "0.5rem" }}
        >
          <img src={logo} alt="My logo" style={{ width: "100%" }} />
        </div>
        <Box>
          <Paper
            style={{
              width: "340px",
              margin: "0 auto",
              padding: "2rem 1.75rem",
            }}
          >
            <form noValidate onSubmit={executeSignIn}>
              <div style={{ marginBottom: "1.5rem" }}>
                <Typography>パスワードを変更してください。</Typography>
                <Typography>
                  新しく設定するパスワードをご入力ください。
                </Typography>
                {errorFlag ? (
                  <div
                    className="field"
                    style={{
                      marginBottom: "0.2rem",
                      backgroundColor: "#f8e8e6",
                      textAlign: "left",
                      lineHeight: "1.2rem",
                      padding: "0.5rem",
                    }}
                  >
                    <span
                      className="errpr-label"
                      style={{
                        color: "#ba1400",
                        fontSize: "12px",
                        margin: "0.5rem",
                        textIndent: "1.5rem",
                      }}
                    >
                      パスワードを正しく入力ください。8文字以上
                    </span>
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  パスワード
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
              <Grid
                container
                style={{ marginTop: "1.75rem", justifyContent: "center" }}
              >
                <Button type="submit" variant="contained">
                  パスワード変更
                </Button>
              </Grid>
            </form>
          </Paper>
        </Box>
      </div>
    </CustomContainer>
  );
}
