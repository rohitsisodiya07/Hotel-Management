import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "sonner";

const UserLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAF7]">
            <Toaster position="top-center" richColors closeButton />
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default UserLayout;