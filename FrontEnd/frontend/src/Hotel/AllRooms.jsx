import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { Search, Eye, Trash2, Power, Edit2, Users, BedDouble, Info } from "lucide-react";

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
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`${signupApi}room/status/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setRooms(prev => prev.map(r => r._id === id ? { ...r, isActive: !r.isActive } : r));
        } catch { alert("Failed to update status"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this room?")) return;
        try {
            await axios.delete(`${signupApi}room/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setRooms(prev => prev.filter(r => r._id !== id));
            setSelectedRoom(null);
        } catch { alert("Delete failed"); }
    };

    const filteredRooms = useMemo(() => {
        let data = [...rooms];
        if (statusFilter === "Active") data = data.filter(r => r.isActive);
        if (statusFilter === "Inactive") data = data.filter(r => !r.isActive);
        if (search) data = data.filter(r => r.roomNumber.toLowerCase().includes(search.toLowerCase()));
        return data;
    }, [rooms, search, statusFilter]);

    return (
        <div className="p-2 space-y-8">
            {/* Search and Tabs */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input type="text" placeholder="Search by room number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 outline-none" />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-full">
                    {["All", "Active", "Inactive"].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-6 py-2 rounded-full text-sm font-semibold transition ${statusFilter === s ? "bg-white shadow text-[#1B2537]" : "text-gray-500"}`}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Room Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRooms.map((room) => (
                    <div key={room._id} className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        {/* Image Preview */}
                        <div className="relative h-56 rounded-2xl overflow-hidden mb-4">
                            <img src={room.roomImages[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="room" />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">₹{room.pricePerNight} / night</div>
                        </div>

                        <div className="px-3 pb-3">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold">Unit {room.roomNumber}</h2>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${room.isActive ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}>
                                    {room.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-1">{room.description}</p>

                            <div className="flex gap-4 mb-6">
                                <div className="flex items-center gap-1.5 text-sm"><Users size={16} className="text-[#A2782E]" /> {room.maxOccupancy}</div>
                                <div className="flex items-center gap-1.5 text-sm"><BedDouble size={16} className="text-[#A2782E]" /> {room.totalBeds}</div>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <button onClick={() => setSelectedRoom(room)} className="col-span-2 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl flex justify-center"><Eye size={18} /></button>
                                
                                <button
                                    onClick={() => navigate(`/hotel/room?edit=${room._id}`)}
                                    className="bg-gray-100 hover:bg-blue-50 py-3 rounded-xl flex justify-center"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleToggleStatus(room._id)} className="bg-gray-100 hover:bg-yellow-50 py-3 rounded-xl flex justify-center"><Power size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Details Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative">
                        <button onClick={() => setSelectedRoom(null)} className="absolute top-6 right-6 bg-gray-100 p-2 rounded-full">✕</button>
                        <img src={selectedRoom.roomImages[0]} className="w-full h-64 object-cover rounded-2xl mb-6" alt="room" />
                        <h2 className="text-2xl font-bold mb-2">Unit {selectedRoom.roomNumber}</h2>
                        <p className="text-gray-600 mb-6">{selectedRoom.description}</p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {selectedRoom.roomAmenities.map(a => <span key={a} className="bg-orange-50 text-[#A2782E] px-3 py-1 text-xs rounded-full font-bold">{a}</span>)}
                        </div>

                        <button onClick={() => handleDelete(selectedRoom._id)} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100">Delete Room</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllRooms;