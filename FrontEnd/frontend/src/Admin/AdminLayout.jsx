import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";
import { signupApi } from "../api";
import {
  LayoutDashboard,
  Building2,
  Ticket,
  UserCircle,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Bell,
  MapPin,
  Menu,
  X
} from "lucide-react";

dayjs.extend(relativeTime);

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const bellRef = useRef(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 80, right: 24 });

  // 🌟 Fetch Dynamic Notifications from Backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${signupApi}dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.success && res.data.notifications) {
          setNotifications(res.data.notifications);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Calculate exact position on bell click
  const handleToggleNotifications = () => {
    if (!notificationsOpen && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setNotificationsOpen(!notificationsOpen);
  };

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  const menu = [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "Add Hotel", path: "addHotel", icon: Building2 },
    { name: "My Coupon", path: "myCoupon", icon: Ticket },
    { name: "Profile", path: "profile", icon: UserCircle },
    { name: "Hotel Bookings", path: "adminBookings", icon: CalendarCheck },
  ];

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to securely end your session?")) return;
    localStorage.clear();
    navigate("/login");
  };

  const initials = (name) => {
    return (name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("dashboard")) return "Admin Console";
    if (location.pathname.includes("addHotel")) return "Hotel Management";
    if (location.pathname.includes("myCoupon")) return "Coupons & Offers";
    if (location.pathname.includes("profile")) return "Administrator Profile";
    if (location.pathname.includes("adminBookings")) return "Platform Reservations";
    return "System Control Node";
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="flex h-screen bg-gray-50 font-['Inter',sans-serif] text-gray-800 overflow-hidden selection:bg-blue-600 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ================= SIDEBAR (Desktop) ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col shrink-0 hidden lg:flex shadow-2xs z-20 relative">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-['Space_Grotesk'] font-bold text-sm">
              {initials(user?.name) || "A"}
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 truncate">
              Admin Core
            </span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-[10px] tracking-wider text-gray-400 mb-3 px-3 font-bold uppercase font-['IBM_Plex_Mono']">
            Navigation
          </p>
          {menu.map((item) => {
            const active = location.pathname.includes(`/admin/${item.path}`);
            const IconComponent = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm ${active
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <IconComponent size={18} /> {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
          <Link
            to="/reset"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-2xs rounded-xl transition border border-transparent hover:border-gray-200"
          >
            <ShieldCheck size={18} className="text-blue-600" /> Reset Password
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="w-64 bg-white h-full shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-left-4 duration-200">
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  {initials(user?.name) || "A"}
                </div>
                <span className="font-bold text-base tracking-tight text-gray-900">Admin Menu</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menu.map((item) => {
                const active = location.pathname.includes(`/admin/${item.path}`);
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm ${active ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <IconComponent size={18} /> {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 space-y-1">
              <Link
                to="/reset"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                <ShieldCheck size={18} className="text-blue-600" /> Reset Password
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* 🌐 TOPBAR (Fixed) */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-['Space_Grotesk'] tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide hidden sm:block">
                {dayjs().format("dddd, DD MMMM YYYY")}
              </p>
            </div>
          </div>

          {/* Right: Notifications Popover & Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 pl-4 sm:pl-6 sm:border-l border-gray-200">

              {/* 🔔 Notification Bell & Portal Dropdown */}
              <div className="relative">
                <button
                  ref={bellRef}
                  onClick={handleToggleNotifications}
                  className="relative p-2 text-gray-500 hover:text-gray-900 transition rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {/* 🌟 PORTAL DROPDOWN RENDERED AT BODY ROOT LEVEL */}
                {notificationsOpen && ReactDOM.createPortal(
                  <div
                    ref={notifRef}
                    style={{ top: `${dropdownCoords.top}px`, right: `${dropdownCoords.right}px` }}
                    className="fixed w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 z-[99999] animate-in fade-in duration-150"
                  >
                    <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm font-['Space_Grotesk']">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-3.5 hover:bg-gray-50/80 transition flex items-start gap-3 ${n.unread ? "bg-blue-50/30" : ""}`}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-blue-100 text-blue-600">
                              <CalendarCheck size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                                <span className="text-[10px] text-gray-400 shrink-0 font-medium">{n.time}</span>
                              </div>
                              <p className="text-xs text-gray-600 font-medium leading-relaxed">{n.desc}</p>
                            </div>
                            {n.unread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center"></span>}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 px-4 border-t border-gray-100 text-center">
                      <button
                        onClick={() => { setNotificationsOpen(false); navigate("adminBookings"); }}
                        className="text-xs font-bold text-gray-600 hover:text-blue-600 transition py-1 cursor-pointer uppercase tracking-wider font-['IBM_Plex_Mono']"
                      >
                        View All Bookings
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase flex items-center justify-end gap-1 mt-0.5 font-['IBM_Plex_Mono']">
                    <MapPin size={10} className="text-blue-600" /> System Admin
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm text-sm shrink-0 font-['Space_Grotesk']">
                  {initials(user?.name) || "AD"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 📜 DYNAMIC PAGE CONTENT (Outlet) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide bg-gray-50/50">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;