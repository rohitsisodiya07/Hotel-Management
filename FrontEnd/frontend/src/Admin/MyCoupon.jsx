import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { Search, Plus, Eye, Edit, Trash2, Power, PowerOff, X, TicketPercent, Loader2, Copy, Check } from "lucide-react";
import { Toaster, toast } from "sonner";

const MyCoupon = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showView, setShowView] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

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
            console.error("Fetch coupons exception:", error);
            toast.error("Failed to load discount coupons.");
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
            toast.success("Coupon status updated successfully.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update coupon status.");
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you absolutely sure you want to delete this coupon permanently?");
        if (!confirmDelete) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${signupApi}coupon/delete/${id}`, { headers });
            toast.success("Coupon successfully deleted.");
            setCoupons((prev) => prev.filter((c) => c._id !== id));
            if (showView) setShowView(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error executing deletion.");
        }
    };

    const handleCopyCode = (code, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Copied "${code}" to clipboard!`);
        setTimeout(() => setCopiedCode(null), 2000);
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
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <h2 className="text-gray-500 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider font-semibold">
                    Loading Coupons...
                </h2>
            </div>
        );
    }

    return (
        <div className="text-gray-800 font-['Inter',sans-serif]">
            <Toaster position="top-right" richColors />
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Header controls interface bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search coupon codes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 h-11 text-xs font-medium focus:outline-none focus:border-blue-500 transition bg-white shadow-2xs"
                    />
                </div>
                <button
                    onClick={() => navigate("/admin/addCoupon")}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Plus size={16} />
                    Create Coupon
                </button>
            </div>

            {/* Tabs Switcher Panels Control Layout */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-2 scrollbar-none">
                {["All", "Active", "Inactive"].map((status) => {
                    const isActive = statusFilter === status;
                    const count = status === "All" ? stats.total : status === "Active" ? stats.active : stats.inactive;

                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-3 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${isActive
                                    ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                                }`}
                        >
                            {status} Coupons
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${isActive ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
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
                    <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center shadow-2xs">
                        <TicketPercent className="mx-auto text-gray-300 mb-3" size={40} />
                        <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-base text-gray-900">No discount coupons available</h3>
                        <p className="text-gray-500 text-xs mt-1 font-medium">Try adjusting your filters or create a new coupon.</p>
                    </div>
                )}

                {filteredCoupons.map((coupon) => {
                    const isExpired = new Date(coupon.expiryDate) < new Date();
                    return (
                        <div
                            key={coupon._id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                        >
                            {/* Top Banner Block */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 relative flex justify-between items-start">
                                <div>
                                    <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase text-blue-600 tracking-wider font-bold block mb-1">Coupon Code</span>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-gray-900 tracking-wider">
                                            {coupon.couponCode}
                                        </h2>
                                        <button
                                            onClick={(e) => handleCopyCode(coupon.couponCode, e)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200 shadow-2xs cursor-pointer"
                                            title="Copy Code"
                                        >
                                            {copiedCode === coupon.couponCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`px-2.5 py-1 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-wider border rounded-md shadow-2xs ${coupon.status === "Active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-100 border-gray-200 text-gray-600"
                                        }`}>
                                        {coupon.status}
                                    </span>
                                    {isExpired && (
                                        <span className="bg-rose-50 border border-rose-200 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase font-['IBM_Plex_Mono',monospace] shadow-2xs">
                                            Expired
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Central Details */}
                            <div className="p-6 space-y-3.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Discount Type</span>
                                    <span className="font-bold text-gray-900">{coupon.discountType}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Value</span>
                                    <span className="font-bold text-blue-600 text-sm">
                                        {coupon.discountType === "Percentage" ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Flat`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Min. Booking</span>
                                    <span className="font-bold text-gray-900">₹{coupon.minBookingAmount || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Valid Until</span>
                                    <span className="font-['IBM_Plex_Mono',monospace] text-[11px] font-bold text-gray-900">
                                        {new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Actions Array */}
                            <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-4 gap-2 items-center">
                                <button
                                    onClick={() => handleView(coupon)}
                                    className="col-span-2 flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[11px] py-2 rounded-xl font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                                >
                                    <Eye size={13} /> View
                                </button>
                                <button
                                    onClick={() => handleEdit(coupon._id)}
                                    className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 flex items-center justify-center py-2 rounded-xl transition shadow-2xs cursor-pointer"
                                    title="Edit Coupon"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(coupon._id)}
                                    className={`flex items-center justify-center py-2 rounded-xl border transition shadow-2xs cursor-pointer ${coupon.status === "Active"
                                            ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                                            : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                                        }`}
                                    title={coupon.status === "Active" ? "Deactivate Coupon" : "Activate Coupon"}
                                >
                                    {coupon.status === "Active" ? <PowerOff size={14} /> : <Power size={14} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View Details Modal Layer */}
            {showView && selectedCoupon && (
                <div className="fixed inset-0 bg-gray-900/50 flex justify-center items-center z-50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b border-gray-100 p-6 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="font-['Space_Grotesk',sans-serif] text-base font-bold text-gray-900">Coupon Inspection Profile</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowView(false);
                                    setSelectedCoupon(null);
                                }}
                                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5 text-xs">
                            {/* Grid Details */}
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coupon Code</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-gray-900 text-base tracking-wider">{selectedCoupon.couponCode}</h3>
                                        <button
                                            onClick={(e) => handleCopyCode(selectedCoupon.couponCode, e)}
                                            className="p-1 text-gray-400 hover:text-blue-600 bg-white rounded-md border border-gray-200 shadow-2xs cursor-pointer"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <span className={`px-2.5 py-1 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-wider border rounded-md mt-1.5 inline-block shadow-2xs ${selectedCoupon.status === "Active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-100 border-gray-200 text-gray-600"
                                        }`}>
                                        {selectedCoupon.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount Type</p>
                                    <h4 className="font-bold text-gray-900 mt-1">{selectedCoupon.discountType}</h4>
                                </div>
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount Value</p>
                                    <h4 className="font-bold text-blue-600 text-sm mt-1">
                                        {selectedCoupon.discountType === "Percentage" ? `${selectedCoupon.discountValue}%` : `₹${selectedCoupon.discountValue}`}
                                    </h4>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-3">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-2xs">
                                    <span className="font-bold text-gray-500">Minimum Booking Amount</span>
                                    <span className="font-bold text-gray-900">₹{selectedCoupon.minBookingAmount || 0}</span>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-2xs">
                                    <span className="font-bold text-gray-500">Maximum Uses Allowed</span>
                                    <span className="font-bold text-gray-900">{selectedCoupon.maxUses || "Unlimited"}</span>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-2xs">
                                    <span className="font-bold text-gray-500">Creation Date</span>
                                    <span className="font-['IBM_Plex_Mono',monospace] font-bold text-gray-900">
                                        {new Date(selectedCoupon.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-2xs">
                                    <span className="font-bold text-gray-500">Expiry Date</span>
                                    <span className="font-['IBM_Plex_Mono',monospace] font-bold text-rose-600">
                                        {new Date(selectedCoupon.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="mt-8 flex flex-wrap justify-between items-center gap-3 border-t pt-5 border-gray-100">
                                <button
                                    onClick={() => handleDelete(selectedCoupon._id)}
                                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-4 py-2.5 text-xs rounded-xl transition shadow-2xs cursor-pointer uppercase tracking-wider"
                                >
                                    <Trash2 size={14} /> Delete Coupon
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleToggleStatus(selectedCoupon._id)}
                                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition shadow-2xs cursor-pointer uppercase tracking-wider ${selectedCoupon.status === "Active"
                                                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                                                : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                                            }`}
                                    >
                                        {selectedCoupon.status === "Active" ? <><PowerOff size={14} /> Deactivate</> : <><Power size={14} /> Activate</>}
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