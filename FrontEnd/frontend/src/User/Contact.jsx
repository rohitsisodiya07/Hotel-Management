import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { signupApi } from "../api";
import { toast } from "sonner";
import {
    ArrowUpRight,
    Clock3,
    Mail,
    MapPin,
    MessageCircle,
    Send,
    ShieldCheck,
    Headphones,
    Loader2,
    CheckCircle2,
    Phone,
} from "lucide-react";

const initialForm = {
    name: "",
    email: "",
    subject: "",
    message: "",
};

export default function Contact() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        if (notice) setNotice("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            setNotice("");
            const res = await axios.post(`${signupApi}contact`, form);
            toast.success(res.data.message || "Message sent successfully!");
            setNotice(res.data.message || "Thank you! Our concierge team has received your message.");
            setForm(initialForm);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to deliver message. Please try again.";
            toast.error(errorMsg);
            setNotice(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[#F7F7F2] text-[#202A24]">
            {/* Hero */}
            <section className="relative isolate overflow-hidden bg-[#173D31] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
                <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border border-white/10" />
                <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border border-white/10" />
                <div className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-[#A9B9A5]/10 blur-3xl" />
                <div className="relative mx-auto max-w-7xl">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#C5D2C1]">
                        We would love to hear from you
                    </p>
                    <h1 className="max-w-3xl font-serif text-5xl leading-[1.06] text-[#FBFAF6] sm:text-6xl lg:text-7xl">
                        We’re here to <span className="italic text-[#C5D2C1]">help.</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                        Questions about a stay, a reservation, or something else? Send us a
                        message and our team will be happy to help.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-3 text-sm text-white/80">
                        <Link to="/" className="transition hover:text-white">Home</Link>
                        <span className="text-white/40">/</span>
                        <span className="text-[#C5D2C1]">Contact Us</span>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:py-20">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#718575]">Get in touch</p>
                    <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight text-[#20372D] sm:text-5xl">
                        Every great stay starts with a conversation.
                    </h2>
                    <p className="mt-5 max-w-md text-sm leading-7 text-[#68736B]">
                        Whether you need help with a booking or have a question before you
                        travel, we’re here to make things easier.
                    </p>

                    <div className="mt-9 space-y-4">
                        <div className="flex gap-4 rounded-2xl border border-[#E5E9E1] bg-white p-5 shadow-xs">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EDF2EB] text-[#315C48]">
                                <Mail size={19} />
                            </span>
                            <div>
                                <h3 className="font-semibold text-[#26392F]">Concierge Email</h3>
                                <p className="mt-1 text-sm leading-6 text-[#788078]">concierge@aurastay.com</p>
                            </div>
                        </div>
                        <div className="flex gap-4 rounded-2xl border border-[#E5E9E1] bg-white p-5 shadow-xs">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EDF2EB] text-[#315C48]">
                                <Phone size={19} />
                            </span>
                            <div>
                                <h3 className="font-semibold text-[#26392F]">Dedicated Hotline</h3>
                                <p className="mt-1 text-sm leading-6 text-[#788078]">+91 (080) 4567-8900 / 1800-AURA-STAY</p>
                            </div>
                        </div>
                        <div className="flex gap-4 rounded-2xl border border-[#E5E9E1] bg-white p-5 shadow-xs">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EDF2EB] text-[#315C48]">
                                <Clock3 size={19} />
                            </span>
                            <div>
                                <h3 className="font-semibold text-[#26392F]">Support Availability</h3>
                                <p className="mt-1 text-sm leading-6 text-[#788078]">24 Hours / 7 Days a Week (Round the Clock)</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#EAF0E8] p-5">
                        <ShieldCheck className="mt-0.5 shrink-0 text-[#315C48]" size={20} />
                        <p className="text-sm leading-6 text-[#53665A]">
                            For booking-related questions, sign in and visit{" "}
                            <Link to="/myBookings" className="font-semibold text-[#244B39] underline underline-offset-4">
                                My Bookings
                            </Link>{" "}
                            to find your reservation details.
                        </p>
                    </div>
                </div>

                {/* Contact form */}
                <div className="rounded-[28px] border border-[#E6E9E2] bg-white p-5 shadow-[0_18px_55px_rgba(31,54,41,0.07)] sm:p-8 lg:p-10">
                    <div className="mb-8">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF0E8] text-[#315C48]">
                            <Headphones size={22} />
                        </span>
                        <h2 className="mt-5 font-serif text-3xl text-[#20372D] sm:text-4xl">Send us a message</h2>
                        <p className="mt-2 text-sm leading-6 text-[#7A837B]">
                            Fill in the details below and tell us how we can assist you.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[#35443A]">Your name</span>
                                <input
                                    required
                                    minLength={2}
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="w-full rounded-xl border border-[#E1E6DE] bg-[#FCFCFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A0A79F] focus:border-[#52745D] focus:ring-4 focus:ring-[#52745D]/10"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[#35443A]">Email address</span>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-[#E1E6DE] bg-[#FCFCFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A0A79F] focus:border-[#52745D] focus:ring-4 focus:ring-[#52745D]/10"
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[#35443A]">Subject</span>
                            <input
                                required
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="What can we help you with?"
                                className="w-full rounded-xl border border-[#E1E6DE] bg-[#FCFCFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A0A79F] focus:border-[#52745D] focus:ring-4 focus:ring-[#52745D]/10"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[#35443A]">Message</span>
                            <textarea
                                required
                                minLength={10}
                                rows={5}
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Write your message here..."
                                className="w-full resize-y rounded-xl border border-[#E1E6DE] bg-[#FCFCFA] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A0A79F] focus:border-[#52745D] focus:ring-4 focus:ring-[#52745D]/10"
                            />
                        </label>

                        {notice && (
                            <p role="status" className="rounded-xl border border-[#D8E5D7] bg-[#F0F5EE] px-4 py-3 text-sm leading-6 text-[#315C48]">
                                {notice}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#244B39] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#244B39]/15 transition hover:-translate-y-0.5 hover:bg-[#183B2C] focus:outline-none focus:ring-4 focus:ring-[#52745D]/20 disabled:opacity-70 disabled:cursor-not-allowed sm:w-auto cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} /> Sending Message...
                                </>
                            ) : (
                                <>
                                    Send message <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>

            {/* Help banner */}
            <section className="px-5 pb-14 sm:px-8 sm:pb-20">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[26px] bg-[#E9EFE6] p-7 sm:p-9 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#718575]">Need a quick answer?</p>
                        <h2 className="mt-2 font-serif text-3xl text-[#20372D]">Your next stay should feel effortless.</h2>
                        <p className="mt-2 text-sm text-[#68766B]">Explore our stays or check the details of your existing booking.</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#244B39] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183B2C]"
                    >
                        Explore stays <ArrowUpRight size={17} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
