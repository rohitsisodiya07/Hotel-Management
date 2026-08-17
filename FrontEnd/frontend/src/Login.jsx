import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { signupApi } from "./api";
import { Hotel, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import logo from './assets/logo.png'

const EyeIcon = ({ open }) =>
    open ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" />
        </svg>
    ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

const ROLE_ROUTES = {
    user: "/signup",
    admin: "/admin/dashboard",
    superAdmin: "/superAdmin/state",
    hotel: "/hotel/hotelDashboard",
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    useEffect(() => {
        if (location.state?.signupMessage) {
            setInfoMessage(location.state.signupMessage);
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location.state, location.pathname, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
        setFormError("");
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!validate()) return;

        try {
            setLoading(true);
            const response = await axios.post(`${signupApi}userSignup/login`, formData);
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setFormData({
                email: "",
                password: "",
            });

            navigate(ROLE_ROUTES[user.role] || "/user");
        } catch (error) {
            setFormError(
                error.response?.data?.message || "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    const FieldError = ({ name }) =>
        errors[name] ? (
            <p id={`${name}-error`} role="alert" className="text-[11px] text-rose-600 mt-1.5 ml-1 flex items-center gap-1 font-medium">
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
                    <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl" />
                    <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-white/30" />
                    <div className="absolute top-36 right-32 w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-28 left-20 w-2 h-2 rounded-full bg-white/20" />

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

                        <p className="text-[15px] leading-7 max-w-[250px] text-center font-medium text-white/90">
                            Discover and Find Your
                            <br />
                            Perfect Healing Place
                        </p>

                        <div className="flex items-center gap-3 mt-12 text-[10px] tracking-[0.25em] uppercase text-white/50">
                            <span className="w-8 h-px bg-white/30" />
                            Stay • Explore • Relax
                            <span className="w-8 h-px bg-white/30" />
                        </div>
                    </div>

                    <div className="absolute top-[3%] -right-5 w-14 h-24 bg-blue-600 rounded-full" />
                    <div className="absolute top-[18%] -right-9 w-24 h-36 bg-blue-600 rounded-full" />
                    <div className="absolute top-[40%] -right-7 w-20 h-32 bg-blue-600 rounded-full" />
                    <div className="absolute top-[61%] -right-12 w-28 h-40 bg-blue-600 rounded-full" />
                    <div className="absolute top-[82%] -right-5 w-16 h-24 bg-blue-600 rounded-full" />
                    <div className="absolute -bottom-5 -right-4 w-20 h-28 bg-blue-600 rounded-full" />
                </div>

                {/* =====================================================
                RIGHT LOGIN SECTION
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
                                Secure Authentication
                            </p>
                            <h1 className="text-[28px] sm:text-[32px] lg:text-[38px] font-extrabold tracking-tight text-gray-900">
                                Welcome back.
                            </h1>
                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                Log in to your AuraStay account and continue your journey.
                            </p>
                        </div>

                        {/* ================= INFO MESSAGE ================= */}
                        {infoMessage && (
                            <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={15} className="text-emerald-600" />
                                </div>
                                <p className="text-xs leading-5 text-emerald-800 font-medium">
                                    {infoMessage}
                                </p>
                            </div>
                        )}

                        {/* ================= ERROR MESSAGE ================= */}
                        {formError && (
                            <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                    <AlertCircle size={15} className="text-rose-600" />
                                </div>
                                <p className="text-xs leading-5 text-rose-700 font-medium">
                                    {formError}
                                </p>
                            </div>
                        )}

                        {/* ================= LOGIN FORM ================= */}
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">

                            {/* ================= EMAIL ================= */}
                            <div>
                                <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                    <input
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                        className={`w-full h-12 rounded-xl border pl-11 pr-4 text-sm outline-none transition-all duration-300 ${errors.email
                                            ? "border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                            : "border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 hover:border-gray-300"
                                            }`}
                                    />
                                </div>
                                <FieldError name="email" />
                            </div>

                            {/* ================= PASSWORD ================= */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label htmlFor="login-password" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        Password
                                    </label>
                                    <Link to="/forgot" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 mr-1">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-600'}`} size={18} />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                        className={`w-full h-12 rounded-xl border pl-11 pr-12 text-sm outline-none transition-all duration-300 ${errors.password
                                            ? "border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                            : "border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 hover:border-gray-300"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        aria-pressed={showPassword}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                                <FieldError name="password" />
                            </div>

                            {/* ================= LOGIN BUTTON ================= */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
                            >
                                {loading && <Loader2 className="animate-spin" size={17} />}
                                {loading ? "Authenticating..." : "Log In"}
                            </button>

                        </form>

                        {/* ================= FOOTER LINKS ================= */}
                        <div className="mt-9 pt-6 border-t border-gray-100 text-center">
                            <p className="text-[13px] text-gray-500">
                                Don't have an account?{" "}
                                <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4">
                                    Sign up as user
                                </Link>
                            </p>
                            <p className="text-[13px] text-gray-500 mt-3">
                                Want to manage properties?{" "}
                                <Link to="/adminSignup" className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4">
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

export default Login;