import React, { useEffect, useState } from "react";
import axiosInstance from "axios";
import axios from "axios"; // Direct axios for JSON import request if needed, or axiosInstance
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";
import { ArrowLeft, Loader2, TicketPercent, FileSpreadsheet, Upload, X } from "lucide-react";
import { Toaster, toast } from "sonner";

const AddCoupon = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // 📂 Bulk Import & Preview States
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [previewRows, setPreviewRows] = useState([]);
    const [previewSummary, setPreviewSummary] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [importing, setImporting] = useState(false);

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

    // 📤 Handle Bulk Import Submit (Hits /bulk-preview endpoint)
    const handleBulkImportSubmit = async (e) => {
        e.preventDefault();

        if (!importFile) {
            toast.error("Please select an Excel or CSV file first.");
            return;
        }

        try {
            setImporting(true);

            const formData = new FormData();
            formData.append("file", importFile);

            const response = await fetch(
                `${signupApi}coupon/bulk-preview`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();
            console.log("Bulk Preview Response:", data);

            if (!response.ok) {
                throw new Error(data?.message || "Preview generation failed");
            }

            setPreviewRows(data.rows || []);
            setPreviewSummary(data.summary || null);

            // Close upload modal and open preview modal
            setShowImportModal(false);
            setShowPreview(true);

        } catch (error) {
            console.error("Bulk Preview Error:", error);
            toast.error(error.message || "Failed to generate preview.");
        } finally {
            setImporting(false);
        }
    };

    // 🚀 Handle Final Import of Validated Rows (Hits /bulk-import endpoint with JSON)
    const handleFinalImport = async () => {
        try {
            setImporting(true);

            const validRows = previewRows.filter(
                (row) => row.valid
            );

            if (validRows.length === 0) {
                toast.error(
                    "No valid coupons available for import."
                );
                return;
            }

            const response = await axios.post(
                `${signupApi}coupon/bulk-import`,
                {
                    coupons: validRows,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Final Import Response:",
                response.data
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Import failed"
                );
            }

            toast.success(
                `${response.data.summary.imported} coupon(s) imported successfully!`
            );

            setShowPreview(false);
            setPreviewRows([]);
            setPreviewSummary(null);
            setImportFile(null);

            // Navigate or refresh list
            setTimeout(() => {
                navigate("/admin/myCoupon");
            }, 1500);

        } catch (error) {
            console.error(
                "Final Import Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to import coupons."
            );
        } finally {
            setImporting(false);
        }
    };

    // ❌ Remove Row from Preview State
    const removePreviewRow = (rowNumber) => {
        const updatedRows = previewRows.filter(
            (row) => row.rowNumber !== rowNumber
        );

        setPreviewRows(updatedRows);

        const valid = updatedRows.filter(
            (row) => row.valid
        ).length;

        const invalid = updatedRows.filter(
            (row) => !row.valid
        ).length;

        setPreviewSummary({
            totalRows: updatedRows.length,
            valid,
            invalid,
        });
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

            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-xs transition cursor-pointer"
                >
                    <ArrowLeft size={16} /> Back to Coupons
                </button>

                {!id && (
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                    >
                        <FileSpreadsheet size={15} /> Bulk Import (Excel)
                    </button>
                )}
            </div>

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

            {/* 📁 BULK IMPORT UPLOAD MODAL */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 relative border border-gray-200">
                        <button
                            onClick={() => setShowImportModal(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                            <FileSpreadsheet size={20} />
                            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900">Bulk Import Coupons</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                            Upload an Excel (.xlsx) or CSV file containing coupon details matching your schema columns.
                        </p>

                        <form onSubmit={handleBulkImportSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-gray-50 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0];
                                        if (selectedFile) {
                                            setImportFile(selectedFile);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-xs font-bold text-gray-800">
                                    {importFile ? importFile.name : "Click to browse or drag & drop file"}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">Supports XLSX, XLS, CSV format</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={importing || !importFile}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs cursor-pointer"
                                >
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

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet size={20} className="text-emerald-600" />
                                    <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">
                                        Review Coupon Import
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Review your coupons before importing them.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Summary */}
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

                        {/* Table */}
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-100 z-10">
                                    <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-3">Row</th>
                                        <th className="px-4 py-3">Coupon Code</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Discount</th>
                                        <th className="px-4 py-3">Min. Booking</th>
                                        <th className="px-4 py-3">Expiry</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Validation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.map((row, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b border-gray-100 ${row.valid ? "hover:bg-gray-50" : "bg-rose-50/60"
                                                }`}
                                        >
                                            <td className="px-4 py-4 text-xs text-gray-500">{row.rowNumber}</td>
                                            <td className="px-4 py-4">
                                                <span className="font-['IBM_Plex_Mono'] text-xs font-bold text-gray-900">
                                                    {row.couponCode || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-600">{row.discountType || "—"}</td>
                                            <td className="px-4 py-4 text-xs font-semibold text-gray-900">
                                                {row.discountType === "Percentage"
                                                    ? `${row.discountValue}%`
                                                    : `₹${row.discountValue}`}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-600">₹{row.minBookingAmount || 0}</td>
                                            <td className="px-4 py-4 text-xs text-gray-600">
                                                {row.expiryDate
                                                    ? new Date(row.expiryDate).toLocaleDateString("en-IN")
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${row.status === "Active"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {row.valid ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                            ✓ Valid
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="space-y-1">
                                                            {row.errors.map((error, errorIndex) => (
                                                                <p
                                                                    key={errorIndex}
                                                                    className="text-[10px] text-rose-600 font-semibold whitespace-nowrap"
                                                                >
                                                                    ✕ {error}
                                                                </p>
                                                            ))}
                                                        </div>

                                                        {/* Remove Row */}
                                                        <button
                                                            type="button"
                                                            onClick={() => removePreviewRow(row.rowNumber)}
                                                            title="Remove this coupon"
                                                            className="w-8 h-8 shrink-0 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 flex items-center justify-center transition cursor-pointer"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between gap-3">
                            <button
                                onClick={() => {
                                    setShowPreview(false);
                                    setShowImportModal(true);
                                }}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                            >
                                ← Change File
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPreview(false);
                                        setPreviewRows([]);
                                        setPreviewSummary(null);
                                        setImportFile(null);
                                    }}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleFinalImport}
                                    disabled={
                                        importing ||
                                        !previewSummary ||
                                        previewSummary.invalid > 0 ||
                                        previewRows.length === 0
                                    }
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    {importing
                                        ? "Importing..."
                                        : `Import ${previewSummary?.valid || 0} Coupons`}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCoupon;