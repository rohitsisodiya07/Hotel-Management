import "./App.css";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import User from "./User";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

// Super Admin
import AdminLayout from "./SuperAdmin/AdminLayout";
import State from "./SuperAdmin/State";
import District from "./SuperAdmin/District";
import City from "./SuperAdmin/City";
import PendingHotels from "./SuperAdmin/PendingHotels";
import PendingAdmin from "./SuperAdmin/PendingAdmin";

// Admin
import SignupAdmin from "./Admin/SignupAdmin";
import CheckStatus from "./Admin/CheckStatus";
import AdminLayoutAdmin from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import AddHotels from "./Admin/AddHotels";
import MyHotels from "./Admin/MyHotels";
import Profile from "./Admin/Profile";
import CheckHotelStatus from "./Admin/CheckHotelStatus";
import AddCoupon from "./Admin/AddCoupon";
import MyCoupon from "./Admin/MyCoupon";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Signup */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Admin Signup */}
        <Route
          path="/adminSignup"
          element={<SignupAdmin />}
        />

        <Route
          path="/adminSignup/:id"
          element={<SignupAdmin />}
        />

        {/* Check Status */}
        <Route
          path="/checkStatus"
          element={<CheckStatus />}
        />

        <Route
          path="/hotelStatus"
          element={<CheckHotelStatus />}
        />
        {/* Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* User */}
        <Route
          path="/user"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}
            >
              <User />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <AdminLayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="addHotel"
            element={<AddHotels />}
          />

          <Route
            path="addCoupon"
            element={<AddCoupon />}
          />

          <Route
            path="myCoupon"
            element={<MyCoupon />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />
        </Route>

        {/* Super Admin */}
        <Route
          path="/superAdmin"
          element={
            <ProtectedRoute
              allowedRoles={["superAdmin"]}
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="state"
            element={<State />}
          />

          <Route
            path="district"
            element={<District />}
          />

          <Route
            path="city"
            element={<City />}
          />

          <Route
            path="pendingHotels"
            element={<PendingHotels />}
          />

          <Route
            path="pendingAdmin"
            element={<PendingAdmin />}
          />
        </Route>

        {/* Forgot Password */}
        <Route
          path="/forgot"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Reset Password */}
        <Route
          path="/reset"
          element={
            <ProtectedRoute
              allowedRoles={[
                "user",
                "admin",
                "superAdmin",
              ]}
            >
              <ResetPassword />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;