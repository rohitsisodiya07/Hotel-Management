
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import {
    Mail,
    Lock,
    KeyRound,
    AlertCircle,
    Loader2,
    Check,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";
import Logo from "./components/Logo";

// ================= STEPS =================
const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "OTP" },
    { n: 3, label: "New password" },
];

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
                className={`w-full h-[52px] rounded-xl border pl-11 ${rightElement ? "pr-12" : "pr-4"
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

// ================= MAIN COMPONENT =================
const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formError, setFormError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

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
        setInfoMessage("");
    };

    // ================= EMAIL VALIDATION =================
    const validateEmail = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Enter a valid email address";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ================= PASSWORD VALIDATION =================
    const validatePassword = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password =
                "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword =
                "Confirm password is required";
        } else if (
            formData.password !== formData.confirmPassword
        ) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ================= SEND OTP =================
    const handleSendOtp = async () => {
        setFormError("");
        setInfoMessage("");

        if (!validateEmail()) return;

        try {
            setLoading(true);

            const response = await axios.post(
                `${signupApi}userSignup/sendOtp`,
                {
                    email: formData.email.trim(),
                }
            );

            setInfoMessage(
                response.data.message ||
                "Verification code sent successfully."
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
    const handleVerifyOtp = async () => {
        setFormError("");
        setInfoMessage("");

        if (!otp.trim()) {
            setFormError("OTP is required");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${signupApi}userSignup/verifyOtp`,
                {
                    email: formData.email.trim(),
                    otp: otp.trim(),
                }
            );

            if (response.data.resetToken) {
                setResetToken(response.data.resetToken);
            }

            setInfoMessage(
                response.data.message ||
                "Email verified successfully."
            );

            setStep(3);
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ================= RESET PASSWORD =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");
        setInfoMessage("");

        if (!validatePassword()) return;

        try {
            setLoading(true);

            const response = await axios.patch(
                `${signupApi}userSignup/forgotPassword`,
                {
                    ...formData,
                    email: formData.email.trim(),
                    resetToken,
                },
                {
                    headers: resetToken ? { Authorization: `Bearer ${resetToken}` } : {}
                }
            );

            setInfoMessage(
                response.data.message ||
                "Password reset successfully."
            );

            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
            });

            setOtp("");
            setStep(1);

            navigate("/login", {
                state: {
                    signupMessage:
                        response.data.message ||
                        "Password reset successfully. Please log in.",
                },
            });
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ================= RESET FLOW =================
    const handleBack = () => {
        setFormError("");
        setInfoMessage("");

        if (step === 3) {
            setStep(2);
            setFormData((prev) => ({
                ...prev,
                password: "",
                confirmPassword: "",
            }));
            setErrors({});
        } else if (step === 2) {
            setStep(1);
            setOtp("");
            setErrors({});
        } else {
            navigate("/login");
        }
    };

    // ================= RENDER =================
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
                            Account Recovery
                        </span>

                        <h2 className="text-5xl font-serif leading-[1.15] mt-5 mb-6">
                            A fresh start
                            <br />
                            begins here.
                        </h2>

                        <p className="text-white/80 leading-7 text-sm max-w-sm">
                            Recover access to your account securely and
                            get back to discovering beautiful places
                            and memorable stays.
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

                        {/* HEADER */}
                        <div className="mb-8">
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#54775E] mb-3">
                                Account Recovery
                            </p>

                            <h1 className="text-3xl sm:text-4xl font-serif text-[#26372C]">
                                Reset your password.
                            </h1>

                            <p className="text-sm text-[#7B877D] mt-3 leading-6">
                                Securely recover your AuraStays account
                                in a few simple steps.
                            </p>
                        </div>

                        {/* ================= STEP INDICATOR ================= */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center">

                                {steps.map((s, i) => (
                                    <React.Fragment key={s.n}>

                                        <div className="flex flex-col items-center shrink-0">

                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s.n
                                                        ? "bg-[#315C43] text-white shadow-md"
                                                        : "bg-[#EDF0EB] text-[#9AA49A]"
                                                    }`}
                                            >
                                                {step > s.n ? (
                                                    <Check
                                                        size={16}
                                                        strokeWidth={3}
                                                    />
                                                ) : (
                                                    s.n
                                                )}
                                            </div>

                                            <span
                                                className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${step >= s.n
                                                        ? "text-[#315C43]"
                                                        : "text-[#A0AAA1]"
                                                    }`}
                                            >
                                                {s.label}
                                            </span>
                                        </div>

                                        {i < steps.length - 1 && (
                                            <div className="flex-1 mx-3 mb-5">
                                                <div
                                                    className={`h-1 rounded-full transition-all duration-500 ${step > s.n
                                                            ? "bg-[#315C43]"
                                                            : "bg-[#E5EAE3]"
                                                        }`}
                                                />
                                            </div>
                                        )}

                                    </React.Fragment>
                                ))}

                            </div>
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

                                <p className="text-xs text-[#315C43] leading-5">
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

                                <p className="text-xs text-rose-700 leading-5">
                                    {formError}
                                </p>
                            </div>
                        )}

                        {/* ================= STEP 1: EMAIL ================= */}
                        {step === 1 && (
                            <div className="space-y-5">

                                <InputField
                                    icon={Mail}
                                    id="email"
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                />

                                <div className="rounded-xl bg-[#F0F7F0] border border-[#DCE9DC] px-4 py-3">
                                    <p className="text-xs leading-5 text-[#54775E]">
                                        We'll send a verification code to
                                        this email address to securely reset
                                        your password.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl bg-[#315C43] hover:bg-[#264B35] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,92,67,0.18)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading && (
                                        <Loader2
                                            className="animate-spin"
                                            size={17}
                                        />
                                    )}

                                    {loading
                                        ? "Sending OTP..."
                                        : "Send Verification Code"}
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 2: OTP ================= */}
                        {step === 2 && (
                            <div className="space-y-5">

                                <div className="rounded-2xl bg-[#F7F8F4] border border-[#E5EAE3] p-6">

                                    <div className="flex items-center justify-center mb-4">
                                        <div className="w-14 h-14 rounded-full bg-[#E6EFE7] flex items-center justify-center">
                                            <KeyRound
                                                size={24}
                                                className="text-[#315C43]"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-center text-sm font-semibold text-[#37483C]">
                                        Verify your email
                                    </p>

                                    <p className="text-center text-xs text-[#829084] mt-2 mb-5">
                                        Code sent to{" "}
                                        <span className="font-semibold text-[#315C43]">
                                            {formData.email}
                                        </span>
                                    </p>

                                    <label
                                        htmlFor="otp"
                                        className="block text-sm font-semibold text-[#37483C] mb-2"
                                    >
                                        Verification Code
                                    </label>

                                    <div className="relative">
                                        <KeyRound
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829084]"
                                        />

                                        <input
                                            id="otp"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => {
                                                setOtp(
                                                    e.target.value.replace(/\D/g, "")
                                                );
                                                setFormError("");
                                                setInfoMessage("");
                                            }}
                                            className="w-full h-[52px] rounded-xl border border-[#E2E8E2] pl-11 pr-4 text-center text-lg font-bold tracking-[0.45em] text-[#26372C] outline-none bg-white focus:border-[#315C43] focus:ring-4 focus:ring-[#315C43]/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl bg-[#315C43] hover:bg-[#264B35] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,92,67,0.18)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading && (
                                        <Loader2
                                            className="animate-spin"
                                            size={17}
                                        />
                                    )}

                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 3: NEW PASSWORD ================= */}
                        {step === 3 && (
                            <form
                                onSubmit={handleSubmit}
                                noValidate
                                className="space-y-5"
                            >

                                <div className="rounded-xl bg-[#F0F7F0] border border-[#DCE9DC] px-4 py-3">
                                    <p className="text-xs leading-5 text-[#54775E] font-medium">
                                        Email verified successfully. Create
                                        a new password for your account.
                                    </p>
                                </div>

                                {/* NEW PASSWORD */}
                                <InputField
                                    icon={Lock}
                                    id="password"
                                    name="password"
                                    label="New Password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    rightElement={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="text-[#829084] hover:text-[#315C43]"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    }
                                />

                                {/* CONFIRM PASSWORD */}
                                <InputField
                                    icon={Lock}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    type={showConfirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    rightElement={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirm((prev) => !prev)
                                            }
                                            aria-label={
                                                showConfirm
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="text-[#829084] hover:text-[#315C43]"
                                        >
                                            {showConfirm ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    }
                                />

                                <p className="text-[11px] text-[#829084]">
                                    Password must contain at least 6 characters.
                                </p>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl bg-[#315C43] hover:bg-[#264B35] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,92,67,0.18)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading && (
                                        <Loader2
                                            className="animate-spin"
                                            size={17}
                                        />
                                    )}

                                    {loading
                                        ? "Resetting..."
                                        : "Reset Password"}
                                </button>
                            </form>
                        )}

                        {/* ================= FOOTER ================= */}
                        <div className="mt-8 pt-6 border-t border-[#E9EDE7] text-center">

                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center justify-center gap-2 mx-auto mb-4 text-sm font-semibold text-[#6F7D72] hover:text-[#315C43]"
                                >
                                    <ArrowLeft size={15} />
                                    Back to previous step
                                </button>
                            )}

                            <p className="text-sm text-[#7B877D]">
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="font-bold text-[#315C43] hover:text-[#244B36] hover:underline underline-offset-4"
                                >
                                    Back to Login
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

export default ForgotPassword;
