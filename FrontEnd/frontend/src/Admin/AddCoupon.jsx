import React, { useEffect, useState } from "react";
import axios from "axios"; // Use standard app instances matching your setup
import axiosInstance from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";

const AddCoupon = () => {
    const navigate = useNavigate();

    // URL query parameters (?id=value) ko capture karne ke liye useSearchParams hook lagaya
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

    // Agar URL me ID parameter available hai toh dynamic tracking execute hogi
    useEffect(() => {
        if (id) {
            getCouponById();
        }
    }, [id]);

    // Backend database parameters maps fetching logic for editing setup
    const getCouponById = async () => {
        try {
            setLoading(true);
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const response = await axiosInstance.get(`${signupApi}coupon/${id}`, { headers });
            const coupon = response.data.result;

            // Date structure raw parsing configuration to match standard HTML input (YYYY-MM-DD)
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
            console.error("Fetch coupon dynamic query tracking error:", error);
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
            newErrors.discountValue = "Discount Value must be greater than 0";
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
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            let response;
            if (id) {
                // Agar components parameters updating pipeline runtime map par active ho
                response = await axiosInstance.patch(`${signupApi}coupon/update/${id}`, form, { headers });
                alert(response.data.message || "Coupon successfully modified.");
            } else {
                // New initialization schema model save deployment
                response = await axiosInstance.post(`${signupApi}coupon/create`, form, { headers });
                alert(response.data.message || "Coupon successfully deployed.");
            }

            // Redirect back to operational dashboard layout console
            navigate("/admin/dashboard");
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Something went wrong while compiling coupon metadata.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && !form.couponCode) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-[#1B2537] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8C8676] uppercase tracking-wider">
                        Fetching Configurations Map...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto text-[#232320]">
            <div className="bg-white rounded-[3px] border border-[#E1DECF] shadow-[0_1px_2px_rgba(30,28,20,0.02)]">

                {/* Component Header Block */}
                <div className="border-b border-[#E1DECF] px-6 py-5">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.22em] text-[#A2782E] mt-0 mb-2.5 uppercase">
                        {id ? "METADATA CONFIGURATION EDIT" : "MARKETING CAMPAIGN"}
                    </p>
                    <h2 className="font-['Space_Grotesk',sans-serif] text-[24px] font-semibold text-[#1B2537] m-0">
                        {id ? "Modify Existing Discount Coupon" : "Generate New Discount Coupon"}
                    </h2>
                    <p className="text-[#8C8676] text-[13.5px] mt-2 mb-0">
                        Configure target reduction tokens for booking checkouts.
                    </p>
                </div>

                {/* Input Form Fields Grid */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Coupon Code */}
                        <div>
                            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Coupon Code</label>
                            <input
                                type="text"
                                name="couponCode"
                                value={form.couponCode}
                                onChange={handleChange}
                                placeholder="e.g. SUMMER50, WELCOME2026"
                                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition uppercase font-mono tracking-wider"
                            />
                            {errors.couponCode && (
                                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                                    ✕ {errors.couponCode}
                                </p>
                            )}
                        </div>

                        {/* Discount Type */}
                        <div>
                            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Discount Engine Class</label>
                            <select
                                name="discountType"
                                value={form.discountType}
                                onChange={handleChange}
                                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition text-[#4A473D] font-medium"
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
                            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Discount Reduction Value</label>
                            <input
                                type="number"
                                name="discountValue"
                                value={form.discountValue}
                                onChange={handleChange}
                                placeholder={form.discountType === "Percentage" ? "e.g. 10 (for 10%)" : "e.g. 500 (for ₹500)"}
                                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition"
                            />
                            {errors.discountValue && (
                                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                                    ✕ {errors.discountValue}
                                </p>
                            )}
                        </div>

                        {/* Minimum Booking Amount */}
                        <div>
                            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Minimum Order Limit Requirement</label>
                            <input
                                type="number"
                                name="minBookingAmount"
                                value={form.minBookingAmount}
                                onChange={handleChange}
                                placeholder="e.g. 1999 (0 for no limit)"
                                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition"
                            />
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Campaign Expiry Timeline</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={form.expiryDate}
                                onChange={handleChange}
                                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition text-[#4A473D]"
                            />
                            {errors.expiryDate && (
                                <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[11px] mt-1.5">
                                    ✕ {errors.expiryDate}
                                </p>
                            )}
                        </div>

                        {/* Max Uses */}
                        <div>
                            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Usage Capacity Threshold</label>
                            <input
                                type="number"
                                name="maxUses"
                                value={form.maxUses}
                                onChange={handleChange}
                                placeholder="e.g. 100 times usable"
                                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition"
                            />
                        </div>

                        {/* Coupon Status */}
                        <div>
                            <label className="block mb-2 text-[13px] font-medium text-[#4A473D]">Coupon Current Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full bg-white border border-[#E1DECF] text-[13.5px] rounded-[3px] px-4 py-3 outline-none focus:border-[#A2782E] transition text-[#4A473D] font-medium"
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
                    <div className="flex justify-end gap-3 pt-6 border-t border-[#E1DECF]">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/dashboard")}
                            className="px-6 py-2.5 text-[13px] font-medium rounded-[3px] border border-[#E1DECF] text-[#4A473D] hover:bg-[#FCFBF7] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#1B2537] text-[#FFF9EC] px-8 py-2.5 text-[13px] font-medium rounded-[3px] hover:bg-[#26314A] disabled:opacity-40 transition-colors uppercase tracking-wide font-semibold"
                        >
                            {loading ? "Compiling..." : id ? "Update Metadata" : "Deploy Coupon"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddCoupon;