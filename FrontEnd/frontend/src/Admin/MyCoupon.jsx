import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";

const MyCoupon = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // "All", "Active", "Inactive"

    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showView, setShowView] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${signupApi}coupon/all`, { headers });
            setCoupons(response.data.result || []);
        } catch (error) {
            console.error("Fetch coupons pipeline exception:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.patch(`${signupApi}coupon/toggle-status/${id}`, {}, { headers });


            setCoupons((prev) =>
                prev.map((c) => (c._id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c))
            );

            if (selectedCoupon && selectedCoupon._id === id) {
                setSelectedCoupon((prev) => ({ ...prev, status: prev.status === "Active" ? "Inactive" : "Active" }));
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to alter target validation mapping variables.");
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you absolutely sure you want to drop this coupon deployment configuration permanently?");
        if (!confirmDelete) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${signupApi}coupon/delete/${id}`, { headers });
            alert("Coupon record successfully dropped from production cluster maps.");
            setCoupons((prev) => prev.filter((c) => c._id !== id));
            if (showView) setShowView(false);
        } catch (error) {
            alert(error.response?.data?.message || "Internal framework protection error executing node deletion.");
        }
    };

    const handleView = (coupon) => {
        setSelectedCoupon(coupon);
        setShowView(true);
    };

    const handleEdit = (id) => {

        navigate(`/admin/addCoupon?id=${id}`);
    };


    const filteredCoupons = useMemo(() => {
        let data = [...coupons];

        if (statusFilter !== "All") {
            data = data.filter((c) => c.status === statusFilter);
        }

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            data = data.filter((c) => c.couponCode?.toLowerCase().includes(searchLower));
        }

        return data;
    }, [coupons, search, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: coupons.length,
            active: coupons.filter((c) => c.status === "Active").length,
            inactive: coupons.filter((c) => c.status === "Inactive").length,
        };
    }, [coupons]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-[#1B2537] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h2 className="text-[#8C8676] font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider">
                        Loading vouchers database logs...
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="text-[#232320]">
            {/* Header controls interface bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:flex-1">
                    <input
                        type="text"
                        placeholder="Search coupon tokens code layout..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-[#E1DECF] rounded-[3px] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[#A2782E] transition bg-white"
                    />
                </div>
                <button
                    onClick={() => navigate("/admin/addCoupon")}
                    className="w-full sm:w-auto bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] px-6 py-3 rounded-[3px] font-['Space_Grotesk',sans-serif] font-medium text-[13.5px] transition-colors whitespace-nowrap uppercase tracking-wider"
                >
                    + Create Coupon
                </button>
            </div>

            {/* Tabs Switcher Panels Control Layout */}
            <div className="flex border-b border-[#E1DECF] mb-8 overflow-x-auto gap-2 scrollbar-none">
                {["All", "Active", "Inactive"].map((status) => {
                    const isActive = statusFilter === status;
                    const count = status === "All" ? stats.total : status === "Active" ? stats.active : stats.inactive;

                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-3 font-['Space_Grotesk',sans-serif] font-medium text-[14px] rounded-t-[3px] transition whitespace-nowrap border-b-2 -mb-[1px] ${isActive
                                ? "border-[#A2782E] text-[#1B2537] bg-[rgba(162,120,46,0.04)] font-semibold"
                                : "border-transparent text-[#8C8676] hover:text-[#1B2537] hover:bg-[#FCFBF7]"
                                }`}
                        >
                            {status} Campaigns
                            <span className={`ml-1.5 px-2 py-0.5 rounded-[2px] text-[11px] font-['IBM_Plex_Mono',monospace] font-bold ${isActive ? "bg-[#1B2537] text-[#FFF9EC]" : "bg-[#E1DECF] text-[#4A473D]"
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main Grid Render Structure */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCoupons.length === 0 && (
                    <div className="col-span-full bg-[#FCFBF7] rounded-[3px] border border-dashed border-[#E1DECF] p-16 text-center">
                        <h3 className="font-['Space_Grotesk',sans-serif] font-semibold text-[16px] text-[#1B2537]">No discount tokens available</h3>
                        <p className="text-[#8C8676] text-[13px] mt-1">Try tweaking your dynamic tab categories or keyword filters.</p>
                    </div>
                )}

                {filteredCoupons.map((coupon) => {
                    const isExpired = new Date(coupon.expiryDate) < new Date();
                    return (
                        <div
                            key={coupon._id}
                            className="bg-white rounded-[3px] border border-[#E1DECF] shadow-[0_1px_2px_rgba(30,28,20,0.02)] hover:shadow-[0_4px_12px_rgba(30,28,20,0.04)] transition-all flex flex-col justify-between overflow-hidden group"
                        >
                            {/* Top Banner Block details metrics */}
                            <div className="p-5 border-b border-[#FCFBF7] bg-[#FCFBF7]/50 relative flex justify-between items-start">
                                <div>
                                    <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase text-[#A2782E] tracking-wider font-semibold block mb-1">Voucher Token</span>
                                    <h2 className="font-['Space_Grotesk',sans-serif] text-[19px] font-bold text-[#1B2537] font-mono tracking-wide">
                                        {coupon.couponCode}
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`px-2 py-0.5 text-[10px] font-['IBM_Plex_Mono',monospace] font-semibold uppercase tracking-wider border rounded-[2px] ${coupon.status === "Active"
                                        ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]"
                                        : "bg-[#F5F5F5] border-[#E0E0E0] text-[#616161]"
                                        }`}>
                                        {coupon.status}
                                    </span>
                                    {isExpired && (
                                        <span className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] uppercase font-mono">
                                            Expired
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Central Dynamic specifications section */}
                            <div className="p-5 space-y-3 text-[13px] border-b border-[#FCFBF7]">
                                <div className="flex justify-between">
                                    <span className="text-[#8C8676]">Reduction Type</span>
                                    <span className="font-semibold text-[#1B2537]">{coupon.discountType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8C8676]">Discount Benefit</span>
                                    <span className="font-bold text-[#A2782E] text-[14px]">
                                        {coupon.discountType === "Percentage" ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Flat`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8C8676]">Lower Bounds Limit</span>
                                    <span className="font-medium text-[#232320]">Min. Spend ₹{coupon.minBookingAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8C8676]">Expiration Target</span>
                                    <span className="font-['IBM_Plex_Mono',monospace] text-[12px] text-[#4A473D]">
                                        {new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom utilities actions clusters bar panel */}
                            <div className="p-4 bg-white grid grid-cols-4 gap-2 items-center">
                                <button
                                    onClick={() => handleView(coupon)}
                                    className="col-span-2 bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] text-[12.5px] py-2 rounded-[2px] font-medium text-center transition-colors"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleEdit(coupon._id)}
                                    className="bg-white hover:bg-[#FCFBF7] border border-[#E1DECF] text-[#4A473D] text-[12.5px] py-2 rounded-[2px] font-medium text-center transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(coupon._id)}
                                    className={`text-[12.5px] py-2 rounded-[2px] font-medium border text-center transition-all ${coupon.status === "Active"
                                        ? "bg-[#FFF8E1] hover:bg-[#FFF3E0] border-[#FFECB3] text-[#E65100]"
                                        : "bg-[#E8F5E9] hover:bg-[#E8F5E9]/80 border-[#C8E6C9] text-[#2E7D32]"
                                        }`}
                                    title={coupon.status === "Active" ? "Deactivate Campaign" : "Restore & Activate Campaign"}
                                >
                                    {coupon.status === "Active" ? "Hold" : "Resto."}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Expanded Modal Layer Profile Inspection View */}
            {showView && selectedCoupon && (
                <div className="fixed inset-0 bg-[#1B2537]/40 flex justify-center items-center z-50 p-4 backdrop-blur-[2px]">
                    <div className="bg-white rounded-[3px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_24px_48px_-12px_rgba(30,28,20,0.25)] border border-[#E1DECF] animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b border-[#E1DECF] p-5 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="font-['Space_Grotesk',sans-serif] text-[18px] font-semibold text-[#1B2537]">Campaign Specification Profile</h2>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#A2782E] mt-0.5 uppercase tracking-wider">Unique Node mapping data</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowView(false);
                                    setSelectedCoupon(null);
                                }}
                                className="text-[#8C8676] hover:text-[#1B2537] text-[16px] w-7 h-7 bg-[#FCFBF7] rounded-[3px] flex items-center justify-center transition border border-[#E1DECF]"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content parameters payload table */}
                        <div className="p-6 space-y-5 text-[13.5px]">
                            <div className="grid grid-cols-2 gap-4 bg-[#FCFBF7] rounded-[3px] border border-[#E1DECF] p-4 font-sans">
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Coupon Code</p>
                                    <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-[#1B2537] text-[17px] tracking-wide mt-0.5">{selectedCoupon.couponCode}</h3>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">System Status</p>
                                    <span className={`px-2 py-0.5 text-[10px] font-['IBM_Plex_Mono',monospace] font-semibold uppercase tracking-wider border rounded-[2px] mt-1 inline-block ${selectedCoupon.status === "Active" ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]" : "bg-[#F5F5F5] border-[#E0E0E0] text-[#616161]"
                                        }`}>
                                        {selectedCoupon.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Reduction Engine Class</p>
                                    <h4 className="font-medium text-[#232320] mt-0.5">{selectedCoupon.discountType}</h4>
                                </div>
                                <div>
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Discount Magnitude</p>
                                    <h4 className="font-bold text-[#A2782E] text-[15px] mt-0.5">
                                        {selectedCoupon.discountType === "Percentage" ? `${selectedCoupon.discountValue}%` : `₹${selectedCoupon.discountValue}`}
                                    </h4>
                                </div>
                            </div>

                            {/* Extended limits parameter logs lists */}
                            <div className="border border-[#E1DECF] rounded-[3px] p-4 space-y-3.5 bg-white">
                                <div className="flex justify-between border-b pb-2 border-[#FCFBF7]">
                                    <span className="text-[#8C8676]">Minimum Spend Trigger</span>
                                    <span className="font-semibold text-[#1B2537]">₹{selectedCoupon.minBookingAmount || 0}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 border-[#FCFBF7]">
                                    <span className="text-[#8C8676]">Max Dynamic Usage Limits</span>
                                    <span className="font-semibold text-[#1B2537]">{selectedCoupon.maxUses || 100} System Conversions</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 border-[#FCFBF7]">
                                    <span className="text-[#8C8676]">Campaign Launch Timeline</span>
                                    <span className="font-['IBM_Plex_Mono',monospace] text-[#4A473D]">
                                        {new Date(selectedCoupon.createdAt).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8C8676]">Campaign Termination Timeline</span>
                                    <span className="font-['IBM_Plex_Mono',monospace] font-medium text-[#C62828]">
                                        {new Date(selectedCoupon.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                                    </span>
                                </div>
                            </div>

                            {/* Operational Action footer controls bar layout inside component modal */}
                            <div className="mt-8 flex flex-wrap justify-between items-center gap-3 border-t pt-4 border-[#E1DECF]">
                                <button
                                    onClick={() => handleDelete(selectedCoupon._id)}
                                    className="bg-[#FFEBEE] hover:bg-[#FFCDD2] border border-[#FFCDD2] text-[#C62828] font-medium px-4 py-2.5 text-xs rounded-[2px] transition"
                                >
                                    Wipe Out Token
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(selectedCoupon._id)}
                                        className={`px-4 py-2.5 text-xs font-medium rounded-[2px] text-white transition ${selectedCoupon.status === "Active" ? "bg-[#E65100] hover:bg-[#E65100]/90" : "bg-[#2E7D32] hover:bg-[#2E7D32]/90"
                                            }`}
                                    >
                                        {selectedCoupon.status === "Active" ? "Deactivate Token" : "Restore (Activate)"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowView(false);
                                            setSelectedCoupon(null);
                                        }}
                                        className="bg-white hover:bg-[#FCFBF7] border border-[#E1DECF] text-[#4A473D] px-4 py-2.5 text-xs font-medium rounded-[2px] transition"
                                    >
                                        Close Profile
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MyCoupon;