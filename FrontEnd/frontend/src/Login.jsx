import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { signupApi } from "./api";

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

// Sahi redirection paths aapki App.jsx ke routes ke mutabik
const ROLE_ROUTES = {
    user: "/",
    admin: "/admin/dashboard",
    superAdmin: "/superAdmin/state",
    hotel: "/hotel", // ◄--- /hotel se badalkar ab ye /hotel/dashboard par bhejega
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
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Enter valid email";
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

            const response = await axios.post(
                `${signupApi}userSignup/login`,
                formData
            );

            const { token, user } = response.data;

            // Session Data Save karein
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Form Clear karein
            setFormData({
                email: "",
                password: "",
            });

            // Sahi role par redirect karein
            navigate(ROLE_ROUTES[user.role] || "/user");

        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (name) =>
        `w-full border pl-10 pr-10 h-11 text-[13.5px] rounded-[3px] outline-none transition bg-white font-medium text-[#232320] ${errors[name]
            ? "border-[#8E3B30] focus:border-[#8E3B30] bg-[#FFF8F7]"
            : "border-[#E1DECF] focus:border-[#A2782E]"
        }`;

    const FieldError = ({ name }) =>
        errors[name] ? (
            <p id={`${name}-error`} role="alert" className="text-[11.5px] font-['IBM_Plex_Mono',monospace] text-[#8E3B30] mt-1.5 flex items-center gap-1.5 font-medium">
                ✕ {errors[name]}
            </p>
        ) : null;

    return (
        <div className="min-h-screen bg-[#F7F6F0] bg-[radial-gradient(1000px_450px_at_100%_0%,rgba(162,120,46,0.04),transparent_60%)] font-['Inter',sans-serif] text-[#232320] antialiased flex items-center justify-center px-4 py-12">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

            <div className="w-full max-w-md bg-white border border-[#E5E2D5] rounded-[3px] p-8 lg:p-10 shadow-[0_4px_24px_rgba(30,28,20,0.02)]">

                {/* Brand Identity Block */}
                <div className="text-center mb-9">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.24em] text-[#A2782E] mt-0 mb-2.5 font-semibold uppercase">
                        ACCOUNT ACCESS GATEWAY
                    </p>
                    <h1 className="font-['Space_Grotesk',sans-serif] font-bold text-[28px] tracking-tight m-0 text-[#1B2537]">
                        Welcome Back
                    </h1>
                    <p className="text-[#8C8676] text-[13.5px] mt-2 mb-0 font-medium">
                        Log in to coordinate your platform node operations.
                    </p>
                </div>

                {/* Info Messages Alert */}
                {infoMessage && (
                    <div
                        role="status"
                        className="mb-5 rounded-[3px] border border-[#E1DECF] bg-[#FCFBF7] text-[#A2782E] text-[13px] font-medium p-3.5 flex items-start gap-2.5 shadow-sm"
                    >
                        <svg className="mt-[2px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span>{infoMessage}</span>
                    </div>
                )}

                {/* Failure Error Alert */}
                {formError && (
                    <div
                        role="alert"
                        className="mb-5 rounded-[3px] border border-[#E7C9C3]/50 bg-[#FFF8F7] text-[#8E3B30] text-[13px] font-medium p-3.5 flex items-start gap-2.5"
                    >
                        <svg className="mt-[2px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v5" />
                            <path d="M12 16h.01" />
                        </svg>
                        <span>{formError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="login-email" className="block text-[12.5px] font-medium text-[#4A473D] mb-2">
                            Email Identifier
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39C89]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M2 7l10 6 10-6" />
                            </svg>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="name@domain.com"
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
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="login-password" className="block text-[12.5px] font-medium text-[#4A473D]">
                                Security Password
                            </label>
                            <Link to="/forgot" className="text-[12px] font-semibold text-[#8C8676] hover:text-[#A2782E] transition">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39C89]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
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
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39C89] hover:text-[#1B2537] transition duration-150"
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
                        className="w-full h-11 rounded-[3px] font-['Space_Grotesk',sans-serif] font-bold text-[13.5px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm active:scale-[0.99]"
                    >
                        {loading && (
                            <svg className="animate-spin text-[#FFF9EC]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 1 1-9-9" />
                            </svg>
                        )}
                        {loading ? "Authenticating…" : "Sign In"}
                    </button>
                </form>

                {/* Redirect Footer Links */}
                <div className="mt-8 border-t border-[#E5E2D5] pt-5 space-y-3 font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[13px]">
                        <span className="text-[#8C8676] font-medium">New around here?</span>
                        <div className="flex gap-3">
                            <Link to="/" className="text-[#1B2537] font-semibold hover:text-[#A2782E] transition">User Join</Link>
                            <span className="text-[#E5E2D5]">|</span>
                            <Link to="/adminSignup" className="text-[#1B2537] font-semibold hover:text-[#A2782E] transition">Partner Join</Link>
                        </div>
                    </div>

                    <div className="bg-[#FCFBF9] p-3 rounded-[3px] border border-[#E5E2D5] space-y-2 text-[12px] font-medium">
                        <div className="flex justify-between items-center">
                            <span className="text-[#8C8676]">Track Admin Application Status</span>
                            <Link to="/checkStatus" className="text-[#A2782E] font-semibold hover:underline">Verify Key</Link>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2 border-[#FAF9F5]">
                            <span className="text-[#8C8676]">Track Hotel Document Status</span>
                            <Link to="/hotelStatus" className="text-[#A2782E] font-semibold hover:underline">Audit Log</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;