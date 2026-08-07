import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import useSearch from "../Hooks/useSearch";
import {
    Search, Eye, Trash2, Power, PowerOff, Edit2, Users, BedDouble,
    Loader2, Hotel, X, ArrowRight, Plus, RefreshCw, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { Toaster, toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const AllRooms = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // 🌟 Filter & Control States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // All, Active, Inactive
    const [roomTypeFilter, setRoomTypeFilter] = useState("All"); // Deluxe, Suite, etc.
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6);

    // 🌟 Modals & Actions States
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [deleteModalRoom, setDeleteModalRoom] = useState(null); // Custom Delete Modal State
    const [actionLoading, setActionLoading] = useState(false);

    // 🌟 Backend-driven useSearch hook integration (Debounced Search)
    const roomSearch = useSearch(`${signupApi}room/myRooms`, searchQuery, {
        page,
        limit,
        status: statusFilter,
        roomType: roomTypeFilter,
        sort: sortBy
    }, headers);

    const loading = roomSearch.loading;
    const resData = roomSearch.data || {};
    const rooms = resData.rooms || [];
    const stats = resData.stats || { total: 0, active: 0, inactive: 0, featured: 0 };
    const totalPages = resData.totalPages || 1;
    const totalCount = resData.totalRooms || 0;

    // Fetch unique room types for dynamic filter dropdown
    const roomTypesList = useMemo(() => {
        return [...new Set(rooms.map(r => r.roomType).filter(Boolean))];
    }, [rooms]);

    // Handle Toggle Status (Active / Inactive)
    const handleToggleStatus = async (id) => {
        try {
            setActionLoading(true);
            await axios.patch(`${signupApi}room/status/${id}`, {}, { headers });
            toast.success("Room status updated successfully.");
            roomSearch.fetchData();
            if (selectedRoom && selectedRoom._id === id) {
                setSelectedRoom(prev => ({ ...prev, isActive: !prev.isActive }));
            }
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setActionLoading(false);
        }
    };

    // Custom Modal Delete Execution
    const confirmDelete = async () => {
        if (!deleteModalRoom) return;
        try {
            setActionLoading(true);
            await axios.delete(`${signupApi}room/delete/${deleteModalRoom._id}`, { headers });
            toast.success("Room deleted successfully.");
            setDeleteModalRoom(null);
            if (selectedRoom?._id === deleteModalRoom._id) setSelectedRoom(null);
            roomSearch.fetchData();
        } catch {
            toast.error("Delete failed. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="text-gray-800 font-['Inter',sans-serif] max-w-[1600px] mx-auto pb-20 space-y-8">
            <Toaster position="top-right" richColors />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* 1. HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-7 rounded-3xl border border-gray-200/80 shadow-2xs">
                <div>
                    <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.2em] text-blue-600 font-bold uppercase block mb-1">
                        INVENTORY MANAGEMENT HUB
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-gray-900 m-0 tracking-tight">
                        Room Management
                    </h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        Manage all hotel rooms, pricing configurations, and live operational statuses.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/hotel/room")}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 h-12 rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer shrink-0"
                >
                    <Plus size={16} /> Create Room
                </button>
            </div>

            {/* 2. STATISTICS CARDS ⭐ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono']">Total Rooms</p>
                        <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 mt-1">{stats.total || totalCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">🏨</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono']">Active</p>
                        <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-600 mt-1">{stats.active}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">⚡</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono']">Inactive</p>
                        <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-rose-600 mt-1">{stats.inactive}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">💤</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono']">Featured</p>
                        <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-amber-600 mt-1">{stats.featured || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold"><Sparkles size={18} /></div>
                </div>
            </div>

            {/* 3 & 14. BETTER FILTER LAYOUT (Search + Type + Status + Sort) */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-2xs flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search room number or type..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 h-11 text-xs font-medium focus:outline-none focus:border-blue-500 transition bg-white text-gray-900 shadow-2xs"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 h-11 rounded-2xl text-xs font-semibold text-gray-700">
                    <span>Type:</span>
                    <select
                        value={roomTypeFilter}
                        onChange={(e) => { setRoomTypeFilter(e.target.value); setPage(1); }}
                        className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
                    >
                        <option value="All">All Types</option>
                        {roomTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 h-11 rounded-2xl text-xs font-semibold text-gray-700">
                    <span>Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 h-11 rounded-2xl text-xs font-semibold text-gray-700">
                    <span>Sort:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* ROOM GRID WITH SKELETON LOADER (13) & HOVER EFFECTS (4) */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex justify-center items-center z-20 rounded-3xl">
                        <Loader2 className="animate-spin text-blue-600" size={36} />
                    </div>
                )}

                {rooms.length === 0 && !loading ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center shadow-2xs space-y-4">
                        <Hotel className="mx-auto text-gray-300" size={42} />
                        <div>
                            <h3 className="font-['Space_Grotesk'] font-bold text-base text-gray-900">No rooms found</h3>
                            <p className="text-gray-500 text-xs mt-1">No room matches your search criteria or filter configuration.</p>
                        </div>
                        <button
                            onClick={() => navigate("/hotel/room")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <Plus size={15} /> Create Room
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading && rooms.length === 0 ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-200 space-y-4">
                                    <Skeleton height={190} borderRadius={16} />
                                    <Skeleton height={24} width={`70%`} />
                                    <Skeleton height={40} />
                                </div>
                            ))
                        ) : (
                            rooms.map((room) => (
                                <div
                                    key={room._id}
                                    className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                                >
                                    {/* Image Header with Broken Image Fallback (9) */}
                                    <div className="relative h-52 w-full bg-gray-100 overflow-hidden shrink-0 border-b border-gray-100">
                                        <img
                                            src={room.roomImages?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop";
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt="Room Thumbnail"
                                        />

                                        <div className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl font-['Space_Grotesk'] text-xs font-bold tracking-wide shadow-sm">
                                            ₹{room.pricePerNight} <span className="text-[10px] font-normal text-gray-300 uppercase">/ Night</span>
                                        </div>

                                        {/* 7. STATUS TOGGLE SWITCH */}
                                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-gray-200">
                                            <span className={`text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase ${room.isActive ? "text-emerald-700" : "text-rose-700"}`}>
                                                {room.isActive ? "ON" : "OFF"}
                                            </span>
                                            <button
                                                onClick={() => handleToggleStatus(room._id)}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${room.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                                                title="Toggle Status"
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${room.isActive ? "translate-x-4" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        {room.roomImages?.length > 1 && (
                                            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md">
                                                {room.roomImages.length} Photos
                                            </div>
                                        )}

                                        {room.isFeatured && (
                                            <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-lg font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                ★ Featured
                                            </div>
                                        )}
                                    </div>

                                    {/* Room Info */}
                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-bold text-gray-900 leading-tight">
                                                Unit No. {room.roomNumber}
                                            </h2>
                                            <p className="text-blue-600 font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest uppercase mt-0.5">
                                                {room.roomType}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 border-t border-b border-gray-100 py-3.5 my-3 text-xs">
                                                <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                    <Users size={15} className="text-gray-400" />
                                                    {room.maxOccupancy} Guests
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                    <BedDouble size={15} className="text-gray-400" />
                                                    {room.totalBeds} {room.bedType}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 10 & 15. CARD ACTIONS (Prominent View + Icon Utilities) + FOOTER TIMESTAMP */}
                                        <div className="space-y-3 pt-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => { setSelectedRoom(room); setActiveImageIndex(0); }}
                                                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer"
                                                >
                                                    <Eye size={15} /> View Details
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/hotel/room?edit=${room._id}`)}
                                                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl flex items-center justify-center transition shadow-2xs cursor-pointer"
                                                    title="Edit Configuration"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModalRoom(room)}
                                                    className="w-11 h-11 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center transition shadow-2xs cursor-pointer"
                                                    title="Delete Room"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>

                                            {/* Card Footer Timestamp (15) */}
                                            <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono'] text-center">
                                                Updated {dayjs(room.updatedAt || room.createdAt).fromNow()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 11. PAGINATION */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-6 border-t border-gray-200 mt-8 text-xs gap-3">
                    <p className="text-gray-500 font-medium">
                        Showing page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages || 1}</strong> (Total: {totalCount})
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

            {/* 5. VIEW MODAL (With Arrow Controls + Counter) */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-[650px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col relative">

                        <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-white shrink-0 z-10">
                            <div>
                                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900">Unit No. {selectedRoom.roomNumber}</h2>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] text-blue-600 mt-0.5 tracking-widest font-bold uppercase">
                                    {selectedRoom.roomType} Configuration
                                </p>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer">
                                <X size={17} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 bg-white">
                            {/* Image Gallery with Navigation Arrows & Counter */}
                            <div className="relative border-b border-gray-100 bg-gray-950 h-64 sm:h-72 flex items-center justify-center">
                                <img
                                    src={selectedRoom.roomImages?.[activeImageIndex] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600"}
                                    alt="Room View"
                                    className="w-full h-full object-contain"
                                />

                                {selectedRoom.roomImages?.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImageIndex((prev) => (prev === 0 ? selectedRoom.roomImages.length - 1 : prev - 1))}
                                            className="absolute left-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition cursor-pointer backdrop-blur-md"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => setActiveImageIndex((prev) => (prev === selectedRoom.roomImages.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition cursor-pointer backdrop-blur-md"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <div className="absolute bottom-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg font-['IBM_Plex_Mono'] text-[11px] font-bold tracking-widest">
                                            {activeImageIndex + 1} / {selectedRoom.roomImages.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-6 space-y-5 text-xs">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pricing</p>
                                        <h3 className="font-bold text-blue-600 text-sm tracking-wide">₹{selectedRoom.pricePerNight} <span className="text-[10px] text-gray-500 uppercase">/nt</span></h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Occupancy</p>
                                        <h3 className="font-bold text-gray-900 text-xs">{selectedRoom.maxOccupancy} Guests</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bedding</p>
                                        <h3 className="font-bold text-gray-900 text-xs">{selectedRoom.totalBeds} {selectedRoom.bedType}</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`px-2 py-0.5 text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase rounded-md inline-block ${selectedRoom.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                            {selectedRoom.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>

                                {selectedRoom.roomAmenities?.length > 0 && (
                                    <div>
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Amenities Blueprint</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedRoom.roomAmenities.map(a => (
                                                <span key={a} className="bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-xl border border-gray-200 font-medium">
                                                    ✓ {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Narrative Specification</p>
                                    <p className="leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200 italic m-0 text-xs">
                                        "{selectedRoom.description || "No specific narrative text provided."}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. CUSTOM DELETE CONFIRMATION MODAL */}
            {deleteModalRoom && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-center">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900">Delete Room Unit #{deleteModalRoom.roomNumber}?</h3>
                            <p className="text-xs text-gray-500 mt-1">This action is permanent and will remove all associated configurations.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeleteModalRoom(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={actionLoading}
                                onClick={confirmDelete}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                            >
                                {actionLoading ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllRooms;