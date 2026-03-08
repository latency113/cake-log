import { useContext } from "react";
import { ThemeProviderContext } from "../components/theme/theme-provider";

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme ต้องใช้ภายใน ThemeProvider");

  return context;
};