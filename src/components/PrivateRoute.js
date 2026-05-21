import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

import MiniHeader from "./Header";
const path = process.env.REACT_APP_PATH_TEXT;

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <MiniHeader children={children} />
  ) : (
    <Navigate to={`${path}/signin`} />
  );
};

export default PrivateRoute;
