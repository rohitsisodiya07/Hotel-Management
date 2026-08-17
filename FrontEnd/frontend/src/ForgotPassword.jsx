import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import { Hotel, Mail, Lock, KeyRound, AlertCircle, Loader2, Check } from "lucide-react";
import logo from './assets/logo.png'

const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "OTP" },
    { n: 3, label: "New password" },
];

const EyeIcon = ({ open }) =>
    open ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" />
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

    const validatePassword = () => {
        let newErrors = {};

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm Password is required";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Send OTP
    const handleSendOtp = async () => {
        if (!formData.email.trim()) {
            setErrors({
                email: "Email is required",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(`${signupApi}userSignup/sendOtp`, {
                email: formData.email,
            });

            alert(response.data.message);
            setStep(2);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            alert("OTP is required");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(`${signupApi}userSignup/verifyOtp`, {
                email: formData.email,
                otp,
            });

            alert(response.data.message);
            setStep(3);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Reset Password
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword()) return;

        try {
            setLoading(true);

            const response = await axios.patch(
                `${signupApi}userSignup/forgotPassword`,
                formData
            );

            alert(response.data.message);

            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
            });

            setOtp("");
            setStep(1);

            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (name) =>
        `w-full border pl-10 pr-3.5 h-11 rounded-xl text-xs font-medium outline-none transition-all bg-gray-50/50 text-gray-900 shadow-2xs ${errors[name]
            ? "border-rose-300 focus:border-rose-500 bg-rose-50/20"
            : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
        }`;

    const FieldError = ({ name }) =>
        errors[name] ? (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                {errors[name]}
            </p>
        ) : null;

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
                                Account Recovery
                            </p>
                            <h1 className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold tracking-tight text-gray-900">
                                Reset your password.
                            </h1>
                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                Securely recover your AuraStay account in a few simple steps.
                            </p>
                        </div>


                        {/* =================================================
                        STEP INDICATOR
                    ================================================= */}
                        <div className="mb-9">
                            <div className="flex items-center justify-center lg:justify-start">
                                {steps.map((s, i) => (
                                    <React.Fragment key={s.n}>
                                        {/* Step circle */}
                                        <div className="flex flex-col items-center shrink-0">
                                            <div
                                                className={`
                                                    w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                                    ${step >= s.n
                                                        ? "bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.25)]"
                                                        : "bg-gray-100 text-gray-400"
                                                    }
                                                `}
                                            >
                                                {step > s.n ? (
                                                    <Check size={15} strokeWidth={3} />
                                                ) : (
                                                    s.n
                                                )}
                                            </div>
                                            <span
                                                className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${step >= s.n ? "text-blue-600" : "text-gray-400"}`}
                                            >
                                                {s.label}
                                            </span>
                                        </div>

                                        {/* Connector */}
                                        {i < steps.length - 1 && (
                                            <div className="flex-1 mx-3 mb-5">
                                                <div
                                                    className={`h-1 rounded-full transition-all duration-500 ${step > s.n ? "bg-blue-600" : "bg-gray-200"}`}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>


                        {/* =================================================
                        FORM
                    ================================================= */}
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">

                            {/* ================= STEP 1 — EMAIL ================= */}
                            {step === 1 && (
                                <>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                autoComplete="email"
                                                placeholder="name@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full h-[52px] rounded-xl border pl-11 pr-4 text-sm font-medium outline-none transition-all duration-300 bg-gray-50/50 ${errors.email
                                                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                                                    : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                    }`}
                                            />
                                        </div>
                                        <FieldError name="email" />
                                    </div>

                                    <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                                        <p className="text-xs leading-5 text-blue-700">
                                            We'll send a verification code to this
                                            email address to securely reset your password.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="w-full h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={17} />}
                                        {loading ? "Sending OTP..." : "Send Verification Code"}
                                    </button>
                                </>
                            )}


                            {/* ================= STEP 2 — OTP ================= */}
                            {step === 2 && (
                                <>
                                    <div className="rounded-2xl bg-[#f7f8fc] border border-gray-100 p-5">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center">
                                                <KeyRound size={24} className="text-blue-600" />
                                            </div>
                                        </div>

                                        <p className="text-center text-sm font-semibold text-gray-700">
                                            Verify your email
                                        </p>

                                        <p className="text-center text-xs text-gray-400 mt-1 mb-5">
                                            Code sent to{" "}
                                            <span className="font-semibold text-gray-600">
                                                {formData.email}
                                            </span>
                                        </p>

                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                                            Verification Code
                                        </label>

                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full h-[52px] rounded-xl border border-gray-200 pl-11 pr-4 text-center text-lg font-bold tracking-[0.45em] outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={loading}
                                        className="w-full h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={17} />}
                                        {loading ? "Verifying..." : "Verify OTP"}
                                    </button>
                                </>
                            )}


                            {/* ================= STEP 3 — NEW PASSWORD ================= */}
                            {step === 3 && (
                                <>
                                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 mb-2">
                                        <p className="text-xs leading-5 text-emerald-700 font-medium">
                                            Email verified successfully. Create a
                                            new password for your account.
                                        </p>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                                            New Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="Enter new password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full h-[52px] rounded-xl border pl-11 pr-12 text-sm font-medium outline-none transition-all duration-300 bg-gray-50/50 ${errors.password
                                                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                                                    : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                                            >
                                                <EyeIcon open={showPassword} />
                                            </button>
                                        </div>
                                        <FieldError name="password" />
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.confirmPassword ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                name="confirmPassword"
                                                autoComplete="new-password"
                                                placeholder="Confirm new password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full h-[52px] rounded-xl border pl-11 pr-12 text-sm font-medium outline-none transition-all duration-300 bg-gray-50/50 ${errors.confirmPassword
                                                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-500"
                                                    : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                                            >
                                                <EyeIcon open={showConfirm} />
                                            </button>
                                        </div>
                                        <FieldError name="confirmPassword" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={17} />}
                                        {loading ? "Resetting..." : "Reset Password"}
                                    </button>
                                </>
                            )}
                        </form>

                        {/* ================= FOOTER ================= */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-[13px] text-gray-500">
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;