import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { signupApi } from "../api";

import {
    MapPin,
    Users,
    BedDouble,
    Check,
    Star,
    Wifi,
    Waves,
    Sparkles,
    Dumbbell,
    Utensils,
    Car,
    Clock,
    ShieldCheck,
    ChevronRight,
    Share,
    Heart,
    Info,
    X,
} from "lucide-react";



const amenityIcons = {
    "Free WiFi": <Wifi size={18} />,
    "Free Wi-Fi": <Wifi size={18} />,
    Parking: <Car size={18} />,
    "Swimming Pool": <Waves size={18} />,
    Gym: <Dumbbell size={18} />,
    "Gym / Fitness Center": <Dumbbell size={18} />,
    Spa: <Sparkles size={18} />,
    "Spa & Wellness": <Sparkles size={18} />,
    Restaurant: <Utensils size={18} />,
};

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

   
    const [roomSearch, setRoomSearch] = useState("");
    const [roomSort, setRoomSort] = useState("lowToHigh");

    

    const [isSaved, setIsSaved] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);


    const [bookingModal, setBookingModal] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState(null);

    const [bookingLoading, setBookingLoading] = useState(false);

    const [bookingForm, setBookingForm] = useState({
        checkIn: "",
        checkOut: "",
        totalGuests: 1,
        specialRequest: "",
    });


    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchDetails = async () => {
            try {
                const hotelRes = await axios.get(
                    `${signupApi}hotel/public/${id}`
                );

                const roomsRes = await axios.get(
                    `${signupApi}room/public/hotel/${id}`
                );

                setHotel(hotelRes.data.hotel);

                setRooms(roomsRes.data.rooms || []);
            } catch (error) {
                console.error(
                    "Error fetching hotel details:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);



    const processedRooms = useMemo(() => {
        let data = [...rooms];

        if (roomSearch) {
            data = data.filter((room) =>
                room.roomType
                    ?.toLowerCase()
                    .includes(roomSearch.toLowerCase())
            );
        }

        if (roomSort === "lowToHigh") {
            data.sort(
                (a, b) =>
                    Number(a.pricePerNight) -
                    Number(b.pricePerNight)
            );
        }

        if (roomSort === "highToLow") {
            data.sort(
                (a, b) =>
                    Number(b.pricePerNight) -
                    Number(a.pricePerNight)
            );
        }

        return data;
    }, [rooms, roomSearch, roomSort]);

  

    const displayCity =
        hotel?.city?.cityName ||
        hotel?.city ||
        "City";

    const displayState =
        hotel?.city?.districtId?.stateId?.stateName ||
        "State";

    const minPrice =
        rooms.length > 0
            ? Math.min(
                ...rooms.map(
                    (room) =>
                        Number(room.pricePerNight) || 0
                )
            )
            : 0;

    const hotelImages =
        hotel?.hotelImages?.length > 0
            ? hotel.hotelImages
            : Array(5).fill(
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200"
            );


    const getTodayDate = () => {
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    const getNextDate = (dateString) => {
        if (!dateString) return getTodayDate();

        const date = new Date(`${dateString}T00:00:00`);

        date.setDate(date.getDate() + 1);

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

  

    const handleReserve = (room) => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            alert(
                "Please login first to reserve this room."
            );

            navigate("/login");

            return;
        }

        setSelectedRoom(room);

        setBookingForm({
            checkIn: "",
            checkOut: "",
            totalGuests: 1,
            specialRequest: "",
        });

        setBookingModal(true);
    };


    const closeBookingModal = () => {
        if (bookingLoading) return;

        setBookingModal(false);

        setSelectedRoom(null);

        setBookingForm({
            checkIn: "",
            checkOut: "",
            totalGuests: 1,
            specialRequest: "",
        });
    };

  

    const calculateNights = () => {
        if (
            !bookingForm.checkIn ||
            !bookingForm.checkOut
        ) {
            return 0;
        }

        const checkInDate = new Date(
            `${bookingForm.checkIn}T00:00:00`
        );

        const checkOutDate = new Date(
            `${bookingForm.checkOut}T00:00:00`
        );

        const difference =
            checkOutDate.getTime() -
            checkInDate.getTime();

        if (difference <= 0) {
            return 0;
        }

        return Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );
    };

    const totalNights =
        calculateNights();

    const totalAmount =
        selectedRoom && totalNights > 0
            ? Number(
                selectedRoom.pricePerNight
            ) * totalNights
            : 0;

   

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        const token =
            localStorage.getItem("token");

        if (!token) {
            alert(
                "Your login session is required."
            );

            setBookingModal(false);

            navigate("/login");

            return;
        }

        if (!selectedRoom) {
            alert("Please select a room.");

            return;
        }

        if (
            !bookingForm.checkIn ||
            !bookingForm.checkOut
        ) {
            alert(
                "Please select check-in and check-out dates."
            );

            return;
        }

        if (totalNights <= 0) {
            alert(
                "Check-out date must be after check-in date."
            );

            return;
        }

        const guests = Number(
            bookingForm.totalGuests
        );

        if (
            !guests ||
            guests < 1
        ) {
            alert(
                "At least one guest is required."
            );

            return;
        }

        if (
            guests >
            Number(
                selectedRoom.maxOccupancy
            )
        ) {
            alert(
                `Maximum ${selectedRoom.maxOccupancy} guests are allowed in this room.`
            );

            return;
        }

        try {
            setBookingLoading(true);

            const response =
                await axios.post(
                    `${signupApi}booking/create`,
                    {
                        roomId:
                            selectedRoom._id,

                        checkIn:
                            bookingForm.checkIn,

                        checkOut:
                            bookingForm.checkOut,

                        totalGuests:
                            guests,

                        specialRequest:
                            bookingForm.specialRequest.trim(),
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            alert(
                response.data?.message ||
                "Booking created successfully."
            );

            setBookingModal(false);

            setSelectedRoom(null);

            setBookingForm({
                checkIn: "",
                checkOut: "",
                totalGuests: 1,
                specialRequest: "",
            });
        } catch (error) {
            console.error(
                "Booking Error:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Booking failed. Please try again."
            );
        } finally {
            setBookingLoading(false);
        }
    };


    const handleShare = async () => {
        const shareData = {
            title: hotel?.hotelName,

            text: `Check out ${hotel?.hotelName} in ${displayCity}`,

            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(
                    shareData
                );
            } else {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                setShareCopied(true);

                setTimeout(
                    () =>
                        setShareCopied(
                            false
                        ),
                    2000
                );
            }
        } catch (error) {
            console.log(
                "Share cancelled:",
                error
            );
        }
    };

  

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 animate-pulse">

                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />

                <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />

                <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[50vh] min-h-[400px] mb-12">

                    <div className="col-span-2 row-span-2 bg-gray-200 rounded-3xl" />

                    <div className="bg-gray-200 rounded-2xl" />

                    <div className="bg-gray-200 rounded-2xl" />

                    <div className="bg-gray-200 rounded-2xl" />

                    <div className="bg-gray-200 rounded-2xl" />

                </div>

            </div>
        );
    }


    if (!hotel) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F7F6F0]">

                <h2 className="text-3xl font-bold text-[#1B2537] mb-2">
                    Hotel Not Found
                </h2>

                <p className="text-gray-500 mb-6">
                    This hotel is currently unavailable.
                </p>

                <button
                    onClick={() =>
                        navigate("/")
                    }
                    className="bg-[#A2782E] text-white px-8 py-3 rounded-xl font-bold"
                >
                    Return Home
                </button>

            </div>
        );
    }

    return (
        <div className="bg-[#F7F6F0] min-h-screen text-[#232320] pb-28 lg:pb-24">

            <div className="max-w-7xl mx-auto px-6 pt-8">

                {/* HEADER */}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">

                    <div>

                        <div className="flex items-center gap-2 text-[12px] font-bold text-[#8C8676] uppercase tracking-wider mb-3">

                            <span
                                onClick={() =>
                                    navigate("/")
                                }
                                className="cursor-pointer hover:text-[#A2782E]"
                            >
                                Home
                            </span>

                            <ChevronRight size={14} />

                            <span>
                                {displayState}
                            </span>

                            <ChevronRight size={14} />

                            <span className="text-[#1B2537]">
                                {displayCity}
                            </span>

                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[#1B2537]">
                            {hotel.hotelName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mt-3">

                            <span className="flex items-center gap-1 text-[13px] font-bold bg-[#1B2537] text-white px-2.5 py-1 rounded-lg">

                                <Star
                                    size={14}
                                    fill="currentColor"
                                    className="text-[#A2782E]"
                                />

                                4.8

                                <span className="font-normal text-gray-300 ml-1">
                                    (124 Reviews)
                                </span>

                            </span>

                            <p className="flex items-center gap-1.5 text-[#4A473D] text-[14px] font-medium">

                                <MapPin
                                    size={16}
                                    className="text-[#A2782E]"
                                />

                                {hotel.address},{" "}
                                {displayCity}

                            </p>

                        </div>

                    </div>

                    <div className="flex gap-3">

                        <button
                            onClick={handleShare}
                            className="relative flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E2D5] rounded-xl"
                        >
                            <Share size={16} />

                            Share

                            {shareCopied && (
                                <span className="absolute -bottom-8 right-0 bg-[#1B2537] text-white text-[11px] px-2.5 py-1 rounded-md whitespace-nowrap">
                                    Link copied!
                                </span>
                            )}

                        </button>

                        <button
                            onClick={() =>
                                setIsSaved(
                                    !isSaved
                                )
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E2D5] rounded-xl"
                        >

                            <Heart
                                size={16}
                                className={
                                    isSaved
                                        ? "text-red-500 fill-red-500"
                                        : "text-red-500"
                                }
                            />

                            {isSaved
                                ? "Saved"
                                : "Save"}

                        </button>

                    </div>

                </div>

                {/* IMAGE GALLERY */}

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[40vh] md:h-[60vh] min-h-[400px] mb-12 rounded-3xl overflow-hidden shadow-md">

                    <div className="col-span-1 md:col-span-2 md:row-span-2 relative group">

                        <img
                            src={hotelImages[0]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={hotel.hotelName}
                        />

                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase flex items-center gap-1.5">

                            <ShieldCheck
                                size={14}
                                className="text-green-600"
                            />

                            Verified Property

                        </div>

                    </div>

                    {hotelImages
                        .slice(1, 5)
                        .map(
                            (
                                image,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    className="hidden md:block relative overflow-hidden group"
                                >

                                    <img
                                        src={
                                            image ||
                                            hotelImages[0]
                                        }
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        alt={`${hotel.hotelName} ${index + 2}`}
                                    />

                                </div>
                            )
                        )}

                </div>

                {/* MAIN */}

                <div className="flex flex-col lg:flex-row gap-12">

                    <div className="flex-1 space-y-12">

                        {/* HOTEL HIGHLIGHTS */}

                        <div className="flex flex-wrap gap-4 border-b border-[#E5E2D5] pb-8">

                            <div className="bg-white px-5 py-4 rounded-2xl border border-[#E5E2D5] shadow-sm flex-1 min-w-[140px] text-center">

                                <Users
                                    size={24}
                                    className="text-[#A2782E] mx-auto mb-2"
                                />

                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Property Type
                                </p>

                                <p className="font-bold text-[#1B2537] text-lg">
                                    {hotel.hotelType}
                                </p>

                            </div>

                            <div className="bg-white px-5 py-4 rounded-2xl border border-[#E5E2D5] shadow-sm flex-1 min-w-[140px] text-center">

                                <BedDouble
                                    size={24}
                                    className="text-[#A2782E] mx-auto mb-2"
                                />

                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Total Inventory
                                </p>

                                <p className="font-bold text-[#1B2537] text-lg">
                                    {hotel.totalRooms} Rooms
                                </p>

                            </div>

                            <div className="bg-white px-5 py-4 rounded-2xl border border-[#E5E2D5] shadow-sm flex-1 min-w-[140px] text-center">

                                <Clock
                                    size={24}
                                    className="text-[#A2782E] mx-auto mb-2"
                                />

                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Check-In
                                </p>

                                <p className="font-bold text-[#1B2537] text-lg">
                                    02:00 PM
                                </p>

                            </div>

                        </div>

                        {/* ABOUT */}

                        <div>

                            <h2 className="text-2xl font-bold mb-4 text-[#1B2537]">
                                About this space
                            </h2>

                            <p className="text-[#4A473D] leading-relaxed text-[15px] whitespace-pre-line">
                                {hotel.description}
                            </p>

                        </div>

                        {/* AMENITIES */}

                        <div>

                            <h2 className="text-2xl font-bold mb-6 text-[#1B2537]">
                                What this place offers
                            </h2>

                            {hotel.amenities?.length >
                                0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                                    {hotel.amenities.map(
                                        (
                                            amenity,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="flex items-center gap-3 text-[15px] font-medium text-[#4A473D]"
                                            >

                                                <div className="text-[#1B2537]">

                                                    {amenityIcons[
                                                        amenity
                                                    ] || (
                                                            <Check
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        )}

                                                </div>

                                                {
                                                    amenity
                                                }

                                            </div>
                                        )
                                    )}

                                </div>
                            ) : (
                                <p className="text-gray-400">
                                    No amenities listed.
                                </p>
                            )}

                        </div>
                        {/* ROOMS SECTION */}

                        <div
                            id="rooms-section"
                            className="pt-8 border-t border-[#E5E2D5]"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">

                                <div>
                                    <h2 className="text-3xl font-bold text-[#1B2537]">
                                        Select your room
                                    </h2>

                                    <p className="text-gray-500 mt-1">
                                        {processedRooms.length} room
                                        {processedRooms.length !== 1 ? "s" : ""} available
                                    </p>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">

                                    <div className="relative w-full md:w-48">

                                        <input
                                            type="text"
                                            placeholder="Search room type..."
                                            value={roomSearch}
                                            onChange={(e) =>
                                                setRoomSearch(e.target.value)
                                            }
                                            className="border border-[#E5E2D5] pl-4 pr-8 py-2.5 outline-none focus:border-[#A2782E] rounded-xl text-sm w-full bg-white shadow-sm"
                                        />

                                        {roomSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setRoomSearch("")}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}

                                    </div>

                                    <select
                                        value={roomSort}
                                        onChange={(e) =>
                                            setRoomSort(e.target.value)
                                        }
                                        className="border border-[#E5E2D5] px-4 py-2.5 outline-none rounded-xl text-sm bg-white shadow-sm"
                                    >
                                        <option value="lowToHigh">
                                            Price: Low to High
                                        </option>

                                        <option value="highToLow">
                                            Price: High to Low
                                        </option>
                                    </select>

                                </div>

                            </div>

                            {/* ROOM CARDS */}

                            <div className="space-y-6">

                                {processedRooms.length === 0 ? (

                                    <div className="text-center py-16 bg-white border border-dashed border-[#E5E2D5] rounded-3xl">

                                        <BedDouble
                                            size={45}
                                            className="mx-auto text-gray-300 mb-4"
                                        />

                                        <p className="text-[#8C8676] font-medium text-lg">
                                            No rooms found
                                        </p>

                                        <p className="text-sm text-gray-400 mt-2">
                                            Try changing your room search.
                                        </p>

                                    </div>

                                ) : (

                                    processedRooms.map((room) => (

                                        <div
                                            key={room._id}
                                            className="bg-white border border-[#E5E2D5] rounded-3xl p-4 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                        >

                                            {/* ROOM IMAGE */}

                                            <div className="w-full md:w-80 h-56 relative rounded-2xl overflow-hidden shrink-0">

                                                <img
                                                    src={
                                                        room.roomImages?.[0] ||
                                                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"
                                                    }
                                                    alt={room.roomType}
                                                    className="w-full h-full object-cover"
                                                />

                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                                                    {room.roomSize
                                                        ? `${room.roomSize} sq ft`
                                                        : "Spacious"}
                                                </div>

                                            </div>

                                            {/* ROOM DETAILS */}

                                            <div className="flex-1 flex flex-col justify-between py-1">

                                                <div>

                                                    <div className="flex justify-between gap-3">

                                                        <h3 className="text-2xl font-bold text-[#1B2537]">
                                                            {room.roomType}
                                                        </h3>

                                                        {room.isFeatured && (
                                                            <span className="h-fit bg-amber-50 text-[#A2782E] border border-amber-200 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
                                                                Featured
                                                            </span>
                                                        )}

                                                    </div>

                                                    <p className="text-gray-500 text-[13.5px] mt-2 mb-4 line-clamp-2 leading-relaxed">
                                                        {room.description ||
                                                            "Comfortable room designed for a relaxing stay."}
                                                    </p>

                                                    <div className="flex flex-wrap gap-x-6 gap-y-3 mb-5">

                                                        <div className="flex items-center gap-2 text-[13px] text-[#4A473D] font-bold">
                                                            <Users
                                                                size={16}
                                                                className="text-[#A2782E]"
                                                            />

                                                            Max {room.maxOccupancy} Guests
                                                        </div>

                                                        <div className="flex items-center gap-2 text-[13px] text-[#4A473D] font-bold">

                                                            <BedDouble
                                                                size={16}
                                                                className="text-[#A2782E]"
                                                            />

                                                            {room.totalBeds} {room.bedType} Bed

                                                        </div>

                                                    </div>

                                                    <div className="flex flex-wrap gap-2">

                                                        {room.roomAmenities
                                                            ?.slice(0, 4)
                                                            .map((amenity) => (

                                                                <span
                                                                    key={amenity}
                                                                    className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#1B2537] bg-gray-100 px-2.5 py-1.5 rounded-md"
                                                                >
                                                                    <Check
                                                                        size={12}
                                                                        className="text-[#A2782E]"
                                                                    />

                                                                    {amenity}
                                                                </span>

                                                            ))}

                                                    </div>

                                                </div>

                                                {/* PRICE + RESERVE */}

                                                <div className="flex items-end justify-between mt-6 pt-4 border-t border-[#FAF9F5]">

                                                    <div>

                                                        <p className="text-3xl font-bold text-[#A2782E]">
                                                            ₹{Number(
                                                                room.pricePerNight
                                                            ).toLocaleString("en-IN")}
                                                        </p>

                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                            Per Night
                                                        </p>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleReserve(room)
                                                        }
                                                        className="bg-[#1B2537] hover:bg-[#26314A] text-white px-8 py-3.5 font-bold uppercase tracking-widest text-[12px] rounded-xl transition shadow-md"
                                                    >
                                                        Reserve
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    ))

                                )}

                            </div>

                        </div>

                        {/* POLICIES */}

                        <div className="border-t border-[#E5E2D5] pt-12">

                            <h2 className="text-2xl font-bold mb-6 text-[#1B2537]">
                                Things to know
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                <div>

                                    <h4 className="font-bold text-[15px] mb-3 flex items-center gap-2">

                                        <Clock
                                            size={18}
                                            className="text-[#A2782E]"
                                        />

                                        House Rules

                                    </h4>

                                    <ul className="space-y-2 text-[14px] text-gray-600">
                                        <li>Check-in: 2:00 PM - Midnight</li>
                                        <li>Check-out: 11:00 AM</li>
                                        <li>No smoking inside rooms</li>
                                        <li>Government ID may be required</li>
                                    </ul>

                                </div>

                                <div>

                                    <h4 className="font-bold text-[15px] mb-3 flex items-center gap-2">

                                        <Info
                                            size={18}
                                            className="text-[#A2782E]"
                                        />

                                        Booking Information

                                    </h4>

                                    <ul className="space-y-2 text-[14px] text-gray-600">
                                        <li>Select valid check-in and check-out dates.</li>
                                        <li>Guest count cannot exceed room capacity.</li>
                                        <li>Room availability is verified while booking.</li>
                                    </ul>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT SIDEBAR */}

                    <div className="w-full lg:w-[380px] shrink-0 hidden lg:block">

                        <div className="bg-white border border-[#E5E2D5] rounded-3xl p-6 shadow-xl sticky top-6">

                            <div className="flex items-end gap-1 mb-6 border-b border-[#FAF9F5] pb-6">

                                {minPrice > 0 ? (
                                    <>
                                        <span className="text-3xl font-bold text-[#1B2537]">
                                            ₹{Number(minPrice).toLocaleString("en-IN")}
                                        </span>

                                        <span className="text-gray-500 font-medium text-sm mb-1">
                                            / night onward
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-xl font-bold text-[#1B2537]">
                                        Pricing Unavailable
                                    </span>
                                )}

                            </div>

                            <div className="bg-[#F7F6F0] rounded-2xl p-5 mb-5">

                                <p className="font-bold text-[#1B2537]">
                                    Ready to book?
                                </p>

                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                    Choose your preferred room below, then select
                                    dates and guests to calculate your total.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    document
                                        .getElementById("rooms-section")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                }
                                className="w-full bg-[#A2782E] hover:bg-[#8c6727] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition shadow-lg"
                            >
                                Select a Room
                            </button>

                            <div className="text-center text-[12px] text-gray-500 font-medium mt-4">
                                Select dates before confirming your reservation.
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* MOBILE STICKY BAR */}

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E2D5] px-5 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-20">

                <div>

                    {minPrice > 0 ? (
                        <>
                            <span className="text-xl font-bold text-[#1B2537]">
                                ₹{Number(minPrice).toLocaleString("en-IN")}
                            </span>

                            <span className="text-gray-500 text-xs ml-1">
                                / night
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-bold text-[#1B2537]">
                            Pricing Unavailable
                        </span>
                    )}

                </div>

                <button
                    type="button"
                    onClick={() =>
                        document
                            .getElementById("rooms-section")
                            ?.scrollIntoView({
                                behavior: "smooth",
                            })
                    }
                    className="bg-[#A2782E] hover:bg-[#8c6727] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition shadow-md"
                >
                    Select Room
                </button>

            </div>

            {/* ========================================= */}
            {/* BOOKING MODAL */}
            {/* ========================================= */}

            {bookingModal && selectedRoom && (

                <div
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeBookingModal}
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                    >

                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-6 border-b border-gray-100">

                            <div>

                                <p className="text-xs uppercase tracking-widest font-bold text-[#A2782E]">
                                    Complete Reservation
                                </p>

                                <h2 className="text-2xl font-bold text-[#1B2537] mt-1">
                                    {selectedRoom.roomType}
                                </h2>

                            </div>

                            <button
                                type="button"
                                disabled={bookingLoading}
                                onClick={closeBookingModal}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* SELECTED ROOM */}

                        <div className="mx-6 mt-6 bg-[#F7F6F0] rounded-2xl p-4 flex gap-4">

                            <img
                                src={
                                    selectedRoom.roomImages?.[0] ||
                                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"
                                }
                                alt={selectedRoom.roomType}
                                className="w-24 h-20 rounded-xl object-cover shrink-0"
                            />

                            <div className="min-w-0">

                                <h3 className="font-bold text-[#1B2537] truncate">
                                    {hotel.hotelName}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedRoom.roomType}
                                </p>

                                <p className="font-bold text-[#A2782E] mt-1">

                                    ₹{Number(
                                        selectedRoom.pricePerNight
                                    ).toLocaleString("en-IN")}

                                    <span className="text-xs text-gray-500 font-normal">
                                        {" "}/ night
                                    </span>

                                </p>

                            </div>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleBookingSubmit}
                            className="p-6 space-y-5"
                        >

                            {/* DATES */}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* CHECK IN */}

                                <div>

                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Check-In
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        min={getTodayDate()}
                                        value={bookingForm.checkIn}
                                        onChange={(e) =>
                                            setBookingForm((prev) => ({
                                                ...prev,
                                                checkIn: e.target.value,
                                                checkOut: "",
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#A2782E] focus:ring-2 focus:ring-[#A2782E]/10"
                                    />

                                </div>

                                {/* CHECK OUT */}

                                <div>

                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Check-Out
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        disabled={!bookingForm.checkIn}
                                        min={
                                            bookingForm.checkIn
                                                ? getNextDate(bookingForm.checkIn)
                                                : getTodayDate()
                                        }
                                        value={bookingForm.checkOut}
                                        onChange={(e) =>
                                            setBookingForm((prev) => ({
                                                ...prev,
                                                checkOut: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#A2782E] focus:ring-2 focus:ring-[#A2782E]/10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />

                                </div>

                            </div>

                            {/* GUESTS */}

                            <div>

                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Total Guests
                                </label>

                                <select
                                    required
                                    value={bookingForm.totalGuests}
                                    onChange={(e) =>
                                        setBookingForm((prev) => ({
                                            ...prev,
                                            totalGuests: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#A2782E] bg-white"
                                >

                                    {Array.from(
                                        {
                                            length:
                                                Number(
                                                    selectedRoom.maxOccupancy
                                                ) || 1,
                                        },
                                        (_, index) => {

                                            const guestCount = index + 1;

                                            return (
                                                <option
                                                    key={guestCount}
                                                    value={guestCount}
                                                >
                                                    {guestCount} Guest
                                                    {guestCount > 1 ? "s" : ""}
                                                </option>
                                            );
                                        }
                                    )}

                                </select>

                                <p className="text-xs text-gray-400 mt-2">
                                    Maximum {selectedRoom.maxOccupancy} guests allowed
                                    in this room.
                                </p>

                            </div>

                            {/* SPECIAL REQUEST */}

                            <div>

                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Special Request
                                </label>

                                <textarea
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Any special request? (Optional)"
                                    value={bookingForm.specialRequest}
                                    onChange={(e) =>
                                        setBookingForm((prev) => ({
                                            ...prev,
                                            specialRequest: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#A2782E] focus:ring-2 focus:ring-[#A2782E]/10 resize-none"
                                />

                                <div className="text-right text-[11px] text-gray-400 mt-1">
                                    {bookingForm.specialRequest.length}/500
                                </div>

                            </div>

                            {/* PRICE SUMMARY */}

                            <div className="bg-[#F7F6F0] rounded-2xl p-5 space-y-3">

                                <h3 className="font-bold text-[#1B2537] mb-4">
                                    Price Summary
                                </h3>

                                <div className="flex justify-between text-sm">

                                    <span className="text-gray-500">
                                        Price per night
                                    </span>

                                    <span className="font-semibold">
                                        ₹{Number(
                                            selectedRoom.pricePerNight
                                        ).toLocaleString("en-IN")}
                                    </span>

                                </div>

                                <div className="flex justify-between text-sm">

                                    <span className="text-gray-500">
                                        Total nights
                                    </span>

                                    <span className="font-semibold">
                                        {totalNights}
                                    </span>

                                </div>

                                {totalNights > 0 && (

                                    <div className="flex justify-between text-sm">

                                        <span className="text-gray-500">
                                            ₹{Number(
                                                selectedRoom.pricePerNight
                                            ).toLocaleString("en-IN")} ×{" "}
                                            {totalNights} night
                                            {totalNights !== 1 ? "s" : ""}
                                        </span>

                                        <span className="font-semibold">
                                            ₹{Number(totalAmount).toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>

                                    </div>

                                )}

                                <div className="border-t border-gray-300 pt-4 flex justify-between items-center">

                                    <div>

                                        <span className="font-bold text-[#1B2537] block">
                                            Total Amount
                                        </span>

                                        {totalNights === 0 && (
                                            <span className="text-[11px] text-gray-400">
                                                Select dates to calculate total
                                            </span>
                                        )}

                                    </div>

                                    <span className="text-2xl font-bold text-[#A2782E]">
                                        ₹{Number(totalAmount).toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>

                                </div>

                            </div>

                            {/* SUBMIT */}

                            <button
                                type="submit"
                                disabled={
                                    bookingLoading ||
                                    totalNights <= 0
                                }
                                className="w-full bg-[#1B2537] hover:bg-[#26314A] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition"
                            >

                                {bookingLoading
                                    ? "Creating Booking..."
                                    : totalAmount > 0
                                        ? `Confirm Reservation • ₹${Number(
                                            totalAmount
                                        ).toLocaleString("en-IN")}`
                                        : "Select Dates to Continue"}

                            </button>

                            <p className="text-center text-xs text-gray-400 leading-relaxed">
                                Room availability and the final amount will be
                                verified securely by the server before the booking
                                is created.
                            </p>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default HotelDetails;