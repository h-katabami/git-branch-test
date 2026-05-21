import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
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

export default function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorFlag, setErrorFlag] = useState(false);

  const executeSignIn = async (event) => {
    event.preventDefault();
    if (username === "" || password === "") {
      alert("入力されていない項目があります");
      return;
    }
    const result = await auth.signIn(username, password);
    console.log(result);
    if (result.success) {
      if (!result.passwordRequired) {
        navigate(`/${path}`, { replace: true });
      } else {
        navigate(`/${path}/passwordrequired`, { replace: true });
      }
    } else {
      // alert(result.message);
      setErrorFlag(true);
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
                  メールアドレス、または、パスワードが間違っているようです。もう一度入力してください。
                </span>
              </div>
            ) : (
              <></>
            )}
            <form noValidate onSubmit={executeSignIn}>
              {/* <Typography variant="h5">ログイン</Typography> */}
              <div style={{ margin: "0.75rem 0" }}>
                <label htmlFor="username" style={{ display: "block" }}>
                  <Typography variant="subtitle1">メールアドレス</Typography>
                </label>
                <TextField
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
                {/* <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            /> */}
              </div>
              <div style={{ margin: "0.75rem 0" }}>
                <label htmlFor="password" style={{ display: "block" }}>
                  <Typography variant="subtitle1"> パスワード</Typography>
                </label>
                <TextField
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
                {/* <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            /> */}
              </div>
              <div style={{ margin: "0.75rem 0", marginTop: "1.5rem" }}>
                <Button type="submit" variant="contained" fullWidth>
                  ログイン
                </Button>
              </div>
            </form>
            {/* <div
              style={{ width: "340px", margin: "0 auto", textAlign: "center" }}
            >
              <Button variant="text">パスワードをお忘れですか？</Button>
            </div> */}
          </Paper>
        </Box>
      </div>
    </CustomContainer>
  );
}
