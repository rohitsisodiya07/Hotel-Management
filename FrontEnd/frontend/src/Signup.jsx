import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import { Hotel, User, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, Loader2, KeyRound } from "lucide-react";

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

const initialFormData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const Signup = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        if (formError) setFormError("");
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Step 1: Request OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!validate()) return;

        try {
            setLoading(true);
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            };

            const response = await axios.post(`${signupApi}userSignup/sendSignupOtp`, payload);

            setSuccessMessage(response.data.message || "OTP sent successfully to your email.");
            setStep(2); // Move to OTP verification step
        } catch (error) {
            setFormError(
                error.response?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP & Complete Signup
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!otp.trim()) {
            setFormError("Please enter the verification OTP");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                email: formData.email.trim(),
                otp: otp.trim()
            };

            const response = await axios.post(`${signupApi}userSignup/verifySignupOtp`, payload);

            navigate("/login", { state: { signupMessage: response.data.message || "Account verified and registered successfully!" } });
        } catch (error) {
            setFormError(
                error.response?.data?.message || "Invalid or expired OTP."
            );
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
            <p id={`${name}-error`} role="alert" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                {errors[name]}
            </p>
        ) : null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-['Inter',sans-serif] flex items-center justify-center px-4 py-12 relative overflow-hidden">

            {/* Background subtle decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Hotel size={22} />
                    </div>
                    <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                        {step === 1 ? "New Registration" : "Email Verification"}
                    </span>
                    <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 m-0 tracking-tight">
                        {step === 1 ? "Create Account" : "Enter OTP"}
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-medium">
                        {step === 1 ? "Join AuraStays to book luxury stays" : `We've sent a 6-digit code to ${formData.email}`}
                    </p>
                </div>

                {/* Success Message Alert */}
                {successMessage && step === 2 && (
                    <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
                        <AlertCircle className="mt-0.5 shrink-0" size={14} />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Form Level Error */}
                {formError && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs"
                    >
                        <AlertCircle className="mt-0.5 shrink-0" size={14} />
                        <span>{formError}</span>
                    </div>
                )}

                {/* STEP 1: Registration Form */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} noValidate className="space-y-4">
                        <div>
                            <label htmlFor="signup-name" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    id="signup-name"
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={errors.name ? "name-error" : undefined}
                                    className={fieldClass("name")}
                                />
                            </div>
                            <FieldError name="name" />
                        </div>

                        <div>
                            <label htmlFor="signup-email" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    id="signup-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    className={fieldClass("email")}
                                />
                            </div>
                            <FieldError name="email" />
                        </div>

                        <div>
                            <label htmlFor="signup-password" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="At least 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                    className={fieldClass("password") + " pr-11"}
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            <FieldError name="password" />
                        </div>

                        <div>
                            <label htmlFor="signup-confirm-password" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    id="signup-confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.confirmPassword}
                                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                                    className={fieldClass("confirmPassword") + " pr-11"}
                                />
                                <button
                                    type="button"
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                    aria-pressed={showConfirm}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <EyeIcon open={showConfirm} />
                                </button>
                            </div>
                            <FieldError name="confirmPassword" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                        >
                            {loading && <Loader2 className="animate-spin" size={15} />}
                            {loading ? "Sending OTP..." : "Continue & Send OTP"}
                        </button>
                    </form>
                )}

                {/* STEP 2: OTP Verification Form */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label htmlFor="otp-input" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                                Verification Code (OTP)
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    id="otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full border pl-10 pr-3.5 h-11 rounded-xl text-xs font-bold outline-none transition-all bg-gray-50/50 text-gray-900 border-gray-200 focus:border-blue-500 focus:bg-white tracking-widest shadow-2xs"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                        >
                            {loading && <Loader2 className="animate-spin" size={15} />}
                            {loading ? "Verifying..." : "Verify & Complete Signup"}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep(1); setOtp(""); setFormError(""); }}
                            className="w-full text-center text-xs text-gray-500 hover:text-gray-900 mt-3 font-medium transition cursor-pointer"
                        >
                            ← Back to registration details
                        </button>
                    </form>
                )}

                <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col items-center justify-center gap-2 text-xs text-center">
                    <p className="text-gray-500 font-medium">
                        Already have an account?{" "}
                        <Link to="/login" className="text-gray-900 font-bold hover:text-blue-600 underline underline-offset-4">
                            Log in
                        </Link>
                    </p>
                    <p className="text-gray-500 font-medium">
                        Want to manage properties?{" "}
                        <Link to="/adminSignup" className="text-blue-600 font-bold hover:underline underline-offset-4">
                            Sign up as admin
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Signup;