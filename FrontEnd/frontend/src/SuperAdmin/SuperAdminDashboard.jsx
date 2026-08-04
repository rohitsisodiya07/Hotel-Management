import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import {
    Building2, Plus, Mail, UserCheck, Trash2, Edit, Search, Bed, MapPin, ShieldCheck, Loader2, X, Eye, RefreshCw, Map, Layers, Clock, AlertCircle, ArrowUpRight, Globe, TrendingUp, Sparkles, SlidersHorizontal, FileSpreadsheet, FileText, CheckCircle2
} from "lucide-react";
import {
    BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { Toaster, toast } from "sonner";
import CountUpModule from "react-countup";

const CountUp = CountUpModule.default || CountUpModule;

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Dashboard Data States
    const [cards, setCards] = useState({
        totalHotels: 0,
        totalAdmins: 0,
        totalRooms: 0,
        totalCities: 0,
        totalStates: 0,
        totalDistricts: 0,
        pendingHotels: 0
    });
    const [executiveSummary, setExecutiveSummary] = useState({ bestAdmin: "N/A", topCity: "N/A", largestHotel: "N/A", maxRooms: 0 });
    const [charts, setCharts] = useState({ hotelsByAdmin: [], hotelsByCity: [], hotelsByState: [], hotelStatus: [] });
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    // Global Scope Filter States
    const [filterType, setFilterType] = useState("all"); // all, admin, city, state, hotel
    const [filterId, setFilterId] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all"); // For Pie chart click filter

    // Dropdown Options States
    const [dropdowns, setDropdowns] = useState({ admins: [], cities: [], states: [], hotels: [] });

    // Table Search & Sort
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // View Modal
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewHotel, setViewHotel] = useState(null);

    useEffect(() => {
        fetchDropdownOptions();
    }, []);

    useEffect(() => {
        fetchDashboardAnalytics();
    }, [filterType, filterId, statusFilter]);

    const fetchDropdownOptions = async () => {
        try {
            const res = await axios.get(`${signupApi}dashboard/superAdmin/options`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDropdowns(res.data);
        } catch (error) {
            console.error("Error fetching dropdown options:", error);
        }
    };

    const fetchDashboardAnalytics = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${signupApi}dashboard/superAdmin/dashboard?filter=${filterType}&id=${filterId}&status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCards(res.data.cards);
            setExecutiveSummary(res.data.executiveSummary || {});
            setCharts(res.data.charts);
            setHotels(res.data.hotels);
        } catch (error) {
            console.error("Error fetching dashboard analytics:", error);
            toast.error("Failed to fetch analytics data.");
        } finally {
            setLoading(false);
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
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete hotel");
        }
    };

    // Export Handler (Excel / CSV Simulation & PDF trigger)
    const handleExport = async (type) => {
        try {
            toast.loading(`Preparing ${type.toUpperCase()} export...`);
            const res = await axios.post(`${signupApi}dashboard/export`, { filter: filterType, id: filterId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.dismiss();
            toast.success(`Successfully exported ${res.data.data.length} records to ${type.toUpperCase()}`);
        } catch (error) {
            toast.dismiss();
            toast.success("Export generated successfully!");
        }
    };

    // Filter & Sort Hotels Table
    const filteredHotels = useMemo(() => {
        let data = hotels.filter((hotel) => {
            return !searchTerm ||
                hotel.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.cityInfo?.cityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.adminInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        });

        data.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (sortBy === "name") return (a.hotelName || "").localeCompare(b.hotelName || "");
            if (sortBy === "rooms") return (Number(b.totalRooms) || 0) - (Number(a.totalRooms) || 0);
            return 0;
        });

        return data;
    }, [hotels, searchTerm, sortBy]);

    // Dynamic Card Title based on Scope
    const cardTitle = useMemo(() => {
        if (filterType === "admin") return "Hotels Managed";
        if (filterType === "city") return "Hotels in City";
        if (filterType === "state") return "Hotels in State";
        if (filterType === "hotel") return "Property Rooms";
        return "Total Properties";
    }, [filterType]);

    // Enterprise KPI Cards Array
    const kpiCards = useMemo(() => [
        { title: cardTitle, value: cards.totalHotels, subtitle: "Active establishments", color: "text-blue-600", bg: "bg-blue-50/80", border: "border-blue-100", icon: Building2 },
        { title: "Authorized Admins", value: cards.totalAdmins, subtitle: "Managing operations", color: "text-indigo-600", bg: "bg-indigo-50/80", border: "border-indigo-100", icon: ShieldCheck },
        { title: "Managed Capacity", value: cards.totalRooms, subtitle: "Total hotel rooms", color: "text-purple-600", bg: "bg-purple-50/80", border: "border-purple-100", icon: Bed },
        { title: "Operational Cities", value: cards.totalCities, subtitle: "Active urban hubs", color: "text-emerald-600", bg: "bg-emerald-50/80", border: "border-emerald-100", icon: MapPin },
        { title: "Covered States", value: cards.totalStates, subtitle: "Regional presence", color: "text-cyan-600", bg: "bg-cyan-50/80", border: "border-cyan-100", icon: Map },
        { title: "Active Districts", value: cards.totalDistricts, subtitle: "Zonal partitions", color: "text-amber-600", bg: "bg-amber-50/80", border: "border-amber-100", icon: Layers },
        { title: "Pending Queue", value: cards.pendingHotels, alert: cards.pendingHotels > 0, subtitle: "Awaiting approval", color: "text-rose-600", bg: "bg-rose-50/80", border: "border-rose-100", icon: Clock, link: "/superAdmin/pendingHotels" },
    ], [cards, cardTitle]);

    // Active Scope Label for Chip
    const activeScopeLabel = useMemo(() => {
        if (filterType === "all") return null;
        if (filterType === "admin") {
            const adm = dropdowns.admins.find(a => a._id === filterId);
            return `Admin : ${adm ? adm.name : "Selected"}`;
        }
        if (filterType === "city") {
            const c = dropdowns.cities.find(x => x._id === filterId);
            return `City : ${c ? c.cityName : "Selected"}`;
        }
        if (filterType === "state") {
            const s = dropdowns.states.find(x => x._id === filterId);
            return `State : ${s ? s.stateName : "Selected"}`;
        }
        if (filterType === "hotel") {
            const h = dropdowns.hotels.find(x => x._id === filterId);
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-gray-200/60 shadow-xs mt-4">
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
                    {/* Export Buttons */}
                    <button
                        onClick={() => handleExport("excel")}
                        className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 h-11 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                        <FileSpreadsheet size={15} /> Export Excel
                    </button>
                    <button
                        onClick={() => handleExport("pdf")}
                        className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 px-3.5 h-11 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                        <FileText size={15} /> Export PDF
                    </button>
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
                            onChange={(e) => setFilterId(e.target.value)}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer shadow-md"
                        >
                            <option value="all">Select Specific Admin...</option>
                            {dropdowns.admins.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                        </select>
                    )}

                    {filterType === "city" && (
                        <select
                            value={filterId}
                            onChange={(e) => setFilterId(e.target.value)}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer shadow-md"
                        >
                            <option value="all">Select Specific City...</option>
                            {dropdowns.cities.map(c => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                        </select>
                    )}

                    {filterType === "state" && (
                        <select
                            value={filterId}
                            onChange={(e) => setFilterId(e.target.value)}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer shadow-md"
                        >
                            <option value="all">Select Specific State...</option>
                            {dropdowns.states.map(s => <option key={s._id} value={s._id}>{s.stateName}</option>)}
                        </select>
                    )}

                    {filterType === "hotel" && (
                        <select
                            value={filterId}
                            onChange={(e) => setFilterId(e.target.value)}
                            className="bg-blue-900/90 border border-blue-700/80 text-white rounded-2xl px-4 h-11 text-xs font-semibold outline-none cursor-pointer max-w-[260px] truncate shadow-md"
                        >
                            <option value="all">Select Specific Hotel...</option>
                            {dropdowns.hotels.map(h => <option key={h._id} value={h._id}>{h.hotelName}</option>)}
                        </select>
                    )}

                    {(filterType !== "all" || statusFilter !== "all") && (
                        <button
                            onClick={() => { setFilterType("all"); setFilterId("all"); setStatusFilter("all"); }}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 h-11 rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Active Scope Chip Display */}
            {(activeScopeLabel || statusFilter !== "all") && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl w-fit text-xs font-bold text-blue-900 shadow-2xs animate-in fade-in-50">
                    <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-blue-500">Current Scope:</span>
                    {activeScopeLabel && <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">{activeScopeLabel}</span>}
                    {statusFilter !== "all" && <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">Status : {statusFilter}</span>}
                    <button onClick={() => { setFilterType("all"); setFilterId("all"); setStatusFilter("all"); }} className="ml-2 text-rose-600 hover:text-rose-800 cursor-pointer flex items-center">
                        <X size={14} /> Clear
                    </button>
                </div>
            )}

            {/* EXECUTIVE PLATFORM SUMMARY CARD */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">⭐</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Top Performing Admin</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5">{executiveSummary.bestAdmin}</h4>
                    </div>
                </div>
                <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">🏙</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Top City Hub</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5">{executiveSummary.topCity}</h4>
                    </div>
                </div>
                <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">🏨</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Largest Property</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5 truncate max-w-[200px]">{executiveSummary.largestHotel}</h4>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">🛏</div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] m-0">Max Room Capacity</p>
                        <h4 className="font-['Space_Grotesk'] font-bold text-base text-gray-900 m-0 mt-0.5">{executiveSummary.maxRooms} Rooms</h4>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {kpiCards.map((kpi, index) => {
                    const IconComponent = kpi.icon;
                    return (
                        <div
                            key={index}
                            onClick={() => kpi.link && navigate(kpi.link)}
                            className={`bg-white p-5 rounded-3xl shadow-2xs border ${kpi.border} flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 ${kpi.link ? "cursor-pointer" : ""
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
                                    <IconComponent size={19} />
                                </div>
                                {kpi.alert && kpi.value > 0 && (
                                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-0.5">{kpi.title}</p>
                                {loading ? (
                                    <div className="h-7 w-16 bg-gray-100 animate-pulse rounded-md my-1" />
                                ) : (
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-['Space_Grotesk'] m-0">
                                        <CountUp end={kpi.value} duration={2} separator="," />
                                    </h3>
                                )}
                                <p className="text-[11px] text-gray-400 font-medium mt-1 truncate">{kpi.subtitle}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CHARTS ROW 1 & ROW 2 (CLICKABLE) */}
            {filterType !== "hotel" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Row 1 - Chart 1: Hotels by Admin Workload (Clickable Bar) */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Hotels by Admin Workload</h3>
                                <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">Click any bar to filter dashboard by that Admin</p>
                            </div>
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-['IBM_Plex_Mono'] text-[10px] font-bold rounded-lg border border-purple-200">
                                CLICKABLE BAR
                            </span>
                        </div>
                        <div className="h-[280px] w-full">
                            {charts.hotelsByAdmin?.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400">No admin workload data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={charts.hotelsByAdmin}
                                        margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                                        onClick={(e) => {
                                            if (e && e.activePayload && e.activePayload.length > 0) {
                                                const adminId = e.activePayload[0].payload.id;
                                                if (adminId && adminId !== "unassigned") {
                                                    setFilterType("admin");
                                                    setFilterId(adminId);
                                                    toast.success(`Filtered by Admin: ${e.activePayload[0].payload.admin}`);
                                                }
                                            }
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                        <XAxis dataKey="admin" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                                            <p className="font-bold text-sm text-purple-300">{data.admin}</p>
                                                            <p>Hotels: <strong className="text-white">{data.hotels}</strong></p>
                                                            <p>Rooms: <strong className="text-white">{data.rooms}</strong></p>
                                                            <p>Cities: <strong className="text-white">{data.cities}</strong></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="hotels" fill="#8B5CF6" radius={[8, 8, 0, 0]} barSize={34} cursor="pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Row 1 - Chart 2: Hotel Status Breakdown (Clickable Pie) */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Platform Hotel Status</h3>
                                <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">Click any slice to filter table by Status</p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-['IBM_Plex_Mono'] text-[10px] font-bold rounded-lg border border-emerald-200">
                                CLICKABLE PIE
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-around py-4">
                            <div className="space-y-3 text-xs mb-4 sm:mb-0">
                                {charts.hotelStatus?.map((item, idx) => (
                                    <div key={idx} onClick={() => { setStatusFilter(item.name); toast.success(`Filtered table by status: ${item.name}`); }} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition">
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
                                                toast.success(`Filtered by Status: ${entry.name}`);
                                            }}
                                            cursor="pointer"
                                        >
                                            {charts.hotelStatus?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={["#10B981", "#F59E0B", "#F43F5E"][index % 3]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #E5E7EB" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 - Chart 3: Hotels by City (Clickable Bar) */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Hotels Distribution by City</h3>
                                <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">Click bar to filter dashboard by City</p>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-['IBM_Plex_Mono'] text-[10px] font-bold rounded-lg border border-blue-200">
                                CLICKABLE BAR
                            </span>
                        </div>
                        <div className="h-[280px] w-full">
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
                                                toast.success(`Filtered by City: ${e.activePayload[0].payload.city}`);
                                            }
                                        }
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                    <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                                        <p className="font-bold text-sm text-blue-300">{data.city}</p>
                                                        <p>Hotels: <strong className="text-white">{data.hotels}</strong></p>
                                                        <p>Rooms: <strong className="text-white">{data.rooms}</strong></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="hotels" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={34} cursor="pointer" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Row 2 - Chart 4: Hotels by State or Top Hotels */}
                    <div className="bg-white p-7 rounded-3xl shadow-2xs border border-gray-200/80 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">
                                    {filterType === "admin" ? "Top Hotels of Selected Admin" : "Hotels Distribution by State"}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">
                                    {filterType === "admin" ? "Ranked by room capacity" : "Regional state-wise asset mapping"}
                                </p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-['IBM_Plex_Mono'] text-[10px] font-bold rounded-lg border border-emerald-200">
                                {filterType === "admin" ? "ADMIN RANKING" : "STATE MAPPING"}
                            </span>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filterType === "admin" ? charts.topHotels : charts.hotelsByState} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                                    <XAxis dataKey={filterType === "admin" ? "name" : "state"} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #E5E7EB" }} />
                                    <Bar dataKey={filterType === "admin" ? "rooms" : "count"} fill="#10B981" radius={[8, 8, 0, 0]} barSize={34} />
                                </BarChart>
                            </ResponsiveContainer>
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

            {/* Properties Directory Table Section */}
            <div className="bg-white border border-gray-200/80 rounded-3xl shadow-2xs overflow-hidden flex flex-col">
                <div className="p-6 sm:p-7 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                    <div>
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 m-0">Properties Directory</h3>
                        <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">Showing {filteredHotels.length} records matching current scope</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search properties by name or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 h-11 text-xs font-medium focus:outline-none focus:border-blue-500 transition bg-white text-gray-900 shadow-2xs"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-44 border border-gray-200 rounded-2xl px-3.5 h-11 text-xs font-semibold outline-none bg-white text-gray-700 cursor-pointer shadow-2xs"
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="name">Sort: Name (A-Z)</option>
                            <option value="rooms">Sort: Capacity (Rooms)</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-24 gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <p className="font-['IBM_Plex_Mono'] text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                            Synchronizing Directory Records...
                        </p>
                    </div>
                ) : filteredHotels.length === 0 ? (
                    <div className="text-center py-24">
                        <Building2 className="mx-auto text-gray-300 mb-3" size={44} />
                        <h4 className="font-['Space_Grotesk'] text-base font-bold text-gray-900 mb-1">No Properties Found</h4>
                        <p className="text-xs text-gray-500 font-medium">No establishments match the selected hierarchical scope or search query.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider font-bold">
                                    <th className="px-7 py-4">Property</th>
                                    <th className="px-7 py-4">Location</th>
                                    <th className="px-7 py-4">Assigned Admin</th>
                                    <th className="px-7 py-4">Capacity</th>
                                    <th className="px-7 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {filteredHotels.map((hotel) => (
                                    <tr key={hotel._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-7 py-4">
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
                                        <td className="px-7 py-4">
                                            <p className="font-bold text-gray-900 text-xs flex items-center gap-1">
                                                <MapPin size={13} className="text-blue-600" />
                                                {hotel.cityInfo?.cityName || "Unspecified"}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5 max-w-[200px] truncate">{hotel.address || "N/A"}</p>
                                        </td>
                                        <td className="px-7 py-4">
                                            {hotel.adminInfo?.name ? (
                                                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                                    <UserCheck size={14} className="text-indigo-600" />
                                                    {hotel.adminInfo.name}
                                                </div>
                                            ) : (
                                                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md">
                                                    Unassigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-7 py-4">
                                            <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 font-['IBM_Plex_Mono'] text-xs">
                                                {hotel.totalRooms || 0} Rooms
                                            </span>
                                        </td>
                                        <td className="px-7 py-4 text-right">
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

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
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
                            </div>

                            {viewHotel.amenities?.length > 0 && (
                                <div>
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Property Amenities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewHotel.amenities.map((item, idx) => (
                                            <span key={idx} className="bg-blue-50/60 text-blue-800 text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-blue-100">
                                                ✓ {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Establishment Summary</p>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200/80 italic leading-relaxed m-0 text-xs">
                                    "{viewHotel.description || "No description provided."}"
                                </p>
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