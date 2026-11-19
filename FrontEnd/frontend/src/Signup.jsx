
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import {
    User,
    Mail,
    Lock,
    AlertCircle,
    Loader2,
    KeyRound,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import Logo from "./components/Logo";

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
                        ? "border-rose-300 bg-rose-50"
                        : "border-[#E2E8E2] bg-[#F8FAF7] focus:bg-white focus:border-[#315C43] focus:ring-4 focus:ring-[#315C43]/10"
                    }`}
            />

            {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>

        {error && (
            <p role="alert" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                {error}
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

    // ================= HANDLE INPUT =================
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

        if (formError) setFormError("");
    };

    // ================= VALIDATION =================
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

    // ================= SEND OTP =================
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!validate()) return;

        try {
            setLoading(true);

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            };

            const response = await axios.post(
                `${signupApi}userSignup/sendSignupOtp`,
                payload
            );

            setSuccessMessage(
                response.data.message ||
                "OTP sent successfully to your email."
            );

            setStep(2);
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ================= VERIFY OTP =================
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
                otp: otp.trim(),
            };

            const response = await axios.post(
                `${signupApi}userSignup/verifySignupOtp`,
                payload
            );

            navigate("/login", {
                state: {
                    signupMessage:
                        response.data.message ||
                        "Account verified and registered successfully!",
                },
            });
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Invalid or expired OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center p-3 sm:p-6">

            <div className="w-full max-w-[1120px] min-h-[680px] bg-white rounded-[28px] overflow-hidden shadow-[0_20px_70px_rgba(35,55,40,0.10)] grid grid-cols-1 lg:grid-cols-2">

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
                            Your journey begins here
                        </span>

                        <h2 className="text-5xl font-serif leading-[1.15] mt-5 mb-6">
                            Discover stays
                            <br />
                            worth remembering.
                        </h2>

                        <p className="text-white/80 leading-7 text-sm max-w-sm">
                            Find beautiful places, experience thoughtful
                            hospitality and make every journey feel special.
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

                {/* ================= RIGHT FORM SECTION ================= */}
                <div className="flex items-center justify-center px-5 py-9 sm:px-10 lg:px-14">

                    <div className="w-full max-w-[430px]">

                        {/* MOBILE LOGO */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo to="/" imgHeight="h-10" />
                        </div>

                        {/* PROGRESS */}
                        <div className="flex items-center gap-2 mb-8">
                            <div className="h-1.5 flex-1 rounded-full bg-[#315C43]" />

                            <div
                                className={`h-1.5 flex-1 rounded-full ${step === 2
                                        ? "bg-[#315C43]"
                                        : "bg-[#E6EAE4]"
                                    }`}
                            />

                            <span className="text-xs text-[#829084] ml-2">
                                {step}/2
                            </span>
                        </div>

                        {/* HEADING */}
                        <div className="mb-7">
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#54775E] mb-3">
                                {step === 1
                                    ? "Create your account"
                                    : "Email verification"}
                            </p>

                            <h1 className="text-3xl sm:text-4xl font-serif text-[#26372C]">
                                {step === 1
                                    ? "Join AuraStays."
                                    : "Almost there."}
                            </h1>

                            <p className="text-sm text-[#7B877D] mt-3 leading-6">
                                {step === 1
                                    ? "Create your account and discover your next favourite stay."
                                    : `We've sent a verification code to ${formData.email}`}
                            </p>
                        </div>

                        {/* SUCCESS MESSAGE */}
                        {successMessage && step === 2 && (
                            <div className="mb-5 rounded-xl border border-[#D6E5D8] bg-[#F0F7F0] p-4 flex gap-3">
                                <CheckCircle2
                                    size={19}
                                    className="text-[#315C43] shrink-0"
                                />
                                <p className="text-xs text-[#315C43] leading-5">
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        {/* ERROR MESSAGE */}
                        {formError && (
                            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 flex gap-3">
                                <AlertCircle
                                    size={18}
                                    className="text-rose-600 shrink-0"
                                />
                                <p className="text-xs text-rose-700 leading-5">
                                    {formError}
                                </p>
                            </div>
                        )}

                        {/* ================= STEP 1: SIGNUP ================= */}
                        {step === 1 && (
                            <form
                                onSubmit={handleSendOtp}
                                noValidate
                                className="space-y-4"
                            >
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
                                    autoComplete="name"
                                />

                                <InputField
                                    icon={Mail}
                                    id="email"
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    autoComplete="email"
                                />

                                <InputField
                                    icon={Lock}
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    autoComplete="new-password"
                                    rightElement={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[#829084] hover:text-[#315C43]"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />

                                <InputField
                                    icon={Lock}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    autoComplete="new-password"
                                    rightElement={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="text-[#829084] hover:text-[#315C43]"
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] mt-4 rounded-xl bg-[#315C43] hover:bg-[#264B35] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,92,67,0.18)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading && (
                                        <Loader2 size={17} className="animate-spin" />
                                    )}
                                    {loading ? "Sending OTP..." : "Create Account"}
                                </button>
                            </form>
                        )}

                        {/* ================= STEP 2: OTP ================= */}
                        {step === 2 && (
                            <form
                                onSubmit={handleVerifyOtp}
                                className="space-y-5"
                            >
                                <div className="rounded-2xl bg-[#F7F8F4] border border-[#E5EAE3] p-6 text-center">
                                    <div className="w-14 h-14 rounded-full bg-[#E6EFE7] flex items-center justify-center mx-auto mb-4">
                                        <KeyRound
                                            size={24}
                                            className="text-[#315C43]"
                                        />
                                    </div>

                                    <p className="text-sm text-[#68776B] mb-5">
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
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl bg-[#315C43] hover:bg-[#264B35] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,92,67,0.18)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading && (
                                        <Loader2 size={17} className="animate-spin" />
                                    )}
                                    {loading
                                        ? "Verifying..."
                                        : "Verify & Complete Signup"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp("");
                                        setFormError("");
                                    }}
                                    className="w-full h-11 rounded-xl text-sm font-semibold text-[#6F7D72] hover:text-[#315C43] transition flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={15} />
                                    Back to registration
                                </button>
                            </form>
                        )}

                        {/* ================= FOOTER ================= */}
                        <div className="mt-8 pt-6 border-t border-[#E9EDE7] text-center space-y-3">
                            <p className="text-sm text-[#7B877D]">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-bold text-[#315C43] hover:underline"
                                >
                                    Log in
                                </Link>
                            </p>

                            <p className="text-sm text-[#7B877D]">
                                Want to manage properties?{" "}
                                <Link
                                    to="/adminSignup"
                                    className="font-bold text-[#315C43] hover:underline"
                                >
                                    Sign up as admin
                                </Link>
                            </p>
                        </div>

                        <p className="lg:hidden text-center text-[11px] text-[#A0AAA1] mt-8">
                            © {new Date().getFullYear()} AuraStays
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
