import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

import { useAuth } from "../hooks/use-auth";
const path = process.env.REACT_APP_PATH_TEXT;

const UserSetting = () => {
  const auth = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  let navigate = useNavigate();
  const routeChange = () => {
    navigate(`/${path}/password-change`);
    handleMenuClose();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <IconButton onClick={(event) => handleMenuOpen(event)}>
        <AccountBoxIcon style={{ color: "#00a6ba" }} />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => routeChange()}>パスワード変更</MenuItem>
        <MenuItem onClick={() => auth.signOut()}>ログアウト</MenuItem>
      </Menu>
    </div>
  );
};
export default UserSetting;
