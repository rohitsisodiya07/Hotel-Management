import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeRedirect from "./HomeRedirect";


import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

//SuperAdmin
import AdminLayout from "./SuperAdmin/AdminLayout";
import State from "./SuperAdmin/State";
import District from "./SuperAdmin/District";
import City from "./SuperAdmin/City";
import PendingHotels from "./SuperAdmin/PendingHotels";
import PendingAdmin from "./SuperAdmin/PendingAdmin";
import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard";

//Admin
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
import AdminBookings from "./Admin/AdminBookings";

//Hotel
import HotelLayout from "./Hotel/HotelLayout";
import HotelDashboard from "./Hotel/HotelDashboard";
import RoomManagement from "./Hotel/RoomManagement";
import HotelProfile from "./Hotel/HotelProfile";
import AllRooms from "./Hotel/AllRooms";
import HotelBookings from "./Hotel/HotelBookings";

//User
import HotelDetails from "./User/HotelDetails";
import MyBooking from "./User/MyBooking";
import UserLayout from "./User/UserLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* User Layout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/hotel-details/:id"
            element={<HotelDetails />}
          />

          <Route
            path="/myBookings"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <MyBooking />
              </ProtectedRoute>
            }
          />
        </Route>


        {/*Authentication */}
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

        {/* Change 3: Wrapped Admin and Status pages in PublicRoute */}
        <Route
          path="/adminSignup"
          element={
            <PublicRoute>
              <SignupAdmin />
            </PublicRoute>
          }
        />

        <Route
          path="/adminSignup/:id"
          element={
            <PublicRoute>
              <SignupAdmin />
            </PublicRoute>
          }
        />

        <Route
          path="/checkStatus"
          element={
            <PublicRoute>
              <CheckStatus />
            </PublicRoute>
          }
        />

        <Route
          path="/hotelStatus"
          element={
            <PublicRoute>
              <CheckHotelStatus />
            </PublicRoute>
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
            path="myHotels"
            element={<MyHotels />}
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

          <Route
            path="adminBookings"
            element={<AdminBookings />}
          />
        </Route>

        {/* Hotel */}
        <Route
          path="/hotel"
          element={
            <ProtectedRoute
              allowedRoles={["hotel"]}
            >
              <HotelLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="hotelDashboard"
            element={<HotelDashboard />}
          />

          <Route
            path="room"
            element={<RoomManagement />}
          />

          <Route
            path="hotelProfile"
            element={<HotelProfile />}
          />

          <Route
            path="allRooms"
            element={<AllRooms />}
          />

          <Route
            path="hotelBookings"
            element={<HotelBookings />}
          />
        </Route>

        {/* superAdmin */}
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

          {/* Reuse Admin Add Hotel Form */}
          <Route
            path="addHotel"
            element={<AddHotels />}
          />

          <Route
            path="pendingHotels"
            element={<PendingHotels />}
          />

          <Route
            path="pendingAdmin"
            element={<PendingAdmin />}
          />
          <Route
            path="dashboard"
            element={<SuperAdminDashboard />}
          />

        </Route>

        {/* ======================
              Common Routes
        ======================= */}

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

        {/* Change 4: Catch-all 404 Route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;