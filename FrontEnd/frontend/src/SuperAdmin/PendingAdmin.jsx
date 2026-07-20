import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";

const PendingAdmins = () => {
    const [activeTab, setActiveTab] = useState("pending");

    const [pendingAdmins, setPendingAdmins] = useState([]);

    const [rejectedAdmins, setRejectedAdmins] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showApprove, setShowApprove] = useState(false);

    const [showReject, setShowReject] = useState(false);

    const [showView, setShowView] = useState(false);

    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const [viewAdmin, setViewAdmin] = useState(null);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [remark, setRemark] = useState("");

    useEffect(() => {
        getPendingAdmins();
        getRejectedAdmins();
    }, []);

    const getPendingAdmins = async () => {
        try {
            const response = await axios.get(`${signupApi}admin/pending`);

            setPendingAdmins(response.data.admins);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getRejectedAdmins = async () => {
        try {
            const response = await axios.get(`${signupApi}admin/rejected`);

            setRejectedAdmins(response.data.admins);
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
                `${signupApi}admin/approve/${selectedAdmin._id}`,
                { password }
            );

            alert(response.data.message);

            setPassword("");
            setShowApprove(false);
            setSelectedAdmin(null);

            getPendingAdmins();
            getRejectedAdmins();
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
                `${signupApi}admin/reject/${selectedAdmin._id}`,
                { remark }
            );

            alert(response.data.message);

            setRemark("");
            setShowReject(false);
            setSelectedAdmin(null);

            getPendingAdmins();
            getRejectedAdmins();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const admins = activeTab === "pending" ? pendingAdmins : rejectedAdmins;

    const initials = (name) =>
        (name || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join("");

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F4EF] bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(31,42,68,0.05),transparent_60%)] font-['Inter',sans-serif] text-[#232320] px-7 pt-10 pb-[60px] flex items-center justify-center">
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>
                <p className="text-[#8C8676] text-[13px] tracking-[0.02em]">Opening the registry…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F4EF] bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(31,42,68,0.05),transparent_60%)] font-['Inter',sans-serif] text-[#232320] px-7 pt-10 pb-[60px]">
            {/* Google Fonts import (kept as-is; Tailwind utilities don't load fonts) */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

            <div className="max-w-[1080px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end gap-5 flex-wrap mb-[34px] pb-[26px] border-b border-[#DEDBCF]">
                    <div>
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.22em] text-[#A2782E] mt-0 mb-2.5">
                            AUTHORIZATION QUEUE
                        </p>
                        <h1 className="font-['Space_Grotesk',sans-serif] font-semibold text-[32px] tracking-[-0.01em] m-0 text-[#1B2537]">
                            Admin Registry
                        </h1>
                        <p className="text-[#8C8676] text-[13.5px] mt-2 mb-0">
                            Every request awaiting a signature, on the record.
                        </p>
                    </div>

                    <div className="border border-[#E1DECF] bg-white rounded px-[22px] py-3.5 text-right shadow-[0_1px_2px_rgba(30,28,20,0.03),0_12px_26px_-18px_rgba(30,28,20,0.18)]">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.14em] text-[#A39C89] mt-0 mb-1">
                            Total on file
                        </p>
                        <p className="font-['Space_Grotesk',sans-serif] text-[26px] text-[#A2782E] m-0">
                            {pendingAdmins.length + rejectedAdmins.length}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-7">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`font-['Inter',sans-serif] text-[13px] font-medium border border-transparent py-2.5 px-[18px] rounded-full cursor-pointer flex items-center gap-2 transition-all duration-150 ease-in-out hover:text-[#1B2537] ${activeTab === "pending"
                                ? "text-[#FFF9EC] bg-[#1B2537] font-semibold"
                                : "text-[#8C8676] bg-transparent"
                            }`}
                    >
                        Pending
                        <span className="font-['IBM_Plex_Mono',monospace] text-[11px] opacity-80">{pendingAdmins.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`font-['Inter',sans-serif] text-[13px] font-medium border border-transparent py-2.5 px-[18px] rounded-full cursor-pointer flex items-center gap-2 transition-all duration-150 ease-in-out hover:text-[#1B2537] ${activeTab === "rejected"
                                ? "text-[#FDF3F1] bg-[#8E3B30] font-semibold"
                                : "text-[#8C8676] bg-transparent"
                            }`}
                    >
                        Rejected
                        <span className="font-['IBM_Plex_Mono',monospace] text-[11px] opacity-80">{rejectedAdmins.length}</span>
                    </button>
                </div>

                {/* Ledger */}
                {admins.length === 0 ? (
                    <div className="border border-dashed border-[#D8D4C3] rounded-md py-[60px] px-5 text-center text-[#A39C89] text-[13.5px] bg-[#FCFBF7]">
                        <p>No entries in this ledger yet.</p>
                    </div>
                ) : (
                    <div className="border-t border-[#DEDBCF]">
                        <div className="grid grid-cols-[1.6fr_1.6fr_1.1fr_0.9fr_1.4fr] gap-3 py-3 px-4 font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.12em] text-[#A39C89] border-b border-[#DEDBCF] max-[760px]:hidden">
                            <span>Admin</span>
                            <span>Contact</span>
                            <span>Tracking ID</span>
                            <span className="text-left">Status</span>
                            <span className="text-left">Actions</span>
                        </div>

                        {admins.map((admin) => (
                            <div
                                key={admin._id}
                                className="relative grid grid-cols-[1.6fr_1.6fr_1.1fr_0.9fr_1.4fr] gap-3 items-center py-[18px] px-4 bg-white border-b border-[#EAE7DA] transition-shadow duration-150 ease-in-out hover:shadow-[0_8px_22px_-16px_rgba(30,28,20,0.25)] max-[760px]:grid-cols-1 max-[760px]:gap-2.5 max-[760px]:py-[18px] max-[760px]:px-3.5 max-[760px]:border max-[760px]:border-[#E1DECF] max-[760px]:rounded-md max-[760px]:mb-3 max-[760px]:shadow-[0_1px_2px_rgba(30,28,20,0.03),0_10px_24px_-18px_rgba(30,28,20,0.18)]"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {admin.profileImage ? (
                                        <img
                                            src={admin.profileImage}
                                            alt={`${admin.name} portrait`}
                                            className="w-[38px] h-[38px] rounded-full object-cover border border-[#E1DECF] flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-[38px] h-[38px] rounded-full border border-[#E1DECF] flex-shrink-0 flex items-center justify-center bg-[#F3EEDD] text-[#A2782E] font-['Space_Grotesk',sans-serif] text-sm">
                                            {initials(admin.name)}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-[#1B2537] overflow-hidden text-ellipsis whitespace-nowrap">{admin.name}</span>
                                </div>

                                <div className="flex flex-col gap-0.5 min-w-0 max-[760px]:mt-1">
                                    <span className="text-[12.5px] text-[#4A473D] overflow-hidden text-ellipsis whitespace-nowrap">{admin.email}</span>
                                    <span className="text-xs text-[#A39C89]">{admin.mobile}</span>
                                </div>

                                <div className="font-['IBM_Plex_Mono',monospace] text-xs text-[#8C8676]">{admin.trackingId}</div>

                                <div className="max-[760px]:mt-1">
                                    <span
                                        className={`inline-block font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.14em] font-medium py-[5px] px-2.5 rounded-[3px] -rotate-3 border-[1.5px] ${activeTab === "rejected"
                                                ? "text-[#8E3B30] border-[rgba(142,59,48,0.5)] bg-[rgba(142,59,48,0.07)]"
                                                : "text-[#A2782E] border-[rgba(162,120,46,0.55)] bg-[rgba(162,120,46,0.08)]"
                                            }`}
                                    >
                                        {activeTab === "pending" ? "PENDING" : "REJECTED"}
                                    </span>
                                </div>

                                <div className="flex gap-1.5 flex-wrap">
                                    <button
                                        onClick={() => {
                                            setViewAdmin(admin);
                                            setShowView(true);
                                        }}
                                        className="font-['Inter',sans-serif] text-xs font-medium py-[7px] px-3.5 rounded-[3px] border border-[#DEDBCF] cursor-pointer transition-all duration-150 ease-in-out whitespace-nowrap bg-transparent text-[#4A473D] hover:border-[#A2782E] hover:text-[#A2782E]"
                                    >
                                        View
                                    </button>

                                    {activeTab === "pending" && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedAdmin(admin);
                                                    setShowApprove(true);
                                                }}
                                                className="font-['Inter',sans-serif] text-xs font-medium py-[7px] px-3.5 rounded-[3px] border cursor-pointer transition-all duration-150 ease-in-out whitespace-nowrap bg-[rgba(59,110,74,0.1)] border-[rgba(59,110,74,0.35)] text-[#2F6F4E] hover:bg-[#2F6F4E] hover:text-white"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAdmin(admin);
                                                    setShowReject(true);
                                                }}
                                                className="font-['Inter',sans-serif] text-xs font-medium py-[7px] px-3.5 rounded-[3px] border cursor-pointer transition-all duration-150 ease-in-out whitespace-nowrap bg-[rgba(142,59,48,0.1)] border-[rgba(142,59,48,0.35)] text-[#8E3B30] hover:bg-[#8E3B30] hover:text-white"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>

                                {activeTab === "rejected" && admin.remark && (
                                    <div className="col-span-full mt-3 text-[12.5px] text-[#8E3B30] bg-[rgba(142,59,48,0.06)] border-l-2 border-[#8E3B30] py-2 px-3">
                                        <span className="block font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.1em] text-[#8E3B30] mb-[3px]">
                                            Reason
                                        </span>
                                        {admin.remark}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            {showApprove && (
                <div className="fixed inset-0 bg-[rgba(27,22,14,0.35)] backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#E1DECF] rounded-md p-[30px] w-full max-w-[440px] shadow-[0_30px_60px_-20px_rgba(30,28,20,0.28)]">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.18em] text-[#A2782E] mt-0 mb-2.5">
                            GRANT ACCESS
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-[21px] font-semibold text-[#1B2537] mt-0 mb-1.5">
                            Approve {selectedAdmin?.name}
                        </h2>
                        <p className="text-[#8C8676] text-[13px] mt-0 mb-[22px]">
                            Set a login password to authorize this account.
                        </p>

                        <label className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">Password</label>
                        <div className="relative mb-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                className="w-full bg-[#FCFBF7] border border-[#DEDBCF] text-[#232320] text-[13px] rounded font-['Inter',sans-serif] outline-none transition-colors duration-150 ease-in-out pr-10 h-11 pl-3.5 focus:border-[#A2782E]"
                            />
                            <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39C89] cursor-pointer hover:text-[#A2782E]"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </span>
                        </div>

                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={() => {
                                    setShowApprove(false);
                                    setPassword("");
                                }}
                                className="font-['Inter',sans-serif] text-xs font-medium rounded-[3px] border border-[#DEDBCF] cursor-pointer transition-all duration-150 ease-in-out bg-transparent text-[#4A473D] hover:border-[#A2782E] hover:text-[#A2782E] flex-1 text-center py-[11px] px-3.5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                className="font-['Inter',sans-serif] text-xs font-medium rounded-[3px] border cursor-pointer transition-all duration-150 ease-in-out bg-[rgba(59,110,74,0.1)] border-[rgba(59,110,74,0.35)] text-[#2F6F4E] hover:bg-[#2F6F4E] hover:text-white flex-1 text-center py-[11px] px-3.5"
                            >
                                Confirm approval
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showReject && (
                <div className="fixed inset-0 bg-[rgba(27,22,14,0.35)] backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#E1DECF] rounded-md p-[30px] w-full max-w-[440px] shadow-[0_30px_60px_-20px_rgba(30,28,20,0.28)]">
                        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.18em] text-[#8E3B30] mt-0 mb-2.5">
                            DENY ACCESS
                        </p>
                        <h2 className="font-['Space_Grotesk',sans-serif] text-[21px] font-semibold text-[#1B2537] mt-0 mb-1.5">
                            Reject {selectedAdmin?.name}
                        </h2>
                        <p className="text-[#8C8676] text-[13px] mt-0 mb-[22px]">
                            State the reason this request is being turned down.
                        </p>

                        <label className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">Rejection reason</label>
                        <textarea
                            rows={4}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter rejection reason…"
                            autoFocus
                            className="w-full bg-[#FCFBF7] border border-[#DEDBCF] text-[#232320] text-[13px] rounded font-['Inter',sans-serif] outline-none transition-colors duration-150 ease-in-out p-3.5 resize-none focus:border-[#A2782E]"
                        />

                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={() => {
                                    setShowReject(false);
                                    setRemark("");
                                }}
                                className="font-['Inter',sans-serif] text-xs font-medium rounded-[3px] border border-[#DEDBCF] cursor-pointer transition-all duration-150 ease-in-out bg-transparent text-[#4A473D] hover:border-[#A2782E] hover:text-[#A2782E] flex-1 text-center py-[11px] px-3.5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="font-['Inter',sans-serif] text-xs font-medium rounded-[3px] border cursor-pointer transition-all duration-150 ease-in-out bg-[rgba(142,59,48,0.1)] border-[rgba(142,59,48,0.35)] text-[#8E3B30] hover:bg-[#8E3B30] hover:text-white flex-1 text-center py-[11px] px-3.5"
                            >
                                Confirm rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showView && viewAdmin && (
                <div className="fixed inset-0 bg-[rgba(27,22,14,0.35)] backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#E1DECF] rounded-md p-[30px] w-full max-w-[520px] max-h-[88vh] overflow-y-auto shadow-[0_30px_60px_-20px_rgba(30,28,20,0.28)]">
                        <div className="flex items-center gap-4 mb-6">
                            {viewAdmin.profileImage ? (
                                <img
                                    src={viewAdmin.profileImage}
                                    alt={`${viewAdmin.name} portrait`}
                                    className="w-14 h-14 rounded-full object-cover border border-[#E1DECF] text-lg"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full border border-[#E1DECF] flex items-center justify-center bg-[#F3EEDD] text-[#A2782E] font-['Space_Grotesk',sans-serif] text-lg">
                                    {initials(viewAdmin.name)}
                                </div>
                            )}
                            <div>
                                <h2 className="font-['Space_Grotesk',sans-serif] text-[21px] font-semibold text-[#1B2537] mt-0 mb-1">
                                    {viewAdmin.name}
                                </h2>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[11.5px] text-[#A39C89] m-0">
                                    Tracking ID · {viewAdmin.trackingId}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-5 gap-y-[18px]">
                            <div>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.12em] text-[#A39C89] mt-0 mb-[5px]">Email</p>
                                <p className="text-[13.5px] text-[#232320] m-0">{viewAdmin.email}</p>
                            </div>
                            <div>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.12em] text-[#A39C89] mt-0 mb-[5px]">Mobile</p>
                                <p className="text-[13.5px] text-[#232320] m-0">{viewAdmin.mobile}</p>
                            </div>
                            <div>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.12em] text-[#A39C89] mt-0 mb-[5px]">Status</p>
                                <p className="text-[13.5px] text-[#232320] m-0 capitalize">{viewAdmin.status}</p>
                            </div>
                            <div>
                                <p className="font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.12em] text-[#A39C89] mt-0 mb-[5px]">Tracking ID</p>
                                <p className="text-[13.5px] text-[#232320] m-0">{viewAdmin.trackingId}</p>
                            </div>
                        </div>

                        {viewAdmin.remark && (
                            <div className="mt-5 text-[13px] text-[#8E3B30] bg-[rgba(142,59,48,0.06)] border-l-2 border-[#8E3B30] py-2.5 px-3.5">
                                <span className="block font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.1em] text-[#8E3B30] mb-[3px]">
                                    Rejection reason
                                </span>
                                {viewAdmin.remark}
                            </div>
                        )}

                        <div className="flex gap-2.5 mt-6 justify-end">
                            <button
                                onClick={() => {
                                    setShowView(false);
                                    setViewAdmin(null);
                                }}
                                className="font-['Inter',sans-serif] text-xs font-medium rounded-[3px] border border-transparent cursor-pointer transition-all duration-150 ease-in-out bg-[#1B2537] text-[#FFF9EC] font-semibold py-2.5 px-[22px] hover:bg-[#26314A]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingAdmins;