import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import { User, Mail, Lock, AlertCircle, Loader2, KeyRound } from "lucide-react";
import logo from './assets/logo.png';

const EyeIcon = ({ open }) =>
    open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

// --- REUSABLE INPUT COMPONENT ---
const InputField = ({ icon: Icon, id, label, error, rightElement, ...props }) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
            {label}
        </label>
        <div className="relative group">
            <Icon size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
            <input
                id={id}
                {...props}
                className={`w-full h-12 rounded-xl border pl-11 text-sm outline-none transition-all duration-300 ${rightElement ? 'pr-12' : 'pr-4'
                    } ${error
                        ? 'border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                        : 'border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 hover:border-gray-300'
                    }`}
            />
            {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>
        {error && (
            <p role="alert" className="text-[11px] text-rose-600 mt-1.5 ml-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

const initialFormData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const Signup = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [step, setStep] = useState(1);
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
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email address";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
            setStep(2);
        } catch (error) {
            setFormError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!otp.trim()) {
            setFormError("Please enter the verification OTP");
            return;
        }

        try {
            setLoading(true);
            const payload = { email: formData.email.trim(), otp: otp.trim() };
            const response = await axios.post(`${signupApi}userSignup/verifySignupOtp`, payload);
            navigate("/login", { state: { signupMessage: response.data.message || "Account verified and registered successfully!" } });
        } catch (error) {
            setFormError(error.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 sm:p-6">

            {/* ================= MAIN CARD ================= */}
            <div className="w-full max-w-[1100px] min-h-[650px] bg-white rounded-[30px] overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.12)] flex relative">

                {/* =====================================================
                LEFT BRAND SECTION
            ===================================================== */}
                <div className="hidden lg:flex w-[43%] relative bg-blue-600 text-white flex-col items-center justify-center px-12 z-10 overflow-hidden">

                    {/* Soft decorative background */}
                    <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

                    <div className="absolute -bottom-32 -left-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl" />


                    {/* Small decorative dots */}
                    <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-white/30" />

                    <div className="absolute top-36 right-32 w-2 h-2 rounded-full bg-white/20" />

                    <div className="absolute bottom-28 left-20 w-2 h-2 rounded-full bg-white/20" />


                    {/* ================= BRAND CONTENT ================= */}
                    <div className="relative z-20 flex flex-col items-center justify-center text-center">

                        {/* Welcome */}
                        <h2 className="text-xl font-medium tracking-wide mb-8">
                            Welcome to
                        </h2>


                        {/* ================= LOGO ================= */}
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


                    {/* =================================================
                    CURVED / BUBBLE RIGHT EDGE
                ================================================= */}

                    <div className="absolute top-[3%] -right-5 w-14 h-24 bg-blue-600 rounded-full" />

                    <div className="absolute top-[18%] -right-9 w-24 h-36 bg-blue-600 rounded-full" />

                    <div className="absolute top-[40%] -right-7 w-20 h-32 bg-blue-600 rounded-full" />

                    <div className="absolute top-[61%] -right-12 w-28 h-40 bg-blue-600 rounded-full" />

                    <div className="absolute top-[82%] -right-5 w-16 h-24 bg-blue-600 rounded-full" />

                    <div className="absolute -bottom-5 -right-4 w-20 h-28 bg-blue-600 rounded-full" />

                </div>


                {/* =====================================================
                RIGHT FORM SECTION
            ===================================================== */}
                <div className="w-full lg:w-[57%] flex items-center justify-center bg-white relative z-0">

                    <div className="w-full max-w-[440px] px-6 py-10 sm:px-10 lg:px-12">


                        {/* ================= HEADER ================= */}
                        <div className="mb-8">

                            {/* Step Indicator */}
                            <div className="flex items-center gap-3 mb-6">

                                <div
                                    className={`h-1.5 w-10 rounded-full ${step === 1
                                            ? "bg-blue-600"
                                            : "bg-blue-600"
                                        }`}
                                />

                                <div
                                    className={`h-1.5 w-10 rounded-full ${step === 2
                                            ? "bg-blue-600"
                                            : "bg-gray-200"
                                        }`}
                                />

                                <span className="ml-1 text-[11px] font-semibold text-gray-400">
                                    Step {step} of 2
                                </span>

                            </div>


                            {/* Small Heading */}
                            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-2">
                                {step === 1
                                    ? "Create Your Account"
                                    : "Email Verification"}
                            </p>


                            {/* Main Heading */}
                            <h1 className="text-[32px] sm:text-[36px] font-extrabold tracking-tight text-gray-900">
                                {step === 1
                                    ? "Get started."
                                    : "Almost there."}
                            </h1>


                            {/* Description */}
                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                {step === 1
                                    ? "Create your AuraStay account and start exploring amazing stays."
                                    : `We've sent a 6-digit verification code to ${formData.email}`}
                            </p>

                        </div>


                        {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}
                        {successMessage && step === 2 && (

                            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex items-start gap-3">

                                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">

                                    <AlertCircle
                                        size={14}
                                        className="text-emerald-600"
                                    />

                                </div>

                                <p className="text-xs leading-5 text-emerald-800 font-medium">
                                    {successMessage}
                                </p>

                            </div>

                        )}


                        {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}
                        {formError && (

                            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 flex items-start gap-3">

                                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">

                                    <AlertCircle
                                        size={14}
                                        className="text-rose-600"
                                    />

                                </div>

                                <p className="text-xs leading-5 text-rose-700 font-medium">
                                    {formError}
                                </p>

                            </div>

                        )}


                        {/* =================================================
                        STEP 1 — SIGNUP
                    ================================================= */}
                        {step === 1 && (

                            <form
                                onSubmit={handleSendOtp}
                                noValidate
                                className="space-y-4"
                            >

                                {/* Name */}
                                <InputField
                                    icon={User}
                                    id="name"
                                    name="name"
                                    label="Full Name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                />


                                {/* Email */}
                                <InputField
                                    icon={Mail}
                                    id="email"
                                    name="email"
                                    label="E-mail Address"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                />


                                {/* Password */}
                                <InputField
                                    icon={Lock}
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    rightElement={

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                        >

                                            <EyeIcon
                                                open={showPassword}
                                            />

                                        </button>

                                    }
                                />


                                {/* Confirm Password */}
                                <InputField
                                    icon={Lock}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type={
                                        showConfirm
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    rightElement={

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirm(
                                                    !showConfirm
                                                )
                                            }
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                        >

                                            <EyeIcon
                                                open={showConfirm}
                                            />

                                        </button>

                                    }
                                />


                                {/* Create Account */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >

                                    {loading && (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    {loading
                                        ? "Sending OTP..."
                                        : "Create Account"}

                                </button>

                            </form>

                        )}


                        {/* =================================================
                        STEP 2 — OTP
                    ================================================= */}
                        {step === 2 && (

                            <form
                                onSubmit={handleVerifyOtp}
                                className="space-y-5"
                            >

                                <div className="rounded-2xl bg-[#f7f8fc] border border-gray-100 p-5">

                                    <div className="flex items-center justify-center mb-4">

                                        <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center">

                                            <KeyRound
                                                size={24}
                                                className="text-blue-600"
                                            />

                                        </div>

                                    </div>


                                    <p className="text-center text-xs text-gray-500 mb-5">
                                        Enter the verification code sent to your email.
                                    </p>


                                    <InputField
                                        icon={KeyRound}
                                        id="otp"
                                        name="otp"
                                        label="Verification Code"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(e.target.value)
                                        }
                                    />

                                </div>


                                {/* Verify Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
                                >

                                    {loading && (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    {loading
                                        ? "Verifying..."
                                        : "Verify & Complete Signup"}

                                </button>


                                {/* Back */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp("");
                                        setFormError("");
                                    }}
                                    className="w-full h-11 rounded-xl text-sm font-semibold text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all"
                                >
                                    ← Back to registration
                                </button>

                            </form>

                        )}


                        {/* =================================================
                        FOOTER LINKS
                    ================================================= */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">

                            <p className="text-[13px] text-gray-500">

                                Already have an account?{" "}

                                <Link
                                    to="/login"
                                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4"
                                >
                                    Log in
                                </Link>

                            </p>


                            <p className="text-[13px] text-gray-500 mt-3">

                                Want to manage properties?{" "}

                                <Link
                                    to="/adminSignup"
                                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4"
                                >
                                    Sign up as admin
                                </Link>

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Signup;