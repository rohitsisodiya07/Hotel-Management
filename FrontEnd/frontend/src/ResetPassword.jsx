
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "./api";
import {
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    KeyRound,
    AlertCircle,
    Lock,
    CheckCircle2,
} from "lucide-react";
import logo from "./assets/logo.png";

// ================= REUSABLE PASSWORD FIELD =================
const PasswordField = ({
    id,
    name,
    label,
    placeholder,
    value,
    onChange,
    error,
    showPassword,
    togglePassword,
    autoComplete,
    icon: Icon = Lock,
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
                type={showPassword ? "text" : "password"}
                name={name}
                autoComplete={autoComplete}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`w-full h-[52px] rounded-xl border pl-11 pr-12 text-sm text-[#26372C] outline-none transition-all ${error
                        ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                        : "border-[#E2E8E2] bg-[#F8FAF7] focus:bg-white focus:border-[#315C43] focus:ring-4 focus:ring-[#315C43]/10"
                    }`}
            />

            <button
                type="button"
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#829084] hover:text-[#315C43] transition-colors"
            >
                {showPassword ? (
                    <EyeOff size={18} />
                ) : (
                    <Eye size={18} />
                )}
            </button>
        </div>

        {error && (
            <p
                id={`${id}-error`}
                role="alert"
                className="text-xs text-rose-600 mt-1.5 flex items-center gap-1"
            >
                <AlertCircle size={13} />
                {error}
            </p>
        )}
    </div>
);

const ResetPassword = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

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
        setFormSuccess("");
    };

    // ================= TOGGLE PASSWORD VISIBILITY =================
    const togglePassword = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // ================= VALIDATION =================
    const validate = () => {
        const newErrors = {};

        if (!formData.oldPassword.trim()) {
            newErrors.oldPassword = "Current password is required";
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword =
                "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirmation is required";
        } else if (
            formData.newPassword !== formData.confirmPassword
        ) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (
            formData.oldPassword &&
            formData.newPassword &&
            formData.oldPassword === formData.newPassword
        ) {
            newErrors.newPassword =
                "New password must be different from current password";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");
        setFormSuccess("");

        if (!validate()) return;

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.patch(
                `${signupApi}userSignup/resetPassword`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFormSuccess(
                response.data.message ||
                "Password updated successfully."
            );

            // Logout after password change
            localStorage.clear();

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
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
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            aria-label="Go to AuraStays home"
                            className="inline-flex items-center justify-center bg-[#244B36] rounded-xl px-3 py-2 shadow-sm"
                        >
                            <img
                                src={logo}
                                alt="AuraStays Logo"
                                className="w-36 h-auto max-h-12 object-contain"
                            />
                        </button>
                    </div>

                    {/* BRAND CONTENT */}
                    <div className="relative z-10 max-w-md mb-10">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                            Your security matters
                        </span>

                        <h2 className="text-5xl font-serif leading-[1.15] mt-5 mb-6">
                            Your account,
                            <br />
                            your peace of mind.
                        </h2>

                        <p className="text-white/80 leading-7 text-sm max-w-sm">
                            Keep your AuraStays account protected with a
                            strong password and enjoy a secure booking
                            experience every time.
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
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                aria-label="Go to AuraStays home"
                                className="bg-[#244B36] rounded-xl px-3 py-2 shadow-sm"
                            >
                                <img
                                    src={logo}
                                    alt="AuraStays Logo"
                                    className="w-36 h-auto max-h-12 object-contain"
                                />
                            </button>
                        </div>

                        {/* HEADER */}
                        <div className="mb-7">
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#54775E] mb-3">
                                Security Settings
                            </p>

                            <h1 className="text-3xl sm:text-4xl font-serif text-[#26372C]">
                                Change password.
                            </h1>

                            <p className="text-sm text-[#7B877D] mt-3 leading-6">
                                Update your password to keep your AuraStays
                                account secure.
                            </p>
                        </div>

                        {/* SECURITY INFORMATION */}
                        <div className="mb-6 rounded-xl bg-[#F0F7F0] border border-[#D6E5D8] p-4 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E0EDE1] flex items-center justify-center shrink-0">
                                <ShieldCheck
                                    size={19}
                                    className="text-[#315C43]"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#315C43]">
                                    Secure password update
                                </p>

                                <p className="text-xs text-[#66806B] mt-1 leading-5">
                                    Use a password of at least 6 characters
                                    and keep it private.
                                </p>
                            </div>
                        </div>

                        {/* SUCCESS MESSAGE */}
                        {formSuccess && (
                            <div
                                role="status"
                                className="mb-5 rounded-xl border border-[#D6E5D8] bg-[#F0F7F0] p-4 flex items-start gap-3"
                            >
                                <CheckCircle2
                                    size={19}
                                    className="text-[#315C43] shrink-0"
                                />

                                <p className="text-sm text-[#315C43] leading-5">
                                    {formSuccess} Redirecting to login...
                                </p>
                            </div>
                        )}

                        {/* ERROR MESSAGE */}
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

                        {/* ================= FORM ================= */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* CURRENT PASSWORD */}
                            <PasswordField
                                id="oldPassword"
                                name="oldPassword"
                                label="Current Password"
                                placeholder="Enter your current password"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                error={errors.oldPassword}
                                autoComplete="current-password"
                                icon={KeyRound}
                                showPassword={showPasswords.oldPassword}
                                togglePassword={() =>
                                    togglePassword("oldPassword")
                                }
                            />

                            {/* DIVIDER */}
                            <div className="flex items-center gap-3 py-1">
                                <div className="flex-1 h-px bg-[#E9EDE7]" />

                                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#A0AAA1]">
                                    New Credentials
                                </span>

                                <div className="flex-1 h-px bg-[#E9EDE7]" />
                            </div>

                            {/* NEW PASSWORD */}
                            <PasswordField
                                id="newPassword"
                                name="newPassword"
                                label="New Password"
                                placeholder="Enter new password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                error={errors.newPassword}
                                autoComplete="new-password"
                                icon={Lock}
                                showPassword={showPasswords.newPassword}
                                togglePassword={() =>
                                    togglePassword("newPassword")
                                }
                            />

                            {/* CONFIRM PASSWORD */}
                            <PasswordField
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm New Password"
                                placeholder="Re-enter your new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                                icon={Lock}
                                showPassword={showPasswords.confirmPassword}
                                togglePassword={() =>
                                    togglePassword("confirmPassword")
                                }
                            />

                            {/* PASSWORD VISIBILITY */}
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const shouldShow = !Object.values(
                                            showPasswords
                                        ).every(Boolean);

                                        setShowPasswords({
                                            oldPassword: shouldShow,
                                            newPassword: shouldShow,
                                            confirmPassword: shouldShow,
                                        });
                                    }}
                                    className="text-xs font-semibold text-[#6F7D72] hover:text-[#315C43] transition-colors flex items-center gap-2"
                                >
                                    {Object.values(showPasswords).every(Boolean) ? (
                                        <EyeOff size={15} />
                                    ) : (
                                        <Eye size={15} />
                                    )}

                                    {Object.values(showPasswords).every(Boolean)
                                        ? "Hide all passwords"
                                        : "Show all passwords"}
                                </button>

                                <span className="text-[10px] text-[#A0AAA1] uppercase tracking-wider font-bold">
                                    Min 6 characters
                                </span>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[52px] mt-2 rounded-xl bg-[#315C43] hover:bg-[#264B35] text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,92,67,0.18)] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {loading && (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                )}

                                {loading
                                    ? "Updating Password..."
                                    : "Update Password"}
                            </button>
                        </form>

                        {/* BACK BUTTON */}
                        <div className="mt-7 pt-6 border-t border-[#E9EDE7] text-center">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="text-sm font-semibold text-[#6F7D72] hover:text-[#315C43] transition-colors flex items-center gap-2 mx-auto"
                            >
                                <ArrowLeft size={15} />
                                Go Back
                            </button>
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

export default ResetPassword;
