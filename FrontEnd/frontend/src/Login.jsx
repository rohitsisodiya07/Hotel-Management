import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { signupApi } from "./api";
import { Hotel, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

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
    }, []);

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

    const fieldClass = (name) =>
        `w-full border pl-10 pr-10 h-11 text-xs font-medium rounded-xl outline-none transition-all bg-gray-50/50 text-gray-900 shadow-2xs ${errors[name]
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

            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10">

                {/* Brand Identity Block */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Hotel size={22} />
                    </div>
                    <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-blue-600 font-bold uppercase block mb-1">
                        Secure Authentication
                    </span>
                    <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 m-0 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 font-medium">
                        Log in to access your dashboard & reservations.
                    </p>
                </div>

                {/* Info Messages Alert */}
                {infoMessage && (
                    <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
                        <CheckCircle2 className="mt-0.5 shrink-0" size={14} />
                        <span>{infoMessage}</span>
                    </div>
                )}

                {/* Failure Error Alert */}
                {formError && (
                    <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs px-4 py-3 flex items-start gap-2 font-medium shadow-2xs">
                        <AlertCircle className="mt-0.5 shrink-0" size={14} />
                        <span>{formError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">

                    {/* Email Input */}
                    <div>
                        <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-['IBM_Plex_Mono']">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
                                className={fieldClass("email")}
                            />
                        </div>
                        <FieldError name="email" />
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="login-password" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 font-['IBM_Plex_Mono']">
                                Password
                            </label>
                            <Link to="/forgot" className="text-xs font-bold text-blue-600 hover:underline underline-offset-2">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
                                className={fieldClass("password")}
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                        <FieldError name="password" />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    >
                        {loading && <Loader2 className="animate-spin" size={15} />}
                        {loading ? "Authenticating..." : "Log In"}
                    </button>
                </form>

                {/* Clean Streamlined Footer Links */}
                <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col items-center justify-center gap-2 text-xs text-center">
                    <p className="text-gray-500 font-medium">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-gray-900 font-bold hover:text-blue-600 underline underline-offset-4">
                            Sign up as user
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

export default Login;