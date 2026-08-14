import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import {
    Building2, UserCheck, Trash2, Edit, Search, Bed, MapPin, ShieldCheck, RefreshCw, Map, Layers, Clock, Globe, SlidersHorizontal, IndianRupee, Eye, X, Download
} from "lucide-react";
import {
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { Toaster, toast } from "sonner";
import CountUpModule from "react-countup";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const CountUp = CountUpModule.default || CountUpModule;

const formatMoney = (amount) => {
    const num = Number(amount || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString()}`;
};

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [cards, setCards] = useState({
        totalHotels: 0,
        totalAdmins: 0,
        totalRooms: 0,
        totalRevenue: 0,
        totalCities: 0,
        totalStates: 0,
        totalDistricts: 0,
        pendingHotels: 0
    });
    const [executiveSummary, setExecutiveSummary] = useState({
        bestAdmin: "N/A",
        topCity: "N/A",
        largestHotel: "N/A",
        maxRooms: 0,
        highestRevenueState: "N/A"
    });
    const [charts, setCharts] = useState({
        hotelsByAdmin: [],
        hotelsByCity: [],
        hotelsByState: [],
        hotelStatus: [],
        newHotelsPerMonth: [],
        topAdminsManaged: []
    });
    const [platformHealth, setPlatformHealth] = useState({
        approvedHotels: 0,
        pending: 0,
        rejected: 0,
        approvalRate: 0,
        totalAdmins: 0,
        avgHotelsPerAdmin: 0
    });
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState("all");
    const [filterId, setFilterId] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [dropdowns, setDropdowns] = useState({ admins: [], cities: [], states: [], hotels: [] });

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewHotel, setViewHotel] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchDropdownOptions();
    }, []);

    useEffect(() => {
        fetchDashboardAnalytics();
    }, [filterType, filterId, statusFilter, searchTerm, sortBy, page, limit]);

    const fetchDropdownOptions = async () => {
        try {
            const res = await axios.get(`${signupApi}dashboard/superAdmin/options`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDropdowns(res.data || {});
        } catch (error) {
            console.error("Error fetching dropdown options:", error);
        }
    };

    const fetchDashboardAnalytics = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                filter: filterType,
                id: filterId,
                status: statusFilter,
                search: searchTerm,
                sortBy,
                page,
                limit
            });

            const res = await axios.get(`${signupApi}dashboard/superAdmin/dashboard?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCards(res.data.cards || {});
            setExecutiveSummary(res.data.executiveSummary || {});
            setCharts(res.data.charts || {});
            setPlatformHealth(res.data.platformHealth || {});
            setHotels(res.data.hotels || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalRecords(res.data.total || 0);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching dashboard analytics:", error);
            toast.error("Failed to fetch analytics data.");
        } finally {
            setLoading(false);
        }
    };

    // --- Excel Export Function ---
    const handleExport = async () => {
        try {
            toast.info("Preparing Excel Export...");

            const params = {
                filter: filterType || "all",
                id: filterId || "all",
                status: statusFilter || "all",
                search: searchTerm || "",
                sortBy: sortBy || "newest",
            };

            const response = await axios.get(
                `${signupApi}dashboard/superAdmin/dashboard/export`,
                {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "hotel_dashboard.xlsx";

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Dashboard successfully exported!");
        } catch (error) {
            console.error("Export Error:", error.response?.data || error);
            toast.error("Failed to export dashboard data.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this hotel?")) return;
        try {
            await axios.delete(`${signupApi}hotel/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHotels((prev) => prev.filter((h) => h._id !== id));
            toast.success("Hotel deleted successfully.");
            fetchDashboardAnalytics();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete hotel");
        }
    };

    const cardTitle = useMemo(() => {
        if (filterType === "admin") return "Hotels Managed";
        if (filterType === "city") return "Hotels in City";
        if (filterType === "state") return "Hotels in State";
        if (filterType === "hotel") return "Property Rooms";
        return "Total Hotels";
    }, [filterType]);

    const kpiCards = useMemo(() => [
        { title: cardTitle, value: cards.totalHotels, subtitle: "Active establishments", color: "text-blue-600", bg: "bg-blue-50/80", border: "border-blue-100", icon: Building2, trend: "+5.2%" },
        { title: "Total Admins", value: cards.totalAdmins, subtitle: "Managing operations", color: "text-purple-600", bg: "bg-purple-50/80", border: "border-purple-100", icon: ShieldCheck, trend: "Active" },
        { title: "Total Rooms", value: cards.totalRooms, subtitle: "Total hotel inventory", color: "text-indigo-600", bg: "bg-indigo-50/80", border: "border-indigo-100", icon: Bed, trend: "+12%" },
        { title: "Total Revenue", value: cards.totalRevenue, isCurrency: true, subtitle: "Platform revenue", color: "text-emerald-600", bg: "bg-emerald-50/80", border: "border-emerald-100", icon: IndianRupee, trend: "+18%" },
        { title: "Total States", value: cards.totalStates, subtitle: "Regional presence", color: "text-blue-600", bg: "bg-blue-50/80", border: "border-blue-100", icon: Map, trend: "Pan-India" },
        { title: "Total Cities", value: cards.totalCities, subtitle: "Active urban hubs", color: "text-cyan-600", bg: "bg-cyan-50/80", border: "border-cyan-100", icon: MapPin, trend: "Top Hub" },
        { title: "Total Districts", value: cards.totalDistricts, subtitle: "Zonal partitions", color: "text-amber-600", bg: "bg-amber-50/80", border: "border-amber-100", icon: Layers, trend: "Zones" },
        { title: "Pending Hotel Approvals", value: cards.pendingHotels, alert: cards.pendingHotels > 0, subtitle: "Awaiting review", color: "text-orange-600", bg: "bg-orange-50/80", border: "border-orange-100", icon: Clock, link: "/superAdmin/pendingHotels", trend: "Action Req" },
    ], [cards, cardTitle]);

    const activeScopeLabel = useMemo(() => {
        if (filterType === "all") return null;
        if (filterType === "admin") {
            const adm = dropdowns.admins?.find(a => a._id === filterId);
            return `Admin : ${adm ? adm.name : "Selected"}`;
        }
        if (filterType === "city") {
            const c = dropdowns.cities?.find(x => x._id === filterId);
            return `City : ${c ? c.cityName : "Selected"}`;
        }
        if (filterType === "state") {
            const s = dropdowns.states?.find(x => x._id === filterId);
            return `State : ${s ? s.stateName : "Selected"}`;
        }
        if (filterType === "hotel") {
            const h = dropdowns.hotels?.find(x => x._id === filterId);
            return `Hotel : ${h ? h.hotelName : "Selected"}`;
        }
        return null;
    }, [filterType, filterId, dropdowns]);

    return (
        <div className="space-y-6 font-['Inter',sans-serif] text-gray-800 pb-20 max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-gray-100/30 min-h-screen">
            <Toaster position="top-right" richColors />

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Top Header Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white/85 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-gray-200/60 shadow-xs mt-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[0.25em] uppercase border border-blue-200/80">
                            ENTERPRISE EXECUTIVE CONSOLE
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live System Sync
                        </span>
                    </div>
                    <h1 className="font-['Space_Grotesk'] font-bold text-2xl sm:text-3xl text-gray-900 tracking-tight m-0">
                        Platform Intelligence & Oversight
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                        Last Updated: {dayjs(lastUpdated).fromNow()}
                    </span>
                    <button
                        onClick={fetchDashboardAnalytics}
                        className="p-3 bg-white hover:bg-gray-50 border border-gray-200/80 rounded-2xl text-gray-700 transition shadow-2xs cursor-pointer flex items-center gap-2 text-xs font-bold"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* GLOBAL ANALYTICS SCOPE SELECTOR BAR */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 border border-blue-900/50 relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-4 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-300 border border-white/10 shrink-0 shadow-inner">
                        <Globe size={24} />
                    </div>
                    <div>
                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[0.25em] text-blue-300 uppercase m-0">
                            HIERARCHICAL SCOPE ENGINE
                        </p>
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg m-0 text-white mt-0.5">
                            Interactive Drill-Down & Multi-Entity Filtering
                        </h3>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto z-10">
                    <div className="flex items-center bg-blue-900/60 border border-blue-700/60 backdrop-blur-md rounded-2xl p-1 w-full sm:w-auto shadow-inner">
                        <span className="text-[11px] font-bold text-blue-200 px-3 font-['IBM_Plex_Mono'] uppercase flex items-center gap-1.5">
                            <SlidersHorizontal size={13} /> Scope:
                        </span>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setFilterId("all");
                                setStatusFilter("all");
                                setPage(1);
                            }}
                            className="bg-blue-800/90 text-white rounded-xl px-3.5 h-9 text-xs font-semibold outline-none cursor-pointer border-0"
                        >
                            <option value="all">🌐 All Platform Data</option>
                            <option value="admin">👨‍💼 Admin-Wise View</option>
                            <option value="city">🏙 City-Wise View</option>
                            <option value="state">🗺 State-Wise View</option>
                            <option value="hotel">🏨 Hotel-Wise Inspector</option>
                        </select>
                    </div>

                    {filterType === "admin" && (
                        <select
                            value={filterId}
                            onChange={(e) => { setFilterId(e.target.value); setPage(1); }}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer shadow-md"
                        >
                            <option value="all">Select Specific Admin...</option>
                            {dropdowns.admins?.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                        </select>
                    )}

                    {filterType === "city" && (
                        <select
                            value={filterId}
                            onChange={(e) => { setFilterId(e.target.value); setPage(1); }}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer shadow-md"
                        >
                            <option value="all">Select Specific City...</option>
                            {dropdowns.cities?.map(c => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                        </select>
                    )}

                    {filterType === "state" && (
                        <select
                            value={filterId}
                            onChange={(e) => { setFilterId(e.target.value); setPage(1); }}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer shadow-md"
                        >
                            <option value="all">Select Specific State...</option>
                            {dropdowns.states?.map(s => <option key={s._id} value={s._id}>{s.stateName}</option>)}
                        </select>
                    )}

                    {filterType === "hotel" && (
                        <select
                            value={filterId}
                            onChange={(e) => { setFilterId(e.target.value); setPage(1); }}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer max-w-[260px] truncate shadow-md"
                        >
                            <option value="all">Select Specific Hotel...</option>
                            {dropdowns.hotels?.map(h => <option key={h._id} value={h._id}>{h.hotelName}</option>)}
                        </select>
                    )}

                    {(filterType !== "all" || statusFilter !== "all") && (
                        <button
                            onClick={() => { setFilterType("all"); setFilterId("all"); setStatusFilter("all"); setPage(1); }}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 h-11 rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Active Scope Chip Display */}
            {(activeScopeLabel || statusFilter !== "all") && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-5 py-3 rounded-2xl w-fit text-xs font-bold text-blue-900 shadow-2xs">
                    <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-blue-500">Current Scope:</span>
                    {activeScopeLabel && <span className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">{activeScopeLabel}</span>}
                    {statusFilter !== "all" && <span className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">Status : {statusFilter}</span>}
                    <span className="text-gray-400 font-normal">| {totalRecords} Total Properties</span>
                    <button onClick={() => { setFilterType("all"); setFilterId("all"); setStatusFilter("all"); setPage(1); }} className="ml-2 text-rose-600 hover:text-rose-800 cursor-pointer flex items-center">
                        <X size={14} /> Clear
                    </button>
                </div>
            )}

            {/* EXECUTIVE SUMMARY CARD */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-gray-100 pb-4 sm:pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">⭐</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Top Performing Admin</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5">{executiveSummary.bestAdmin}</h4>
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">Top Revenue Generator</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-gray-100 pb-4 sm:pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">🏙</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Top City Hub</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5">{executiveSummary.topCity}</h4>
                        <p className="text-[11px] font-semibold text-blue-600 mt-0.5">High Density Cluster</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-gray-100 pb-4 sm:pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">🏨</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Largest Property</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5 truncate max-w-[180px]">{executiveSummary.largestHotel}</h4>
                        <p className="text-[11px] font-semibold text-purple-600 mt-0.5">{executiveSummary.maxRooms} Rooms Capacity</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">💰</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Highest Revenue State</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5 truncate max-w-[180px]">{executiveSummary.highestRevenueState}</h4>
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">Leading Region</p>
                    </div>
                </div>
            </div>

            {/* 8 KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                {kpiCards.map((kpi, index) => {
                    const IconComponent = kpi.icon;
                    return (
                        <div
                            key={index}
                            onClick={() => kpi.link && navigate(kpi.link)}
                            className={`bg-white p-5 rounded-3xl shadow-2xs border ${kpi.border} flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 ${kpi.link ? "cursor-pointer" : ""}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
                                    <IconComponent size={19} />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {kpi.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-0.5">{kpi.title}</p>
                                {loading ? (
                                    <Skeleton width={80} height={24} />
                                ) : (
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight font-['Space_Grotesk'] m-0 flex items-center">
                                        {kpi.isCurrency ? formatMoney(kpi.value) : <CountUp end={kpi.value} duration={2} separator="," />}
                                    </h3>
                                )}
                                <p className="text-[11px] text-gray-400 font-medium mt-1 truncate">{kpi.subtitle}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CHARTS ROW (1 to 6) */}
            {filterType !== "hotel" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Admin Performance */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Admin Performance</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5 mb-4">Click any bar to filter dashboard by that Admin</p>
                        <div className="h-[280px] w-full">
                            {loading ? (
                                <Skeleton height={250} />
                            ) : charts?.hotelsByAdmin?.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400">No admin performance data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={charts.hotelsByAdmin}
                                        margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
                                        onClick={(e) => {
                                            if (e && e.activePayload && e.activePayload.length > 0) {
                                                const adminId = e.activePayload[0].payload.id;
                                                if (adminId && adminId !== "unassigned") {
                                                    setFilterType("admin");
                                                    setFilterId(adminId);
                                                    setPage(1);
                                                    toast.success(`Filtered by Admin: ${e.activePayload[0].payload.admin}`);
                                                }
                                            }
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                        <XAxis dataKey="admin" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(val) => formatMoney(val)} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                                            <p className="font-bold text-sm text-purple-300">{data.admin}</p>
                                                            <p>Hotels : <strong className="text-white">{data.hotels}</strong></p>
                                                            <p>Rooms : <strong className="text-white">{data.rooms}</strong></p>
                                                            <p>Revenue : <strong className="text-white">{formatMoney(data.revenue)}</strong></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="#8B5CF6" radius={[8, 8, 0, 0]} barSize={34} cursor="pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* 2. Hotel Status Distribution */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col justify-between">
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Hotel Status Distribution</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5 mb-2">Approved / Pending / Rejected</p>
                        <div className="flex flex-col sm:flex-row items-center justify-around py-4">
                            {loading ? (
                                <Skeleton height={180} width={180} circle />
                            ) : charts?.hotelStatus?.length === 0 ? (
                                <div className="text-xs text-gray-400">No status data available</div>
                            ) : (
                                <>
                                    <div className="space-y-3 text-xs mb-4 sm:mb-0">
                                        {charts?.hotelStatus?.map((item, idx) => (
                                            <div key={idx} onClick={() => { setStatusFilter(item.name); setPage(1); toast.success(`Filtered table by status: ${item.name}`); }} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition">
                                                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: ["#10B981", "#F59E0B", "#F43F5E"][idx % 3] }}></span>
                                                <span className="text-gray-600 font-semibold">{item.name}: <strong className="text-gray-900 font-['Space_Grotesk'] text-sm ml-1">{item.value}</strong></span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-[180px] w-[180px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={charts.hotelStatus}
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={6}
                                                    dataKey="value"
                                                    stroke="none"
                                                    onClick={(entry) => {
                                                        setStatusFilter(entry.name);
                                                        setPage(1);
                                                        toast.success(`Filtered by Status: ${entry.name}`);
                                                    }}
                                                    cursor="pointer"
                                                >
                                                    {charts?.hotelStatus?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={["#10B981", "#F59E0B", "#F43F5E"][index % 3]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. Hotels by State */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Hotels by State</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5 mb-4">Click any bar to filter by State</p>
                        <div className="h-[280px] w-full">
                            {loading ? (
                                <Skeleton height={250} />
                            ) : charts?.hotelsByState?.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400">No state data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={charts.hotelsByState}
                                        margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                                        onClick={(e) => {
                                            if (!e?.activePayload?.length) return;
                                            const state = e.activePayload[0].payload;
                                            if (state.id && state.id !== "other") {
                                                setFilterType("state");
                                                setFilterId(state.id);
                                                setPage(1);
                                                toast.success(`Filtered by State: ${state.state}`);
                                            }
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                        <XAxis dataKey="state" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} barSize={34} cursor="pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* 4. Hotels by City */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Hotels by City</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5 mb-4">Click bar to filter dashboard by City</p>
                        <div className="h-[280px] w-full">
                            {loading ? (
                                <Skeleton height={250} />
                            ) : charts?.hotelsByCity?.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400">No city data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={charts.hotelsByCity}
                                        margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                                        onClick={(e) => {
                                            if (e && e.activePayload && e.activePayload.length > 0) {
                                                const cityId = e.activePayload[0].payload.id;
                                                if (cityId && cityId !== "other") {
                                                    setFilterType("city");
                                                    setFilterId(cityId);
                                                    setPage(1);
                                                    toast.success(`Filtered by City: ${e.activePayload[0].payload.city}`);
                                                }
                                            }
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                        <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <Tooltip />
                                        <Bar dataKey="hotels" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={34} cursor="pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* 5th Chart (New): New Hotels Added Per Month */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">New Hotels Added Per Month</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5 mb-4">Platform growth trajectory</p>
                        <div className="h-[280px] w-full">
                            {loading ? (
                                <Skeleton height={250} />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts?.newHotelsPerMonth || []} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="hotelGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#hotelGrowthGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* 6th Chart (New): Top 5 Admins (Hotels Managed) */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Top 5 Admins (Hotels Managed)</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5 mb-4">Property count per administrator</p>
                        <div className="h-[280px] w-full">
                            {loading ? (
                                <Skeleton height={250} />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts?.topAdminsManaged || []} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                        <XAxis dataKey="admin" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <Tooltip />
                                        <Bar dataKey="hotelsCount" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={34} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-3xl shadow-2xs border border-gray-200/80 text-center space-y-3">
                    <Building2 className="mx-auto text-blue-600" size={40} />
                    <h3 className="font-['Space_Grotesk'] text-xl font-bold text-gray-900">Hotel-Wise Focused Inspection Active</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">You have selected a specific hotel scope. Review full establishment specifications in the directory table below.</p>
                </div>
            )}

            {/* Platform Health Card (New) */}
            <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-indigo-950 text-white p-7 rounded-3xl shadow-xl border border-gray-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-4">
                    <div>
                        <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-emerald-400 uppercase tracking-[0.25em]">SYSTEM INTEGRITY & METRICS</span>
                        <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white m-0 mt-0.5">Platform Health</h3>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold">
                        Optimal Operation
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-2">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-['IBM_Plex_Mono'] mb-1">Approved Hotels</p>
                        <p className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">{platformHealth.approvedHotels}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-['IBM_Plex_Mono'] mb-1">Pending</p>
                        <p className="text-2xl font-bold text-amber-400 font-['Space_Grotesk']">{platformHealth.pending}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-['IBM_Plex_Mono'] mb-1">Rejected</p>
                        <p className="text-2xl font-bold text-rose-400 font-['Space_Grotesk']">{platformHealth.rejected}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-['IBM_Plex_Mono'] mb-1">Approval Rate</p>
                        <p className="text-2xl font-bold text-blue-400 font-['Space_Grotesk']">{platformHealth.approvalRate}%</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-['IBM_Plex_Mono'] mb-1">Total Admins</p>
                        <p className="text-2xl font-bold text-purple-400 font-['Space_Grotesk']">{platformHealth.totalAdmins}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-['IBM_Plex_Mono'] mb-1">Avg Hotels/Admin</p>
                        <p className="text-2xl font-bold text-cyan-400 font-['Space_Grotesk']">{platformHealth.avgHotelsPerAdmin}</p>
                    </div>
                </div>
            </div>

            {/* Properties Directory Table Section */}
            <div className="bg-white border border-gray-200/80 rounded-3xl shadow-2xs overflow-hidden flex flex-col relative min-h-[350px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all duration-200">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="p-6 sm:p-7 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-gray-50/50">
                    <div>
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Properties Directory</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">Total Records: {totalRecords}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer shrink-0"
                        >
                            <Download size={16} />
                            Export
                        </button>

                        <div className="relative flex-1 sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email, tracking ID..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 h-11 text-xs font-medium focus:outline-none focus:border-blue-500 transition bg-white text-gray-900 shadow-2xs"
                            />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 h-11 rounded-2xl text-xs font-semibold text-gray-700 shadow-2xs">
                            <span>Show:</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="w-full sm:w-48 border border-gray-200 rounded-2xl px-3.5 h-11 text-xs font-semibold outline-none bg-white text-gray-700 cursor-pointer shadow-2xs"
                        >
                            <option value="newest">Sort: Latest</option>
                            <option value="oldest">Sort: Oldest</option>
                            <option value="name">Sort: Name (A-Z)</option>
                            <option value="rooms">Sort: Rooms</option>
                            <option value="revenue">Sort: Revenue</option>
                        </select>
                    </div>
                </div>

                {hotels.length === 0 ? (
                    <div className="text-center py-24">
                        <Building2 className="mx-auto text-gray-300 mb-3" size={44} />
                        <h4 className="font-['Space_Grotesk'] text-base font-bold text-gray-900 mb-1">No Properties Found</h4>
                        <p className="text-xs text-gray-500 font-medium">No establishments match the selected criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4">Hotel Name</th>
                                    <th className="px-6 py-4">Admin</th>
                                    <th className="px-6 py-4">City</th>
                                    <th className="px-6 py-4">State</th>
                                    <th className="px-6 py-4">Rooms</th>
                                    <th className="px-6 py-4">Revenue</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Created Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {hotels.map((hotel) => (
                                    <tr key={hotel._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-11 h-11 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                                                    {hotel.hotelImages?.[0] ? (
                                                        <img src={hotel.hotelImages[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 className="text-gray-400" size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-xs">{hotel.hotelName}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{hotel.hotelEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {hotel.adminInfo?.name ? (
                                                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                                    <UserCheck size={14} className="text-purple-600" />
                                                    {hotel.adminInfo.name}
                                                </div>
                                            ) : (
                                                <span className="text-rose-600 font-semibold">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 text-xs flex items-center gap-1">
                                                <MapPin size={13} className="text-blue-600" />
                                                {hotel.cityInfo?.cityName || "Unspecified"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 font-semibold">
                                                {hotel.stateName || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 font-['IBM_Plex_Mono'] text-xs">
                                                {hotel.totalRooms || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-['IBM_Plex_Mono'] text-xs">
                                                {formatMoney(hotel.totalRevenue || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${hotel.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                hotel.status === "Pending" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                    "bg-rose-50 text-rose-700 border-rose-200"
                                                }`}>
                                                {hotel.status || "Approved"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {dayjs(hotel.createdAt).format("DD MMM YYYY")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setViewHotel(hotel); setShowViewModal(true); }}
                                                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-300 inline-flex items-center justify-center transition shadow-2xs cursor-pointer"
                                                    title="Inspect Profile"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/superAdmin/addHotel?id=${hotel._id}`)}
                                                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-indigo-600 hover:border-indigo-300 inline-flex items-center justify-center transition shadow-2xs cursor-pointer"
                                                    title="Edit Property"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(hotel._id)}
                                                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300 inline-flex items-center justify-center transition shadow-2xs cursor-pointer"
                                                    title="Delete Property"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Numeric Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-t border-gray-100 bg-gray-50/50 text-xs gap-3">
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
            </div>

            {/* View Details Modal */}
            {showViewModal && viewHotel && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-[650px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-gray-50/50 shrink-0">
                            <div>
                                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase">
                                    ESTABLISHMENT AUDIT
                                </span>
                                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-gray-900 mt-0.5">
                                    {viewHotel.hotelName}
                                </h2>
                            </div>
                            <button
                                onClick={() => { setShowViewModal(false); setViewHotel(null); }}
                                className="text-gray-400 hover:text-gray-700 transition bg-white border border-gray-200 w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer shadow-2xs"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 space-y-6 text-xs">
                            {viewHotel.hotelImages?.length > 0 && (
                                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-2">
                                    {viewHotel.hotelImages.map((img, idx) => (
                                        <img key={idx} src={img} alt="" className="w-80 h-48 object-cover rounded-2xl shrink-0 snap-center border border-gray-200 shadow-2xs" />
                                    ))}
                                </div>
                            )}

                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/85">
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Email</p>
                                    <p className="font-bold text-gray-900 text-sm truncate">{viewHotel.hotelEmail}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location Details</p>
                                    <p className="font-bold text-gray-900 text-sm">{viewHotel.cityInfo?.cityName || "N/A"}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Administrator</p>
                                    <p className="font-bold text-gray-900 text-sm">{viewHotel.adminInfo?.name || "Unassigned"}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Room Capacity</p>
                                    <p className="font-bold text-blue-600 text-sm font-['IBM_Plex_Mono']">{viewHotel.totalRooms || 0} Rooms</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 sm:col-span-2">
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Generated Revenue</p>
                                    <p className="font-bold text-emerald-600 text-sm font-['IBM_Plex_Mono']">{formatMoney(viewHotel.totalRevenue || 0)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end">
                            <button
                                onClick={() => { setShowViewModal(false); setViewHotel(null); }}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl transition shadow-2xs cursor-pointer"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;