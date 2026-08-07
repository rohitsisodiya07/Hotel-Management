import React, { useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import {
    Loader2, Search, RefreshCw, Eye, CheckCircle2, XCircle,
    UserCheck, ShieldAlert, Sparkles, EyeOff, X
} from "lucide-react";
import { Toaster, toast } from "sonner";
import useSearch from "../Hooks/useSearch";

const PendingAdmins = () => {
    const [activeTab, setActiveTab] = useState("pending");

    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showView, setShowView] = useState(false);

    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [viewAdmin, setViewAdmin] = useState(null);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remark, setRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Search, Sort & Pagination States
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    const [pendingPage, setPendingPage] = useState(1);
    const [approvedPage, setApprovedPage] = useState(1);
    const [rejectedPage, setRejectedPage] = useState(1);
    const [limit, setLimit] = useState(5); // Default 5 items per page

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // 🌟 Backend-driven useSearch hooks for each tab
    const pendingSearch = useSearch(`${signupApi}admin/pending`, search, {
        page: pendingPage,
        limit,
        sort: sortOrder
    }, headers);

    const approvedSearch = useSearch(`${signupApi}admin/approved`, search, {
        page: approvedPage,
        limit,
        sort: sortOrder
    }, headers);

    const rejectedSearch = useSearch(`${signupApi}admin/rejected`, search, {
        page: rejectedPage,
        limit,
        sort: sortOrder
    }, headers);

    const currentActiveSearch = activeTab === "pending" ? pendingSearch : activeTab === "approved" ? approvedSearch : rejectedSearch;
    const loading = currentActiveSearch.loading;

    const resData = currentActiveSearch.data || {};
    const admins = resData.admins || resData.result || [];
    const totalPages = resData.totalPages || 1;

    // Counts
    const pendingCount = pendingSearch.data?.total || 0;
    const approvedCount = approvedSearch.data?.total || 0;
    const rejectedCount = rejectedSearch.data?.total || 0;

    const currentPage = activeTab === "pending" ? pendingPage : activeTab === "approved" ? approvedPage : rejectedPage;
    const setCurrentPage = activeTab === "pending" ? setPendingPage : activeTab === "approved" ? setApprovedPage : setRejectedPage;

    const refreshData = () => {
        pendingSearch.fetchData();
        approvedSearch.fetchData();
        rejectedSearch.fetchData();
    };

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        let pass = "";
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
        toast.success("Secure random password generated.");
    };

    const handleApprove = async () => {
        if (!password.trim() || password.trim().length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.patch(
                `${signupApi}admin/approve/${selectedAdmin._id}`,
                { password },
                { headers }
            );
            toast.success(response.data.message || "Admin approved and access granted.");

            setPassword("");
            setShowApprove(false);
            setSelectedAdmin(null);
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong during approval sync.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!remark.trim()) {
            toast.error("Remark is required");
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.patch(
                `${signupApi}admin/reject/${selectedAdmin._id}`,
                { remark },
                { headers }
            );
            toast.success(response.data.message || "Admin request rejected.");

            setRemark("");
            setShowReject(false);
            setSelectedAdmin(null);
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const initials = (name) => (name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

    return (
        <div className="space-y-6 font-['Inter',sans-serif] text-gray-800 pb-12 max-w-[1600px] mx-auto">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
                <div>
                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[0.2em] text-blue-600 mb-1 uppercase">
                        AUTHORIZATION QUEUE
                    </p>
                    <h1 className="font-['Space_Grotesk'] font-bold text-2xl text-gray-900 tracking-tight m-0">
                        Admin Verification Requests
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-medium m-0">
                        Review identity credentials, validate tracking IDs, and grant enterprise access.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition shadow-2xs cursor-pointer"
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Pending Queue</p>
                        <h3 className="text-2xl font-bold text-amber-600 font-['Space_Grotesk']">{pendingCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <UserCheck size={20} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Approved List</p>
                        <h3 className="text-2xl font-bold text-emerald-600 font-['Space_Grotesk']">{approvedCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Rejected List</p>
                        <h3 className="text-2xl font-bold text-rose-600 font-['Space_Grotesk']">{rejectedCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <XCircle size={20} />
                    </div>
                </div>
            </div>

            {/* Status Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-2 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => { setActiveTab("pending"); setPendingPage(1); }}
                    className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${activeTab === "pending"
                        ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                        }`}
                >
                    Pending Review
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${activeTab === "pending" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                        {pendingCount}
                    </span>
                </button>
                <button
                    onClick={() => { setActiveTab("approved"); setApprovedPage(1); }}
                    className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${activeTab === "approved"
                        ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                        }`}
                >
                    Approved (Success)
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${activeTab === "approved" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                        {approvedCount}
                    </span>
                </button>
                <button
                    onClick={() => { setActiveTab("rejected"); setRejectedPage(1); }}
                    className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${activeTab === "rejected"
                        ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                        }`}
                >
                    Rejected Submissions
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${activeTab === "rejected" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                        {rejectedCount}
                    </span>
                </button>
            </div>

            {/* Controls Bar: Search, Limit & Sort */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="relative w-full sm:flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search name, email or tracking ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPendingPage(1);
                            setApprovedPage(1);
                            setRejectedPage(1);
                        }}
                        className="w-full bg-white border border-gray-200 pl-10 pr-4 h-11 rounded-xl text-xs font-medium outline-none focus:border-blue-500 transition shadow-2xs text-gray-900"
                    />
                    {search && (
                        <button onClick={() => { setSearch(""); setPendingPage(1); setApprovedPage(1); setRejectedPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Rows per page dropdown */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 h-11 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
                        <span>Show:</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPendingPage(1);
                                setApprovedPage(1);
                                setRejectedPage(1);
                            }}
                            className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>

                    <select
                        value={sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value);
                            setPendingPage(1);
                            setApprovedPage(1);
                            setRejectedPage(1);
                        }}
                        className="w-full sm:w-44 bg-white border border-gray-200 px-3.5 h-11 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer shadow-2xs"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all duration-200">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                    </div>
                )}

                {admins.length === 0 ? (
                    <div className="text-center py-20">
                        <ShieldAlert className="mx-auto text-gray-300 mb-3" size={40} />
                        <h4 className="font-['Space_Grotesk'] text-base font-bold text-gray-900 mb-1">No requests found</h4>
                        <p className="text-xs text-gray-500 font-medium">The {activeTab} queue is currently empty.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider font-bold">
                                    <th className="px-6 py-3.5">Applicant</th>
                                    <th className="px-6 py-3.5">Contact Details</th>
                                    <th className="px-6 py-3.5">Tracking ID</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {admins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                {admin.profileImage ? (
                                                    <img src={admin.profileImage} alt="profile" className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-2xs" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl border border-gray-200 bg-blue-50 text-blue-600 font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center shadow-2xs">
                                                        {initials(admin.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 text-xs">{admin.name}</p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[180px]">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 font-semibold text-gray-900">
                                            {admin.mobile || "N/A"}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs">
                                                {admin.trackingId || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            {activeTab === "pending" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                                                    Pending
                                                </span>
                                            ) : activeTab === "approved" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                                    Rejected
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setViewAdmin(admin); setShowView(true); }} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="View Details">
                                                    <Eye size={14} />
                                                </button>

                                                {activeTab === "pending" && (
                                                    <>
                                                        <button onClick={() => { setSelectedAdmin(admin); setPassword(""); setShowApprove(true); }} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-emerald-600 hover:border-emerald-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Approve">
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                        <button onClick={() => { setSelectedAdmin(admin); setRemark(""); setShowReject(true); }} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Reject">
                                                            <XCircle size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Numeric Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-xs gap-3">
                    <p className="text-gray-500 font-medium">
                        Showing page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages || 1}</strong>
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {Array.from({ length: totalPages }, (_, index) => {
                            const pageNum = index + 1;
                            const isSelected = pageNum === currentPage;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-xl font-bold transition shadow-2xs cursor-pointer flex items-center justify-center ${isSelected
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modals remain clean and intact */}
            {/* Approve Modal */}
            {showApprove && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[450px] shadow-2xl relative animate-in zoom-in-95 duration-150">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.2em] text-blue-600 uppercase font-bold mt-0 mb-1">
                            GRANT ACCESS
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-gray-900 mt-0 mb-1">
                            Approve {selectedAdmin?.name}
                        </h2>
                        <p className="text-gray-500 text-xs font-medium mt-0 mb-6 leading-relaxed">
                            Set a login password to authorize this administrator account.
                        </p>

                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase tracking-widest font-bold">Security Password</label>
                            <button
                                onClick={generateRandomPassword}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <Sparkles size={13} /> Generate Random Password
                            </button>
                        </div>

                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                disabled={submitting}
                                className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl outline-none pr-10 h-11 pl-4 focus:border-blue-500 font-medium transition shadow-2xs"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {password && (
                            <div className="mb-6 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['IBM_Plex_Mono']">Strength:</span>
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${password.length < 6 ? "text-rose-600" : password.length < 10 ? "text-amber-600" : "text-emerald-600"}`}>
                                    {password.length < 6 ? "Weak" : password.length < 10 ? "Medium" : "Strong"}
                                </span>
                            </div>
                        )}

                        <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => { setShowApprove(false); setPassword(""); }}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs py-2.5 transition cursor-pointer uppercase tracking-wider disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs py-2.5 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shadow-2xs disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="animate-spin" size={15} />}
                                {submitting ? "Approving..." : "Confirm Approval"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showReject && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[450px] shadow-2xl relative animate-in zoom-in-95 duration-150">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.2em] text-rose-600 uppercase font-bold mt-0 mb-1">
                            DENY ACCESS
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-gray-900 mt-0 mb-1">
                            Reject {selectedAdmin?.name}
                        </h2>
                        <p className="text-gray-500 text-xs font-medium mt-0 mb-5 leading-relaxed">State the reason this request is being turned down.</p>

                        <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-400 uppercase tracking-widest font-bold mb-2">Rejection Reason</label>
                        <textarea
                            rows={4}
                            placeholder="Enter rejection reason..."
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            autoFocus
                            disabled={submitting}
                            className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl outline-none p-4 resize-none transition focus:border-blue-500 font-medium shadow-2xs"
                        />

                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {["Invalid Credentials", "Unauthorized Entity", "Incomplete Profile", "Duplicate Request"].map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => setRemark(reason)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border border-gray-200"
                                >
                                    + {reason}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => { setShowReject(false); setRemark(""); }}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs py-2.5 transition cursor-pointer uppercase tracking-wider disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={submitting}
                                className="flex-1 font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs py-2.5 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shadow-2xs disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="animate-spin" size={15} />}
                                {submitting ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showView && viewAdmin && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[480px] shadow-2xl relative animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-4 mb-6">
                            {viewAdmin.profileImage ? (
                                <img src={viewAdmin.profileImage} alt="profile" className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-2xs" />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl border border-gray-200 bg-blue-50 text-blue-600 font-['Space_Grotesk'] text-lg font-bold flex items-center justify-center shadow-2xs">
                                    {initials(viewAdmin.name)}
                                </div>
                            )}
                            <div>
                                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900 leading-tight">
                                    {viewAdmin.name}
                                </h2>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                                    TRACKING ID: {viewAdmin.trackingId || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 mb-6 text-xs">
                            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-gray-900 font-medium truncate">{viewAdmin.email}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile</p>
                                <p className="text-gray-900 font-medium truncate">{viewAdmin.mobile || "N/A"}</p>
                            </div>
                        </div>

                        {viewAdmin.remark && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
                                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-1">Rejection Reason</p>
                                <p className="text-xs text-rose-900 font-medium">{viewAdmin.remark}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => { setShowView(false); setViewAdmin(null); }}
                                className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gray-900 hover:bg-gray-800 transition shadow-2xs cursor-pointer"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingAdmins;