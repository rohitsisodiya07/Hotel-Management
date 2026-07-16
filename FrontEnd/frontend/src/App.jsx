import "./App.css";
import { BrowserRouter, Route, Routes, } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import User from "./User";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

//SuperAdmin
import AdminRoute from "./SuperAdmin/AdminRoute";
import AdminLayout from "./SuperAdmin/AdminLayout";
import State from "./SuperAdmin/State";
import District from "./SuperAdmin/District";
import City from "./SuperAdmin/City";
import PendingHotels from "./SuperAdmin/PendingHotels";

//Admin
import SignupAdmin from './Admin/SignupAdmin'
import CheckStatus from "./Admin/CheckStatus";

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

        <Route
          path="/adminSignup"
          element={<SignupAdmin />}
        />

        <Route
          path="/adminSignup/:id"
          element={<SignupAdmin />}
        />

        <Route
          path="/checkStatus"
          element={<CheckStatus />}
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

        {/* User Dashboard */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          }
        />

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
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        {/* Super Admin */}
        <Route
          path="/superAdmin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
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

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;