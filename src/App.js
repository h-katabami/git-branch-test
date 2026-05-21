import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./hooks/use-auth";
import SignIn from "./pages/SignIn";
import SignInPassword from "./pages/SignInPassword";
import PasswordChange from "./pages/PsswordChange";
import Dashboard from "./pages/Dashboard";
import LogContents from "./pages/Logs";
import FileDownload from "./pages/FileDownload";

import { ThemeProvider } from "@mui/material/styles";
import { CustomTheme } from "./components/theme";

const path = process.env.REACT_APP_PATH_TEXT;

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div></div>;
  }
  const TopPage = () => <PrivateRoute children={<Dashboard />} />;

  return (
    <ThemeProvider theme={CustomTheme}>
      <BrowserRouter>
        <Routes>
          <Route index element={<TopPage />} />
          <Route path={`${path}/signin`} element={<SignIn />} />
          <Route
            path={`${path}/passwordrequired/`}
            element={
              auth.isAuthenticated ? (
                <SignInPassword />
              ) : (
                <Navigate to={`${path}/signin`} />
              )
            }
          ></Route>
          <Route
            path={`${path}/password-change`}
            element={<PrivateRoute children={<PasswordChange />} />}
          ></Route>
          <Route
            path={`${path}/dashboard/`}
            element={<PrivateRoute children={<Dashboard />} />}
          ></Route>
          <Route
            path={`${path}/logs`}
            element={<PrivateRoute children={<LogContents />} />}
          ></Route>
          <Route
            path={`${path}/file`}
            element={<PrivateRoute children={<FileDownload />} />}
          ></Route>
          <Route path="*" element={<TopPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
