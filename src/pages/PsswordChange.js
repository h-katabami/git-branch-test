import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { useAuth } from "../hooks/use-auth";

import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const CustomContainer = styled(Container)(({ theme }) => ({
  height: "100vh",
  padding: theme.spacing(5),
  paddingTop: theme.spacing(2),
  backgroundColor: "#f8fbfb",
}));

// type ChangeColumn = {
//   oldpassword: string,
//   password: string,
//   repassword: string,
// };

export default function PasswordChange() {
  const [open, setOpen] = React.useState(false);
  const [errorFlag, setErrorFlag] = useState(false);

  const auth = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    reset,
  } = useForm();
  const onSubmit = async (data) => {
    console.log(data);
    const result = await auth.passwordChange(
      auth.user,
      data.oldPass,
      data.password
    );
    console.log(result);
    if (result.success) {
      setErrorFlag(false);
      setOpen(true);
      console.log(result);
      reset();
    } else {
      setErrorFlag(true);
      setOpen(true);
      console.log(result);
    }
  };

  return (
    <CustomContainer>
      <form onSubmit={handleSubmit(onSubmit)} style={{ margin: "50px" }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            現在のパスワード
          </Grid>
          <Grid item xs={8}>
            <Controller
              control={control}
              name="oldPass"
              rules={{
                required: "必須項目です",
                minLength: {
                  value: 6,
                  message: "6文字以上で指定ください。",
                },
              }}
              defaultValue=""
              render={({
                field: { ref, ...field },
                fieldState: { invalid, error },
              }) => (
                <TextField
                  {...field}
                  inputRef={ref}
                  error={invalid}
                  helperText={error && error.message}
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            新しいパスワード
          </Grid>
          <Grid item xs={8}>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "必須項目です",
                minLength: {
                  value: 6,
                  message: "6文字以上で指定ください。",
                },
              }}
              defaultValue=""
              render={({
                field: { ref, ...field },
                fieldState: { invalid, error },
              }) => (
                <TextField
                  {...field}
                  inputRef={ref}
                  error={invalid}
                  helperText={error && error.message}
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            新しいパスワード（確認）
          </Grid>
          <Grid item xs={8}>
            <Controller
              control={control}
              name="repassword"
              rules={{
                validate: (value) =>
                  value === getValues("password") || "パスワードが一致しません",
                required: "必須項目です",
                minLength: {
                  value: 8,
                  message: "8文字以上で指定ください。",
                },
              }}
              defaultValue=""
              render={({
                field: { ref, ...field },
                fieldState: { invalid, error },
              }) => (
                <TextField
                  {...field}
                  inputRef={ref}
                  error={invalid}
                  helperText={error && error.message}
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid
          container
          style={{ marginTop: "1.75rem", justifyContent: "center" }}
        >
          <Button type="submit" variant="contained">
            パスワードを変更する
          </Button>
        </Grid>
      </form>
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
              ? "パスワードが正しくありません。"
              : "パスワードを変更しました！"}
          </Alert>
        </Snackbar>
      </Grid>
    </CustomContainer>
  );
}
