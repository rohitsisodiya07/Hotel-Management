import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import axios from "axios";

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

const ROLE_ROUTES = {
    superAdmin: "/superAdmin/state",
    admin: "/admin/dashboard",
};

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.signupMessage) {
            setInfoMessage(location.state.signupMessage);
            // clear it from history state so it doesn't reappear on refresh/back
            navigate(location.pathname, { replace: true, state: {} });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        if (formError) setFormError("");
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }

        if (!formData.password) {
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

            try {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
            } catch (storageError) {
                // localStorage can throw in private/incognito modes with storage disabled
                console.error("Could not persist session:", storageError);
            }

            setFormData({ email: "", password: "" });
            navigate(ROLE_ROUTES[user.role] || "/user");
        } catch (error) {
            setFormError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (name) =>
        `w-full border pl-10 pr-3.5 h-11 rounded text-[13px] outline-none transition-colors duration-150 ease-in-out bg-[#FCFBF7] text-[#232320] ${errors[name]
            ? "border-[#8E3B30] focus:border-[#8E3B30]"
            : "border-[#DEDBCF] focus:border-[#A2782E]"
        }`;

    const FieldError = ({ name }) =>
        errors[name] ? (
            <p id={`${name}-error`} role="alert" className="text-[12px] text-[#8E3B30] mt-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5" />
                    <path d="M12 16h.01" />
                </svg>
                {errors[name]}
            </p>
        ) : null;

    return (
        <div className="min-h-screen bg-[#F5F4EF] bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(31,42,68,0.05),transparent_60%)] font-['Inter',sans-serif] text-[#232320] flex items-center justify-center px-4 py-10">
            {/* Note: prefer moving this @import into a global stylesheet/index.html
                so it isn't re-injected on every mount. Left inline to preserve
                the original single-file structure. */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

            <div className="w-full max-w-md bg-white border border-[#E1DECF] rounded-md p-8 shadow-[0_1px_2px_rgba(30,28,20,0.03),0_12px_26px_-18px_rgba(30,28,20,0.18)]">
                <div className="text-center mb-8">
                    <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.22em] text-[#A2782E] mt-0 mb-2.5">
                        ACCOUNT ACCESS
                    </p>
                    <h1 className="font-['Space_Grotesk',sans-serif] font-semibold text-[26px] tracking-[-0.01em] m-0 text-[#1B2537]">
                        Welcome back
                    </h1>
                    <p className="text-[#8C8676] text-[13px] mt-2 mb-0">
                        Log in to your account
                    </p>
                </div>

                {infoMessage && (
                    <div
                        role="status"
                        className="mb-4 rounded border border-[#E4D2A0] bg-[#FBF6E9] text-[#7A5A1E] text-[13px] px-3.5 py-2.5 flex items-start gap-2"
                    >
                        <svg className="mt-[1px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {infoMessage}
                    </div>
                )}

                {formError && (
                    <div
                        role="alert"
                        className="mb-4 rounded border border-[#E7C9C3] bg-[#FBF0EE] text-[#8E3B30] text-[13px] px-3.5 py-2.5 flex items-start gap-2"
                    >
                        <svg className="mt-[1px] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v5" />
                            <path d="M12 16h.01" />
                        </svg>
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <label htmlFor="login-email" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
                            Email
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M2 7l10 6 10-6" />
                            </svg>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="Enter your email"
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
                        <label htmlFor="login-password" className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">
                            Password
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39C89" strokeWidth="1.8">
                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
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
                                className={fieldClass("password") + " pr-10"}
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39C89] hover:text-[#A2782E] transition-colors duration-150"
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                        <FieldError name="password" />
                    </div>

                    <div className="text-right">
                        <Link to="/forgot" className="text-[12.5px] text-[#8C8676] font-medium hover:text-[#A2782E] transition-colors duration-150">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-[3px] font-['Inter',sans-serif] font-semibold text-[13.5px] bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 1 1-9-9" />
                            </svg>
                        )}
                        {loading ? "Logging in…" : "Log in"}
                    </button>
                </form>

                <div className="mt-6 border-t border-[#DEDBCF] pt-4 space-y-2">
                    <p className="text-center text-[13px] text-[#8C8676]">
                        New user?{" "}
                        <Link to="/" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
                            Sign up as User
                        </Link>
                    </p>

                    <p className="text-center text-[13px] text-[#8C8676]">
                        Want to create an admin account?{" "}
                        <Link to="/adminSignup" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
                            Sign up as Admin
                        </Link>
                    </p>

                    <p className="text-center text-[13px] text-[#8C8676]">
                        Already submitted an admin request?{" "}
                        <Link to="/checkStatus" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
                            Check Admin Status
                        </Link>
                    </p>

                    <p className="text-center text-[13px] text-[#8C8676]">
                        Already submitted a hotel request?{" "}
                        <Link to="/hotelStatus" className="text-[#1B2537] font-medium hover:text-[#A2782E]">
                            Check Hotel Status
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;