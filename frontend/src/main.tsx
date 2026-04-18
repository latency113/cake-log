import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./styles/index.css";
import { router } from "./router";
import { ThemeProvider } from "./components/theme/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotFoundProvider } from "./contexts/NotFoundContext";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { getSystemActiveYear } from "./utils/api/settings";

const queryClient = new QueryClient();

// New component to wrap RouterProvider and provide auth context
const AuthRouterWrapper = () => {
  const { user, checkAuth } = useAuth();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Sync academic year with server default if not manually overridden in this session
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const { academicYear: serverYear } = await getSystemActiveYear();
          const storedYear = localStorage.getItem("academicYear");
          const isManual = sessionStorage.getItem("academicYearManual") === "true";

          if (serverYear && storedYear !== serverYear && !isManual) {
            localStorage.setItem("academicYear", serverYear);
            // If there was a previous year, we need to reload to apply the change globally
            if (storedYear) {
              window.location.reload();
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to sync academic year:", error);
      }

      await checkAuth();
      setLoadingAuth(false);
    };
    initializeApp();
  }, [checkAuth]);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} context={{ user }} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <NotFoundProvider>
          <QueryClientProvider client={queryClient}>
            <AuthRouterWrapper />
          </QueryClientProvider>
        </NotFoundProvider>
      </AuthProvider>
    </ThemeProvider>
    <Toaster />
  </StrictMode>
);