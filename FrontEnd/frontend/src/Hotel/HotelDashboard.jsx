import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { motion } from "framer-motion";
import dayjs from "dayjs";
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
    CalendarCheck, BedDouble, Wallet, Star, LogIn, LogOut, TrendingUp, CheckCircle2, ChevronRight, Calendar, Download
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
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Checked In": "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-sky-50 text-sky-700 border-sky-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200"
};

const HotelDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [dateRange, setDateRange] = useState("today");
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchDashboardData(dateRange);
    }, [dateRange]);

    const fetchDashboardData = async (range) => {
        try {
            setLoading(true);
            setErrorMsg("");
            const token = localStorage.getItem("token");

            if (!token) {
                setErrorMsg("Session expired. Please log in again.");
                return;
            }

            const response = await axios.get(`${signupApi}dashboard/summary?range=${range}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.success) {
                setDashboardData(response.data);
                setLastUpdated(new Date());
            } else {
                setErrorMsg("Failed to parse dashboard analytics.");
            }
        } catch (err) {
            console.error("Dashboard API Fetch Error:", err);
            setErrorMsg(err.response?.data?.message || "Could not synchronize with backend clusters.");
            toast.error("Data sync failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Export Handler ---
    const handleExport = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            toast.loading("Preparing Dashboard Report...", { id: "export-dashboard" });

            const response = await axios.get(
                `${signupApi}dashboard/summary/export?range=${dateRange}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `hotel-dashboard-report-${dayjs().format("DD-MM-YYYY")}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Report exported successfully!", { id: "export-dashboard" });
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export dashboard data.", { id: "export-dashboard" });
        }
    };

    const {
        monthlyRevenue = [],
        bookingTrend = [],
        recentBookings = [],
        recentReviews = [],
        ratingSummary = { averageRating: 0, totalReviews: 0, categories: { cleanliness: 0, staff: 0, location: 0, valueForMoney: 0 } },
        summary = {},
    } = dashboardData || {};

    const columns = useMemo(
        () => [
            { header: "Booking ID", accessorKey: "bookingId", cell: (info) => <span className="font-mono text-xs font-bold text-gray-600">{info.getValue()}</span> },
            { header: "Guest Name", accessorKey: "userId.name", cell: (info) => <span className="font-bold text-gray-900">{info.getValue() || "Guest User"}</span> },
            { header: "Room Type", accessorKey: "roomId.roomType", cell: (info) => <span className="text-gray-600 font-medium">{info.getValue() || "Standard"}</span> },
            { header: "Room No", accessorKey: "roomId.roomNumber", cell: (info) => <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-[11px] font-bold font-['IBM_Plex_Mono']">{info.getValue() || "101"}</span> },
            { header: "Check-In", accessorKey: "checkIn", cell: (info) => <span className="text-gray-500 text-xs">{dayjs(info.getValue()).format("DD MMM YYYY")}</span> },
            {
                header: "Status",
                accessorKey: "bookingStatus",
                cell: (info) => {
                    const status = info.getValue();
                    const color = statusColorMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
                    return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${color}`}>{status}</span>;
                },
            },
            { header: "Amount", accessorKey: "finalAmount", cell: (info) => <span className="font-bold text-emerald-600 font-['IBM_Plex_Mono'] text-xs">₹{(info.getValue() || 0).toLocaleString()}</span> },
        ],
        []
    );

    const table = useReactTable({
        data: recentBookings,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const kpiCards = useMemo(() => [
        { title: "Bookings", value: summary.todayBookings || 0, trend: "+8.7%", trendUp: true, color: "text-blue-600", bg: "bg-blue-50", icon: CalendarCheck },
        { title: "Check-Ins", value: summary.todayCheckIns || 0, trend: "+3.5%", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-50", icon: LogIn },
        { title: "Check-Outs", value: summary.todayCheckOuts || 0, trend: "-1.0%", trendUp: false, color: "text-rose-600", bg: "bg-rose-50", icon: LogOut },
        { title: "Total Revenue", value: summary.todayRevenue || 0, prefix: "₹", trend: "+5.7%", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-50", icon: Wallet },
    ], [summary]);

    if (errorMsg) {
        return (
            <div className="flex h-full min-h-[400px] items-center justify-center p-6 bg-gray-50">
                <div className="border border-red-200 rounded-xl py-8 px-6 text-center text-red-700 bg-white max-w-md shadow-sm">
                    <h3 className="font-bold text-xl mb-2 text-gray-900">Sync Interrupted</h3>
                    <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" richColors />

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 w-full pb-16 max-w-[1600px] mx-auto text-gray-800 font-['Inter',sans-serif]">
                
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>

                {/* 🌟 1. REDESIGNED TOP HEADER */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-gray-900 tracking-tight m-0">Hotel Dashboard</h1>
                            <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md font-bold font-['IBM_Plex_Mono'] border border-gray-200 uppercase tracking-wider hidden sm:inline-block">
                                Updated {dayjs(lastUpdated).format("HH:mm")}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium m-0">
                            Welcome back! Monitor bookings and complete financial yield.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 w-full lg:w-auto">
                        {/* Filter Group Box */}
                        <div className="flex flex-wrap items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 w-full sm:w-auto">
                            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 h-11 w-full sm:w-auto rounded-xl border border-gray-200 shadow-2xs">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar size={15} />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline-block">Date:</span>
                                </div>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer text-right sm:text-left"
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
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                            >
                                <Download size={15} /> Export Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. TOP 4 METRIC CARDS */}
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

                {/* 3. REVENUE ANALYTICS & GUEST RATING */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Revenue Area Chart */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 lg:col-span-2 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">Revenue Analytics</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Complete monthly financial yield overview</p>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md font-['IBM_Plex_Mono'] uppercase tracking-widest border border-blue-100">All-Time</span>
                        </div>
                        {loading ? (
                            <Skeleton height={240} className="rounded-xl" />
                        ) : (
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="classicGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px", fontWeight: "bold" }} formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#classicGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </motion.div>

                    {/* Guest Rating Box */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">Guest Rating</h3>
                                <span className="text-[10px] text-gray-500 font-bold bg-gray-50 border border-gray-200 px-2 py-1 rounded-md uppercase tracking-wider">{ratingSummary.totalReviews} Reviews</span>
                            </div>

                            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/60 mb-6 shadow-inner">
                                <div className="bg-amber-500 text-white px-3 py-2 rounded-xl font-bold text-xl flex items-center gap-1.5 shadow-sm">
                                    {ratingSummary.averageRating} <Star size={16} className="fill-white text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm tracking-tight">Excellent</h4>
                                    <p className="text-[11px] text-gray-500 font-medium">Based on verified feedback</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Cleanliness", val: ratingSummary.categories.cleanliness },
                                    { label: "Staff Service", val: ratingSummary.categories.staff },
                                    { label: "Location", val: ratingSummary.categories.location },
                                    { label: "Value for Money", val: ratingSummary.categories.valueForMoney }
                                ].map((cat, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                                            <span>{cat.label}</span>
                                            <span className="text-gray-900">{cat.val}/5</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(cat.val / 5) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 4. ROOM INVENTORY & WEEKLY TREND */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* Room Inventory Pie */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col justify-between">
                        <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-2">Room Inventory</h3>
                        {loading ? (
                            <Skeleton height={130} className="rounded-xl mt-2" />
                        ) : (
                            <div className="flex items-center justify-between mt-4">
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs"></span>
                                        <span className="text-gray-600 font-medium">Available: <strong className="text-gray-900 ml-1">{summary.availableRooms || 0}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-2xs"></span>
                                        <span className="text-gray-600 font-medium">Occupied: <strong className="text-gray-900 ml-1">{summary.occupiedRooms || 0}</strong></span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-['IBM_Plex_Mono'] pt-2 border-t border-gray-100">
                                        Total Capacity: {summary.totalRooms || 0}
                                    </p>
                                </div>
                                <div className="h-[110px] w-[110px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Available", value: summary.availableRooms || 0 },
                                                    { name: "Occupied", value: summary.occupiedRooms || 0 }
                                                ]}
                                                innerRadius={35}
                                                outerRadius={50}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                <Cell fill="#10B981" />
                                                <Cell fill="#3B82F6" />
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px", fontWeight: "bold", border: "1px solid #E5E7EB" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Booking Trend Bar */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-1">Weekly Booking Trend</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4 font-['IBM_Plex_Mono']">Last 7 Days</p>
                        <div className="h-[120px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bookingTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                                    <Bar dataKey="bookings" fill="#10B981" radius={[4, 4, 0, 0]} barSize={22} />
                                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px", fontWeight: "bold" }} cursor={{fill: 'transparent'}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Recent Feedback */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk'] mb-4">Recent Guest Feedback</h3>
                        <div className="space-y-3 overflow-y-auto max-h-[140px] pr-2 scrollbar-hide">
                            {recentReviews.length === 0 ? (
                                <p className="text-xs text-gray-400 font-medium">No reviews logged yet.</p>
                            ) : (
                                recentReviews.slice(0, 3).map((rev, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 size={12} />
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <p className="text-xs font-bold text-gray-900 truncate">{rev.userId?.name || "Guest"}</p>
                                            <p className="text-[11px] text-gray-600 italic truncate mt-0.5">"{rev.review || "Wonderful stay!"}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* 5. BOOKING LIST TABLE */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 text-base font-['Space_Grotesk']">Recent Bookings Directory</h3>
                        <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition uppercase tracking-wider">
                            View All <ChevronRight size={13} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-3"><Skeleton count={4} height={45} className="rounded-xl" /></div>
                    ) : recentBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <CalendarCheck size={40} className="text-gray-200 mb-3" />
                            <p className="text-gray-500 text-xs font-medium">No bookings recorded in this timeframe.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-bold font-['IBM_Plex_Mono'] border-b border-gray-200">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th key={header.id} className="px-4 py-3.5 font-semibold">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="text-gray-700 divide-y divide-gray-100">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-4 py-3.5">
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
        </>
    );
};

export default HotelDashboard;