import React, { useEffect, useState } from "react";
import axiosInstance from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";
import { ArrowLeft, Loader2, TicketPercent } from "lucide-react";
import { Toaster, toast } from "sonner";

const AddCoupon = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        couponCode: "",
        discountType: "Percentage",
        discountValue: "",
        minBookingAmount: "",
        expiryDate: "",
        maxUses: "",
        status: "Active",
    });

    const discountTypes = ["Percentage", "Fixed Amount"];
    const statusOptions = ["Active", "Inactive"];

    useEffect(() => {
        if (id) {
            getCouponById();
        }
    }, [id]);

    const getCouponById = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axiosInstance.get(`${signupApi}coupon/${id}`, { headers });
            const coupon = response.data.result;

            let formattedExpiry = "";
            if (coupon.expiryDate) {
                formattedExpiry = new Date(coupon.expiryDate).toISOString().split("T")[0];
            }

            setForm({
                couponCode: coupon.couponCode || "",
                discountType: coupon.discountType || "Percentage",
                discountValue: coupon.discountValue || "",
                minBookingAmount: coupon.minBookingAmount !== undefined ? coupon.minBookingAmount : "",
                expiryDate: formattedExpiry,
                maxUses: coupon.maxUses !== undefined ? coupon.maxUses : "",
                status: coupon.status || "Active",
            });
        } catch (error) {
            console.error("Fetch coupon error:", error);
            toast.error("Failed to load coupon configuration.");
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        let newErrors = {};

        if (!form.couponCode.trim()) {
            newErrors.couponCode = "Coupon Code is required";
        } else if (form.couponCode.trim().length < 4) {
            newErrors.couponCode = "Minimum 4 characters required";
        }

        if (!form.discountValue || Number(form.discountValue) <= 0) {
            newErrors.discountValue = "Must be greater than 0";
        } else if (form.discountType === "Percentage" && Number(form.discountValue) > 100) {
            newErrors.discountValue = "Percentage cannot exceed 100%";
        }

        if (!form.expiryDate) {
            newErrors.expiryDate = "Expiry date is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "couponCode" ? value.toUpperCase() : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            let response;

            if (id) {
                response = await axiosInstance.patch(`${signupApi}coupon/update/${id}`, form, { headers });
                toast.success(response.data.message || "Coupon successfully modified.");
            } else {
                response = await axiosInstance.post(`${signupApi}coupon/create`, form, { headers });
                toast.success(response.data.message || "Coupon successfully deployed.");
            }

            setTimeout(() => {
                navigate("/admin/myCoupon");
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && !form.couponCode) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <h2 className="text-gray-500 font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-wider font-semibold">
                    Fetching Configuration...
                </h2>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto text-gray-800 font-['Inter',sans-serif] pb-12">
            <Toaster position="top-right" richColors />

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-semibold text-xs transition cursor-pointer"
            >
                <ArrowLeft size={16} /> Back to Coupons
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">

                {/* Header Block */}
                <div className="border-b border-gray-100 px-8 py-6 bg-gray-50/50">
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <TicketPercent size={18} className="text-blue-600" />
                        <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest text-blue-600 uppercase m-0">
                            {id ? "Edit Campaign Token" : "New Marketing Campaign"}
                        </p>
                    </div>
                    <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-gray-900 m-0 tracking-tight">
                        {id ? "Modify Discount Coupon" : "Generate Discount Coupon"}
                    </h2>
                    <p className="text-gray-500 text-xs mt-1 m-0 font-medium">
                        Configure target reduction tokens for booking checkouts.
                    </p>
                </div>

                {/* Input Form Fields Grid */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* Coupon Code */}
                        <div>
                            <label className="block mb-2 text-xs font-bold text-gray-900">Coupon Code</label>
                            <input
                                type="text"
                                name="couponCode"
                                value={form.couponCode}
                                onChange={handleChange}
                                placeholder="e.g. SUMMER50, WELCOME26"
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition uppercase font-['IBM_Plex_Mono'] tracking-wider shadow-2xs font-semibold"
                            />
                            {errors.couponCode && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.couponCode}</p>}
                        </div>

                        {/* Discount Type */}
                        <div>
                            <label className="block mb-2 text-xs font-bold text-gray-900">Discount Engine Class</label>
                            <select
                                name="discountType"
                                value={form.discountType}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition text-gray-700 font-semibold shadow-2xs cursor-pointer"
                            >
                                {discountTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === "Percentage" ? "Percentage (%)" : "Fixed Amount (INR)"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Discount Value */}
                        <div>
                            <label className="block mb-2 text-xs font-bold text-gray-900">Discount Reduction Value</label>
                            <input
                                type="number"
                                name="discountValue"
                                value={form.discountValue}
                                onChange={handleChange}
                                placeholder={form.discountType === "Percentage" ? "e.g. 10 (for 10%)" : "e.g. 500 (for ₹500)"}
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs font-medium"
                            />
                            {errors.discountValue && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.discountValue}</p>}
                        </div>

                        {/* Minimum Booking Amount */}
                        <div>
                            <label className="block mb-2 text-xs font-bold text-gray-900">Minimum Order Limit Requirement</label>
                            <input
                                type="number"
                                name="minBookingAmount"
                                value={form.minBookingAmount}
                                onChange={handleChange}
                                placeholder="e.g. 1999 (0 for no limit)"
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs font-medium"
                            />
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block mb-2 text-xs font-bold text-gray-900">Campaign Expiry Timeline</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={form.expiryDate}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition text-gray-700 font-semibold shadow-2xs cursor-pointer"
                            />
                            {errors.expiryDate && <p className="text-rose-500 text-[11px] font-medium mt-1.5">✕ {errors.expiryDate}</p>}
                        </div>

                        {/* Max Uses */}
                        <div>
                            <label className="block mb-2 text-xs font-bold text-gray-900">Usage Capacity Threshold</label>
                            <input
                                type="number"
                                name="maxUses"
                                value={form.maxUses}
                                onChange={handleChange}
                                placeholder="e.g. 100 times usable"
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition shadow-2xs font-medium"
                            />
                        </div>

                        {/* Coupon Status */}
                        <div>
                            <label className="block mb-2 text-xs font-bold text-gray-900">Coupon Current Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 h-11 outline-none focus:border-blue-500 transition text-gray-700 font-semibold shadow-2xs cursor-pointer"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Action Footer Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/myCoupon")}
                            className="w-full sm:w-auto h-11 px-8 text-xs font-bold uppercase tracking-wider rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 transition shadow-2xs cursor-pointer"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {id ? "Update Metadata" : "Deploy Coupon"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddCoupon;   