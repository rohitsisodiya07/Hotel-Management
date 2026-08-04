import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import { ShieldCheck, Eye, EyeOff, ArrowLeft, Loader2, KeyRound, AlertCircle } from "lucide-react";

const ResetPassword = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false); // Toggle visibility

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setErrors({
            ...errors,
            [e.target.name]: "",
        });
    };

    const validate = () => {
        let newErrors = {};

        if (!formData.oldPassword.trim()) {
            newErrors.oldPassword = "Current password is required";
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirmation is required";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.patch(
                `${signupApi}userSignup/resetPassword`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert(response.data.message || "Password updated successfully.");

            // Logout after password change
            localStorage.clear();
            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-[440px] relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 mb-6 font-semibold text-xs uppercase tracking-wider transition cursor-pointer font-['IBM_Plex_Mono']"
                >
                    <ArrowLeft size={15} /> Return Back
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">

                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/60 text-center">
                        <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-2xs">
                            <ShieldCheck size={26} strokeWidth={1.75} />
                        </div>
                        <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                            Security Credentials
                        </span>
                        <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 mb-1 tracking-tight">
                            Reset Password
                        </h1>
                        <p className="text-gray-500 text-xs font-medium">
                            Update your account password to maintain secure access.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-5 text-xs">

                        {/* Old Password */}
                        <div>
                            <label className="block text-[11px] font-['IBM_Plex_Mono',monospace] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                Current Password
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    name="oldPassword"
                                    placeholder="Enter current password"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition shadow-2xs text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                                >
                                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.oldPassword && (
                                <p className="text-rose-600 font-medium text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.oldPassword}</p>
                            )}
                        </div>

                        <hr className="border-gray-100" />

                        {/* New Password */}
                        <div>
                            <label className="block text-[11px] font-['IBM_Plex_Mono',monospace] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    name="newPassword"
                                    placeholder="Min. 6 characters"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition shadow-2xs text-gray-900"
                                />
                            </div>
                            {errors.newPassword && (
                                <p className="text-rose-600 font-medium text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.newPassword}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-[11px] font-['IBM_Plex_Mono',monospace] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Re-enter new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition shadow-2xs text-gray-900"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-rose-600 font-medium text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs disabled:opacity-50 transition cursor-pointer"
                            >
                                {loading && <Loader2 size={15} className="animate-spin" />}
                                {loading ? "Authenticating..." : "Update Security Key"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;