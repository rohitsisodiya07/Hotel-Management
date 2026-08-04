import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { 
    Loader2, Search, RefreshCw, Eye, CheckCircle2, XCircle, 
    Building2, MapPin, KeyRound, AlertTriangle, X, Check, Copy, Sparkles, Filter 
} from "lucide-react";
import { Toaster, toast } from "sonner";

const PendingHotels = () => {
    const [activeTab, setActiveTab] = useState("pending");
    const [pendingHotels, setPendingHotels] = useState([]);
    const [rejectedHotels, setRejectedHotels] = useState([]);
    const [approvedHotels, setApprovedHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showView, setShowView] = useState(false);

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [viewHotel, setViewHotel] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remark, setRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Search, Filter & Sort States
    const [search, setSearch] = useState("");
    const [hotelTypeFilter, setHotelTypeFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchAllHotels();
    }, []);

    const fetchAllHotels = async () => {
        try {
            setLoading(true);
            const [pendingRes, rejectedRes, approvedRes] = await Promise.all([
                axios.get(`${signupApi}hotel/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${signupApi}hotel/rejected`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${signupApi}hotel/approved`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setPendingHotels(pendingRes.data.hotels || []);
            setRejectedHotels(rejectedRes.data.hotels || []);
            setApprovedHotels(approvedRes.data.hotels || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load hotel submissions.");
        } finally {
            setLoading(false);
        }
    };

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        let pass = "";
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
        toast.success("Secure random password generated.");
    };

    const handleApprove = async () => {
        if (!password.trim()) {
            toast.error("Password is required");
            return;
        }
        if (password.trim().length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.patch(
                `${signupApi}hotel/approve/${selectedHotel._id}`,
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(response.data.message || "Hotel approved and user credentials synchronised.");
            setPassword("");
            setShowApprove(false);
            setSelectedHotel(null);
            fetchAllHotels();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong during approval sync.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!remark.trim()) {
            toast.error("Remark is required");
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.patch(
                `${signupApi}hotel/reject/${selectedHotel._id}`,
                { remark },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(response.data.message || "Hotel submission rejected.");
            setRemark("");
            setShowReject(false);
            setSelectedHotel(null);
            fetchAllHotels();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const rawHotels = activeTab === "pending" ? pendingHotels : activeTab === "approved" ? approvedHotels : rejectedHotels;

    const filteredHotels = useMemo(() => {
        let data = [...rawHotels];

        if (search.trim()) {
            const query = search.toLowerCase();
            data = data.filter(
                (h) =>
                    h.hotelName?.toLowerCase().includes(query) ||
                    h.adminId?.name?.toLowerCase().includes(query) ||
                    h.hotelEmail?.toLowerCase().includes(query) ||
                    h.adminId?.email?.toLowerCase().includes(query)
            );
        }

        if (hotelTypeFilter !== "all") {
            data = data.filter((h) => h.hotelType?.toLowerCase() === hotelTypeFilter.toLowerCase());
        }

        data.sort((a, b) => {
            if (sortOrder === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortOrder === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (sortOrder === "name") return (a.hotelName || "").localeCompare(b.hotelName || "");
            if (sortOrder === "rooms") return (Number(b.totalRooms) || 0) - (Number(a.totalRooms) || 0);
            return 0;
        });

        return data;
    }, [rawHotels, search, hotelTypeFilter, sortOrder]);

    const locationOf = (hotel) =>
        [
            hotel.city?.cityName,
            hotel.city?.districtId?.districtName,
            hotel.city?.districtId?.stateId?.stateName,
        ]
            .filter(Boolean)
            .join(", ");

    const initials = (name) =>
        (name || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join("");

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <h2 className="text-gray-500 font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-wider font-semibold">
                    Opening the partner registry...
                </h2>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-['Inter',sans-serif] text-gray-800 pb-12 max-w-[1600px] mx-auto">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
                <div>
                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[0.2em] text-blue-600 mb-1 uppercase">
                        PARTNER ONBOARDING AUDIT
                    </p>
                    <h1 className="font-['Space_Grotesk'] font-bold text-2xl text-gray-900 tracking-tight m-0">
                        Hotel Verification Requests
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-medium m-0">
                        Review, validate credentials, and authorize hotel partner registration profiles.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAllHotels}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition shadow-2xs cursor-pointer"
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Pending Audit</p>
                        <h3 className="text-2xl font-bold text-amber-600 font-['Space_Grotesk']">{pendingHotels.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Building2 size={20} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Approved List</p>
                        <h3 className="text-2xl font-bold text-emerald-600 font-['Space_Grotesk']">{approvedHotels.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Rejected List</p>
                        <h3 className="text-2xl font-bold text-rose-600 font-['Space_Grotesk']">{rejectedHotels.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <XCircle size={20} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Total Submissions</p>
                        <h3 className="text-2xl font-bold text-blue-600 font-['Space_Grotesk']">{pendingHotels.length + approvedHotels.length + rejectedHotels.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <KeyRound size={20} />
                    </div>
                </div>
            </div>

            {/* Status Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-2 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${
                        activeTab === "pending"
                            ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                    }`}
                >
                    Pending Review
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${
                        activeTab === "pending" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                        {pendingHotels.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("approved")}
                    className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${
                        activeTab === "approved"
                            ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                    }`}
                >
                    Approved (Success)
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${
                        activeTab === "approved" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                        {approvedHotels.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("rejected")}
                    className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${
                        activeTab === "rejected"
                            ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                    }`}
                >
                    Rejected Submissions
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${
                        activeTab === "rejected" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                        {rejectedHotels.length}
                    </span>
                </button>
            </div>

            {/* Controls Bar: Search, Filter & Sort */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col xl:flex-row justify-between gap-4 items-center">
                <div className="relative w-full xl:flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search hotel name, admin or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 pl-10 pr-4 h-11 rounded-xl text-xs font-medium outline-none focus:border-blue-500 transition shadow-2xs text-gray-900"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3 items-center shrink-0 flex-wrap">
                    <select
                        value={hotelTypeFilter}
                        onChange={(e) => setHotelTypeFilter(e.target.value)}
                        className="w-full sm:w-44 bg-white border border-gray-200 px-3.5 h-11 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer shadow-2xs"
                    >
                        <option value="all">All Hotel Types</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Resort">Resort</option>
                        <option value="Guest House">Guest House</option>
                        <option value="Villa">Villa</option>
                        <option value="Hostel">Hostel</option>
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full sm:w-44 bg-white border border-gray-200 px-3.5 h-11 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer shadow-2xs"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Hotel Name (A-Z)</option>
                        <option value="rooms">Rooms (High to Low)</option>
                    </select>
                </div>
            </div>

            {/* Hotels Matrix Grid */}
            {filteredHotels.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-2xs p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-6 shadow-2xs">
                        <Building2 size={36} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-bold font-['Space_Grotesk'] text-gray-900 mb-1">No Hotels Found</h2>
                    <p className="text-gray-500 text-xs font-medium">No partner onboarding verification records match this criteria.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredHotels.map((hotel) => (
                        <div
                            key={hotel._id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                        >
                            <div>
                                {/* Card Thumbnail Header */}
                                <div className="relative h-48 border-b border-gray-100 bg-gray-50 overflow-hidden">
                                    {hotel.hotelImages?.[0] ? (
                                        <img
                                            src={hotel.hotelImages[0]}
                                            alt={hotel.hotelName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-['Space_Grotesk',sans-serif] text-xs font-bold uppercase tracking-wider">
                                            No Media Blueprint Attached
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                                        <span className="text-white text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase tracking-wider bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10">
                                            {hotel.hotelType || "Hotel"} · {hotel.totalRooms || 0} Rooms
                                        </span>
                                    </div>

                                    <span
                                        className={`absolute top-3.5 right-3.5 font-['IBM_Plex_Mono',monospace] text-[10px] tracking-widest font-bold px-2.5 py-1 rounded-md border shadow-2xs ${
                                            activeTab === "approved"
                                                ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                                                : activeTab === "rejected"
                                                ? "text-rose-700 border-rose-200 bg-rose-50"
                                                : "text-amber-700 border-amber-200 bg-amber-50"
                                        }`}
                                    >
                                        {activeTab === "pending" ? "🟡 PENDING REVIEW" : activeTab === "approved" ? "🟢 APPROVED" : "🔴 REJECTED"}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0 flex items-center justify-center bg-gray-50 text-gray-900 font-['Space_Grotesk',sans-serif] font-bold text-sm shadow-2xs">
                                            {initials(hotel.adminId?.name) || "AD"}
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-base font-bold text-gray-900 truncate m-0 font-['Space_Grotesk',sans-serif]">
                                                {hotel.hotelName}
                                            </h2>
                                            <p className="text-gray-500 text-xs font-medium truncate mt-0.5 mb-0">
                                                Admin · {hotel.adminId?.name || "System Manager"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs text-gray-600 border-t pt-3.5 border-gray-100">
                                        <div className="flex justify-between truncate gap-2"><span className="text-gray-400 font-medium">Hotel Contact:</span> <span className="font-semibold text-gray-900 truncate">{hotel.hotelEmail}</span></div>
                                        <div className="flex justify-between truncate gap-2"><span className="text-gray-400 font-medium">Admin Login:</span> <span className="font-semibold text-gray-900 truncate">{hotel.adminId?.email}</span></div>
                                        <div className="flex justify-between items-start gap-4"><span className="text-gray-400 font-medium shrink-0">Region Mapping:</span> <span className="font-semibold text-gray-900 text-right line-clamp-1">{locationOf(hotel) || "Not Mapped"}</span></div>
                                    </div>

                                    <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <p className="text-xs text-gray-500 italic line-clamp-2 m-0 leading-relaxed font-medium">
                                            "{hotel.description || "No descriptions detailed."}"
                                        </p>
                                    </div>

                                    {activeTab === "rejected" && hotel.remark && (
                                        <div className="mt-3 text-xs text-rose-700 bg-rose-50 border-l-4 border-rose-600 py-2.5 px-3.5 rounded-r-xl">
                                            <span className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold uppercase tracking-wider text-rose-800 mb-0.5">
                                                Audit Dismissal Reason
                                            </span>
                                            <p className="m-0 font-medium leading-normal">{hotel.remark}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 pt-0 flex gap-2">
                                <button
                                    onClick={() => {
                                        setViewHotel(hotel);
                                        setActiveImageIndex(0);
                                        setShowView(true);
                                    }}
                                    className="flex-1 font-bold py-2.5 rounded-xl text-xs border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer uppercase tracking-wider"
                                >
                                    👁 View
                                </button>

                                {activeTab === "pending" && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedHotel(hotel);
                                                setPassword("");
                                                setShowApprove(true);
                                            }}
                                            className="flex-1 font-bold py-2.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer uppercase tracking-wider"
                                        >
                                            ✓ Approve
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedHotel(hotel);
                                                setRemark("");
                                                setShowReject(true);
                                            }}
                                            className="flex-1 font-bold py-2.5 rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white transition shadow-2xs cursor-pointer uppercase tracking-wider"
                                        >
                                            ✕ Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approve Modal Frame */}
            {showApprove && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[450px] shadow-2xl relative animate-in zoom-in-95 duration-150">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.2em] text-blue-600 uppercase font-bold mt-0 mb-1">
                            AUTHORIZE PLATFORM CREDENTIALS
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-gray-900 mt-0 mb-1">
                            Approve {selectedHotel?.hotelName}
                        </h2>
                        <p className="text-gray-500 text-xs font-medium mt-0 mb-6 leading-relaxed">
                            Generate a system access security password to sync and register this admin credential payload.
                        </p>

                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase tracking-widest font-bold">Security Password</label>
                            <button
                                onClick={generateRandomPassword}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <Sparkles size={13} /> Generate Random Password
                            </button>
                        </div>

                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 alphanumeric characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                disabled={submitting}
                                className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl outline-none pr-10 h-11 pl-4 focus:border-blue-500 font-medium transition shadow-2xs"
                            />
                            <span
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-700"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66" /><path d="M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </span>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="mb-6 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['IBM_Plex_Mono']">Strength:</span>
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                    password.length < 6 ? "text-rose-600" : password.length < 10 ? "text-amber-600" : "text-emerald-600"
                                }`}>
                                    {password.length < 6 ? "Weak" : password.length < 10 ? "Medium" : "Strong"}
                                </span>
                            </div>
                        )}

                        <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setShowApprove(false);
                                    setPassword("");
                                }}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs py-2.5 transition cursor-pointer uppercase tracking-wider disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs py-2.5 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shadow-2xs disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="animate-spin" size={15} />}
                                {submitting ? "Approving..." : "Confirm Approval"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal Frame */}
            {showReject && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[450px] shadow-2xl relative animate-in zoom-in-95 duration-150">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.2em] text-rose-600 uppercase font-bold mt-0 mb-1">
                            DISMISS REGISTRATION TASK
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-gray-900 mt-0 mb-1">
                            Reject {selectedHotel?.hotelName}
                        </h2>
                        <p className="text-gray-500 text-xs font-medium mt-0 mb-5 leading-relaxed">
                            Specify the technical or regulatory audit reason regarding why this partner is being denied.
                        </p>

                        <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase tracking-widest font-bold mb-2">Audit Remark Reason</label>
                        <textarea
                            rows={4}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="State detailed reason..."
                            autoFocus
                            disabled={submitting}
                            className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl outline-none p-4 resize-none transition focus:border-blue-500 font-medium shadow-2xs"
                        />

                        {/* Quick Reasons Chips */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {["Documents Missing", "Fake Details", "Incomplete Information", "Duplicate Hotel"].map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => setRemark(reason)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border border-gray-200"
                                >
                                    + {reason}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setShowReject(false);
                                    setRemark("");
                                }}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs py-2.5 transition cursor-pointer uppercase tracking-wider disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs py-2.5 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shadow-2xs disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="animate-spin" size={15} />}
                                {submitting ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile View Modal with Main Image + Thumbnail Switcher */}
            {showView && viewHotel && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">

                        {/* Sticky Modal Header */}
                        <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-white z-20 shrink-0">
                            <div>
                                <h2 className="font-['Space_Grotesk',sans-serif] text-base font-bold text-gray-900">Listing Inspection Profile</h2>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-blue-600 mt-0.5 uppercase tracking-wider font-bold">MAPPED ADMIN LOG TRACK: {viewHotel.trackingId || "N/A"}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowView(false);
                                    setViewHotel(null);
                                }}
                                className="text-gray-400 hover:text-gray-700 text-sm w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Scrollable Content Body */}
                        <div className="p-8 space-y-6 text-xs overflow-y-auto flex-1 bg-white">

                            {/* Main Image + 4 Thumbnails Gallery */}
                            <div>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Property Media Gallery ({viewHotel.hotelImages?.length || 0})</p>
                                {viewHotel.hotelImages?.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="w-full h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-2xs">
                                            <img
                                                src={viewHotel.hotelImages[activeImageIndex] || viewHotel.hotelImages[0]}
                                                alt={viewHotel.hotelName}
                                                className="w-full h-full object-cover transition duration-300"
                                            />
                                        </div>

                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                            {viewHotel.hotelImages.map((imgUrl, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`w-24 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition shrink-0 ${
                                                        activeImageIndex === index ? "border-blue-600 scale-105 shadow-md" : "border-gray-200 opacity-70 hover:opacity-100"
                                                    }`}
                                                >
                                                    <img src={imgUrl} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center text-gray-400 text-xs font-medium">
                                        No media blueprints attached.
                                    </div>
                                )}
                            </div>

                            {/* Parameters Grid */}
                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 bg-gray-50 rounded-2xl border border-gray-200 p-6">
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hotel Identity</p>
                                    <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-gray-900 text-base mt-1">{viewHotel.hotelName}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registered By (Admin)</p>
                                    <h3 className="font-bold text-gray-900 mt-1">{viewHotel.adminId?.name || "System Manager"}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner Name</p>
                                    <h3 className="font-bold text-gray-900 mt-1">{viewHotel.adminId?.name || "N/A"}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Contact</p>
                                    <h3 className="font-bold text-gray-900 mt-1">{viewHotel.adminId?.mobile || viewHotel.mobile || "N/A"}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hotel Email Link</p>
                                    <h3 className="font-medium text-gray-700 break-all mt-1">{viewHotel.hotelEmail}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin User Account Link</p>
                                    <h3 className="font-medium text-gray-700 break-all mt-1">{viewHotel.adminId?.email}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">GST & License Numbers</p>
                                    <h3 className="font-medium text-gray-900 mt-1">{viewHotel.gstNumber || "N/A"} · {viewHotel.licenseNumber || "N/A"}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created & Approval Dates</p>
                                    <h3 className="font-medium text-gray-900 mt-1">{new Date(viewHotel.createdAt || Date.now()).toLocaleDateString()} · Active</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accommodation Class</p>
                                    <h3 className="font-bold text-gray-900 mt-1">{viewHotel.hotelType}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Active Vault Rooms</p>
                                    <h3 className="font-bold text-blue-600 mt-1">{viewHotel.totalRooms} Rooms</h3>
                                </div>
                            </div>

                            {/* Regions Block */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Geographic Region Mapping</p>
                                    <h3 className="font-bold text-gray-900 text-xs">{locationOf(viewHotel) || "No Region Connected"}</h3>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Physical Street Address</p>
                                    <h3 className="font-medium text-gray-700 leading-relaxed">{viewHotel.address}</h3>
                                </div>
                            </div>

                            {/* Infrastructure Amenities with Icons */}
                            {viewHotel.amenities?.length > 0 && (
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Infrastructure Amenities Blueprint</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewHotel.amenities.map((item, idx) => {
                                            let icon = "✓";
                                            const lower = item.toLowerCase();
                                            if (lower.includes("wifi")) icon = "📶";
                                            else if (lower.includes("parking")) icon = "🚗";
                                            else if (lower.includes("pool")) icon = "🏊";
                                            else if (lower.includes("restaurant") || lower.includes("breakfast")) icon = "🍽";
                                            else if (lower.includes("gym")) icon = "🏋️";
                                            else if (lower.includes("spa")) icon = "💆";

                                            return (
                                                <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-xl border border-blue-200 font-bold shadow-2xs">
                                                    {icon} {item}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Audit Rejection Layer Case */}
                            {viewHotel.remark && (
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                                    <p className="text-rose-700 font-['IBM_Plex_Mono',monospace] text-[10px] font-bold uppercase tracking-wider mb-1">Audit Dismissal Log Remark</p>
                                    <p className="text-gray-900 text-xs font-medium leading-relaxed m-0">{viewHotel.remark}</p>
                                </div>
                            )}

                            {/* Description block layout */}
                            <div>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Establishment Overview Summary</p>
                                <p className="leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200 italic m-0 text-xs font-medium">
                                    "{viewHotel.description || "No descriptions specified."}"
                                </p>
                            </div>

                        </div>

                        {/* Sticky Modal Footer */}
                        <div className="flex justify-end p-5 border-t border-gray-100 bg-gray-50 z-20 shrink-0">
                            <button
                                onClick={() => {
                                    setShowView(false);
                                    setViewHotel(null);
                                }}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-2xs cursor-pointer"
                            >
                                Close Inspection Window
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingHotels;