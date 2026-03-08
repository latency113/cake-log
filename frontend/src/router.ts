import SettingsPage from "./pages/AdminDashboard/SettingsPage";
import CreditsPage from "./pages/CreditsPage"; // New import
import {
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import App from "./App";
import Dashboard from "./pages/AdminDashboard/Dashboard";
import Home from "./pages/Home";
import Orders from "./pages/AdminDashboard/Orders";
import OfficerOrdersPage from "./pages/OfficerDashboard/OfficerOrdersPage";
import OfficerPreparePage from "./pages/OfficerDashboard/OfficerPreparePage";
import OfficerAllOrdersPage from "./pages/OfficerDashboard/OfficerAllOrdersPage";
import Users from "./pages/AdminDashboard/Users";
import Login from "./pages/Login";
import LeaderboardPage from "./pages/AdminDashboard/LeaderboardPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import OfficerLayout from "./components/layout/OfficerLayout";
import OrderSearchPage from "./pages/OrderSearchPage";
import { decodeJwtToken } from "./utils/auth";
import WelcomePage from "./pages/WelcomePage";
import { showAlertError } from "./utils/alerts";
import Teachers from "./pages/AdminDashboard/Teachers";
import Products from "./pages/AdminDashboard/Products";
import Departments from "./pages/AdminDashboard/Departments";
import Teams from "./pages/AdminDashboard/Teams";
import Classrooms from "./pages/AdminDashboard/Classrooms";
import ClassroomStudentsPage from "./pages/AdminDashboard/ClassroomStudentsPage";
import AddTeamPage from "./pages/AddTeamPage";
import OrderPickupConfirmationPage from "./pages/OrderPickupConfirmationPage";
import SalesRecordsPage from "./pages/AdminDashboard/SalesRecordsPage";
import ExecutivePage from "./pages/ExecutiveDashboard/ExecutivePage";
import ExecutiveLayout from "./components/layout/ExecutiveLayout";
import NotFound from "./pages/NotFound";
import ClassroomsReport from "./pages/AdminDashboard/ClassroomsReport";
import ClassroomCakeSummaryPage from "./pages/ClassroomCakeSummaryPage"; // New import
import OrderBooks from "./pages/AdminDashboard/OrderBooks"; // Import OrderBooks
import SelectBookPage from "./pages/AdminDashboard/SelectBookPage"; // Import SelectBookPage

const rootRoute = createRootRoute({
  component: App,
});

// Remove notFoundRoute and catchAllRoute definitions

const addTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-team",
  component: AddTeamPage,
});

const orderPickupConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirm-pickup",
  component: OrderPickupConfirmationPage,
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: WelcomePage,
});

const classroomCakeSummaryRoute = createRoute({ // New route definition
  getParentRoute: () => rootRoute,
  path: "/classroom-cake-summary",
  component: ClassroomCakeSummaryPage,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw navigate({ to: "/login" });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "user") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  }
});

const creditsRoute = createRoute({ // New route definition for Credits
  getParentRoute: () => rootRoute,
  path: "/credits",
  component: CreditsPage,
});


const selectBookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/select-book",
  component: SelectBookPage,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw navigate({ to: "/login" });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "user") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  }
});

const userHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: Home,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      bookId: (search.bookId as string) || undefined,
    } as { bookId?: string };
  },
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "user") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }

    // Logic to check if user has a book would be better done in Home component or by fetching user data.
    // TanStack router beforeLoad can't easily access React state (useAuth).
    // We'll handle the redirect inside the Home component for simplicity.
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = decodeJwtToken(token);
      const userRole = decodedToken?.role?.toLowerCase();
      if (userRole === "superadmin") {
        throw navigate({ to: "/dashboard" });
      } else if (userRole === "admin") {
        throw navigate({ to: "/executive-summary" });
      } else if (userRole === "officer1") {
        throw navigate({ to: "/officer-orders" });
      } else if (userRole === "user") {
        throw navigate({ to: "/home", search: {} as any });
      }
    }
  },
});

const orderSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-search",
  component: OrderSearchPage,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "user") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboard",
  component: DashboardLayout,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "superadmin") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  },
});

const executiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/executive-summary",
  component: ExecutiveLayout,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "admin") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  },
});

const officerOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officer-orders",
  component: OfficerLayout,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "officer1" && userRole !== "officer2") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  },
});

const officerPrepareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officer-prepare",
  component: OfficerPreparePage,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "officer1" && userRole !== "officer2") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  },
});

const officerAllOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officer-orders-all",
  component: OfficerAllOrdersPage,
  beforeLoad: async ({ navigate }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    if (userRole !== "officer1" && userRole !== "officer2") {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw navigate({ to: "/login", search: { unauthorized: true } });
    }
  },
});

// Child routes (must be defined after their parents)
const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: Dashboard,
});

const ordersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "orders",
  component: Orders,
});

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "users",
  component: Users,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "leaderboard",
  component: LeaderboardPage,
});

const teacherRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "teachers",
  component: Teachers,
});

const productRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "products",
  component: Products,
});

const departmentRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "departments",
  component: Departments,
});

const teamRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "teams",
  component: Teams,
});

const classroomRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "classrooms",
  component: Classrooms,
});

const classroomReportRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "classrooms-report",
  component: ClassroomsReport,
});

const orderBookRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "order-books",
  component: OrderBooks,
});

const classroomStudentsRoute = createRoute({
  getParentRoute: () => classroomRoute,
  path: "$classroomId/students",
  component: ClassroomStudentsPage,
});

const salesRecordsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "sales-records",
  component: SalesRecordsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "settings",
  component: SettingsPage,
});

const officerOrdersIndexRoute = createRoute({
  getParentRoute: () => officerOrdersRoute,
  path: "/",
  component: OfficerOrdersPage,
});



const executiveIndexRoute = createRoute({
  getParentRoute: () => executiveRoute,
  path: "/",
  component: ExecutivePage,
});

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  classroomCakeSummaryRoute, // New route added
  creditsRoute, // New route added
  addTeamRoute,
  orderPickupConfirmationRoute,
  userHomeRoute,
  loginRoute,
  orderSearchRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    ordersRoute,
    usersRoute,
    leaderboardRoute,
    teacherRoute,
    productRoute,
    departmentRoute,
    teamRoute,
    classroomRoute.addChildren([classroomStudentsRoute]),
    salesRecordsRoute,
    settingsRoute,
    classroomReportRoute,
    orderBookRoute,
  ]),
  officerOrdersRoute.addChildren([officerOrdersIndexRoute]),
  officerPrepareRoute,
  officerAllOrdersRoute, // New route
  executiveRoute.addChildren([executiveIndexRoute]),
  selectBookRoute, // Added here
]);

// Create the router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound, // Use the recommended approach for 404
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router, rootRoute };