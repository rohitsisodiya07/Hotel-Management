import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster, toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import {
  Building2, Users, CalendarCheck, Wallet, Star, ShieldCheck, TrendingUp, Search, Edit, Eye, X, Calendar, Filter
} from "lucide-react";

import CountUpModule from "react-countup";
const CountUp = CountUpModule.default || CountUpModule;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statusColorMap = {
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [pendingHotels, setPendingHotels] = useState([]);
  const [approvedHotels, setApprovedHotels] = useState([]);
  const [rejectedHotels, setRejectedHotels] = useState([]);

  // 🌟 Filters & Analytics States
  const [dateRange, setDateRange] = useState("all");
  const [selectedHotelId, setSelectedHotelId] = useState("all");

  const [platformAnalytics, setPlatformAnalytics] = useState({
    monthlyRevenue: [],
    bookingTrend: [],
    bookingStatusBreakdown: [],
    hotelsByCity: [],
    topPerformingHotels: [],
    occupancyComparison: [],
    newRegistrations: [],
    kpis: {}
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("city");
  const [cityFilter, setCityFilter] = useState("");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showView, setShowView] = useState(false);

  useEffect(() => {
    fetchDashboardListings();
  }, []);

  useEffect(() => {
    fetchAnalytics(dateRange, selectedHotelId);
  }, [dateRange, selectedHotelId]);

  const fetchDashboardListings = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pending, approved, rejected] = await Promise.all([
        axios.get(`${signupApi}hotel/pending`, { headers }),
        axios.get(`${signupApi}hotel/approved`, { headers }),
        axios.get(`${signupApi}hotel/rejected`, { headers }),
      ]);

      setPendingHotels(pending.data.hotels || []);
      setApprovedHotels(approved.data.hotels || []);
      setRejectedHotels(rejected.data.hotels || []);
    } catch (error) {
      console.error("Listings fetching error:", error);
      toast.error("Failed to load hotel listings.");
    }
  };

  const fetchAnalytics = async (range, hotelId) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const analyticsRes = await axios.get(`${signupApi}dashboard/platform-analytics?range=${range}&hotelId=${hotelId}`, { headers });
      if (analyticsRes.data?.success) {
        setPlatformAnalytics(analyticsRes.data.analytics);
      }
    } catch (analyticErr) {
      console.error("Analytics fetching error:", analyticErr);
      toast.error("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const allHotels = useMemo(() => {
    const map = new Map();
    [...pendingHotels, ...approvedHotels, ...rejectedHotels].forEach((hotel) => {
      map.set(hotel._id, hotel);
    });
    return [...map.values()];
  }, [pendingHotels, approvedHotels, rejectedHotels]);

  const uniqueCities = useMemo(() => {
    const citiesMap = new Map();
    allHotels.forEach(hotel => {
      if (hotel.city && hotel.city._id) {
        citiesMap.set(hotel.city._id, hotel.city);
      }
    });
    return Array.from(citiesMap.values()).sort((a, b) => a.cityName.localeCompare(b.cityName));
  }, [allHotels]);

  const filteredHotels = useMemo(() => {
    let data = [...allHotels];

    if (statusFilter !== "All") {
      data = data.filter((hotel) => hotel.status === statusFilter);
    }

    if (cityFilter) {
      data = data.filter((hotel) => hotel.city?._id === cityFilter);
    }

    if (selectedHotelId !== "all") {
      data = data.filter((hotel) => hotel._id === selectedHotelId);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (hotel) =>
          hotel.hotelName?.toLowerCase().includes(searchLower) ||
          hotel.hotelEmail?.toLowerCase().includes(searchLower) ||
          hotel.adminId?.name?.toLowerCase().includes(searchLower) ||
          hotel.city?.cityName?.toLowerCase().includes(searchLower)
      );
    }

    data.sort((a, b) => {
      if (sortBy === "city") {
        const cityA = a.city?.cityName || "";
        const cityB = b.city?.cityName || "";
        return cityA.localeCompare(cityB);
      }
      if (sortBy === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return data;
  }, [allHotels, search, statusFilter, sortBy, cityFilter, selectedHotelId]);

  const stats = useMemo(() => {
    const totalRoomsCalc = allHotels.reduce((acc, h) => acc + (Number(h.totalRooms) || 0), 0);
    return {
      total: platformAnalytics.kpis?.totalHotels || allHotels.length,
      pending: pendingHotels.length,
      approved: approvedHotels.length,
      rejected: rejectedHotels.length,
      totalRooms: platformAnalytics.kpis?.totalRooms || totalRoomsCalc || 0,
      totalBookings: platformAnalytics.kpis?.totalBookings || 0,
      totalCustomers: platformAnalytics.kpis?.totalCustomers || 0,
      activeOwners: platformAnalytics.kpis?.activeOwners || allHotels.length,
      averageRating: platformAnalytics.kpis?.averageRating || 0,
      occupancyRate: platformAnalytics.kpis?.occupancyRate || 0,
      totalRevenue: platformAnalytics.kpis?.totalRevenue || 0
    };
  }, [allHotels, pendingHotels, approvedHotels, rejectedHotels, platformAnalytics]);

  const locationOf = (hotel) => {
    return [
      hotel.city?.cityName,
      hotel.city?.districtId?.districtName,
      hotel.city?.districtId?.stateId?.stateName,
    ].filter(Boolean).join(", ");
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowView(true);
  };

  const handleEdit = (id) => {
    navigate(`/admin/addHotel?id=${id}`);
  };

  const monthlyRevenue = platformAnalytics.monthlyRevenue || [];
  const bookingTrend = platformAnalytics.bookingTrend || [];
  const bookingStatusData = platformAnalytics.bookingStatusBreakdown || [];
  const topPerformingHotels = platformAnalytics.topPerformingHotels || [];
  const occupancyComparisonData = platformAnalytics.occupancyComparison || [];

  const hotelsByCityData = useMemo(() => {
    if (platformAnalytics.hotelsByCity?.length > 0) return platformAnalytics.hotelsByCity;
    const cityCounts = {};
    allHotels.forEach(h => {
      const cityName = h.city?.cityName || "Unassigned";
      cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
    });
    return Object.entries(cityCounts).map(([city, count]) => ({ city, count }));
  }, [allHotels, platformAnalytics]);

  const newRegistrationsData = useMemo(() => {
    if (platformAnalytics.newRegistrations?.length > 0) return platformAnalytics.newRegistrations;
    const monthCounts = {};
    allHotels.forEach(h => {
      if (h.createdAt) {
        const monthName = new Date(h.createdAt).toLocaleString('default', { month: 'short' });
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });
    return Object.entries(monthCounts).map(([month, hotels]) => ({ month, hotels }));
  }, [allHotels, platformAnalytics]);

  const kpiCards = useMemo(() => [
    { title: "Total Hotels", value: stats.total, trend: "+8.4%", trendUp: true, color: "text-blue-600", bg: "bg-blue-50", icon: Building2 },
    { title: "Total Rooms", value: stats.totalRooms, trend: "+12.1%", trendUp: true, color: "text-indigo-600", bg: "bg-indigo-50", icon: Building2 },
    { title: "Total Bookings", value: stats.totalBookings, trend: "+15.3%", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-50", icon: CalendarCheck },
    { title: "Total Customers", value: stats.totalCustomers, trend: "+9.2%", trendUp: true, color: "text-purple-600", bg: "bg-purple-50", icon: Users },
    { title: "Total Revenue", value: stats.totalRevenue, prefix: "₹", trend: "+14.5%", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-50", icon: Wallet },
    { title: "Average Rating", value: stats.averageRating, trend: "+0.2", trendUp: true, color: "text-amber-600", bg: "bg-amber-50", icon: Star },
    { title: "Occupancy Rate", value: stats.occupancyRate, suffix: "%", trend: "+4.1%", trendUp: true, color: "text-blue-600", bg: "bg-blue-50", icon: TrendingUp },
    { title: "Active Owners", value: stats.activeOwners, trend: "+6", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck },
  ], [stats]);

  const columns = useMemo(
    () => [
      { header: "Hotel Name", accessorKey: "hotelName", cell: (info) => <span className="font-bold text-gray-900">{info.getValue()}</span> },
      { header: "City", accessorKey: "city.cityName", cell: (info) => <span className="text-gray-600">{info.getValue() || "N/A"}</span> },
      { header: "Owner / Admin", accessorKey: "adminId.name", cell: (info) => <span className="text-gray-600">{info.getValue() || "Admin"}</span> },
      { header: "Rooms", accessorKey: "totalRooms", cell: (info) => <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">{info.getValue() || 0}</span> },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue();
          const color = statusColorMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
          return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${color}`}>{status}</span>;
        },
      },
      {
        header: "Actions",
        accessorKey: "_id",
        cell: (info) => {
          const hotel = info.row.original;
          return (
            <div className="flex gap-2">
              <button onClick={() => handleView(hotel)} className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-2xs cursor-pointer">
                View
              </button>
              <button onClick={() => handleEdit(hotel._id)} className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-gray-200 transition shadow-2xs cursor-pointer">
                Edit
              </button>
            </div>
          );
        }
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredHotels,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Toaster position="top-right" richColors />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 w-full pb-16 max-w-[1600px] mx-auto text-gray-800 font-['Inter',sans-serif]">

        {/* 🌟 DASHBOARD HEADER WITH FILTERS */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs gap-4">
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 tracking-tight">Admin Console</h1>
            <p className="text-xs text-gray-500 font-medium">
              Platform-wide overview of hotels, bookings, and financial analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* 🌟 Hotel Selector Dropdown */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <Filter size={14} className="text-gray-400" />
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">All Hotels (Platform)</option>
                {allHotels.map(h => (
                  <option key={h._id} value={h._id}>{h.hotelName}</option>
                ))}
              </select>
            </div>

            {/* 🌟 Date Range Dropdown */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <Calendar size={14} className="text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="year">This Year</option>
                <option value="all">All-Time (Complete)</option>
              </select>
            </div>

            <button
              onClick={() => navigate("/admin/addHotel")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
            >
              + Add Hotel
            </button>
          </div>
        </div>

        {/* 📊 8 KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <motion.div key={index} variants={itemVariants} className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-['IBM_Plex_Mono']">{kpi.title}</p>
                    {loading ? (
                      <Skeleton width={80} height={28} />
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-['Space_Grotesk']">
                        {kpi.prefix}
                        <CountUp end={kpi.value} duration={2} separator="," />
                        {kpi.suffix}
                      </h3>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
                    <IconComponent size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium ${kpi.trendUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    <TrendingUp size={11} className={kpi.trendUp ? "" : "rotate-180"} />
                    {kpi.trend}
                  </span>
                  <span className="text-gray-400">vs previous period</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 📈 7 DYNAMIC ENTERPRISE SAAS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 1. Revenue Trend (Area Chart) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">Revenue Trend</h3>
                <p className="text-xs text-gray-500 font-medium">Monthly revenue performance</p>
              </div>
            </div>
            <div className="h-[240px] w-full">
              {monthlyRevenue.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No revenue data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }} formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 2. Booking Trend (Bar Chart) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">Booking Trend</h3>
                <p className="text-xs text-gray-500 font-medium">Daily reservation volume</p>
              </div>
            </div>
            <div className="h-[240px] w-full">
              {bookingTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No booking trend data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="bookings" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 3. Booking Status (Donut Chart) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-2">Booking Status Distribution</h3>
            <div className="flex items-center justify-between">
              {bookingStatusData.length === 0 ? (
                <div className="w-full text-center text-xs text-gray-400 py-8">No booking distribution data available</div>
              ) : (
                <>
                  <div className="space-y-2 text-xs">
                    {bookingStatusData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#F43F5E"][idx % 4] }}></span>
                        <span className="text-gray-600 font-medium">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-[150px] w-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={bookingStatusData} innerRadius={42} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                          {bookingStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={["#10B981", "#3B82F6", "#F59E0B", "#F43F5E"][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "6px", fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* 4. Hotels by City (Bar Chart) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-3">Hotels by City</h3>
            <div className="h-[190px] w-full">
              {hotelsByCityData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No city distribution data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hotelsByCityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 5. Top Performing Hotels (Horizontal Bar Chart) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-3">Top Performing Hotels (Revenue)</h3>
            <div className="h-[210px] w-full">
              {topPerformingHotels.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No performance data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={topPerformingHotels} margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 6. Hotel Occupancy Comparison (Bar Chart) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-3">Hotel Occupancy Comparison (%)</h3>
            <div className="h-[210px] w-full">
              {occupancyComparisonData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No occupancy data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyComparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="hotel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(value) => [`${value}%`, "Occupancy"]} />
                    <Bar dataKey="occupancy" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 7. New Hotel Registrations (Line Chart) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">New Hotel Registrations</h3>
                <p className="text-xs text-gray-500 font-medium">Monthly onboarded partner hotels</p>
              </div>
            </div>
            <div className="h-[220px] w-full">
              {newRegistrationsData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No registration history available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={newRegistrationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="hotels" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5, fill: "#8B5CF6" }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

        </div>

        {/* 🔍 SEARCH & FILTERS BAR */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="relative w-full xl:flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by hotel name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 h-11 text-xs font-medium focus:outline-none focus:border-blue-500 transition shadow-2xs bg-white"
            />
          </div>

          <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3 items-center shrink-0 flex-wrap">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full sm:w-40 border border-gray-200 rounded-xl px-3.5 h-11 text-xs font-semibold focus:outline-none focus:border-blue-500 transition shadow-2xs bg-white text-gray-700 cursor-pointer"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city._id} value={city._id} className="capitalize">{city.cityName}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-40 border border-gray-200 rounded-xl px-3.5 h-11 text-xs font-semibold focus:outline-none focus:border-blue-500 transition shadow-2xs bg-white text-gray-700 cursor-pointer"
            >
              <option value="city">City (A to Z)</option>
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* 🗂️ TABS FILTER */}
        <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none">
          {["All", "Pending", "Approved", "Rejected"].map((status) => {
            const isActive = statusFilter === status;
            const count =
              status === "All" ? stats.total
                : status === "Pending" ? stats.pending
                  : status === "Approved" ? stats.approved
                    : stats.rejected;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${isActive
                  ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                  }`}
              >
                {status} Listings{" "}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${isActive ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 📋 HOTEL PERFORMANCE TABLE */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">Hotel Performance Directory</h3>
            <span className="text-xs font-bold text-gray-400 font-['IBM_Plex_Mono']">Showing {filteredHotels.length} records</span>
          </div>

          {loading ? (
            <div className="space-y-3"><Skeleton count={4} height={45} className="rounded-lg" /></div>
          ) : filteredHotels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Building2 size={36} className="text-gray-300 mb-2" />
              <p className="text-gray-500 text-xs font-medium">No properties found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-bold font-['IBM_Plex_Mono'] border-b border-gray-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3 font-semibold">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100 font-medium">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </motion.div>

      {/* View Details Modal */}
      {showView && selectedHotel && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 p-5 sticky top-0 bg-white z-10 shrink-0">
              <div>
                <h2 className="font-['Space_Grotesk',sans-serif] text-base font-bold text-gray-900">Listing Inspection Profile</h2>
              </div>
              <button
                onClick={() => { setShowView(false); setSelectedHotel(null); }}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 bg-white">
              {selectedHotel.hotelImages?.length > 0 ? (
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border-b border-gray-100 bg-gray-900 p-3 gap-3">
                  {selectedHotel.hotelImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${selectedHotel.hotelName} - View ${index + 1}`}
                      className="w-full sm:w-[85%] h-52 sm:h-60 object-cover rounded-xl flex-shrink-0 snap-center shadow-xs border border-white/10"
                    />
                  ))}
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
                  alt="Fallback Hotel"
                  className="w-full h-56 object-cover border-b border-gray-100"
                />
              )}

              <div className="p-6 space-y-5 text-xs">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hotel Identity</p>
                    <h3 className="font-bold text-gray-900 text-sm">{selectedHotel.hotelName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 break-all font-medium">{selectedHotel.hotelEmail}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Admin</p>
                    <h3 className="font-bold text-gray-900 text-sm">{selectedHotel.adminId?.name || "System Manager"}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 break-all font-medium">{selectedHotel.adminId?.email || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Accommodation</p>
                    <h3 className="font-bold text-gray-900 text-xs">{selectedHotel.hotelType || "N/A"}</h3>
                    <p className="text-xs text-blue-600 font-bold mt-0.5">{selectedHotel.totalRooms || 0} Active Rooms</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-md font-['IBM_Plex_Mono',monospace] text-[10px] font-bold uppercase tracking-wider shadow-2xs ${selectedHotel.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : selectedHotel.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                      {selectedHotel.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Geographic Region & Address</p>
                    <h3 className="font-bold text-gray-900 text-xs">{locationOf(selectedHotel) || "No Region Data Linked"}</h3>
                    <p className="font-medium text-gray-600 mt-1 leading-relaxed">{selectedHotel.address}</p>
                  </div>
                </div>

                {selectedHotel.amenities?.length > 0 && (
                  <div>
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHotel.amenities.map((item, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-xl border border-gray-200 font-medium shadow-2xs">
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedHotel.remark && (
                  <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
                    <p className="text-rose-700 font-['IBM_Plex_Mono',monospace] text-[10px] font-bold uppercase tracking-wider mb-1">Audit Execution Remark</p>
                    <p className="text-gray-900 text-xs font-medium leading-relaxed m-0">{selectedHotel.remark}</p>
                  </div>
                )}

                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Establishment Overview</p>
                  <p className="leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200 italic m-0 text-xs">
                    "{selectedHotel.description || "No public summary description specified for this establishment."}"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-2.5">
              <button
                onClick={() => { setShowView(false); handleEdit(selectedHotel._id); }}
                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit size={13} /> Edit Listing
              </button>
              <button
                onClick={() => { setShowView(false); setSelectedHotel(null); }}
                className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;