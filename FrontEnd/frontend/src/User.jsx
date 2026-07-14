import React from "react";
import { useNavigate } from "react-router-dom";

const User = () => {
    const navigate = useNavigate();
    const user =
        JSON.parse(localStorage.getItem("user")) || {};

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-5">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome 👋
                </h1>

                <p className="text-gray-500 mt-2">
                    You are successfully logged in.
                </p>

                <div className="mt-8 space-y-4 text-left">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-500 text-sm">Name</p>
                        <p className="font-semibold text-gray-800">
                            {user?.name || "N/A"}
                        </p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-500 text-sm">Email</p>
                        <p className="font-semibold text-gray-800">
                            {user?.email || "N/A"}
                        </p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-500 text-sm">Role</p>
                        <p className="font-semibold text-gray-800 capitalize">
                            {user?.role || "User"}
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={() => navigate("/reset")}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 duration-300 cursor-pointer"
                    >
                        Reset Password
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 duration-300 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default User;