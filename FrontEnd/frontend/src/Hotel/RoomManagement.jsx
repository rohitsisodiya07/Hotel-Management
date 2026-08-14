import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { Plus, Edit2, Loader2, BedDouble, Users, Hotel, ChevronDown, CheckSquare, XCircle, Info, UploadCloud, CheckCircle2, X, Trash2 } from "lucide-react";
import { Toaster, toast } from "sonner";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
];
const MAX_SIZE = 1024 * 1024; // 1 MB
const MAX_IMAGES = 10;

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
    const [previewImages, setPreviewImages] = useState([]); // 🌟 Image Previews State
    const [existingImages, setExistingImages] = useState([]);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formError, setFormError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const roomTypes = ["Standard", "Deluxe", "Super Deluxe", "Suite", "Family Room"];
    const bedTypes = ["Single", "Double", "Queen", "King"];

    const standardRoomAmenities = [
        "Air Conditioning (AC)",
        "Free High-Speed Wi-Fi",
        "Smart TV",
        "King Size Bed",
        "Queen Size Bed",
        "Twin Beds",
        "Premium Mattress",
        "Private Balcony",
        "Garden View",
        "Pool View",
        "City View",
        "Mountain View",
        "Sea View",
        "Lake View",
        "River View",
        "Complimentary Tea/Coffee Maker",
        "Electric Kettle",
        "Mini Bar",
        "Bottled Drinking Water",
        "Work Desk & Chair",
        "Wardrobe",
        "Reading Lamp",
        "USB Charging Ports",
        "Telephone",
        "Electronic Safe",
        "Attached Bathroom",
        "Rain Shower",
        "Bathtub",
        "Hot & Cold Water",
        "Luxury Toiletries",
        "Hair Dryer",
        "Bathrobe & Slippers",
        "Fresh Towels",
        "Iron & Ironing Board",
        "Blackout Curtains",
        "Sofa Seating Area",
        "Dining Table",
        "Soundproof Room",
        "Non-Smoking Room",
        "Daily Housekeeping",
        "24/7 Room Service",
        "Laundry Service",
        "Wake-up Call Service",
        "Power Backup",
        "Smoke Detector",
        "Fire Safety Alarm"
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
            setSelectedImages([]);
            setPreviewImages([]);
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
            setSelectedImages([]);
            setPreviewImages([]);
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
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        if (files.length > MAX_IMAGES) {
            return setFormError("Maximum 10 images are allowed.");
        }

        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return setFormError("Only JPG, JPEG and PNG images are allowed.");
            }

            if (file.size > MAX_SIZE) {
                return setFormError("Each image size should be less than 1 MB.");
            }
        }

        setSelectedImages(files);
        setPreviewImages(files.map((file) => URL.createObjectURL(file)));
        setFormError("");
    };

    // 🌟 Remove newly selected image from preview
    const removeSelectedImage = (index) => {
        const updatedImages = selectedImages.filter((_, i) => i !== index);
        const updatedPreviews = previewImages.filter((_, i) => i !== index);
        setSelectedImages(updatedImages);
        setPreviewImages(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSuccessMsg("");

        if (!formData.roomNumber.toString().trim()) return setFormError("Room identity number is mandatory.");
        if (!formData.pricePerNight || Number(formData.pricePerNight) <= 0) return setFormError("Pricing per night metrics must be a positive count.");
        if (!editId && selectedImages.length < 2) return setFormError("System constraint: Upload at least 2 clear picture assets.");

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
                const messageText = editId ? "Room configuration updated successfully!" : "Room structure compiled and deployed successfully!";
                setSuccessMsg(messageText);
                setModalMessage(messageText);
                setShowSuccessModal(true);
                toast.success(messageText);

                if (!editId) {
                    setFormData({
                        roomNumber: "", roomType: "Standard", pricePerNight: "", maxOccupancy: "2",
                        totalBeds: "1", bedType: "Double", roomSize: "", description: "", isFeatured: false
                    });
                    setAmenitiesList([]);
                    setSelectedImages([]);
                    setPreviewImages([]);
                }
                fetchRoomsInventory();
            }
        } catch (error) {
            console.error("Room Submission Error:", error);
            const errorMsgText = error.response?.data?.message || "Operational data layer synchronization failure.";
            setFormError(errorMsgText);
            toast.error(errorMsgText);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        if (editId) {
            navigate("/hotel/room");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 text-gray-800 font-['Inter',sans-serif] max-w-[1600px] mx-auto pb-12 relative">
            <Toaster position="top-right" richColors />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
                .custom-checkbox:checked { background-color: #2563EB; border-color: #2563EB; }
            `}</style>

            <div className="grid lg:grid-cols-3 gap-6 items-start">

                {/* Left Side Section: Inventory Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                    <div className="border-b border-gray-100 px-6 sm:px-8 py-5 bg-gray-50/60 flex justify-between items-center">
                        <div>
                            <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase block mb-1">
                                {editId ? "Update Framework" : "Inventory Creation"}
                            </span>
                            <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-xl text-gray-900 m-0 tracking-tight">
                                {editId ? `Edit Room No. ${formData.roomNumber}` : "Add New Room"}
                            </h2>
                        </div>
                        {editId && (
                            <button
                                onClick={() => navigate("/hotel/room")}
                                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs"
                            >
                                <XCircle size={14} /> Cancel Edit
                            </button>
                        )}
                    </div>

                    <div className="p-6 sm:p-8">
                        {formError && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-start gap-2 shadow-2xs">
                                <Info size={16} className="shrink-0 mt-0.5" /> {formError}
                            </div>
                        )}
                        {successMsg && !showSuccessModal && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl flex items-start gap-2 shadow-2xs">
                                <CheckSquare size={16} className="shrink-0 mt-0.5" /> {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-5">

                            {/* Row 1 */}
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Room Identity Number <span className="text-rose-500">*</span></label>
                                    <input type="text" name="roomNumber" placeholder="e.g. 101" value={formData.roomNumber} onChange={handleChange} className="w-full border border-gray-200 px-4 h-11 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-gray-50/50 focus:bg-white text-xs font-medium transition shadow-2xs" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Pricing Per Night (₹) <span className="text-rose-500">*</span></label>
                                    <input type="number" name="pricePerNight" placeholder="e.g. 3500" value={formData.pricePerNight} onChange={handleChange} className="w-full border border-gray-200 px-4 h-11 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-gray-50/50 focus:bg-white text-xs font-medium transition shadow-2xs" />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Room Category Class <span className="text-rose-500">*</span></label>
                                    <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full border border-gray-200 px-4 h-11 rounded-xl outline-none focus:border-blue-500 bg-white text-xs font-medium cursor-pointer shadow-2xs">
                                        {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Bedding Class <span className="text-rose-500">*</span></label>
                                    <select name="bedType" value={formData.bedType} onChange={handleChange} className="w-full border border-gray-200 px-4 h-11 rounded-xl outline-none focus:border-blue-500 bg-white text-xs font-medium cursor-pointer shadow-2xs">
                                        {bedTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Max Occupancy <span className="text-rose-500">*</span></label>
                                    <input type="number" name="maxOccupancy" value={formData.maxOccupancy} onChange={handleChange} className="w-full border border-gray-200 px-4 h-11 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-xs font-medium transition shadow-2xs" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Total Beds Count <span className="text-rose-500">*</span></label>
                                    <input type="number" name="totalBeds" value={formData.totalBeds} onChange={handleChange} className="w-full border border-gray-200 px-4 h-11 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-xs font-medium transition shadow-2xs" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Room Size (Sq Ft)</label>
                                    <input type="number" name="roomSize" placeholder="Optional" value={formData.roomSize} onChange={handleChange} className="w-full border border-gray-200 px-4 h-11 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-xs font-medium transition shadow-2xs" />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Amenities Select Dropdown */}
                            <div ref={dropdownRef} className="relative">
                                <label className="block text-gray-700 text-xs font-bold mb-1.5">Select Room Amenities <span className="text-rose-500">*</span></label>
                                <div onClick={() => setDropdownOpen((v) => !v)} className="w-full border border-gray-200 px-4 min-h-[44px] py-2 rounded-xl flex items-center justify-between bg-gray-50/50 hover:bg-white text-xs cursor-pointer select-none transition shadow-2xs">
                                    <span className={amenitiesList.length === 0 ? "text-gray-400 font-medium" : "text-gray-900 font-semibold"}>
                                        {amenitiesList.length === 0 ? "Choose available features..." : `${amenitiesList.length} Features Selected`}
                                    </span>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                                </div>

                                {dropdownOpen && (
                                    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 p-2 space-y-0.5">
                                        {standardRoomAmenities.map((amenity, idx) => {
                                            const isChecked = amenitiesList.includes(amenity);
                                            return (
                                                <label key={idx} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer select-none transition text-xs ${isChecked ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}>
                                                    <input type="checkbox" checked={isChecked} onChange={() => handleAmenityCheckboxChange(amenity)} className="w-4 h-4 accent-blue-600 cursor-pointer rounded" />
                                                    <span>{amenity}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Selected Amenities Chips */}
                            {amenitiesList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 bg-gray-50 p-3.5 border border-gray-200 rounded-xl shadow-inner">
                                    {amenitiesList.map((amenity, idx) => (
                                        <span key={idx} className="bg-white border border-gray-200 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                                            {amenity.split(" (")[0]}
                                            <button type="button" onClick={() => handleAmenityCheckboxChange(amenity)} className="text-rose-500 hover:text-rose-700 font-bold transition">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <hr className="border-gray-100" />

                            {/* Media File Upload */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-1.5">Media Assets {editId && <span className="text-gray-400 font-normal">(Leave empty to retain existing)</span>} <span className="text-rose-500">*</span></label>

                                {editId && existingImages.length > 0 && (
                                    <div className="mb-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                                        <p className="text-gray-400 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-widest mb-2.5">Current Active Images</p>
                                        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                                            {existingImages.map((img, i) => (
                                                <img key={i} src={img} alt="Current" className="h-14 w-18 object-cover rounded-lg border border-gray-200 shadow-2xs" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/60 hover:bg-gray-50 p-6 text-center transition cursor-pointer">
                                    <input type="file" multiple accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <UploadCloud className="mx-auto text-gray-400 mb-2" size={28} />
                                    <p className="text-xs font-bold text-gray-800">Click or drag images here to upload</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Only JPG, JPEG & PNG<br />
                                        Maximum size: 1 MB each<br />
                                        Minimum 2 images, Maximum 10 images
                                    </p>
                                </div>

                                {/* 🌟 Image Previews Grid with Cut/Delete Button */}
                                {previewImages.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2">
                                            Selected Images Preview ({previewImages.length}/{MAX_IMAGES})
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {previewImages.map((src, index) => (
                                                <div key={index} className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white relative group shadow-2xs">
                                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSelectedImage(index)}
                                                        className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100" />

                            {/* Description */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-1.5">Overview Summary / Description</label>
                                <textarea name="description" rows="3" placeholder="Describe the room, its features, and overall vibe..." value={formData.description} onChange={handleChange} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-xs resize-none transition shadow-2xs leading-relaxed" />
                            </div>

                            {/* Featured Checkbox */}
                            <div className="flex items-center gap-2.5 pt-1">
                                <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="custom-checkbox w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                                <label htmlFor="isFeatured" className="text-gray-700 text-xs font-medium cursor-pointer select-none">Mark this room as a <strong className="text-gray-900">Featured Room</strong></label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button type="submit" disabled={loading} className="w-full sm:w-auto h-11 px-7 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-2xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                                    {loading && <Loader2 size={15} className="animate-spin" />}
                                    {loading ? "Processing..." : (editId ? "Save Updated Configurations" : "Deploy Room")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side Section Control Box: Live Inventory */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="border border-gray-200 bg-white rounded-2xl shadow-2xs overflow-hidden sticky top-6">
                        <div className="p-5 bg-gray-50/60 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase block mb-0.5">Live Ledger</span>
                                <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-lg text-gray-900 m-0">Room Catalog</h2>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700 font-['IBM_Plex_Mono']">
                                {rooms.length}
                            </span>
                        </div>

                        <div className="p-4 bg-white min-h-[400px]">
                            {fetchLoading ? (
                                <div className="py-20 text-center space-y-3 flex flex-col items-center">
                                    <Loader2 size={24} className="text-blue-600 animate-spin" />
                                    <p className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-gray-400 uppercase tracking-widest">Fetching Data</p>
                                </div>
                            ) : rooms.length === 0 ? (
                                <div className="py-16 text-center border border-dashed border-gray-200 bg-gray-50/50 rounded-xl">
                                    <Hotel size={30} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-gray-500 text-xs font-medium m-0">No active rooms deployed yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 scrollbar-hide">
                                    {rooms.map((room) => (
                                        <div key={room._id} className={`border ${editId === room._id ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 bg-white'} rounded-xl overflow-hidden shadow-2xs flex flex-col p-3.5 hover:border-blue-400 transition duration-200 group`}>
                                            <div className="flex gap-3.5">
                                                <img src={room.roomImages?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=150"} alt="Unit" className="w-16 h-16 object-cover rounded-lg border border-gray-100 shrink-0 shadow-2xs" />
                                                <div className="min-w-0 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="font-['Space_Grotesk',sans-serif] font-bold text-sm text-gray-900 m-0 leading-tight">No. {room.roomNumber}</h4>
                                                        <p className="text-gray-500 text-[11px] font-medium mt-0.5">{room.roomType}</p>
                                                    </div>
                                                    <div className="flex justify-between items-end mt-1">
                                                        <span className="font-bold text-blue-600 text-xs">₹{room.pricePerNight}</span>
                                                        <div className="flex gap-2 text-gray-400 text-[10px]">
                                                            <span className="flex items-center gap-0.5 font-medium"><Users size={11} /> {room.maxOccupancy}</span>
                                                            <span className="flex items-center gap-0.5 font-medium"><BedDouble size={11} /> {room.totalBeds}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => navigate(`?edit=${room._id}`)} className="text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 px-3 py-1 text-[11px] rounded-lg font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer">
                                                    <Edit2 size={11} /> Edit Detail
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Success Popup Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-gray-200 rounded-2xl p-7 w-full max-w-[380px] shadow-2xl text-center relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                            <CheckCircle2 size={24} />
                        </div>

                        <span className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.15em] text-blue-600 uppercase font-bold block mb-1">
                            SYSTEM NOTIFICATION
                        </span>

                        <h3 className="font-['Space_Grotesk',sans-serif] text-lg font-bold text-gray-900 mb-1.5">
                            Successfully Synchronized!
                        </h3>

                        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                            {modalMessage}
                        </p>

                        <button
                            onClick={handleCloseModal}
                            className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                        >
                            Okay, Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;