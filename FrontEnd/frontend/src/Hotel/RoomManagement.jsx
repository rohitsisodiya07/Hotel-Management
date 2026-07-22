import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom"; // Naya import Edit mode ke liye
import { signupApi } from "../api";

const RoomManagement = () => {
    
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit"); 
    const navigate = useNavigate();

  
    const [formData, setFormData] = useState({
        roomNumber: "",
        roomType: "Standard",
        pricePerNight: "",
        maxOccupancy: "2",
        totalBeds: "1",
        bedType: "Double",
        roomSize: "",
        description: "",
        isFeatured: false
    });

    const [amenitiesList, setAmenitiesList] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]); 

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

  
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formError, setFormError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

  
    const roomTypes = ["Standard", "Deluxe", "Super Deluxe", "Suite", "Family Room"];
    const bedTypes = ["Single", "Double", "Queen", "King"];

    
    const standardRoomAmenities = [
        "Air Conditioning (AC)",
        "Free High-Speed Wi-Fi",
        "Smart TV / Cable",
        "Mini Bar Fridge",
        "Attached Balcony View",
        "Complimentary Tea/Coffee Maker",
        "Electronic Safety Deposit Vault",
        "Premium En-suite Bathroom",
        "24/7 Room Dining Service",
        "Work Desk & Ergonomic Chair"
    ];

    const fetchRoomsInventory = async () => {
        try {
            setFetchLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(`${signupApi}room/myRooms`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.success) {
                setRooms(response.data.rooms);
            }
        } catch (error) {
            console.error("Fetch Rooms Matrix Interrupted:", error);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchSingleRoomForEdit = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${signupApi}room/view/${editId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.room;

            setFormData({
                roomNumber: data.roomNumber,
                roomType: data.roomType,
                pricePerNight: data.pricePerNight,
                maxOccupancy: data.maxOccupancy,
                totalBeds: data.totalBeds,
                bedType: data.bedType,
                roomSize: data.roomSize || "",
                description: data.description || "",
                isFeatured: data.isFeatured
            });
            setAmenitiesList(data.roomAmenities || []);
            setExistingImages(data.roomImages || []);
            setFormError("");
        } catch (error) {
            setFormError("Failed to load room details for editing.");
        }
    };

    useEffect(() => {
        fetchRoomsInventory();

        
        if (editId) {
            fetchSingleRoomForEdit();
        } else {
            
            setFormData({
                roomNumber: "", roomType: "Standard", pricePerNight: "", maxOccupancy: "2",
                totalBeds: "1", bedType: "Double", roomSize: "", description: "", isFeatured: false
            });
            setAmenitiesList([]);
            setExistingImages([]);
        }

       
        const closeDropdownHandler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", closeDropdownHandler);
        return () => document.removeEventListener("mousedown", closeDropdownHandler);
    }, [editId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        setFormError("");
    };

    
    const handleAmenityCheckboxChange = (amenity) => {
        setAmenitiesList((prev) =>
            prev.includes(amenity)
                ? prev.filter((item) => item !== amenity)
                : [...prev, amenity]
        );
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedImages(Array.from(e.target.files));
            setFormError("");
        }
    };

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSuccessMsg("");

        // Simple input checks
        if (!formData.roomNumber.toString().trim()) return setFormError("Room identity number is mandatory.");
        if (!formData.pricePerNight || Number(formData.pricePerNight) <= 0) return setFormError("Pricing per night metrics must be a positive count.");

       
        if (!editId && selectedImages.length < 2) return setFormError("Mongoose constraint: Please upload at least 2 clear picture assets.");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const dataPayload = new FormData();
            dataPayload.append("roomNumber", formData.roomNumber.toString().trim());
            dataPayload.append("roomType", formData.roomType);
            dataPayload.append("pricePerNight", formData.pricePerNight);
            dataPayload.append("maxOccupancy", formData.maxOccupancy);
            dataPayload.append("totalBeds", formData.totalBeds);
            dataPayload.append("bedType", formData.bedType);
            dataPayload.append("roomSize", formData.roomSize || 0);
            dataPayload.append("description", formData.description.trim());
            dataPayload.append("isFeatured", formData.isFeatured);
            dataPayload.append("roomAmenities", amenitiesList.join(","));

            selectedImages.forEach((file) => {
                dataPayload.append("roomImages", file);
            });

            // Dynamic API URL and Method
            const url = editId ? `${signupApi}room/update/${editId}` : `${signupApi}room/create`;
            const method = editId ? 'put' : 'post';

            const response = await axios({
                method,
                url,
                data: dataPayload,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data?.success) {
                setSuccessMsg(editId ? "Room configuration updated successfully!" : "Room structure compiled and deployed successfully!");

                if (editId) {
                    // Edit mode - wapas default path pe jao (Add Mode)
                    setTimeout(() => {
                        navigate("/hotel/room");
                        setSuccessMsg("");
                    }, 1500);
                } else {
                    // Create mode - form reset karo
                    setFormData({
                        roomNumber: "", roomType: "Standard", pricePerNight: "", maxOccupancy: "2",
                        totalBeds: "1", bedType: "Double", roomSize: "", description: "", isFeatured: false
                    });
                    setAmenitiesList([]);
                    setSelectedImages([]);
                }
                fetchRoomsInventory(); // Auto refresh listings
            }
        } catch (error) {
            console.error("Room Submission Error:", error);
            setFormError(error.response?.data?.message || "Operational data layer synchronization failure.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-200 text-[#232320]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

            <div className="grid lg:grid-cols-5 gap-8 items-start">

                {/* Left Side Section: Inventory Form */}
                <div className="lg:col-span-3 border border-[#E5E2D5] bg-white rounded-[3px] p-6 shadow-xs">

                    <div className="flex justify-between items-start mb-6 pb-3 border-b border-[#FAF9F5]">
                        <div>
                            <span className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.2em] text-[#A2782E] font-bold uppercase block mb-1">
                                {editId ? "Update Framework" : "Inventory Creation Framework"}
                            </span>
                            <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-xl text-[#1B2537] mt-0">
                                {editId ? `Edit Unit ${formData.roomNumber}` : "Add New Inventory Room"}
                            </h2>
                        </div>
                        {editId && (
                            <button
                                onClick={() => navigate("/hotel/room")}
                                className="text-[11px] font-bold uppercase tracking-wider bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#616161] px-3 py-1.5 rounded-[2px] transition"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    {formError && <div className="mb-5 p-3.5 bg-[#FFF8F7] border border-[#E7C9C3]/60 text-[#8E3B30] text-[13px] font-medium rounded-[2px]">✕ {formError}</div>}
                    {successMsg && <div className="mb-5 p-3.5 bg-[#E8F5E9] border border-[#C8E6C9]/60 text-[#2E7D32] text-[13px] font-medium rounded-[2px]">✓ {successMsg}</div>}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5 text-[13px] font-medium">

                        {/* Identifiers Numbers Grid Rows */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#4A473D] mb-1.5">Room Identity Number *</label>
                                <input type="text" name="roomNumber" placeholder="e.g. 101" value={formData.roomNumber} onChange={handleChange} className="w-full border border-[#E1DECF] px-3 h-10 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320]" />
                            </div>
                            <div>
                                <label className="block text-[#4A473D] mb-1.5">Pricing Per Night (₹) *</label>
                                <input type="number" name="pricePerNight" placeholder="e.g. 3500" value={formData.pricePerNight} onChange={handleChange} className="w-full border border-[#E1DECF] px-3 h-10 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320]" />
                            </div>
                        </div>

                        {/* Dropdown Type Enums selections */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#4A473D] mb-1.5">Room Category Class *</label>
                                <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full border border-[#E1DECF] px-3 h-10 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] cursor-pointer">
                                    {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#4A473D] mb-1.5">Bedding Class *</label>
                                <select name="bedType" value={formData.bedType} onChange={handleChange} className="w-full border border-[#E1DECF] px-3 h-10 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] cursor-pointer">
                                    {bedTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Numeric limits metadata */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[#4A473D] mb-1.5">Max Occupancy *</label>
                                <input type="number" name="maxOccupancy" value={formData.maxOccupancy} onChange={handleChange} className="w-full border border-[#E1DECF] px-3 h-10 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320]" />
                            </div>
                            <div>
                                <label className="block text-[#4A473D] mb-1.5">Total Beds Count *</label>
                                <input type="number" name="totalBeds" value={formData.totalBeds} onChange={handleChange} className="w-full border border-[#E1DECF] px-3 h-10 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320]" />
                            </div>
                            <div>
                                <label className="block text-[#4A473D] mb-1.5">Room Size (Sq Ft)</label>
                                <input type="number" name="roomSize" placeholder="Optional" value={formData.roomSize} onChange={handleChange} className="w-full border border-[#E1DECF] px-3 h-10 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320]" />
                            </div>
                        </div>

                        {/* Interactive Selection Amenities Dropdown List Block */}
                        <div ref={dropdownRef} className="relative">
                            <label className="block text-[#4A473D] mb-1.5">Select Room Amenities Blueprint *</label>
                            <div onClick={() => setDropdownOpen((v) => !v)} className="w-full border border-[#E1DECF] px-3 min-h-[40px] py-2 rounded-[2px] flex items-center justify-between bg-white text-[#232320] cursor-pointer select-none focus-within:border-[#A2782E]">
                                <span className={amenitiesList.length === 0 ? "text-[#8C8676]" : "text-[#232320] font-medium"}>
                                    {amenitiesList.length === 0 ? "Choose room features matrix items..." : `${amenitiesList.length} Amenities Selected`}
                                </span>
                                <svg className={`text-[#8C8676] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </div>

                            {dropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E5E2D5] rounded-[3px] shadow-lg max-h-60 overflow-y-auto z-50 p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {standardRoomAmenities.map((amenity, idx) => {
                                        const isChecked = amenitiesList.includes(amenity);
                                        return (
                                            <label key={idx} className={`flex items-center gap-3 px-3 py-2 rounded-[2px] cursor-pointer select-none transition ${isChecked ? "bg-[rgba(162,120,46,0.04)] text-[#A2782E]" : "hover:bg-[#FCFBF9] text-[#4A473D]"}`}>
                                                <input type="checkbox" checked={isChecked} onChange={() => handleAmenityCheckboxChange(amenity)} className="w-4 h-4 accent-[#A2782E] cursor-pointer" />
                                                <span className="font-medium text-[12.5px]">{amenity}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Badges visual chip grid output loop */}
                            {amenitiesList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 bg-[#FCFBF9] p-3 border border-[#E5E2D5] rounded-[2px]">
                                    {amenitiesList.map((amenity, idx) => (
                                        <span key={idx} className="bg-white border border-[#E5E2D5] text-[#A2782E] text-[12px] px-2.5 py-1 rounded-[2px] flex items-center gap-1 animate-in scale-in duration-700 font-medium">
                                            {amenity.split(" (")[0]}
                                            <button type="button" onClick={() => handleAmenityCheckboxChange(amenity)} className="text-[#8E3B30] font-bold hover:text-red-700 ml-1 text-[13px] cursor-pointer">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Binary File Input Blocks */}
                        <div className="bg-[#FCFBF9] p-4 border border-[#E1DECF] rounded-[2px]">
                            <label className="block text-[#4A473D] mb-1.5 font-bold">Media Assets {editId ? "(Optional)" : "*"}</label>

                            {editId && existingImages.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-[#8C8676] text-[11px] font-['IBM_Plex_Mono',monospace] uppercase tracking-wider mb-2">Current Active Images</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {existingImages.map((img, i) => (
                                            <img key={i} src={img} alt="Current" className="h-14 w-16 object-cover rounded-[2px] border border-[#E5E2D5]" />
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-[#A2782E] mt-1">Upload below only to replace existing media.</p>
                                </div>
                            )}

                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full file:bg-white file:border file:border-[#E5E2D5] file:text-[#1B2537] file:px-4 file:py-2 file:rounded-[2px] file:mr-4 file:font-semibold file:cursor-pointer cursor-pointer border border-[#E1DECF] p-1.5 rounded-[2px] text-[#8C8676] bg-white mt-1" />

                            {selectedImages.length > 0 && (
                                <p className="m-0 mt-2 text-[12px] font-['IBM_Plex_Mono',monospace] text-[#A2782E] font-bold">
                                    ✓ {selectedImages.length} new files ready for deployment.
                                </p>
                            )}
                        </div>

                        {/* Long text fields description area */}
                        <div>
                            <label className="block text-[#4A473D] mb-1.5">Overview Summary / Description</label>
                            <textarea name="description" rows="3" placeholder="Enter structural or special visual descriptions of the room features..." value={formData.description} onChange={handleChange} className="w-full border border-[#E1DECF] p-3 rounded-[2px] outline-none focus:border-[#A2782E] bg-white text-[#232320] resize-none" />
                        </div>

                        {/* Featured Checkbox toggle switches */}
                        <div className="flex items-center gap-2.5 pt-1">
                            <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 accent-[#A2782E] cursor-pointer" />
                            <label htmlFor="isFeatured" className="text-[#4A473D] cursor-pointer select-none">Flag this room node as a **Featured Unit** highlight</label>
                        </div>

                        {/* Form execution trigger */}
                        <button type="submit" disabled={loading} className="w-full h-11 bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] text-[13.5px] font-['Space_Grotesk',sans-serif] font-bold uppercase rounded-[2px] tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading && <div className="w-4 h-4 border-2 border-[#FFF9EC] border-t-transparent rounded-full animate-spin"></div>}
                            {loading ? "Processing..." : (editId ? "Save Updated Configurations" : "Compile & Deploy Room")}
                        </button>
                    </form>
                </div>

                {/* Right Side Section Control Box: Live Inventory */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border border-[#E5E2D5] bg-white rounded-[3px] p-6 shadow-xs min-h-[500px]">
                        <span className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.2em] text-[#8C8676] font-bold uppercase block mb-1">Live Inventory Ledger</span>
                        <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-xl text-[#1B2537] mt-0 mb-6 pb-3 border-b border-[#FAF9F5]">Rooms Catalog ({rooms.length})</h2>

                        {fetchLoading ? (
                            <div className="py-20 text-center space-y-2">
                                <div className="w-6 h-6 border-2 border-[#A2782E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="py-24 text-center border border-dashed border-[#E5E2D5] bg-[#FCFBF9] rounded-[2px]">
                                <p className="text-[#8C8676] m-0">No active rooms deployed yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
                                {rooms.map((room) => (
                                    <div key={room._id} className={`border ${editId === room._id ? 'border-[#A2782E] bg-[rgba(162,120,46,0.02)]' : 'border-[#E5E2D5] bg-white'} rounded-[3px] overflow-hidden shadow-xs flex gap-4 p-3 hover:border-[#A2782E] transition duration-150`}>
                                        <img src={room.roomImages?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=150"} alt="Unit" className="w-24 h-24 object-cover rounded-[2px] border border-[#E5E2D5] bg-[#FCFBF9] shrink-0" />
                                        <div className="min-w-0 flex-1 flex flex-col justify-between text-[13px]">
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-['Space_Grotesk',sans-serif] font-bold text-[15px] m-0 text-[#1B2537]">Unit {room.roomNumber}</h4>
                                                    <button onClick={() => navigate(`?edit=${room._id}`)} className="text-[#A2782E] text-[10px] uppercase font-bold hover:underline tracking-wider cursor-pointer">
                                                        Edit
                                                    </button>
                                                </div>
                                                <p className="text-[#8C8676] text-[12px] m-0 mt-0.5 font-medium">{room.roomType}</p>
                                            </div>
                                            <div className="flex items-end justify-between border-t pt-2 border-[#FAF9F5] mt-2">
                                                <span className="font-['Space_Grotesk',sans-serif] font-bold text-[#A2782E] text-[14.5px]">₹{room.pricePerNight}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RoomManagement;