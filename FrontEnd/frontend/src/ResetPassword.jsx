import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import {
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    KeyRound,
    AlertCircle,
    Lock
} from "lucide-react";
import logo from './assets/logo.png'

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
        <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 sm:p-6">

            {/* ================= MAIN CARD ================= */}
            <div className="w-full max-w-[1100px] min-h-[550px] lg:min-h-[650px] bg-white rounded-[24px] lg:rounded-[30px] overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.12)] flex relative">

                {/* =====================================================
                LEFT BRAND SECTION (Desktop Only)
            ===================================================== */}
                <div className="hidden lg:flex w-[43%] relative bg-blue-600 text-white flex-col items-center justify-center px-12 z-10 overflow-hidden">

                    {/* Decorative background */}
                    <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl" />

                    {/* Decorative dots */}
                    <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-white/30" />
                    <div className="absolute top-36 right-32 w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-28 left-20 w-2 h-2 rounded-full bg-white/20" />

                    {/* ================= BRAND CONTENT ================= */}
                    <div className="relative z-20 flex flex-col items-center justify-center text-center">

                        <h2 className="text-xl font-medium tracking-wide mb-8">
                            Welcome to
                        </h2>

                        {/* LOGO */}
                        <div className="w-[250px] mb-10 flex items-center justify-center">
                            <img
                                src={logo}
                                alt="AuraStay Logo"
                                className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
                            />
                        </div>

                        {/* Tagline */}
                        <p className="text-[15px] leading-7 max-w-[250px] text-center font-medium text-white/90">
                            Discover and Find Your
                            <br />
                            Perfect Healing Place
                        </p>

                        {/* Bottom tagline */}
                        <div className="flex items-center gap-3 mt-12 text-[10px] tracking-[0.25em] uppercase text-white/50">
                            <span className="w-8 h-px bg-white/30" />
                            Stay • Explore • Relax
                            <span className="w-8 h-px bg-white/30" />
                        </div>

                    </div>

                    {/* ================= CURVED RIGHT EDGE ================= */}
                    <div className="absolute top-[3%] -right-5 w-14 h-24 bg-blue-600 rounded-full" />
                    <div className="absolute top-[18%] -right-9 w-24 h-36 bg-blue-600 rounded-full" />
                    <div className="absolute top-[40%] -right-7 w-20 h-32 bg-blue-600 rounded-full" />
                    <div className="absolute top-[61%] -right-12 w-28 h-40 bg-blue-600 rounded-full" />
                    <div className="absolute top-[82%] -right-5 w-16 h-24 bg-blue-600 rounded-full" />
                    <div className="absolute -bottom-5 -right-4 w-20 h-28 bg-blue-600 rounded-full" />

                </div>


                {/* =====================================================
                RIGHT RESET PASSWORD SECTION
            ===================================================== */}
                <div className="w-full lg:w-[57%] flex items-center justify-center bg-white relative z-0">

                    <div className="w-full max-w-[440px] px-6 py-8 sm:px-10 lg:px-12 lg:py-10">

                        {/* ================= MOBILE BRANDING (Mobile Only) ================= */}
                        <div className="lg:hidden flex flex-col items-center justify-center mb-8">
                            <div className="bg-blue-600 p-4 rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center justify-center w-[180px]">
                                <img
                                    src={logo}
                                    alt="AuraStay Logo"
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        </div>


                        {/* ================= HEADER ================= */}
                        <div className="mb-8 text-center lg:text-left">
                            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-2">
                                Security Settings
                            </p>
                            <h1 className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold tracking-tight text-gray-900">
                                Change password.
                            </h1>
                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                Update your password to keep your AuraStay account secure.
                            </p>
                        </div>


                        {/* ================= SECURITY INFO ================= */}
                        <div className="mb-6 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3.5 flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <ShieldCheck size={17} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-800">
                                    Secure password update
                                </p>
                                <p className="text-[11px] text-blue-600 mt-0.5 leading-5">
                                    Use a password of at least 6 characters and keep it private.
                                </p>
                            </div>
                        </div>


                        {/* ================= FORM ================= */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* ================= CURRENT PASSWORD ================= */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5 ml-1">
                                    Current Password
                                </label>
                                <div className="relative group">
                                    <KeyRound className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.oldPassword ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        name="oldPassword"
                                        autoComplete="current-password"
                                        placeholder="Enter your current password"
                                        value={formData.oldPassword}
                                        onChange={handleChange}
                                        className={`w-full h-[52px] rounded-xl border pl-11 pr-12 text-sm font-medium outline-none transition-all duration-300 bg-gray-50/50 ${errors.oldPassword
                                            ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                                            : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {errors.oldPassword && (
                                    <p className="text-rose-600 font-medium text-[11px] mt-1.5 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.oldPassword}
                                    </p>
                                )}
                            </div>


                            {/* ================= DIVIDER ================= */}
                            <div className="flex items-center gap-3 py-1">
                                <div className="flex-1 h-px bg-gray-100" />
                                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-300">
                                    New credentials
                                </span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>


                            {/* ================= NEW PASSWORD ================= */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5 ml-1">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.newPassword ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        name="newPassword"
                                        autoComplete="new-password"
                                        placeholder="Enter new password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className={`w-full h-[52px] rounded-xl border pl-11 pr-12 text-sm font-medium outline-none transition-all duration-300 bg-gray-50/50 ${errors.newPassword
                                            ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                                            : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="text-rose-600 font-medium text-[11px] mt-1.5 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.newPassword}
                                    </p>
                                )}
                            </div>


                            {/* ================= CONFIRM PASSWORD ================= */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5 ml-1">
                                    Confirm New Password
                                </label>
                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.confirmPassword ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        placeholder="Re-enter your new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full h-[52px] rounded-xl border pl-11 pr-12 text-sm font-medium outline-none transition-all duration-300 bg-gray-50/50 ${errors.confirmPassword
                                            ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                                            : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-rose-600 font-medium text-[11px] mt-1.5 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>


                            {/* ================= PASSWORD VISIBILITY TOGGLE (Optional helper) ================= */}
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="text-[11px] font-semibold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                >
                                    {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPasswords ? "Hide passwords" : "Show passwords"}
                                </button>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                    Min 6 characters
                                </span>
                            </div>


                            {/* ================= SUBMIT BUTTON ================= */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[52px] mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {loading && <Loader2 size={17} className="animate-spin" />}
                                {loading ? "Updating Password..." : "Update Password"}
                            </button>

                        </form>


                        {/* ================= BACK TO PROFILE/HOME ================= */}
                        <div className="mt-7 pt-6 border-t border-gray-100 text-center">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="text-[13px] font-semibold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <ArrowLeft size={14} />
                                Go Back
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;