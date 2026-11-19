import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
import { Sparkles, Building2 } from "lucide-react";

/**
 * Universal AuraStay Brand Logo Component
 * - Prevents image distortion by maintaining proper aspect ratio
 * - Adapts to light, dark, and sidebar layouts
 * - Handles image fallback gracefully with high-end luxury typography
 */
const Logo = ({
  to = "/",
  variant = "default", // 'default' | 'dark' | 'light' | 'sidebar' | 'compact'
  showText = true,
  className = "",
  imgHeight = "h-9",
}) => {
  const [hasError, setHasError] = useState(false);

  // Variant stylings
  const isDark = variant === "light" || variant === "sidebar-dark"; // Light text on dark bg
  const isSidebar = variant === "sidebar";

  const brandMark = (
    <div className={`inline-flex items-center gap-2.5 select-none transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      {/* Brand Icon / Image */}
      <div className="relative flex items-center justify-center shrink-0">
        {!hasError ? (
          <img
            src={logoImg}
            alt="AuraStay Logo"
            onError={() => setHasError(true)}
            className={`${imgHeight} w-auto object-contain transition-all duration-300 ${
              isDark
                ? "brightness-100 contrast-100 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                : "brightness-0 opacity-95 contrast-125 drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
            }`}
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173D31] to-[#2A5946] flex items-center justify-center text-amber-300 shadow-md">
            <Sparkles size={20} className="animate-pulse" />
          </div>
        )}
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight">
            <span
              className={`font-serif text-xl sm:text-2xl font-black tracking-tight ${
                isDark ? "text-white" : "text-[#05130D]"
              }`}
            >
              Aura<span className={`${isDark ? "text-[#E6BE75]" : "text-[#6B4610]"} italic font-black ml-0.5`}>Stay</span>
            </span>
          </div>
          {!isSidebar && (
            <span
              className={`text-[9px] tracking-[0.25em] font-black uppercase mt-0.5 ${
                isDark ? "text-amber-200" : "text-[#102319]"
              }`}
            >
              Luxury Stays
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!to) return brandMark;

  return (
    <Link to={to} className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315C43] rounded-lg">
      {brandMark}
    </Link>
  );
};

export default Logo;
