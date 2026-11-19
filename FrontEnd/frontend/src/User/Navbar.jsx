import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import {
  Menu,
  X,
  Compass,
  MapPin,
  CalendarDays,
  Headphones,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Sparkles,
  Heart,
  HelpCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getSavedStays } from "../utils/wishlist";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(() => getSavedStays().length);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (err) {
    user = null;
  }

  // Sync wishlist badge in real time
  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedStays().length);
    };
    window.addEventListener("aurastay_wishlist_updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("aurastay_wishlist_updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Signed out successfully");
    navigate("/");
    window.location.reload();
  };

  const scrollToHotels = () => {
    setMobileMenuOpen(false);
    const element = document.getElementById("hotels-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#hotels-section");
    }
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case "superAdmin":
        return "/superAdmin/dashboard";
      case "admin":
        return "/admin/dashboard";
      case "hotel":
        return "/hotel/hotelDashboard";
      default:
        return "/myBookings";
    }
  };

  const navLinks = [
    { label: "Stays & Resorts", action: scrollToHotels, icon: Compass },
    { label: "Destinations", path: "/popularcity", icon: MapPin },
    { label: "About", path: "/about", icon: Info },
    { label: "FAQ", path: "/faq", icon: HelpCircle },
    { label: "Concierge", path: "/contact", icon: Headphones },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#F8FAF7]/95 backdrop-blur-md shadow-[0_4px_25px_rgba(23,61,49,0.06)] border-b border-[#E3E8E1]"
          : "bg-[#F8FAF7] border-b border-[#EAEFE8]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Logo to="/" imgHeight="h-11 sm:h-12" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) =>
              link.path ? (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-full text-xs lg:text-sm font-medium tracking-wide transition-colors flex items-center gap-1.5 ${
                    location.pathname === link.path
                      ? "bg-[#173D31] text-white shadow-sm"
                      : "text-[#3A4B3F] hover:text-[#173D31] hover:bg-[#EDF2EB]"
                  }`}
                >
                  <link.icon size={15} />
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="px-3.5 py-2 rounded-full text-xs lg:text-sm font-medium tracking-wide text-[#3A4B3F] hover:text-[#173D31] hover:bg-[#EDF2EB] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <link.icon size={15} />
                  {link.label}
                </button>
              )
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Wishlist Link with dynamic badge */}
            <Link
              to="/saved-stays"
              title="Saved Stays"
              className={`relative p-2.5 rounded-full border transition-all cursor-pointer ${
                location.pathname === "/saved-stays"
                  ? "bg-[#173D31] text-white border-[#173D31]"
                  : "bg-white text-[#2C3E33] border-[#D5DFD3] hover:border-[#173D31] hover:bg-[#F2F6F1]"
              }`}
            >
              <Heart
                size={16}
                className={savedCount > 0 ? "text-rose-500 fill-rose-500" : ""}
              />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {savedCount}
                </span>
              )}
            </Link>

            {token && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-full border border-[#D5DFD3] bg-white hover:border-[#173D31] hover:shadow-sm transition-all text-xs font-semibold text-[#173D31] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#173D31] to-[#315C48] text-white flex items-center justify-center text-xs font-bold uppercase shadow-inner">
                    {user.name ? user.name[0] : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name || "Guest"}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-[#718575] ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Popover */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-[0_15px_40px_rgba(23,61,49,0.12)] border border-[#E5ECE3] py-2 px-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-[#F0F4EF]">
                      <p className="text-xs font-semibold text-[#173D31] truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#718575] truncate mt-0.5">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#EDF2EB] text-[#224A3B] text-[10px] font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/myBookings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#2C3E33] hover:bg-[#F2F6F1] transition"
                      >
                        <CalendarDays size={16} className="text-[#315C48]" />
                        My Reservations
                      </Link>

                      <Link
                        to="/saved-stays"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#2C3E33] hover:bg-[#F2F6F1] transition"
                      >
                        <Heart size={16} className="text-rose-500" />
                        Saved Stays ({savedCount})
                      </Link>

                      {user.role && user.role !== "user" && (
                        <Link
                          to={getDashboardRoute(user.role)}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#2C3E33] hover:bg-[#F2F6F1] transition"
                        >
                          <LayoutDashboard size={16} className="text-[#A27B3C]" />
                          Management Portal
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#173D31] hover:bg-[#EDF2EB] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#173D31] hover:bg-[#204A3C] shadow-sm hover:shadow transition transform active:scale-95"
                >
                  Join AuraStay
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions Hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Mobile Wishlist Icon */}
            <Link
              to="/saved-stays"
              aria-label="Saved Stays"
              className="relative p-2 rounded-full text-[#173D31] hover:bg-[#EDF2EB]"
            >
              <Heart size={20} className={savedCount > 0 ? "text-rose-500 fill-rose-500" : ""} />
              {savedCount > 0 && (
                <span className="absolute 0 top-0 right-0 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {token && (
              <Link
                to="/myBookings"
                aria-label="My Bookings"
                className="p-2 rounded-full text-[#173D31] hover:bg-[#EDF2EB]"
              >
                <CalendarDays size={20} />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
              className="p-2 rounded-xl text-[#173D31] hover:bg-[#EDF2EB] transition cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8EEE6] bg-white px-5 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) =>
              link.path ? (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#293A2E] hover:bg-[#F2F6F1]"
                >
                  <link.icon size={18} className="text-[#315C48]" />
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => {
                    link.action();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#293A2E] hover:bg-[#F2F6F1] text-left w-full cursor-pointer"
                >
                  <link.icon size={18} className="text-[#315C48]" />
                  {link.label}
                </button>
              )
            )}
            <Link
              to="/saved-stays"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#293A2E] hover:bg-[#F2F6F1]"
            >
              <div className="flex items-center gap-3">
                <Heart size={18} className="text-rose-500" />
                Saved Stays
              </div>
              {savedCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </Link>
          </nav>

          <hr className="border-[#F0F4EF]" />

          {token && user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 bg-[#F6F8F5] rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#173D31] text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name[0] : "U"}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-semibold text-[#173D31] truncate">{user.name}</p>
                  <p className="text-xs text-[#718575] truncate">{user.email}</p>
                </div>
              </div>

              <Link
                to="/myBookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#293A2E] hover:bg-[#F2F6F1]"
              >
                <CalendarDays size={18} className="text-[#315C48]" />
                My Bookings & Reservations
              </Link>

              {user.role && user.role !== "user" && (
                <Link
                  to={getDashboardRoute(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#293A2E] hover:bg-[#F2F6F1]"
                >
                  <LayoutDashboard size={18} className="text-[#A27B3C]" />
                  Management Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center h-11 rounded-xl text-xs font-bold text-[#173D31] border border-[#CAD6C8] bg-white hover:bg-[#F6F8F5]"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center h-11 rounded-xl text-xs font-bold text-white bg-[#173D31] hover:bg-[#204A3C]"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
