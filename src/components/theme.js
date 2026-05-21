import { createTheme } from "@mui/material/styles";

export const CustomTheme = createTheme({
  palette: {
    primary: {
      light: "#55d6df",
      main: "#2bccd8",
      dark: "#1e8e97",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#fbc963",
      main: "#fabc3c",
      dark: "#af832a",
      contrastText: "#ffffff",
    },
  },
});
