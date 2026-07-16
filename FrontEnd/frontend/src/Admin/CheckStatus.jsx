import React, {
    useState,
} from "react";
import axios from "axios";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import { signupApi } from "../api";

const CheckStatus = () => {
    const navigate =
        useNavigate();

    const [
        trackingId,
        setTrackingId,
    ] = useState("");

    const [otp, setOtp] =
        useState("");

    const [showOtp, setShowOtp] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [hotel, setHotel] =
        useState(null);

    const [error, setError] =
        useState("");

    const handleSendOtp =
        async () => {
            if (!trackingId.trim()) {
                setError(
                    "Please enter Tracking ID"
                );
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await axios.post(
                        `${signupApi}hotel/sendOtp`,
                        {
                            trackingId,
                        }
                    );

                alert(
                    response.data.message
                );

                setShowOtp(true);
            } catch (error) {
                setError(
                    error.response?.data
                        ?.message ||
                    "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

    const handleVerifyOtp =
        async () => {
            if (!otp.trim()) {
                setError(
                    "Please enter OTP"
                );
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await axios.post(
                        `${signupApi}hotel/verifyOtp`,
                        {
                            trackingId,
                            otp,
                        }
                    );

                setHotel(
                    response.data.hotel
                );
            } catch (error) {
                setError(
                    error.response?.data
                        ?.message ||
                    "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
                {/* Back Button */}
                <button
                    onClick={() =>
                        navigate(-1)
                    }
                    className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 cursor-pointer"
                >
                    ← Back
                </button>

                <h1 className="text-3xl font-bold text-center mb-2">
                    Check Request Status
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Enter your tracking ID
                    to check your pending
                    request.
                </p>

                {!showOtp && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter Tracking ID"
                            value={
                                trackingId
                            }
                            onChange={(e) =>
                                setTrackingId(
                                    e.target.value
                                )
                            }
                            className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-black"
                        />

                        <button
                            onClick={
                                handleSendOtp
                            }
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                        >
                            {loading
                                ? "Sending..."
                                : "Send OTP"}
                        </button>
                    </>
                )}

                {showOtp &&
                    !hotel && (
                        <>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value
                                    )
                                }
                                className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-black"
                            />

                            <button
                                onClick={
                                    handleVerifyOtp
                                }
                                disabled={loading}
                                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </button>
                        </>
                    )}

                {error && (
                    <p className="text-red-500 text-center mt-4">
                        {error}
                    </p>
                )}

                {hotel && (
                    <div className="mt-8 border rounded-xl p-5 bg-gray-50">
                        <h2 className="text-xl font-semibold mb-4">
                            Request Details
                        </h2>

                        <div className="space-y-3">
                            <p>
                                <strong>
                                    Hotel:
                                </strong>{" "}
                                {
                                    hotel.hotelName
                                }
                            </p>

                            <p>
                                <strong>
                                    Owner:
                                </strong>{" "}
                                {
                                    hotel.ownerName
                                }
                            </p>

                            <p>
                                <strong>
                                    Email:
                                </strong>{" "}
                                {
                                    hotel.email
                                }
                            </p>

                            <p>
                                <strong>
                                    Tracking ID:
                                </strong>{" "}
                                {
                                    hotel.trackingId
                                }
                            </p>

                            <p>
                                <strong>
                                    Status:
                                </strong>

                                <span className="ml-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                    {
                                        hotel.status
                                    }
                                </span>
                            </p>
                            {
                                hotel.status ===
                                "Pending" && (
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/adminSignup/${hotel._id}`
                                            )
                                        }
                                        className="w-full mt-5 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
                                    >
                                        Edit Request
                                    </button>
                                )
                            }
                        </div>

                    </div>
                )}


                {/* Bottom Buttons */}
                <div className="mt-8 pt-6 border-t flex flex-col gap-3">
                    <Link
                        to="/adminSignup"
                        className="w-full text-center bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        Register New Hotel
                    </Link>

                    <Link
                        to="/login"
                        className="w-full text-center border border-black py-3 rounded-lg hover:bg-gray-100 transition"
                    >
                        Login
                    </Link>

                </div>

            </div>
        </div>
    );
};

export default CheckStatus;