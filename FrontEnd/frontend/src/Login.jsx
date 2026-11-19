
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { signupApi } from "./api";
import {
    Mail,
    Lock,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Eye,
    EyeOff,
} from "lucide-react";
import Logo from "./components/Logo";

// ================= ROLE ROUTES =================
const ROLE_ROUTES = {
    user: "/",
    admin: "/admin/dashboard",
    superAdmin: "/superAdmin/state",
    hotel: "/hotel/hotelDashboard",
};

// ================= REUSABLE INPUT =================
const InputField = ({
    icon: Icon,
    id,
    label,
    error,
    rightElement,
    ...props
}) => (
    <div className="w-full">
        <label
            htmlFor={id}
            className="block text-sm font-semibold text-[#37483C] mb-2"
        >
            {label}
        </label>

        <div className="relative group">
            <Icon
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error
                        ? "text-rose-500"
                        : "text-[#829084] group-focus-within:text-[#315C43]"
                    }`}
            />

            <input
                id={id}
                {...props}
                className={`w-full h-12 rounded-xl border pl-11 ${rightElement ? "pr-12" : "pr-4"
                    } text-sm text-[#26372C] outline-none transition-all ${error
                        ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                        : "border-[#E2E8E2] bg-[#F8FAF7] focus:bg-white focus:border-[#315C43] focus:ring-4 focus:ring-[#315C43]/10 hover:border-[#C7D2C8]"
                    }`}
            />

            {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>

        {error && (
            <p
                id={`${id}-error`}
                role="alert"
                className="text-xs text-rose-600 mt-1.5 ml-1 flex items-center gap-1"
            >
                <AlertCircle size={13} />
                {error}
            </p>
        )}
    </div>
);

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

    // ================= SIGNUP SUCCESS MESSAGE =================
    useEffect(() => {
        if (location.state?.signupMessage) {
            setInfoMessage(location.state.signupMessage);

            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location.state, location.pathname, navigate]);

    // ================= HANDLE CHANGE =================
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

    // ================= VALIDATION =================
    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ================= LOGIN SUBMIT =================
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

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setFormData({
                email: "",
                password: "",
            });

            navigate(ROLE_ROUTES[user.role] || "/user");
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center p-3 sm:p-6">

            {/* ================= MAIN CARD ================= */}
            <div className="w-full max-w-[1120px] min-h-[650px] bg-white rounded-[28px] overflow-hidden shadow-[0_20px_70px_rgba(35,55,40,0.10)] grid grid-cols-1 lg:grid-cols-2">

                {/* ================= LEFT BRAND SECTION ================= */}
                <div className="hidden lg:flex relative min-h-full flex-col justify-between p-12 text-white overflow-hidden">

                    <img
                        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85"
                        alt="Luxury hotel resort"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-[#17291E]/70" />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#14251A]/80 via-transparent to-black/20" />

                    {/* DESKTOP LOGO */}
                    <div className="relative z-10">
                        <Logo variant="light" to="/" imgHeight="h-12" />
                    </div>

                    {/* BRAND CONTENT */}
                    <div className="relative z-10 max-w-md mb-10">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                            Welcome to AuraStays
                        </span>

                        <h2 className="text-5xl font-serif leading-[1.15] mt-5 mb-6">
                            Every journey
                            <br />
                            deserves a beautiful stay.
                        </h2>

                        <p className="text-white/80 leading-7 text-sm max-w-sm">
                            Sign in to explore thoughtfully selected stays,
                            manage your bookings and continue discovering
                            beautiful destinations.
                        </p>

                        <div className="flex items-center gap-3 mt-10 text-xs tracking-wider text-white/70">
                            <span className="w-8 h-px bg-white/60" />
                            STAY · EXPLORE · RELAX
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-white/60">
                        © {new Date().getFullYear()} AuraStays. All rights reserved.
                    </div>
                </div>

                {/* ================= RIGHT LOGIN SECTION ================= */}
                <div className="flex items-center justify-center px-5 py-9 sm:px-10 lg:px-14">

                    <div className="w-full max-w-[430px]">

                        {/* MOBILE LOGO */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo to="/" imgHeight="h-10" />
                        </div>

                        {/* HEADER */}
                        <div className="mb-8">
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#54775E] mb-3">
                                Secure Authentication
                            </p>

                            <h1 className="text-3xl sm:text-4xl font-serif text-[#26372C]">
                                Welcome back.
                            </h1>

                            <p className="text-sm text-[#7B877D] mt-3 leading-6">
                                Log in to your AuraStays account and
                                continue your journey.
                            </p>
                        </div>

                        {/* ================= SUCCESS MESSAGE ================= */}
                        {infoMessage && (
                            <div
                                role="status"
                                className="mb-5 rounded-xl border border-[#D6E5D8] bg-[#F0F7F0] p-4 flex items-start gap-3"
                            >
                                <CheckCircle2
                                    size={19}
                                    className="text-[#315C43] shrink-0"
                                />

                                <p className="text-xs leading-5 text-[#315C43] font-medium">
                                    {infoMessage}
                                </p>
                            </div>
                        )}

                        {/* ================= ERROR MESSAGE ================= */}
                        {formError && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3"
                            >
                                <AlertCircle
                                    size={18}
                                    className="text-rose-600 shrink-0"
                                />

                                <p className="text-xs leading-5 text-rose-700 font-medium">
                                    {formError}
                                </p>
                            </div>
                        )}

                        {/* ================= LOGIN FORM ================= */}
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >

                            {/* EMAIL */}
                            <InputField
                                icon={Mail}
                                id="login-email"
                                name="email"
                                label="Email Address"
                                type="email"
                                autoComplete="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                aria-invalid={!!errors.email}
                                aria-describedby={
                                    errors.email ? "login-email-error" : undefined
                                }
                            />

                            {/* PASSWORD */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label
                                        htmlFor="login-password"
                                        className="text-sm font-semibold text-[#37483C]"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot"
                                        className="text-xs font-semibold text-[#315C43] hover:text-[#244B36] hover:underline underline-offset-4"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <InputField
                                    icon={Lock}
                                    id="login-password"
                                    name="password"
                                    label=""
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    aria-invalid={!!errors.password}
                                    aria-describedby={
                                        errors.password
                                            ? "login-password-error"
                                            : undefined
                                    }
                                    rightElement={
                                        <button
                                            type="button"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            aria-pressed={showPassword}
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="text-[#829084] hover:text-[#315C43] transition-colors p-1"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    }
                                />
                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[52px] rounded-xl bg-[#315C43] hover:bg-[#264B35] text-white text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,92,67,0.18)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
                            >
                                {loading && (
                                    <Loader2
                                        className="animate-spin"
                                        size={17}
                                    />
                                )}

                                {loading ? "Authenticating..." : "Log In"}
                            </button>
                        </form>

                        {/* ================= FOOTER LINKS ================= */}
                        <div className="mt-9 pt-6 border-t border-[#E9EDE7] text-center">

                            <p className="text-sm text-[#7B877D]">
                                Don't have an account?{" "}
                                <Link
                                    to="/signup"
                                    className="font-bold text-[#315C43] hover:text-[#244B36] hover:underline underline-offset-4"
                                >
                                    Sign up as user
                                </Link>
                            </p>

                            <p className="text-sm text-[#7B877D] mt-3">
                                Want to manage properties?{" "}
                                <Link
                                    to="/adminSignup"
                                    className="font-bold text-[#315C43] hover:text-[#244B36] hover:underline underline-offset-4"
                                >
                                    Sign up as admin
                                </Link>
                            </p>
                        </div>

                        {/* MOBILE COPYRIGHT */}
                        <p className="lg:hidden text-center text-[11px] text-[#A0AAA1] mt-8">
                            © {new Date().getFullYear()} AuraStays
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
