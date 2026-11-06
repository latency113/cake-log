import {
  createRouter,
  createRootRoute,
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";
import App from "./App";
import { decodeJwtToken } from "./utils/auth";
import { showAlertError } from "./utils/alerts";

// Root Route
const rootRoute = createRootRoute({
  component: App,
});

/**
 * Reusable role-based route guard helper.
 * Enforces authentication and role verification across protected routes using standard TanStack Router redirect.
 */
const requireRoles = (allowedRoles: string[]) => {
  return () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw redirect({ to: "/login", search: { unauthorized: true } });
    }
    const decodedToken = decodeJwtToken(token);
    const userRole = decodedToken?.role?.toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!userRole || !normalizedAllowed.includes(userRole)) {
      showAlertError({
        title: "ไม่ได้รับอนุญาต",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      });
      throw redirect({ to: "/login", search: { unauthorized: true } });
    }
  };
};

// -------------------------------------------------------------
// Public & Common Routes
// -------------------------------------------------------------
const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./pages/WelcomePage")),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: lazyRouteComponent(() => import("./pages/Login")),
  beforeLoad: () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = decodeJwtToken(token);
      const userRole = decodedToken?.role?.toLowerCase();
      switch (userRole) {
        case "superadmin":
          throw redirect({ to: "/dashboard" });
        case "admin":
          throw redirect({ to: "/executive-summary" });
        case "officer1":
        case "officer2":
          throw redirect({ to: "/officer-orders" });
        case "user":
          throw redirect({ to: "/select-book" });
      }
    }
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: lazyRouteComponent(() => import("./pages/Register")),
  beforeLoad: () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = decodeJwtToken(token);
      const userRole = decodedToken?.role?.toLowerCase();
      switch (userRole) {
        case "superadmin":
          throw redirect({ to: "/dashboard" });
        case "admin":
          throw redirect({ to: "/executive-summary" });
        case "officer1":
        case "officer2":
          throw redirect({ to: "/officer-orders" });
        case "user":
          throw redirect({ to: "/select-book" });
      }
    }
  },
});


const creditsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/credits",
  component: lazyRouteComponent(() => import("./pages/CreditsPage")),
});

// -------------------------------------------------------------
// User Protected Routes
// -------------------------------------------------------------
const selectBookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/select-book",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/SelectBookPage")),
  beforeLoad: requireRoles(["user"]),
});

const userHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: lazyRouteComponent(() => import("./pages/Home")),
  validateSearch: (search: Record<string, unknown>): { bookId?: string } => ({
    bookId: (search.bookId as string) || undefined,
  }),

  beforeLoad: requireRoles(["user"]),
});

const orderSearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-search",
  component: lazyRouteComponent(() => import("./pages/OrderSearchPage")),
  beforeLoad: requireRoles(["user"]),
});

const classroomCakeSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/classroom-cake-summary",
  component: lazyRouteComponent(() => import("./pages/ClassroomCakeSummaryPage")),
  beforeLoad: requireRoles(["user"]),
});

const addTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-team",
  component: lazyRouteComponent(() => import("./pages/AddTeamPage")),
});

const orderPickupConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirm-pickup",
  component: lazyRouteComponent(() => import("./pages/OrderPickupConfirmationPage")),
});

const userClassroomStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-classroom/$classroomId/students",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/ClassroomStudentsPage")),
  beforeLoad: requireRoles(["user"]),
});

// -------------------------------------------------------------
// Superadmin / Dashboard Routes
// -------------------------------------------------------------
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboard",
  component: lazyRouteComponent(() => import("./components/layout/DashboardLayout")),
  beforeLoad: requireRoles(["superadmin"]),
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Dashboard")),
});

const ordersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "orders",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Orders")),
});

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "users",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Users")),
});

const leaderboardRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "leaderboard",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/LeaderboardPage")),
});

const teacherRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "teachers",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Teachers")),
});

const productRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "products",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Products")),
});

const departmentRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "departments",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Departments")),
});

const teamRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "teams",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Teams")),
});

const classroomRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "classrooms",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/Classrooms")),
});

const classroomStudentsRoute = createRoute({
  getParentRoute: () => classroomRoute,
  path: "$classroomId/students",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/ClassroomStudentsPage")),
});

const classroomReportRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "classrooms-report",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/ClassroomsReport")),
});

const orderBookRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "order-books",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/OrderBooks")),
});

const salesRecordsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "sales-records",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/SalesRecordsPage")),
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "settings",
  component: lazyRouteComponent(() => import("./pages/AdminDashboard/SettingsPage")),
});

// -------------------------------------------------------------
// Executive Routes
// -------------------------------------------------------------
const executiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/executive-summary",
  component: lazyRouteComponent(() => import("./components/layout/ExecutiveLayout")),
  beforeLoad: requireRoles(["admin"]),
});

const executiveIndexRoute = createRoute({
  getParentRoute: () => executiveRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./pages/ExecutiveDashboard/ExecutivePage")),
});

// -------------------------------------------------------------
// Officer Routes
// -------------------------------------------------------------
const officerOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officer-orders",
  component: lazyRouteComponent(() => import("./components/layout/OfficerLayout")),
  beforeLoad: requireRoles(["officer1", "officer2"]),
});

const officerOrdersIndexRoute = createRoute({
  getParentRoute: () => officerOrdersRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./pages/OfficerDashboard/OfficerOrdersPage")),
});

const officerPrepareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officer-prepare",
  component: lazyRouteComponent(() => import("./pages/OfficerDashboard/OfficerPreparePage")),
  beforeLoad: requireRoles(["officer1", "officer2"]),
});

const officerAllOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officer-orders-all",
  component: lazyRouteComponent(() => import("./pages/OfficerDashboard/OfficerAllOrdersPage")),
  beforeLoad: requireRoles(["officer1", "officer2"]),
});

// -------------------------------------------------------------
// Route Tree Configuration
// -------------------------------------------------------------
const routeTree = rootRoute.addChildren([
  welcomeRoute,
  classroomCakeSummaryRoute,
  creditsRoute,
  addTeamRoute,
  orderPickupConfirmationRoute,
  userHomeRoute,
  loginRoute,
  registerRoute,
  orderSearchRoute,
  userClassroomStudentsRoute,
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
  officerAllOrdersRoute,
  executiveRoute.addChildren([executiveIndexRoute]),
  selectBookRoute,
]);

// Create the router instance with lazy NotFound component
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: lazyRouteComponent(() => import("./pages/NotFound")),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router, rootRoute };