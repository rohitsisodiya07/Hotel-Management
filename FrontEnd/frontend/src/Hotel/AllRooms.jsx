import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import useSearch from "../Hooks/useSearch";
import {
    Search, Eye, Trash2, Edit2, Users, BedDouble, Loader2, Hotel, X, Plus,
    Sparkles, FileSpreadsheet, Upload, AlertTriangle, CheckCircle2
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
    const [statusFilter, setStatusFilter] = useState("All");
    const [roomTypeFilter, setRoomTypeFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6);

    // 🌟 Modals & Actions States
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [deleteModalRoom, setDeleteModalRoom] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // 📂 Bulk Import States
    const [showImportModal, setShowImportModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [previewRows, setPreviewRows] = useState([]);
    const [previewSummary, setPreviewSummary] = useState(null);
    const [importing, setImporting] = useState(false);

    // Drag to scroll ref
    const scrollRef = useRef(null);
    let isDown = false;
    let startX;
    let scrollLeft;

    const roomSearch = useSearch(`${signupApi}room/myRooms`, searchQuery, {
        page,
        limit,
        status: statusFilter,
        roomType: roomTypeFilter,
        sort: sortBy
    });

    const loading = roomSearch.loading;
    const resData = roomSearch.data || {};
    const rooms = resData.rooms || [];
    const stats = resData.stats || { total: 0, active: 0, inactive: 0, featured: 0 };
    const totalPages = resData.totalPages || 1;
    const totalCount = resData.totalRooms || 0;

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

    // --- Bulk Import Methods ---
    const handleBulkPreview = async (e) => {
        e.preventDefault();
        if (!importFile) {
            toast.error("Please select an Excel file first.");
            return;
        }

        try {
            setImporting(true);
            const formData = new FormData();
            formData.append("file", importFile);

            const response = await axios.post(`${signupApi}room/bulk-preview`, formData, { headers });

            setPreviewRows(response.data.preview || []);
            setPreviewSummary({
                totalRows: response.data.totalRows,
                valid: response.data.validRows,
                invalid: response.data.invalidRows
            });

            toast.success(response.data.message || "Preview generated successfully");
            setShowImportModal(false);
            setShowPreview(true);

        } catch (error) {
            console.log("BULK PREVIEW ERROR:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to generate preview");
        } finally {
            setImporting(false);
        }
    };

    const removePreviewRow = (rowNumber) => {
        const updatedRows = previewRows.filter((row) => row.rowNumber !== rowNumber);
        setPreviewRows(updatedRows);
        const valid = updatedRows.filter((row) => row.status === "Valid").length;
        const invalid = updatedRows.filter((row) => row.status === "Invalid").length;
        setPreviewSummary({ totalRows: updatedRows.length, valid, invalid });
    };

    const handleFinalImport = async () => {
        const validRows = previewRows.filter((row) => row.status === "Valid");
        if (validRows.length === 0) {
            toast.error("No valid rooms available for import");
            return;
        }

        try {
            setImporting(true);
            const roomsData = validRows.map((row) => row.originalData);

            const response = await axios.post(`${signupApi}room/bulk-import`, { rooms: roomsData }, { headers });

            toast.success(response.data.message || "Bulk import completed");
            setShowPreview(false);
            setPreviewRows([]);
            setPreviewSummary(null);
            setImportFile(null);
            roomSearch.fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Bulk import failed");
        } finally {
            setImporting(false);
        }
    };

    // --- Drag to Scroll Handlers ---
    const handleMouseDown = (e) => {
        isDown = true;
        scrollRef.current.classList.add('cursor-grabbing');
        scrollRef.current.classList.remove('cursor-grab');
        startX = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft = scrollRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown = false;
        if (scrollRef.current) {
            scrollRef.current.classList.remove('cursor-grabbing');
            scrollRef.current.classList.add('cursor-grab');
        }
    };

    const handleMouseUp = () => {
        isDown = false;
        if (scrollRef.current) {
            scrollRef.current.classList.remove('cursor-grabbing');
            scrollRef.current.classList.add('cursor-grab');
        }
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // scroll speed multiplier
        scrollRef.current.scrollLeft = scrollLeft - walk;
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-7 rounded-3xl border border-gray-200/80 shadow-2xs">
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

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-5 h-12 rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer shrink-0"
                    >
                        <FileSpreadsheet size={16} /> Bulk Import
                    </button>
                    <button
                        onClick={() => navigate("/hotel/room")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 h-12 rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer shrink-0"
                    >
                        <Plus size={16} /> Create Room
                    </button>
                </div>
            </div>

            {/* 2. STATISTICS CARDS */}
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

            {/* 3. FILTER LAYOUT */}
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

            {/* ROOM GRID - ENHANCED UI */}
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
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {loading && rooms.length === 0 ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                                    <Skeleton height={200} borderRadius={16} />
                                    <Skeleton height={24} width={`70%`} />
                                    <Skeleton height={40} />
                                </div>
                            ))
                        ) : (
                            rooms.map((room) => (
                                <div
                                    key={room._id}
                                    className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-60 w-full bg-gray-100 overflow-hidden shrink-0">
                                        <img
                                            src={room.roomImages?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop";
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt="Room Thumbnail"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-gray-900/40 pointer-events-none"></div>

                                        {/* Top Tags */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {room.isFeatured && (
                                                <div className="bg-amber-500 text-white px-2.5 py-1 rounded-lg font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                                                    <Sparkles size={11} /> Featured
                                                </div>
                                            )}
                                            {room.roomImages?.length > 1 && (
                                                <div className="bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10">
                                                    1/{room.roomImages.length}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Toggle */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                            <span className={`text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase ${room.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                                                {room.isActive ? "ON" : "OFF"}
                                            </span>
                                            <button
                                                onClick={() => handleToggleStatus(room._id)}
                                                className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${room.isActive ? "bg-emerald-500" : "bg-gray-400/50"}`}
                                                title="Toggle Status"
                                            >
                                                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${room.isActive ? "translate-x-4" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        {/* Bottom Price */}
                                        <div className="absolute bottom-4 left-4">
                                            <h3 className="text-white font-bold font-['Space_Grotesk'] text-2xl tracking-tight leading-none">
                                                ₹{room.pricePerNight} <span className="text-xs text-gray-300 font-medium uppercase font-sans">/ Night</span>
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-blue-600 font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest uppercase mb-1">
                                                        {room.roomType}
                                                    </p>
                                                    <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-gray-900 leading-tight">
                                                        Unit No. {room.roomNumber}
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2.5 mt-4">
                                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600">
                                                    <Users size={14} className="text-gray-400" />
                                                    {room.maxOccupancy} Guests
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600">
                                                    <BedDouble size={14} className="text-gray-400" />
                                                    {room.totalBeds} {room.bedType}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
                                            <button
                                                onClick={() => setSelectedRoom(room)}
                                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                                            >
                                                <Eye size={15} /> Details
                                            </button>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/hotel/room?edit=${room._id}`)}
                                                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer"
                                                    title="Edit Configuration"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModalRoom(room)}
                                                    className="w-10 h-10 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer"
                                                    title="Delete Room"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* PAGINATION */}
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

            {/* 📁 BULK IMPORT UPLOAD MODAL */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 relative border border-gray-200">
                        <button onClick={() => { setShowImportModal(false); setImportFile(null); }} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer">
                            <X size={16} />
                        </button>
                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                            <FileSpreadsheet size={20} />
                            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900">Bulk Import Rooms</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                            Upload an Excel (.xlsx) or CSV file containing room specifications.
                        </p>
                        <form onSubmit={handleBulkPreview} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-gray-50 transition cursor-pointer relative">
                                <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) setImportFile(file); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-xs font-bold text-gray-800">{importFile ? importFile.name : "Click to browse or drag & drop file"}</p>
                                <p className="text-[10px] text-gray-400 mt-1">Supports XLSX, XLS, CSV format</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setShowImportModal(false); setImportFile(null); }} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer">
                                    Cancel
                                </button>
                                <button type="submit" disabled={importing || !importFile} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs cursor-pointer">
                                    {importing && <Loader2 size={14} className="animate-spin" />}
                                    {importing ? "Generating Preview..." : "Upload & Preview"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 👁️ BULK IMPORT PREVIEW MODAL */}
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet size={20} className="text-emerald-600" />
                                    <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">Review Room Import</h3>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Review your room configurations before importing. Remove invalid rows to proceed.</p>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>

                        {previewSummary && (
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                                        <p className="text-lg font-bold text-gray-900">{previewSummary.totalRows}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <p className="text-[10px] text-emerald-600 uppercase font-bold">Valid</p>
                                        <p className="text-lg font-bold text-emerald-700">{previewSummary.valid}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
                                        <p className="text-[10px] text-rose-600 uppercase font-bold">Issues</p>
                                        <p className="text-lg font-bold text-rose-700">{previewSummary.invalid}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-100 z-10">
                                    <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-3">Row</th>
                                        <th className="px-4 py-3">Room No.</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Validation Message</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.map((row, index) => (
                                        <tr key={index} className={`border-b border-gray-100 ${row.status === "Valid" ? "hover:bg-gray-50" : "bg-rose-50/60"}`}>
                                            <td className="px-4 py-4 text-xs font-mono text-gray-500">{row.rowNumber}</td>
                                            <td className="px-4 py-4 font-bold text-gray-900 text-xs">{row.roomNumber || "—"}</td>
                                            <td className="px-4 py-4 text-xs text-gray-600">{row.roomType || "—"}</td>
                                            <td className="px-4 py-4 text-xs font-['IBM_Plex_Mono'] font-bold text-blue-600">{row.pricePerNight ? `₹${row.pricePerNight}` : "—"}</td>
                                            <td className="px-4 py-4">
                                                {row.status === "Valid" ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 size={14} /> Valid</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold"><AlertTriangle size={14} /> Invalid</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {row.status === "Valid" ? <span className="text-xs text-gray-500">—</span> : (
                                                    <div className="flex flex-col gap-1">
                                                        {row.errors.map((error, errIdx) => (
                                                            <span key={errIdx} className="text-[10px] text-rose-600 font-semibold whitespace-nowrap">✕ {error}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button type="button" onClick={() => removePreviewRow(row.rowNumber)} className="w-8 h-8 inline-flex items-center justify-center shrink-0 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition cursor-pointer">
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between gap-3">
                            <button onClick={() => { setShowPreview(false); setShowImportModal(true); }} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer">
                                ← Change File
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowPreview(false); setPreviewRows([]); setPreviewSummary(null); setImportFile(null); }} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleFinalImport} disabled={importing || !previewSummary || previewSummary.invalid > 0 || previewRows.length === 0} className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                                    {importing ? "Importing..." : `Import ${previewSummary?.valid || 0} Rooms`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL (Drag to Scroll Gallery) */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-[800px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col relative">

                        <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-white shrink-0 z-10">
                            <div>
                                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-gray-900">Unit No. {selectedRoom.roomNumber}</h2>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] text-blue-600 mt-0.5 tracking-widest font-bold uppercase">
                                    {selectedRoom.roomType} Configuration
                                </p>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 bg-white scrollbar-hide">
                            {/* Horizontal Scrollable Image Gallery */}
                            <div className="bg-gray-50 border-b border-gray-100">
                                <div
                                    ref={scrollRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseLeave={handleMouseLeave}
                                    onMouseUp={handleMouseUp}
                                    onMouseMove={handleMouseMove}
                                    className="flex overflow-x-auto gap-4 p-6 snap-x snap-mandatory scrollbar-hide cursor-grab"
                                    style={{ WebkitOverflowScrolling: 'touch' }}
                                >
                                    {selectedRoom.roomImages?.length > 0 ? (
                                        selectedRoom.roomImages.map((img, idx) => (
                                            <div key={idx} className="shrink-0 w-[85%] sm:w-[70%] h-64 sm:h-80 snap-center rounded-2xl overflow-hidden shadow-md border border-gray-200/50 relative bg-gray-200">
                                                <img
                                                    src={img}
                                                    alt={`Room View ${idx + 1}`}
                                                    className="w-full h-full object-cover pointer-events-none" // pointer-events-none ensures drag works smoothly
                                                />
                                                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold font-['IBM_Plex_Mono'] px-2.5 py-1.5 rounded-lg backdrop-blur-md">
                                                    {idx + 1} / {selectedRoom.roomImages.length}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="shrink-0 w-[85%] sm:w-[70%] h-64 sm:h-80 snap-center rounded-2xl overflow-hidden shadow-md relative bg-gray-200 flex items-center justify-center">
                                            <Hotel size={48} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pricing</p>
                                        <h3 className="font-bold text-gray-900 text-lg tracking-tight">₹{selectedRoom.pricePerNight} <span className="text-[10px] text-gray-500 uppercase font-sans">/nt</span></h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Occupancy</p>
                                        <h3 className="font-bold text-gray-900 text-base">{selectedRoom.maxOccupancy} Guests</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bedding</p>
                                        <h3 className="font-bold text-gray-900 text-base">{selectedRoom.totalBeds} {selectedRoom.bedType}</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`px-2.5 py-1 text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase rounded-md inline-block mt-0.5 ${selectedRoom.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                                            {selectedRoom.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>

                                {selectedRoom.roomAmenities?.length > 0 && (
                                    <div>
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Amenities Blueprint</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {selectedRoom.roomAmenities.map(a => (
                                                <span key={a} className="bg-gray-50 text-gray-700 text-xs px-3.5 py-2 rounded-xl border border-gray-200 font-medium">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Narrative Specification</p>
                                    <p className="leading-relaxed text-gray-600 bg-gray-50 p-5 rounded-2xl border border-gray-100 m-0 text-sm">
                                        {selectedRoom.description || "No specific narrative text provided for this room."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-white shrink-0 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    const id = selectedRoom._id;
                                    setSelectedRoom(null);
                                    navigate(`/hotel/room?edit=${id}`);
                                }}
                                className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                                <Edit2 size={14} /> Edit Room
                            </button>
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM DELETE CONFIRMATION MODAL */}
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