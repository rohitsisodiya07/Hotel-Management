import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { Search, Eye, Trash2, Power, PowerOff, Edit2, Users, BedDouble, Loader2, Hotel, X, ArrowRight, Plus } from "lucide-react";
import { Toaster, toast } from "sonner";

const AllRooms = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => { fetchRooms(); }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${signupApi}room/myRooms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data.rooms || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch room inventory.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`${signupApi}room/status/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setRooms(prev => prev.map(r => r._id === id ? { ...r, isActive: !r.isActive } : r));

            if (selectedRoom && selectedRoom._id === id) {
                setSelectedRoom(prev => ({ ...prev, isActive: !prev.isActive }));
            }
            toast.success("Room status updated successfully.");
        } catch {
            toast.error("Failed to update status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you absolutely sure you want to permanently delete this room configuration?")) return;
        try {
            await axios.delete(`${signupApi}room/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setRooms(prev => prev.filter(r => r._id !== id));
            if (selectedRoom?._id === id) setSelectedRoom(null);
            toast.success("Room deleted successfully.");
        } catch {
            toast.error("Delete failed. Please try again.");
        }
    };

    const filteredRooms = useMemo(() => {
        let data = [...rooms];
        if (statusFilter === "Active") data = data.filter(r => r.isActive);
        if (statusFilter === "Inactive") data = data.filter(r => !r.isActive);
        if (search.trim()) data = data.filter(r => r.roomNumber.toString().toLowerCase().includes(search.toLowerCase()) || r.roomType.toLowerCase().includes(search.toLowerCase()));
        return data;
    }, [rooms, search, statusFilter]);

    const stats = {
        total: rooms.length,
        active: rooms.filter((r) => r.isActive).length,
        inactive: rooms.filter((r) => !r.isActive).length,
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-3 bg-gray-50/50">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <h2 className="text-gray-500 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider font-semibold">
                    Loading Inventory...
                </h2>
            </div>
        );
    }

    return (
        <div className="text-gray-800 font-['Inter',sans-serif] max-w-[1600px] mx-auto pb-12">
            <Toaster position="top-right" richColors />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Header & Controls with Add Room Button */}
            <div className="mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="relative w-full xl:flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by room number or type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 h-11 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition shadow-2xs bg-white"
                    />
                </div>
                <button
                    onClick={() => navigate("/hotel/room")}
                    className="w-full xl:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm shrink-0"
                >
                    <Plus size={16} /> Add New Room
                </button>
            </div>

            {/* Tabs Switcher */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto gap-2 scrollbar-none">
                {["All", "Active", "Inactive"].map((status) => {
                    const isActive = statusFilter === status;
                    const count = status === "All" ? stats.total : status === "Active" ? stats.active : stats.inactive;

                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${isActive
                                    ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                                }`}
                        >
                            {status} Rooms
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${isActive ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Room Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredRooms.length === 0 && (
                    <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center mt-4 shadow-2xs">
                        <Hotel className="mx-auto text-gray-300 mb-3" size={36} />
                        <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-base text-gray-900">No rooms found</h3>
                        <p className="text-gray-500 text-xs mt-1">Adjust filters or create a new room configuration.</p>
                    </div>
                )}

                {filteredRooms.map((room) => (
                    <div key={room._id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">

                        {/* Image Header (Card) */}
                        <div className="relative h-48 w-full bg-gray-100 overflow-hidden shrink-0 border-b border-gray-100">
                            <img
                                src={room.roomImages?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                alt="Room Thumbnail"
                            />

                            <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg font-['Space_Grotesk'] text-xs font-bold tracking-wide shadow-sm">
                                ₹{room.pricePerNight} <span className="text-[10px] font-normal text-gray-300 uppercase tracking-wider">/ Night</span>
                            </div>

                            <div className="absolute top-3 right-3">
                                <span className={`px-2.5 py-1 rounded-md font-['IBM_Plex_Mono',monospace] text-[10px] font-bold tracking-wider shadow-2xs uppercase ${room.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                                    }`}>
                                    {room.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {room.roomImages?.length > 1 && (
                                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md flex items-center gap-1 shadow-2xs">
                                    {room.roomImages.length} Photos
                                </div>
                            )}

                            {room.isFeatured && (
                                <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-md font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-widest shadow-2xs">
                                    ★ Featured
                                </div>
                            )}
                        </div>

                        {/* Room Info */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-bold text-gray-900 leading-tight">
                                        Unit No. {room.roomNumber}
                                    </h2>
                                </div>
                                <p className="text-blue-600 font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest uppercase mb-3.5">
                                    {room.roomType}
                                </p>

                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-b border-gray-100 py-3.5 my-3 text-xs">
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

                            {/* Action Grid */}
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                <button onClick={() => setSelectedRoom(room)} className="col-span-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs" title="View Room Details">
                                    <Eye size={15} />
                                </button>
                                <button onClick={() => navigate(`/hotel/room?edit=${room._id}`)} className="col-span-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs" title="Edit Configuration">
                                    <Edit2 size={15} />
                                </button>
                                <button onClick={() => handleToggleStatus(room._id)} className={`col-span-1 py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs border ${room.isActive ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700" : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                                    }`} title={room.isActive ? "Deactivate Room" : "Activate Room"}>
                                    {room.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                                </button>
                                <button onClick={() => handleDelete(room._id)} className="col-span-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs" title="Delete Room">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ========================================== */}
            {/* 🔍 VIEW DETAILS MODAL WITH SCROLLABLE GALLERY */}
            {/* ========================================== */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-[650px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col relative">

                        {/* Sticky Header */}
                        <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-white shrink-0 z-10">
                            <div>
                                <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-bold text-gray-900 leading-none">Unit {selectedRoom.roomNumber}</h2>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-blue-600 mt-1 tracking-widest font-bold uppercase">
                                    {selectedRoom.roomType} Configuration
                                </p>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 bg-white">

                            {/* 🔥 HORIZONTAL SCROLLING IMAGE GALLERY 🔥 */}
                            <div className="relative border-b border-gray-100 bg-gray-900">
                                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide p-3 gap-3 h-56 sm:h-64">
                                    {selectedRoom.roomImages?.map((img, index) => (
                                        <div key={index} className="w-full sm:w-[90%] h-full flex-shrink-0 snap-center relative">
                                            <img
                                                src={img}
                                                alt={`Room View ${index + 1}`}
                                                className="w-full h-full object-cover rounded-xl shadow-xs border border-white/10"
                                            />
                                            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest shadow-sm">
                                                {index + 1} / {selectedRoom.roomImages.length}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {selectedRoom.roomImages?.length > 1 && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-900 shadow-sm flex items-center gap-1">
                                        Swipe <ArrowRight size={11} />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-5 text-xs">
                                {/* Core Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3.5">
                                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pricing</p>
                                        <h3 className="font-bold text-blue-600 text-sm tracking-wide mt-0.5">₹{selectedRoom.pricePerNight} <span className="text-[10px] text-gray-500 uppercase font-normal">/nt</span></h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3.5">
                                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Occupancy</p>
                                        <h3 className="font-bold text-gray-900 text-xs mt-0.5">{selectedRoom.maxOccupancy} Guests</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3.5">
                                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bedding</p>
                                        <h3 className="font-bold text-gray-900 text-xs mt-0.5">{selectedRoom.totalBeds} {selectedRoom.bedType}</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3.5">
                                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`px-2 py-0.5 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-wider border rounded-md mt-0.5 inline-block shadow-2xs ${selectedRoom.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-100 border-gray-200 text-gray-600"
                                            }`}>
                                            {selectedRoom.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>

                                {/* Amenities Blueprint */}
                                {selectedRoom.roomAmenities?.length > 0 && (
                                    <div>
                                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Room Amenities Blueprint</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedRoom.roomAmenities.map(a => (
                                                <span key={a} className="bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-xl border border-gray-200 font-medium shadow-2xs">
                                                    ✓ {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Room Narrative Specification</p>
                                    <p className="leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200 italic m-0 text-xs">
                                        "{selectedRoom.description || "No specific narrative text provided for this room."}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex flex-wrap justify-between items-center gap-3">
                            <button
                                onClick={() => handleDelete(selectedRoom._id)}
                                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-semibold px-4 py-2 text-xs rounded-xl transition shadow-2xs"
                            >
                                <Trash2 size={14} /> Delete Unit
                            </button>

                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => handleToggleStatus(selectedRoom._id)}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition shadow-2xs ${selectedRoom.isActive
                                            ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                                            : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                                        }`}
                                >
                                    {selectedRoom.isActive ? <><PowerOff size={14} /> Deactivate</> : <><Power size={14} /> Activate</>}
                                </button>
                                <button
                                    onClick={() => {
                                        navigate(`/hotel/room?edit=${selectedRoom._id}`);
                                        setSelectedRoom(null);
                                    }}
                                    className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-5 py-2 rounded-xl font-bold transition shadow-2xs flex items-center gap-1.5"
                                >
                                    <Edit2 size={13} /> Edit Data
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default AllRooms;