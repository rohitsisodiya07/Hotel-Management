import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";

const PendingHotels = () => {
    const [activeTab, setActiveTab] = useState("pending");

    const [pendingHotels, setPendingHotels] = useState([]);

    const [rejectedHotels, setRejectedHotels] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showApprove, setShowApprove] = useState(false);

    const [showReject, setShowReject] = useState(false);

    const [showView, setShowView] = useState(false);

    const [selectedHotel, setSelectedHotel] = useState(null);

    const [viewHotel, setViewHotel] = useState(null);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [remark, setRemark] = useState("");

    useEffect(() => {
        getPendingHotels();
        getRejectedHotels();
    }, []);

    const getPendingHotels = async () => {
        try {
            const response = await axios.get(`${signupApi}hotel/pending`);

            setPendingHotels(response.data.hotels);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getRejectedHotels = async () => {
        try {
            const response = await axios.get(`${signupApi}hotel/rejected`);

            setRejectedHotels(response.data.hotels);
        } catch (error) {
            console.log(error);
        }
    };

    const handleApprove = async () => {
        if (!password.trim()) {
            return alert("Password is required");
        }

        try {
            const response = await axios.patch(
                `${signupApi}hotel/approve/${selectedHotel._id}`,
                { password }
            );

            alert(response.data.message);

            setPassword("");
            setShowApprove(false);
            setSelectedHotel(null);

            getPendingHotels();
            getRejectedHotels();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const handleReject = async () => {
        if (!remark.trim()) {
            return alert("Remark is required");
        }

        try {
            const response = await axios.patch(
                `${signupApi}hotel/reject/${selectedHotel._id}`,
                { remark }
            );

            alert(response.data.message);

            setRemark("");
            setShowReject(false);
            setSelectedHotel(null);

            getPendingHotels();
            getRejectedHotels();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const hotels = activeTab === "pending" ? pendingHotels : rejectedHotels;

    const locationOf = (hotel) =>
        [
            hotel.city?.cityName,
            hotel.city?.districtId?.districtName,
            hotel.city?.districtId?.stateId?.stateName,
        ]
            .filter(Boolean)
            .join(", ");

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center font-sans"
                style={{
                    background:
                        "radial-gradient(1200px 480px at 8% -10%, #F3F1EA 0%, #ECE9DF 42%, #E6E2D5 100%)",
                }}
            >
                <p className="text-[#8B8474] text-sm">Loading…</p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen font-sans p-6"
            style={{
                background:
                    "radial-gradient(1400px 560px at 4% -12%, #F3F1EA 0%, #ECE9DF 45%, #E6E2D5 100%)",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .reg-card {
          background: #FFFEFB;
          box-shadow: 0 1px 2px rgba(30,28,20,0.04), 0 10px 30px -14px rgba(30,28,20,0.10);
        }
        .reg-card-hover:hover {
          box-shadow: 0 1px 2px rgba(30,28,20,0.05), 0 20px 40px -16px rgba(30,28,20,0.18);
          transform: translateY(-2px);
        }
        .icon-toggle { color: #A39B8B; transition: color .15s ease; cursor: pointer; }
        .icon-toggle:hover { color: #5A554C; }
      `}</style>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.16em] text-[#9A927D] mb-1.5">
                            PARTNER ONBOARDING
                        </p>
                        <h1 className="text-[22px] font-medium text-[#201F19] tracking-tight">
                            Hotel requests
                        </h1>
                        <p className="text-[#8B8474] text-[13px] mt-1">
                            Review and manage hotel registration requests.
                        </p>
                    </div>

                    <div className="reg-card rounded-2xl px-6 py-4 border border-[#E3E0D4]">
                        <p className="font-mono text-[10px] tracking-[0.16em] text-[#9A927D]">
                            TOTAL REQUESTS
                        </p>
                        <h2 className="text-[28px] font-medium text-[#201F19] mt-0.5">
                            {pendingHotels.length + rejectedHotels.length}
                        </h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-7 border-b border-[#E3E0D4]">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`pb-3 -mb-px text-[13px] font-medium border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${activeTab === "pending"
                                ? "border-[#201F19] text-[#201F19]"
                                : "border-transparent text-[#A39B8B] hover:text-[#201F19]"
                            }`}
                    >
                        Pending
                        <span className="font-mono text-[11px] text-[#A39B8B]">{pendingHotels.length}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`pb-3 -mb-px text-[13px] font-medium border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${activeTab === "rejected"
                                ? "border-[#C6564A] text-[#201F19]"
                                : "border-transparent text-[#A39B8B] hover:text-[#201F19]"
                            }`}
                    >
                        Rejected
                        <span className="font-mono text-[11px] text-[#A39B8B]">{rejectedHotels.length}</span>
                    </button>
                </div>

                {/* No Data */}
                {hotels.length === 0 ? (
                    <div className="reg-card border border-[#E3E0D4] rounded-2xl p-14 text-center">
                        <p className="text-[#8B8474] text-sm">No hotels found in this list.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {hotels.map((hotel) => (
                            <div
                                key={hotel._id}
                                className="reg-card reg-card-hover border border-[#E3E0D4] rounded-2xl overflow-hidden transition-all duration-200"
                            >
                                <div className="relative">
                                    <img
                                        src={hotel.hotelImage}
                                        alt={`${hotel.hotelName} exterior`}
                                        className="w-full h-48 object-cover"
                                    />

                                    <span
                                        className="absolute top-3.5 right-3.5 font-mono text-[10px] tracking-[0.08em] font-medium px-2.5 py-1 rounded-full"
                                        style={{
                                            background: activeTab === "pending" ? "#FBF3E1" : "#FBECEA",
                                            color: activeTab === "pending" ? "#946B1F" : "#B04A3C",
                                        }}
                                    >
                                        {activeTab === "pending" ? "PENDING" : "REJECTED"}
                                    </span>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center gap-3.5 mb-4">
                                        <img
                                            src={hotel.ownerImage}
                                            alt={`${hotel.ownerName} portrait`}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-[#E3E0D4]"
                                        />

                                        <div className="min-w-0">
                                            <h2 className="text-[16px] font-medium text-[#201F19] truncate">
                                                {hotel.hotelName}
                                            </h2>
                                            <p className="text-[#8B8474] text-[12.5px] truncate">
                                                Owner · {hotel.ownerName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-[13px] text-[#5A554C] mb-4">
                                        <p className="truncate">{hotel.email}</p>
                                        <p>{hotel.mobile}</p>
                                        <p className="truncate">{locationOf(hotel)}</p>
                                        <p>
                                            {hotel.hotelType} · {hotel.totalRooms} rooms
                                        </p>
                                    </div>

                                    <div className="p-3 bg-[#FAF8F2] rounded-xl border border-[#EFEBDF]">
                                        <p className="text-[12.5px] text-[#5A554C] line-clamp-2">
                                            {hotel.description}
                                        </p>
                                    </div>

                                    {activeTab === "rejected" && hotel.remark && (
                                        <div className="mt-3 p-3 bg-[#FBECEA] rounded-xl">
                                            <p className="text-[12.5px] text-[#B04A3C]">
                                                <span className="font-medium">Reason: </span>
                                                {hotel.remark}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-5">
                                        <button
                                            onClick={() => {
                                                setViewHotel(hotel);
                                                setShowView(true);
                                            }}
                                            className="flex-1 h-10 rounded-lg border border-[#E3E0D4] text-[#5A554C] text-[13px] font-medium hover:bg-[#FAF8F2] transition-colors duration-150 cursor-pointer"
                                        >
                                            View
                                        </button>

                                        {activeTab === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedHotel(hotel);
                                                        setShowApprove(true);
                                                    }}
                                                    className="flex-1 h-10 rounded-lg bg-[#3E6E4A] text-white text-[13px] font-medium hover:bg-[#345D3E] transition-colors duration-150 cursor-pointer"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedHotel(hotel);
                                                        setShowReject(true);
                                                    }}
                                                    className="flex-1 h-10 rounded-lg bg-[#C6564A] text-white text-[13px] font-medium hover:bg-[#AE493E] transition-colors duration-150 cursor-pointer"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            {showApprove && (
                <div className="fixed inset-0 bg-[#1A1712]/45 backdrop-blur-[3px] flex items-center justify-center z-50 px-4">
                    <div className="reg-card p-7 rounded-2xl w-full max-w-[420px] border border-[#E3E0D4]">
                        <h2 className="text-[18px] font-medium text-[#201F19] mb-1.5">
                            Approve hotel
                        </h2>
                        <p className="text-[13px] text-[#8B8474] mb-5">
                            Set a login password for {selectedHotel?.hotelName}.
                        </p>

                        <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                            Password
                        </label>
                        <div className="relative mb-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                className="w-full border border-[#E3E0D4] px-3.5 pr-10 h-11 rounded-lg text-[13px] outline-none focus:border-[#B3AC97] focus:ring-2 focus:ring-[#B3AC97]/15 transition-all duration-150"
                            />
                            <span
                                className="icon-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </span>
                        </div>

                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={() => {
                                    setShowApprove(false);
                                    setPassword("");
                                }}
                                className="flex-1 h-11 border border-[#E3E0D4] rounded-lg text-[13px] font-medium text-[#5A554C] hover:bg-[#FAF8F2] transition-colors duration-150 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleApprove}
                                className="flex-1 h-11 bg-[#3E6E4A] text-white rounded-lg text-[13px] font-medium hover:bg-[#345D3E] transition-colors duration-150 cursor-pointer"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showReject && (
                <div className="fixed inset-0 bg-[#1A1712]/45 backdrop-blur-[3px] flex items-center justify-center z-50 px-4">
                    <div className="reg-card p-7 rounded-2xl w-full max-w-[440px] border border-[#E3E0D4]">
                        <h2 className="text-[18px] font-medium text-[#201F19] mb-1.5">
                            Reject hotel
                        </h2>
                        <p className="text-[13px] text-[#8B8474] mb-5">
                            Let {selectedHotel?.hotelName} know why this request wasn't approved.
                        </p>

                        <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
                            Rejection reason
                        </label>
                        <textarea
                            rows={4}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter rejection reason…"
                            autoFocus
                            className="w-full border border-[#E3E0D4] px-3.5 py-2.5 rounded-lg text-[13px] outline-none focus:border-[#B3AC97] focus:ring-2 focus:ring-[#B3AC97]/15 transition-all duration-150 resize-none"
                        />

                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={() => {
                                    setShowReject(false);
                                    setRemark("");
                                }}
                                className="flex-1 h-11 border border-[#E3E0D4] rounded-lg text-[13px] font-medium text-[#5A554C] hover:bg-[#FAF8F2] transition-colors duration-150 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleReject}
                                className="flex-1 h-11 bg-[#C6564A] text-white rounded-lg text-[13px] font-medium hover:bg-[#AE493E] transition-colors duration-150 cursor-pointer"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showView && viewHotel && (
                <div className="fixed inset-0 bg-[#1A1712]/45 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
                    <div className="reg-card w-full max-w-3xl rounded-2xl overflow-hidden border border-[#E3E0D4] max-h-[90vh] overflow-y-auto">
                        <img
                            src={viewHotel.hotelImage}
                            alt={`${viewHotel.hotelName} exterior`}
                            className="w-full h-64 object-cover"
                        />

                        <div className="p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={viewHotel.ownerImage}
                                    alt={`${viewHotel.ownerName} portrait`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-[#E3E0D4]"
                                />

                                <div>
                                    <h2 className="text-[22px] font-medium text-[#201F19] tracking-tight">
                                        {viewHotel.hotelName}
                                    </h2>
                                    <p className="text-[#8B8474] text-[13px]">Owner · {viewHotel.ownerName}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 text-[13.5px]">
                                <div>
                                    <p className="font-mono text-[10px] tracking-[0.1em] text-[#9A927D] mb-1">EMAIL</p>
                                    <p className="text-[#26221D]">{viewHotel.email}</p>
                                </div>
                                <div>
                                    <p className="font-mono text-[10px] tracking-[0.1em] text-[#9A927D] mb-1">MOBILE</p>
                                    <p className="text-[#26221D]">{viewHotel.mobile}</p>
                                </div>
                                <div>
                                    <p className="font-mono text-[10px] tracking-[0.1em] text-[#9A927D] mb-1">HOTEL TYPE</p>
                                    <p className="text-[#26221D]">{viewHotel.hotelType}</p>
                                </div>
                                <div>
                                    <p className="font-mono text-[10px] tracking-[0.1em] text-[#9A927D] mb-1">TOTAL ROOMS</p>
                                    <p className="text-[#26221D]">{viewHotel.totalRooms}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="font-mono text-[10px] tracking-[0.1em] text-[#9A927D] mb-1">ADDRESS</p>
                                    <p className="text-[#26221D]">{viewHotel.address}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="font-mono text-[10px] tracking-[0.1em] text-[#9A927D] mb-1">LOCATION</p>
                                    <p className="text-[#26221D]">{locationOf(viewHotel)}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="font-mono text-[10px] tracking-[0.1em] text-[#9A927D] mb-1">DESCRIPTION</p>
                                    <p className="text-[#26221D]">{viewHotel.description}</p>
                                </div>

                                {viewHotel.remark && (
                                    <div className="md:col-span-2 p-3 bg-[#FBECEA] rounded-xl">
                                        <p className="text-[#B04A3C]">
                                            <span className="font-medium">Rejection reason: </span>
                                            {viewHotel.remark}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-7">
                                <button
                                    onClick={() => {
                                        setShowView(false);
                                        setViewHotel(null);
                                    }}
                                    className="bg-[#201F19] text-[#F3EFE3] px-5 h-11 rounded-lg text-[13px] font-medium hover:bg-[#332F26] transition-colors duration-150 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingHotels;
