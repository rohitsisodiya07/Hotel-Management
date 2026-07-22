import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
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
import AddCoupon from "./Admin/AddCoupon";
import MyCoupon from "./Admin/MyCoupon";
import CheckHotelStatus from "./Admin/CheckHotelStatus";

// Hotel
import HotelLayout from "./Hotel/HotelLayout";
import HotelDashboard from "./Hotel/HotelDashboard";
import RoomManagement from "./Hotel/RoomManagement";
import HotelProfile from "./Hotel/HotelProfile";
import AllRooms from "./Hotel/AllRooms";

// User (Public)
import PublicHome from "./User/PublicHome";
import HotelDetails from "./User/HotelDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================================== */}
        {/* 🌍 PUBLIC / CUSTOMER ROUTES (Default UI) */}
        {/* ========================================== */}

        {/* Default Home Page (Saare Hotels Yahan Dikhenge) */}
        <Route path="/" element={<PublicHome />} />

        {/* Hotel Details Page (Rooms Yahan Dikhenge) */}
        <Route path="/hotel-details/:id" element={<HotelDetails />} />

        {/* ========================================== */}
        {/* 🔐 AUTHENTICATION ROUTES */}
        {/* ========================================== */}

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route path="/adminSignup" element={<SignupAdmin />} />
        <Route path="/adminSignup/:id" element={<SignupAdmin />} />
        <Route path="/checkStatus" element={<CheckStatus />} />
        <Route path="/hotelStatus" element={<CheckHotelStatus />} />

        {/* ========================================== */}
        {/* 🏢 ADMIN DASHBOARD */}
        {/* ========================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="addHotel" element={<AddHotels />} />
          <Route path="myHotels" element={<MyHotels />} />
          <Route path="addCoupon" element={<AddCoupon />} />
          <Route path="myCoupon" element={<MyCoupon />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ========================================== */}
        {/* 🏨 HOTEL DASHBOARD */}
        {/* ========================================== */}

        <Route
          path="/hotel"
          element={
            <ProtectedRoute allowedRoles={["hotel"]}>
              <HotelLayout />
            </ProtectedRoute>
          }
        >
          <Route path="hotelDashboard" element={<HotelDashboard />} />
          <Route path="room" element={<RoomManagement />} />
          <Route path="hotelProfile" element={<HotelProfile />} />
          <Route path="allRooms" element={<AllRooms />} />
        </Route>

        {/* ========================================== */}
        {/* 👑 SUPER ADMIN DASHBOARD */}
        {/* ========================================== */}

        <Route
          path="/superAdmin"
          element={
            <ProtectedRoute allowedRoles={["superAdmin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="state" element={<State />} />
          <Route path="district" element={<District />} />
          <Route path="city" element={<City />} />
          <Route path="pendingHotels" element={<PendingHotels />} />
          <Route path="pendingAdmin" element={<PendingAdmin />} />
        </Route>

        {/* ========================================== */}
        {/* 🔑 COMMON SECURE ROUTES */}
        {/* ========================================== */}

        <Route
          path="/reset"
          element={
            <ProtectedRoute
              allowedRoles={[
                "user",
                "admin",
                "superAdmin",
                "hotel",
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