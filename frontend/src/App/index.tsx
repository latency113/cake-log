import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useNotFound } from "../contexts/NotFoundContext"; // Import useNotFound

function App() {
  const location = useLocation();
  const { isNotFoundActive } = useNotFound(); // Consume NotFoundContext

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isLoginPage = location.pathname === "/login";
  const isWelcomePage = location.pathname === "/";
  const isOfficerOrdersPage = location.pathname.startsWith("/officer-orders");
  const isOfficerOrdersPreparePage = location.pathname.startsWith("/officer-prepare");
  const isExecutivePage = location.pathname.startsWith("/executive-summary");
  
  if (isLoginPage || isWelcomePage || isNotFoundActive || isOfficerOrdersPage || isOfficerOrdersPreparePage || isExecutivePage) { // Use isNotFoundActive here
    return <Outlet />;
  }

  if (isDashboard) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
      <Navbar className="print-hide" /> {/* Add print-hide class */}
      <div className="flex-grow bg-background p-4 font-sans text-foreground">
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
      <Footer className="print-hide" /> {/* Add print-hide class */}
    </div>
  );
}

export default App;