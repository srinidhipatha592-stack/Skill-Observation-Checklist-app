import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Children from "./pages/Children";
import AddChild from "./pages/AddChild";
import ChildDetails from "./pages/ChildDetails";
import EditChild from "./pages/EditChild";
import ChildPerformance from "./pages/ChildPerformance";

import Observations from "./pages/Observations";
import ObservationList from "./pages/ObservationList";
import ObservationDetails from "./pages/ObservationDetails";
import ObservationTrends from "./pages/ObservationTrends";

import Reports from "./pages/Reports";
import MonthlyReports from "./pages/MonthlyReports";

import ParentPortal from "./pages/ParentPortal";
import Notifications from "./pages/Notifications";
import Progress from "./pages/Progress";
import ChildProgress from "./pages/ChildProgress";
import ActivityLogs from "./pages/ActivityLogs";
import EmailReports from "./pages/EmailReports";

/* NEW */
import UserManagement from "./pages/UserManagement";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

/* ADMIN PORTAL */
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminChecklists from "./pages/AdminChecklists";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children"
          element={
            <ProtectedRoute>
              <Children />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-child"
          element={
            <RoleProtectedRoute
              allowedRoles={[
              "admin",
              "teacher"
              ]}
            >
              <AddChild />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/child/:id"
          element={
            <ProtectedRoute>
              <ChildDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/child/edit/:id"
          element={
            <ProtectedRoute>
              <EditChild />
            </ProtectedRoute>
          }
        />

        <Route
          path="/child-performance/:id"
          element={
            <ProtectedRoute>
              <ChildPerformance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/observations"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin",
                "teacher"
              ]}
            >
              <Observations />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/observation-list"
          element={
            <ProtectedRoute>
              <ObservationList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/observation/:id"
          element={
            <ProtectedRoute>
              <ObservationDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/observation-trends"
          element={
            <ProtectedRoute>
              <ObservationTrends />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin",
                "teacher"
              ]}
            >
              <Reports />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/monthly-reports"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin",
                "teacher"
              ]}
            >
              <MonthlyReports />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/parent-portal"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin",
                "parent"
              ]}
            >
              <ParentPortal />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin"
              ]}
            >
              <Notifications />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/child-progress/:childId"
          element={
            <ProtectedRoute>
              <ChildProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity-logs"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin"
              ]}
            >
              <ActivityLogs />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/email-reports"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin"
              ]}
            >
              <EmailReports />
            </RoleProtectedRoute>
          }
        />

        {/* NEW USER MANAGEMENT ROUTE */}

        <Route
          path="/user-management"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "admin"
              ]}
            >
              <UserManagement />
            </RoleProtectedRoute>
          }
        />

        {/* --- NEW ADMIN PORTAL ROUTES --- */}

        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <AdminProtectedRoute>
              <AdminReports />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <AdminProtectedRoute>
              <AdminAnalytics />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/checklists"
          element={
            <AdminProtectedRoute>
              <AdminChecklists />
            </AdminProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;