import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import {
  Building2, Users, Wallet, Star, ShieldCheck, TrendingUp, Search, Edit, X, Calendar, Filter, CheckCircle2, Clock, Download, ArrowDownAZ
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import CountUpModule from "react-countup";
const CountUp = CountUpModule.default || CountUpModule;
import { signupApi } from "../api";

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
  Pending: "bg-orange-50 text-orange-700 border-orange-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const formatMoney = (amount) => {
  const num = Number(amount || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString()}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [dateRange, setDateRange] = useState("all");
  const [selectedHotelId, setSelectedHotelId] = useState("all");
  const [allHotelsList, setAllHotelsList] = useState([]);

  const [platformAnalytics, setPlatformAnalytics] = useState({
    monthlyRevenue: [],
    hotelsAddedTrend: [],
    hotelStatusBreakdown: [],
    hotelsByCity: [],
    kpis: {}
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("city");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showView, setShowView] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchAllHotelsForDropdown();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchAnalytics(dateRange, selectedHotelId);
  }, [dateRange, selectedHotelId, refreshTrigger]);

  const fetchAllHotelsForDropdown = async () => {
    try {
      const res = await axios.get(`${signupApi}hotel/approved`, { headers });
      setAllHotelsList(res.data.hotels || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async (range, hotelId) => {
    try {
      setAnalyticsLoading(true);
      const res = await axios.get(`${signupApi}dashboard/platform-analytics?range=${range}&hotelId=${hotelId}`, { headers });
      if (res.data?.success) {
        setPlatformAnalytics(res.data.analytics);
        setLastUpdated(new Date());
      }
    } catch (err) {
      toast.error("Failed to load analytics data.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const [tableDataLoading, setTableDataLoading] = useState(false);
  const [tableResData, setTableResData] = useState({ hotels: [], total: 0, page: 1, totalPages: 1 });

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setTableDataLoading(true);
        const params = new URLSearchParams({
          range: dateRange,
          hotelId: selectedHotelId,
          status: statusFilter,
          city: cityFilter,
          search,
          sortBy,
          page,
          limit
        });
        const res = await axios.get(`${signupApi}dashboard/platform-analytics?${params.toString()}`, { headers });
        if (res.data?.success) {
          setTableResData(res.data.analytics.tableData || { hotels: [], total: 0, page: 1, totalPages: 1 });
        }
      } catch (err) {
        console.error("Table data fetch error:", err);
      } finally {
        setTableDataLoading(false);
      }
    };
    fetchTableData();
  }, [dateRange, selectedHotelId, statusFilter, cityFilter, search, sortBy, page, limit, refreshTrigger]);

  const handleExport = async () => {
    try {
      toast.loading("Preparing Excel file...", { id: "export-hotels" });
      const params = new URLSearchParams({
        range: dateRange,
        hotelId: selectedHotelId,
        status: statusFilter,
        city: cityFilter,
        search,
        sortBy,
      });

      const response = await axios.get(
        `${signupApi}dashboard/platform-analytics/export?${params.toString()}`,
        { headers, responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hotel-report-${dayjs().format("DD-MM-YYYY")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel exported successfully", { id: "export-hotels" });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export hotel data", { id: "export-hotels" });
    }
  };

  const filteredHotels = tableResData.hotels || [];
  const totalPages = tableResData.totalPages || 1;
  const totalRecords = tableResData.total || 0;

  const stats = useMemo(() => {
    return {
      total: platformAnalytics.kpis?.totalHotels || 0,
      totalRooms: platformAnalytics.kpis?.totalRooms || 0,
      totalCustomers: platformAnalytics.kpis?.totalCustomers || 0,
      activeOwners: platformAnalytics.kpis?.activeOwners || 0,
      averageRating: platformAnalytics.kpis?.averageRating || 0,
      totalRevenue: platformAnalytics.kpis?.totalRevenue || 0,
      approvedHotels: platformAnalytics.kpis?.approvedHotels || 0,
      pendingHotels: platformAnalytics.kpis?.pendingHotels || 0,
    };
  }, [platformAnalytics]);

  const locationOf = (hotel) => {
    return [hotel.city?.cityName, hotel.city?.districtId?.districtName, hotel.city?.districtId?.stateId?.stateName].filter(Boolean).join(", ");
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowView(true);
  };

  const handleEdit = (id) => {
    navigate(`/admin/addHotel?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;
    try {
      setTableDataLoading(true);
      await axios.delete(`${signupApi}hotel/delete/${id}`, { headers });
      toast.success("Property deleted successfully.");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete the property.");
    } finally {
      setTableDataLoading(false);
    }
  };

  const monthlyRevenue = platformAnalytics.monthlyRevenue || [];
  const hotelsAddedTrend = platformAnalytics.hotelsAddedTrend || [];
  const hotelStatusData = platformAnalytics.hotelStatusBreakdown || [];
  const hotelsByCityData = platformAnalytics.hotelsByCity || [];

  const kpiCards = useMemo(() => [
    { title: "Total Hotels", value: stats.total, trend: "+8.4%", trendUp: true, color: "text-blue-600", bg: "bg-blue-50", icon: Building2 },
    { title: "Total Rooms", value: stats.totalRooms, trend: "+12.1%", trendUp: true, color: "text-indigo-600", bg: "bg-indigo-50", icon: Building2 },
    { title: "Total Revenue", value: formatMoney(stats.totalRevenue), isFormatted: true, trend: "+14.5%", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-50", icon: Wallet },
    { title: "Total Customers", value: stats.totalCustomers, trend: "+9.2%", trendUp: true, color: "text-purple-600", bg: "bg-purple-50", icon: Users },
    { title: "Average Rating", value: stats.averageRating, trend: "+0.2", trendUp: true, color: "text-amber-600", bg: "bg-amber-50", icon: Star },
    { title: "Active Owners", value: stats.activeOwners, trend: "+6", trendUp: true, color: "text-purple-600", bg: "bg-purple-50", icon: ShieldCheck },
    { title: "Approved Hotels", value: stats.approvedHotels, trend: "+5.3%", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
    { title: "Pending Hotels", value: stats.pendingHotels, trend: "-2", trendUp: false, color: "text-orange-600", bg: "bg-orange-50", icon: Clock },
  ], [stats]);

  const columns = useMemo(
    () => [
      { header: "Hotel Name", accessorKey: "hotelName", cell: (info) => <span className="font-bold text-gray-900">{info.getValue()}</span> },
      { header: "City", accessorKey: "city.cityName", cell: (info) => <span className="text-gray-600">{info.getValue() || "N/A"}</span> },
      { header: "Rooms", accessorKey: "totalRooms", cell: (info) => <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">{info.getValue() || 0}</span> },
      { header: "Revenue", accessorKey: "totalRevenue", cell: (info) => <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold font-['IBM_Plex_Mono']">{formatMoney(info.getValue() || 0)}</span> },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue();
          const color = statusColorMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
          return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${color}`}>{status}</span>;
        },
      },
      { header: "Created Date", accessorKey: "createdAt", cell: (info) => <span className="text-gray-500">{dayjs(info.getValue()).format("DD MMM YYYY")}</span> },
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
              <button onClick={() => handleDelete(hotel._id)} className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-rose-600 hover:text-white transition shadow-2xs cursor-pointer">
                Delete
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

        {/* 🌟 1. REDESIGNED TOP HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm gap-6">

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-gray-900 tracking-tight m-0">Admin Console</h1>
              <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md font-bold font-['IBM_Plex_Mono'] border border-gray-200 uppercase tracking-wider">
                Updated {dayjs(lastUpdated).format("HH:mm")}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium m-0">
              Platform-wide overview of hotels, management metrics, and financial analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 w-full lg:w-auto">
            {/* Filter Group Box */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-xl border border-gray-200 shadow-2xs">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer w-32 sm:w-auto truncate"
                >
                  <option value="all">All Hotels (Platform)</option>
                  {allHotelsList.map(h => (
                    <option key={h._id} value={h._id}>{h.hotelName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-xl border border-gray-200 shadow-2xs">
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
                  <option value="all">All-Time</option>
                </select>
              </div>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
              >
                <Download size={15} /> Export
              </button>
              <button
                onClick={() => navigate("/admin/addHotel")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
              >
                <Building2 size={15} /> Add Hotel
              </button>
            </div>
          </div>
        </div>

        {/* 8 KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <motion.div key={index} variants={itemVariants} className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-['IBM_Plex_Mono']">{kpi.title}</p>
                    {analyticsLoading ? (
                      <Skeleton width={80} height={28} />
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-['Space_Grotesk']">
                        {kpi.isFormatted ? kpi.value : <CountUp end={kpi.value} duration={2} separator="," />}
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

        {/* 📈 4 CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue Trend Area Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-1">Revenue Trend</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">Monthly revenue performance</p>
            <div className="h-[240px] w-full">
              {analyticsLoading ? (
                <Skeleton height={220} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(val) => formatMoney(val)} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }} formatter={(value) => [formatMoney(value), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Hotels Added Trend Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-1">Hotels Added Trend</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">Property onboarding growth</p>
            <div className="h-[240px] w-full">
              {analyticsLoading ? (
                <Skeleton height={220} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hotelsAddedTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Hotel Status Distribution Pie Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-2">Hotel Status Distribution</h3>
            <div className="flex items-center justify-between">
              {analyticsLoading ? (
                <div className="w-full"><Skeleton height={150} /></div>
              ) : hotelStatusData.length === 0 ? (
                <div className="w-full text-center text-xs text-gray-400 py-8">No status distribution data available</div>
              ) : (
                <>
                  <div className="space-y-2 text-xs">
                    {hotelStatusData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#10B981", "#F59E0B", "#F43F5E"][idx % 3] }}></span>
                        <span className="text-gray-600 font-medium">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-[150px] w-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={hotelStatusData} innerRadius={42} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                          {hotelStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={["#10B981", "#F59E0B", "#F43F5E"][index % 3]} />
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

          {/* Hotels by City Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-3">Hotels by City</h3>
            <div className="h-[190px] w-full">
              {analyticsLoading ? (
                <Skeleton height={170} />
              ) : hotelsByCityData.length === 0 ? (
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
        </div>

        {/* 🌟 2. REDESIGNED SEARCH, LIMIT & FILTERS BAR */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col xl:flex-row gap-5 items-center justify-between mt-8">

          <div className="relative w-full xl:w-[400px] shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by hotel name, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 h-11 text-xs font-medium focus:outline-none focus:border-blue-500 transition shadow-2xs bg-gray-50/50 focus:bg-white text-gray-900"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 h-11 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-gray-500">Rows:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 h-11 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs w-full sm:w-auto">
              <ArrowDownAZ className="text-gray-400" size={15} />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-transparent outline-none cursor-pointer w-full text-gray-800 font-bold"
              >
                <option value="city">Sort: City (A-Z)</option>
                <option value="latest">Sort: Latest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="revenue">Sort: High Revenue</option>
                <option value="rooms">Sort: Max Rooms</option>
              </select>
            </div>
          </div>

        </div>

        {/* 🗂️ TABS FILTER */}
        <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none">
          {["All", "Pending", "Approved", "Rejected"].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`px-5 py-3 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 cursor-pointer ${isActive
                  ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                  }`}
              >
                {status} Listings
              </button>
            );
          })}
        </div>

        {/* 📋 HOTEL PERFORMANCE TABLE WITH OVERLAY LOADER */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 overflow-hidden flex flex-col relative min-h-[300px]">
          {tableDataLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all duration-200">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">Hotel Performance Directory</h3>
            <span className="text-xs font-bold text-gray-400 font-['IBM_Plex_Mono']">Total Records: {totalRecords}</span>
          </div>

          {filteredHotels.length === 0 ? (
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

          {/* Numeric Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-5 border-t border-gray-100 mt-4 text-xs gap-3">
            <p className="text-gray-500 font-medium">
              Showing page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages || 1}</strong>
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isSelected = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition shadow-2xs cursor-pointer flex items-center justify-center ${isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          </div>
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
                </div>

                <div className="space-y-3.5">
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Geographic Region & Address</p>
                    <h3 className="font-bold text-gray-900 text-xs">{locationOf(selectedHotel) || "No Region Data Linked"}</h3>
                    <p className="font-medium text-gray-600 mt-1 leading-relaxed">{selectedHotel.address}</p>
                  </div>
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