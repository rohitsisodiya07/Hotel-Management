const mongoose = require("mongoose");
const Booking = require("../Model/bookingModel");
const Hotel = require("../Model/hotelModel");
const Room = require("../Model/roomsModel");
const City = require("../Model/cityModel");
const District = require("../Model/districtModel");
const State = require("../Model/stateModel");
const Review = require("../Model/reviewModel");
const SignupUser = require("../Model/signupModel");
const dayjs = require("dayjs");
const XLSX = require("xlsx");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

/* ===========================================================
   COMMON HELPERS
=========================================================== */
const SUCCESS_BOOKINGS = [
    "Confirmed",
    "Checked In",
    "Completed"
];

const getBookingAmount = (booking) => {
    return Number(
        booking.finalAmount ||
        booking.totalAmount ||
        booking.amount ||
        0
    );
};

/* ===========================================================
   GET ACCESSIBLE HOTEL IDS
=========================================================== */
const getAccessibleHotelIds = async (user) => {
    if (!user) return [];

    // SUPER ADMIN
    if (user.role === "superAdmin") {
        const hotels = await Hotel.find({}, "_id");
        return hotels.map(h => h._id);
    }

    // HOTEL LOGIN
    if (user.role === "hotel") {
        const hotel = await Hotel.findOne({
            $or: [{ hotelEmail: user.email }, { email: user.email }]
        });
        return hotel ? [hotel._id] : [];
    }

    // ADMIN LOGIN
    if (user.role === "admin") {
        const hotels = await Hotel.find({
            $or: [{ adminId: user._id }, { admin: user._id }]
        }).select("_id");
        return hotels.map(h => h._id);
    }

    return [];
};

/* ===========================================================
   DROPDOWN OPTIONS
=========================================================== */
exports.getDropdownOptions = async (req, res) => {
    try {
        const [
            admins,
            cities,
            states,
            hotels
        ] = await Promise.all([
            SignupUser.find({ role: "admin" }).select("name email"),
            City.find().select("cityName"),
            State.find().select("stateName"),
            Hotel.find({ status: "Approved" }).select("hotelName")
        ]);

        return res.status(200).json({
            success: true,
            admins,
            cities,
            states,
            hotels
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAccessibleHotelIds = getAccessibleHotelIds;


/* ===========================================================
   SUPER ADMIN DASHBOARD ANALYTICS (With Server-Side Search, Sort & Pagination)
=========================================================== */
exports.getSuperAdminDashboardAnalytics = async (req, res) => {
    try {
        const { filter = "all", id = "all", status = "all", search = "", sortBy = "newest", page = 1, limit = 10 } = req.query;

        let hotelQuery = {};

        if (status && status !== "all") {
            hotelQuery.status = status;
        }

        if (filter === "admin" && id && id !== "all") {
            hotelQuery.adminId = id;
        } else if (filter === "city" && id && id !== "all") {
            hotelQuery.city = id;
        } else if (filter === "state" && id && id !== "all") {
            const citiesInState = await City.find().populate({
                path: 'districtId',
                match: { stateId: id }
            });
            const validCityIds = citiesInState.filter(c => c.districtId != null).map(c => c._id);
            hotelQuery.city = { $in: validCityIds };
        } else if (filter === "hotel" && id && id !== "all") {
            hotelQuery._id = id;
        }

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            hotelQuery.$or = [
                { hotelName: searchRegex },
                { hotelEmail: searchRegex },
                { trackingId: searchRegex }
            ];
        }

        const totalHotelsCount = await Hotel.countDocuments(hotelQuery);
        const totalAdminsCount = await SignupUser.countDocuments({ role: "admin" });
        const pendingHotelsCount = await Hotel.countDocuments({ status: "Pending" });
        const approvedHotelsCount = await Hotel.countDocuments({ status: "Approved" });
        const rejectedHotelsCount = await Hotel.countDocuments({ status: "Rejected" });

        const totalCitiesCount = await City.countDocuments();
        const totalStatesCount = await State.countDocuments();
        const totalDistrictsCount = await District.countDocuments();

        const allMatchedHotels = await Hotel.find(hotelQuery)
            .populate({
                path: 'city',
                select: 'cityName districtId',
                populate: {
                    path: 'districtId',
                    select: 'districtName stateId',
                    populate: { path: 'stateId', select: 'stateName' }
                }
            })
            .populate('adminId', 'name email');

        let totalRoomsCalc = 0;
        let totalRevenueCalc = 0;
        let maxRoomsVal = 0;
        let largestHotelName = "N/A";

        const enhancedHotels = await Promise.all(
            allMatchedHotels.map(async (h) => {
                const rooms = await Room.find({ hotelId: h._id });
                const roomCount = rooms.length > 0 ? rooms.length : Number(h.totalRooms || 0);

                const bookings = await Booking.find({ hotelId: h._id, bookingStatus: { $ne: "Cancelled" } });
                const rev = bookings.reduce((acc, b) => acc + Number(b.finalAmount || b.totalAmount || b.amount || 0), 0);

                totalRoomsCalc += roomCount;
                totalRevenueCalc += rev;

                if (roomCount > maxRoomsVal) {
                    maxRoomsVal = roomCount;
                    largestHotelName = h.hotelName || "N/A";
                }

                const stateObj = h.city?.districtId?.stateId;
                const stateId = stateObj?._id?.toString() || "other";
                const stateName = stateObj?.stateName || "Unassigned";

                return {
                    ...h.toObject(),
                    totalRooms: roomCount,
                    totalRevenue: rev,
                    stateId,
                    stateName,
                    cityInfo: h.city,
                    adminInfo: h.adminId
                };
            })
        );

        // Sorting Logic
        if (sortBy === "newest") {
            enhancedHotels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === "oldest") {
            enhancedHotels.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === "name") {
            enhancedHotels.sort((a, b) => (a.hotelName || "").localeCompare(b.hotelName || ""));
        } else if (sortBy === "rooms") {
            enhancedHotels.sort((a, b) => b.totalRooms - a.totalRooms);
        } else if (sortBy === "revenue") {
            enhancedHotels.sort((a, b) => b.totalRevenue - a.totalRevenue);
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedHotels = enhancedHotels.slice(startIndex, startIndex + limitNum);

        // Chart 1: Admin Revenue Performance
        const adminMap = {};
        enhancedHotels.forEach(h => {
            const adminName = h.adminInfo?.name || "Unassigned";
            const adminId = h.adminInfo?._id || "unassigned";
            if (!adminMap[adminId]) {
                adminMap[adminId] = { id: adminId, admin: adminName, hotels: 0, rooms: 0, revenue: 0 };
            }
            adminMap[adminId].hotels += 1;
            adminMap[adminId].rooms += h.totalRooms;
            adminMap[adminId].revenue += h.totalRevenue;
        });
        const hotelsByAdmin = Object.values(adminMap);

        // Chart 2: Hotel Status
        const hotelStatus = [
            { name: "Approved", value: approvedHotelsCount },
            { name: "Pending", value: pendingHotelsCount },
            { name: "Rejected", value: rejectedHotelsCount }
        ];

        // Chart 3: Hotels by State (with ID mapped)
        const stateMap = {};
        enhancedHotels.forEach(h => {
            const stateId = h.stateId;
            const stateName = h.stateName;
            if (!stateMap[stateId]) {
                stateMap[stateId] = { id: stateId, state: stateName, count: 0 };
            }
            stateMap[stateId].count += 1;
        });
        const hotelsByState = Object.values(stateMap);

        // Chart 4: Hotels by City
        const cityMap = {};
        enhancedHotels.forEach(h => {
            const cityName = h.cityInfo?.cityName || "Unassigned";
            const cityId = h.cityInfo?._id || "other";
            if (!cityMap[cityId]) {
                cityMap[cityId] = { id: cityId, city: cityName, hotels: 0, rooms: 0, revenue: 0 };
            }
            cityMap[cityId].hotels += 1;
            cityMap[cityId].rooms += h.totalRooms;
            cityMap[cityId].revenue += h.totalRevenue;
        });
        const hotelsByCity = Object.values(cityMap);

        // Chart 5: New Hotels Added Per Month
        const monthMap = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        monthNames.forEach(m => monthMap[m] = 0);
        enhancedHotels.forEach(h => {
            if (h.createdAt) {
                const mIndex = new Date(h.createdAt).getMonth();
                const mName = monthNames[mIndex];
                if (mName) monthMap[mName] += 1;
            }
        });
        const newHotelsPerMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

        // Chart 6: Top 5 Admins (Hotels Managed)
        const topAdminsManaged = [...(hotelsByAdmin || [])]
            .sort((a, b) => b.hotels - a.hotels)
            .slice(0, 5)
            .map(a => ({ admin: a.admin, hotelsCount: a.hotels }));

        // Executive Summary calculations
        let bestAdminName = "N/A";
        let maxAdminRev = -1;
        hotelsByAdmin.forEach(a => {
            if (a.revenue > maxAdminRev) {
                maxAdminRev = a.revenue;
                bestAdminName = a.admin;
            }
        });

        let topCityName = "N/A";
        let maxCityCount = -1;
        hotelsByCity.forEach(c => {
            if (c.hotels > maxCityCount) {
                maxCityCount = c.hotels;
                topCityName = c.city;
            }
        });

        const stateRevMap = {};
        enhancedHotels.forEach(h => {
            const st = h.stateName;
            stateRevMap[st] = (stateRevMap[st] || 0) + h.totalRevenue;
        });
        let highestRevState = "N/A";
        let maxStRev = -1;
        Object.entries(stateRevMap).forEach(([st, rev]) => {
            if (rev > maxStRev) {
                maxStRev = rev;
                highestRevState = st;
            }
        });

        // Platform Health calculations
        const totalEvaluated = approvedHotelsCount + pendingHotelsCount + rejectedHotelsCount;
        const approvalRate = totalEvaluated > 0 ? Math.round((approvedHotelsCount / totalEvaluated) * 100) : 0;
        const avgHotelsPerAdmin = totalAdminsCount > 0 ? (totalHotelsCount / totalAdminsCount).toFixed(1) : 0;

        return res.status(200).json({
            success: true,
            cards: {
                totalHotels: totalHotelsCount || 0,
                totalAdmins: totalAdminsCount || 0,
                totalRooms: totalRoomsCalc || 0,
                totalRevenue: totalRevenueCalc || 0,
                totalCities: totalCitiesCount || 0,
                totalStates: totalStatesCount || 0,
                totalDistricts: totalDistrictsCount || 0,
                pendingHotels: pendingHotelsCount || 0
            },
            executiveSummary: {
                bestAdmin: bestAdminName || "N/A",
                topCity: topCityName || "N/A",
                largestHotel: largestHotelName || "N/A",
                maxRooms: maxRoomsVal || 0,
                highestRevenueState: highestRevState || "N/A"
            },
            charts: {
                hotelsByAdmin: hotelsByAdmin || [],
                hotelsByCity: hotelsByCity || [],
                hotelsByState: hotelsByState || [],
                hotelStatus: hotelStatus || [],
                newHotelsPerMonth: newHotelsPerMonth || [],
                topAdminsManaged: topAdminsManaged || []
            },
            platformHealth: {
                approvedHotels: approvedHotelsCount || 0,
                pending: pendingHotelsCount || 0,
                rejected: rejectedHotelsCount || 0,
                approvalRate: approvalRate || 0,
                totalAdmins: totalAdminsCount || 0,
                avgHotelsPerAdmin: avgHotelsPerAdmin || 0
            },
            hotels: paginatedHotels || [],
            total: enhancedHotels.length || 0,
            page: pageNum,
            totalPages: Math.ceil(enhancedHotels.length / limitNum) || 1
        });

    } catch (error) {
        console.error("Super Admin Dashboard Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.exportSuperAdminDashboard = async (req, res) => {
    try {
        const {
            filter = "all",
            id = "all",
            status = "all",
            search = "",
            sortBy = "newest",
        } = req.query;

        // -----------------------------
        // Same hotel filter as dashboard
        // -----------------------------

        let hotelQuery = {};

        if (status && status !== "all") {
            hotelQuery.status = status;
        }

        // Admin filter
        if (filter === "admin" && id && id !== "all") {

            hotelQuery.adminId = id;

        }

        // City filter
        else if (filter === "city" && id && id !== "all") {

            hotelQuery.city = id;

        }

        // State filter
        else if (filter === "state" && id && id !== "all") {

            const citiesInState = await City.find().populate({
                path: "districtId",
                match: { stateId: id },
            });

            const validCityIds = citiesInState
                .filter((c) => c.districtId != null)
                .map((c) => c._id);

            hotelQuery.city = {
                $in: validCityIds,
            };
        }

        // Hotel filter
        else if (filter === "hotel" && id && id !== "all") {

            hotelQuery._id = id;
        }

        // Search
        if (search && search.trim() !== "") {

            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            hotelQuery.$or = [
                { hotelName: searchRegex },
                { hotelEmail: searchRegex },
                { trackingId: searchRegex },
            ];
        }

        // -----------------------------
        // Get hotels
        // -----------------------------

        const hotels = await Hotel.find(hotelQuery)
            .populate({
                path: "city",
                select: "cityName districtId",
                populate: {
                    path: "districtId",
                    select: "districtName stateId",
                    populate: {
                        path: "stateId",
                        select: "stateName",
                    },
                },
            })
            .populate("adminId", "name email");

        // -----------------------------
        // Prepare Excel data
        // -----------------------------

        const exportData = [];

        for (let i = 0; i < hotels.length; i++) {

            const hotel = hotels[i];

            // Rooms
            const rooms = await Room.find({
                hotelId: hotel._id,
            });

            const roomCount =
                rooms.length > 0
                    ? rooms.length
                    : Number(hotel.totalRooms || 0);

            // Bookings / Revenue
            const bookings = await Booking.find({
                hotelId: hotel._id,
                bookingStatus: {
                    $ne: "Cancelled",
                },
            });

            const revenue = bookings.reduce(
                (total, booking) => {
                    return (
                        total +
                        Number(
                            booking.finalAmount ||
                            booking.totalAmount ||
                            booking.amount ||
                            0
                        )
                    );
                },
                0
            );

            const cityName =
                hotel.city?.cityName || "Unassigned";

            const districtName =
                hotel.city?.districtId?.districtName ||
                "Unassigned";

            const stateName =
                hotel.city?.districtId?.stateId?.stateName ||
                "Unassigned";

            const adminName =
                hotel.adminId?.name || "Unassigned";

            exportData.push({
                "S.No": i + 1,
                "Hotel Name": hotel.hotelName || "",
                "Admin Name": adminName,
                "City": cityName,
                "District": districtName,
                "State": stateName,
                "Total Rooms": roomCount,
                "Revenue": revenue,
                "Status": hotel.status || "",
                "Created Date": hotel.createdAt
                    ? new Date(
                        hotel.createdAt
                    ).toLocaleDateString("en-IN")
                    : "",
            });
        }

        // -----------------------------
        // Sorting
        // -----------------------------

        if (sortBy === "newest") {

            exportData.sort(
                (a, b) =>
                    new Date(b["Created Date"]) -
                    new Date(a["Created Date"])
            );

        } else if (sortBy === "oldest") {

            exportData.sort(
                (a, b) =>
                    new Date(a["Created Date"]) -
                    new Date(b["Created Date"])
            );

        } else if (sortBy === "name") {

            exportData.sort((a, b) =>
                a["Hotel Name"].localeCompare(
                    b["Hotel Name"]
                )
            );

        } else if (sortBy === "rooms") {

            exportData.sort(
                (a, b) =>
                    b["Total Rooms"] -
                    a["Total Rooms"]
            );

        } else if (sortBy === "revenue") {

            exportData.sort(
                (a, b) =>
                    b["Revenue"] -
                    a["Revenue"]
            );
        }

        // Re-number after sorting
        exportData.forEach((item, index) => {
            item["S.No"] = index + 1;
        });

        // -----------------------------
        // Create Excel
        // -----------------------------

        const worksheet =
            XLSX.utils.json_to_sheet(exportData);

        // Column widths
        worksheet["!cols"] = [
            { wch: 8 },   // S.No
            { wch: 25 },  // Hotel
            { wch: 20 },  // Admin
            { wch: 18 },  // City
            { wch: 18 },  // District
            { wch: 18 },  // State
            { wch: 15 },  // Rooms
            { wch: 18 },  // Revenue
            { wch: 15 },  // Status
            { wch: 18 },  // Created
        ];

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Hotels"
        );

        // -----------------------------
        // Send Excel file
        // -----------------------------

        const excelBuffer =
            XLSX.write(workbook, {
                type: "buffer",
                bookType: "xlsx",
            });

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="hotel_dashboard.xlsx"'
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(excelBuffer);

    } catch (error) {

        console.error(
            "Dashboard Export Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// 1. GET DASHBOARD SUMMARY (Regular Dashboard)
// ==========================================
exports.getDashboardSummary = async (req, res) => {
    try {
        const baseHotelIds = await getAccessibleHotelIds(req.user);

        if (baseHotelIds.length === 0 && req.user?.role !== "superAdmin") {
            return res.status(200).json({
                success: true,
                summary: { totalRooms: 0, availableRooms: 0, occupiedRooms: 0, todayBookings: 0, todayRevenue: 0, todayCheckIns: 0, todayCheckOuts: 0 },
                monthlyRevenue: [],
                bookingTrend: [],
                roomStatus: [],
                recentBookings: [],
                ratingSummary: { averageRating: 0, totalReviews: 0, categories: {} },
                recentReviews: [],
                notifications: []
            });
        }

        const range = req.query.range || "today";
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === "7days") startDate.setDate(startDate.getDate() - 6);
        else if (range === "30days") startDate.setDate(startDate.getDate() - 29);
        else if (range === "year") startDate = new Date(`${new Date().getFullYear()}-01-01`);
        else if (range === "all") startDate = new Date(0);

        // 🚀 FIX: Extract ONLY "Approved" Hotels for calculation
        const approvedHotelFilter = req.user?.role === "superAdmin"
            ? { status: "Approved" }
            : { _id: { $in: baseHotelIds }, status: "Approved" };

        const approvedHotels = await Hotel.find(approvedHotelFilter).select("_id");
        const approvedHotelIds = approvedHotels.map(h => h._id);

        // Use this strict filter for ALL metrics
        const bookingHotelQuery = { hotelId: { $in: approvedHotelIds } };
        const hotelQuery = { hotelId: { $in: approvedHotelIds } }; // Because Room collection uses hotelId
        const reviewQuery = { hotelId: { $in: approvedHotelIds } };

        const totalRooms = await Room.countDocuments(hotelQuery);

        const occupiedRoomsCount = await Room.countDocuments({
            ...hotelQuery,
            $or: [{ bookingStatus: "Booked" }, { status: "Booked" }, { isBooked: true }]
        });

        const availableRoomsCount = Math.max(0, totalRooms - occupiedRoomsCount);

        const bookingsInRange = await Booking.find({
            ...bookingHotelQuery,
            createdAt: { $gte: startDate, $lte: endDate },
            bookingStatus: { $ne: "Cancelled" }
        });

        const todayBookings = bookingsInRange.length;

        const revenueBookings = await Booking.find({
            ...bookingHotelQuery,
            createdAt: { $gte: startDate, $lte: endDate },
            $or: [
                { bookingStatus: { $in: SUCCESS_BOOKINGS } },
                { status: { $in: SUCCESS_BOOKINGS } }
            ]
        });

        const todayRevenue = revenueBookings.reduce((sum, b) => sum + getBookingAmount(b), 0);

        const todayCheckIns = await Booking.countDocuments({
            ...bookingHotelQuery,
            checkIn: { $gte: startDate, $lte: endDate },
            $or: [
                { bookingStatus: { $in: ["Confirmed", "Checked In", "Completed", "checkedIn", "completed"] } },
                { status: { $in: ["Confirmed", "Checked In", "Completed", "checkedIn", "completed"] } }
            ]
        });

        const todayCheckOuts = await Booking.countDocuments({
            ...bookingHotelQuery,
            checkOut: { $gte: startDate, $lte: endDate },
            $or: [
                { bookingStatus: { $in: ["Checked In", "Completed", "checkedIn", "completed"] } },
                { status: { $in: ["Checked In", "Completed", "checkedIn", "completed"] } }
            ]
        });

        const recentBookings = await Booking.find(bookingHotelQuery)
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('userId', 'name email')
            .populate('roomId', 'roomType roomNumber');

        const recentReviews = await Review.find(reviewQuery)
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('userId', 'name');

        const reviewStats = await Review.aggregate([
            { $match: reviewQuery },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    avgCleanliness: { $avg: "$cleanliness" },
                    avgStaff: { $avg: "$staff" },
                    avgLocation: { $avg: "$location" },
                    avgValueForMoney: { $avg: "$valueForMoney" }
                }
            }
        ]);

        let ratingSummary = { averageRating: 0, totalReviews: 0, categories: { cleanliness: 0, staff: 0, location: 0, valueForMoney: 0 } };

        if (reviewStats.length > 0) {
            const stats = reviewStats[0];
            const avgClean = stats.avgCleanliness || 0;
            const avgStaff = stats.avgStaff || 0;
            const avgLoc = stats.avgLocation || 0;
            const avgVal = stats.avgValueForMoney || 0;
            const avgOverall = (avgClean + avgStaff + avgLoc + avgVal) / 4;

            ratingSummary = {
                averageRating: Math.round(avgOverall * 10) / 10,
                totalReviews: stats.totalReviews,
                categories: {
                    cleanliness: Math.round(avgClean * 10) / 10,
                    staff: Math.round(avgStaff * 10) / 10,
                    location: Math.round(avgLoc * 10) / 10,
                    valueForMoney: Math.round(avgVal * 10) / 10
                }
            };
        }

        const revenueAggregation = await Booking.aggregate([
            { $match: bookingHotelQuery },
            {
                $match: {
                    $or: [
                        { bookingStatus: { $in: SUCCESS_BOOKINGS } },
                        { status: { $in: SUCCESS_BOOKINGS } }
                    ]
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: {
                        $sum: { $ifNull: ["$finalAmount", { $ifNull: ["$totalAmount", "$amount"] }] }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = monthNames.map((name, index) => {
            const found = revenueAggregation.find(item => item._id === index + 1);
            return { name, revenue: found ? found.revenue : 0 };
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const bookingTrendAggregation = await Booking.aggregate([
            { $match: bookingHotelQuery },
            {
                $match: {
                    bookingStatus: { $ne: "Cancelled" },
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const bookingTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const found = bookingTrendAggregation.find(item => item._id === dateStr);
            bookingTrend.push({ day: dayName, bookings: found ? found.bookings : 0 });
        }

        const recentBookingsForNotif = await Booking.find(bookingHotelQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name');

        const dynamicNotifications = recentBookingsForNotif.map((b, index) => ({
            id: b._id,
            title: b.bookingStatus === "Pending" ? "New Reservation Request" : `Booking ${b.bookingStatus || 'Confirmed'}`,
            desc: `${b.userId?.name || "Guest"} booked room`,
            time: dayjs(b.createdAt).fromNow(),
            unread: index < 2,
            type: "booking"
        }));

        return res.status(200).json({
            success: true,
            summary: { totalRooms, availableRooms: availableRoomsCount, occupiedRooms: occupiedRoomsCount, todayBookings, todayRevenue, todayCheckIns, todayCheckOuts },
            monthlyRevenue,
            bookingTrend,
            roomStatus: [{ name: "Available", value: availableRoomsCount }, { name: "Occupied", value: occupiedRoomsCount }],
            recentBookings,
            ratingSummary,
            recentReviews,
            notifications: dynamicNotifications
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch dashboard summary.", error: error.message });
    }
};

exports.exportDashboardSummary = async (req, res) => {
    try {
        const baseHotelIds = await getAccessibleHotelIds(req.user);

        if (baseHotelIds.length === 0 && req.user?.role !== "superAdmin") {
            return res.status(400).json({ success: false, message: "No accessible hotels found." });
        }

        const range = req.query.range || "today";
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === "7days") startDate.setDate(startDate.getDate() - 6);
        else if (range === "30days") startDate.setDate(startDate.getDate() - 29);
        else if (range === "year") startDate = new Date(`${new Date().getFullYear()}-01-01`);
        else if (range === "all") startDate = new Date(0);

        const approvedHotelFilter = req.user?.role === "superAdmin"
            ? { status: "Approved" }
            : { _id: { $in: baseHotelIds }, status: "Approved" };

        const approvedHotels = await Hotel.find(approvedHotelFilter).select("_id");
        const approvedHotelIds = approvedHotels.map(h => h._id);

        const bookingHotelQuery = { hotelId: { $in: approvedHotelIds } };

        // Sirf unn bookings ko laao jo cancelled nahi hain us specific time range mein
        const bookingsInRange = await Booking.find({
            ...bookingHotelQuery,
            createdAt: { $gte: startDate, $lte: endDate },
            bookingStatus: { $ne: "Cancelled" }
        })
            .populate('userId', 'name email')
            .populate('roomId', 'roomType roomNumber')
            .populate('hotelId', 'hotelName')
            .sort({ createdAt: -1 });

        const excelData = bookingsInRange.map((b, index) => ({
            "S.No": index + 1,
            "Booking ID": b.bookingId || b._id.toString(),
            "Guest Name": b.userId?.name || "Guest",
            "Guest Email": b.userId?.email || "N/A",
            "Hotel Name": b.hotelId?.hotelName || "N/A",
            "Room Type": b.roomId?.roomType || "N/A",
            "Room Number": b.roomId?.roomNumber || "N/A",
            "Check-In Date": dayjs(b.checkIn).format("DD-MM-YYYY"),
            "Check-Out Date": dayjs(b.checkOut).format("DD-MM-YYYY"),
            "Amount (₹)": b.finalAmount || b.totalAmount || b.amount || 0,
            "Status": b.bookingStatus || "N/A",
            "Booking Date": dayjs(b.createdAt).format("DD-MM-YYYY")
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Define Column Widths
        worksheet["!cols"] = [
            { wch: 8 }, { wch: 25 }, { wch: 20 }, { wch: 25 },
            { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Bookings");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", `attachment; filename=dashboard-report-${Date.now()}.xlsx`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return res.send(buffer);

    } catch (error) {
        console.error("Dashboard Export Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};



// ==========================================
// 2. GET PLATFORM ANALYTICS (Admin Dashboard)
// ==========================================
exports.getPlatformAnalytics = async (req, res) => {
    try {
        const { range = "all", hotelId, search = "", status = "All", city = "", sortBy = "city", page = 1, limit = 10 } = req.query;

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === "7days") startDate.setDate(startDate.getDate() - 6);
        else if (range === "30days") startDate.setDate(startDate.getDate() - 29);
        else if (range === "year") startDate = new Date(`${new Date().getFullYear()}-01-01`);
        else if (range === "all") startDate = new Date(0);

        let bookingMatch = {
            bookingStatus: { $ne: "Cancelled" },
            createdAt: { $gte: startDate, $lte: endDate }
        };

        let revenueMatch = {
            $or: [
                { bookingStatus: { $in: SUCCESS_BOOKINGS } },
                { status: { $in: SUCCESS_BOOKINGS } }
            ],
            createdAt: { $gte: startDate, $lte: endDate }
        };

        let hotelMatch = {};

        if (req.user && req.user.role === "admin") {
            const adminHotels = await Hotel.find({ adminId: req.user._id }, "_id");
            const hotelIds = adminHotels.map(h => h._id);

            if (hotelId && hotelId !== "all" && mongoose.Types.ObjectId.isValid(hotelId)) {
                const objectIdHotelId = new mongoose.Types.ObjectId(hotelId);
                const isOwned = hotelIds.some(hId => hId.toString() === objectIdHotelId.toString());

                if (isOwned) {
                    hotelMatch._id = objectIdHotelId;
                } else {
                    hotelMatch._id = { $in: hotelIds };
                }
            } else {
                hotelMatch._id = { $in: hotelIds };
            }
        } else {
            if (hotelId && hotelId !== "all" && mongoose.Types.ObjectId.isValid(hotelId)) {
                hotelMatch._id = new mongoose.Types.ObjectId(hotelId);
            }
        }

        const totalHotels = (hotelId && hotelId !== "all" && req.user?.role !== "admin") ? 1 : await Hotel.countDocuments(hotelMatch);
        const approvedHotels = await Hotel.countDocuments({ ...hotelMatch, status: "Approved" });
        const pendingHotels = await Hotel.countDocuments({ ...hotelMatch, status: "Pending" });
        const rejectedHotels = await Hotel.countDocuments({ ...hotelMatch, status: "Rejected" });

        const hotelStatusBreakdown = [
            { name: "Approved", value: approvedHotels },
            { name: "Pending", value: pendingHotels },
            { name: "Rejected", value: rejectedHotels }
        ];

        // 🚀 FIX: Get ONLY Approved Hotels for Revenue & Booking Queries
        const approvedHotelsList = await Hotel.find({ ...hotelMatch, status: "Approved" }).select("_id");
        const approvedHotelIds = approvedHotelsList.map(h => h._id);

        const globalBookingMatch = { ...bookingMatch, hotelId: { $in: approvedHotelIds } };
        const globalRevenueMatch = { ...revenueMatch, hotelId: { $in: approvedHotelIds } };

        let totalRooms = 0;
        let bookedRoomsCount = 0;

        if (hotelId && hotelId !== "all" && mongoose.Types.ObjectId.isValid(hotelId) && req.user?.role !== "admin") {
            const hotelObjId = new mongoose.Types.ObjectId(hotelId);
            const hotelDoc = await Hotel.findById(hotelObjId);
            const roomDocs = await Room.find({ hotelId: hotelObjId });

            totalRooms = roomDocs.length > 0 ? roomDocs.length : Number(hotelDoc?.totalRooms || 0);
            bookedRoomsCount = roomDocs.filter(r => r.bookingStatus === "Booked" || r.status === "Booked" || r.isBooked).length;
        } else {
            const totalRoomsResult = await Hotel.aggregate([
                { $match: hotelMatch },
                { $group: { _id: null, totalRooms: { $sum: "$totalRooms" } } }
            ]);
            totalRooms = totalRoomsResult[0]?.totalRooms || 0;

            const scopeHotelIds = (await Hotel.find(hotelMatch, "_id")).map(h => h._id);
            bookedRoomsCount = await Room.countDocuments({
                hotelId: { $in: scopeHotelIds },
                $or: [{ bookingStatus: "Booked" }, { status: "Booked" }, { isBooked: true }]
            });
        }

        const occupancyRate = totalRooms > 0 ? Math.round((bookedRoomsCount / totalRooms) * 100) : 0;

        // Use global matches for valid metrics
        const totalBookings = await Booking.countDocuments(globalBookingMatch);
        const totalCustomers = await Booking.distinct("userId", globalBookingMatch).then(users => users.filter(Boolean).length);

        const revenueResult = await Booking.aggregate([
            { $match: globalRevenueMatch },
            { $group: { _id: null, totalRevenue: { $sum: { $ifNull: ["$finalAmount", { $ifNull: ["$totalAmount", "$amount"] }] } } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueAggregation = await Booking.aggregate([
            { $match: globalRevenueMatch },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: { $ifNull: ["$finalAmount", { $ifNull: ["$totalAmount", "$amount"] }] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthlyRevenue = monthNames.map((name, index) => {
            const found = revenueAggregation.find(item => item._id === index + 1);
            return { name, revenue: found ? found.revenue : 0 };
        });

        const hotelsAddedAggregation = await Hotel.aggregate([
            { $match: hotelMatch },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);

        const hotelsAddedTrend = monthNames.map((name, index) => {
            const found = hotelsAddedAggregation.find(item => item._id === index + 1);
            return { name, count: found ? found.count : 0 };
        });

        const hotelsList = await Hotel.find(hotelMatch).populate('city', 'cityName');
        const cityCounts = {};
        hotelsList.forEach(h => {
            const cName = h.city?.cityName || "Unassigned";
            cityCounts[cName] = (cityCounts[cName] || 0) + 1;
        });
        const hotelsByCity = Object.entries(cityCounts).map(([city, count]) => ({ city, count }));

        const topHotelsAgg = await Booking.aggregate([
            { $match: globalRevenueMatch },
            {
                $group: {
                    _id: "$hotelId",
                    revenue: { $sum: { $ifNull: ["$finalAmount", { $ifNull: ["$totalAmount", "$amount"] }] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            { $lookup: { from: "hotels", localField: "_id", foreignField: "_id", as: "hotelInfo" } },
            { $unwind: { path: "$hotelInfo", preserveNullAndEmptyArrays: true } }
        ]);

        const topPerformingHotels = topHotelsAgg.map(item => ({
            name: item.hotelInfo?.hotelName || "Hotel",
            revenue: item.revenue
        }));

        const occupancyComparison = await Promise.all(hotelsList.slice(0, 6).map(async (h) => {
            const hRooms = await Room.find({ hotelId: h._id });
            const hTotal = hRooms.length > 0 ? hRooms.length : Number(h.totalRooms || 1);
            const hBooked = hRooms.filter(r => r.bookingStatus === "Booked" || r.status === "Booked" || r.isBooked).length;
            const rate = hTotal > 0 ? Math.round((hBooked / hTotal) * 100) : 0;
            return { hotel: h.hotelName || "Hotel", occupancy: rate };
        }));

        let tableQuery = { ...hotelMatch };
        if (status && status !== "All") tableQuery.status = status;
        if (city && mongoose.Types.ObjectId.isValid(city)) tableQuery.city = new mongoose.Types.ObjectId(city);
        if (search.trim()) {
            const searchRegex = new RegExp(search, "i");
            tableQuery.$or = [{ hotelName: searchRegex }, { hotelEmail: searchRegex }, { trackingId: searchRegex }];
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const totalTableHotels = await Hotel.countDocuments(tableQuery);

        const paginatedHotels = await Hotel.find(tableQuery)
            .populate('city', 'cityName')
            .populate('adminId', 'name email')
            .skip(skip)
            .limit(limitNum);

        const hotelsWithDetails = await Promise.all(
            paginatedHotels.map(async (h) => {
                let hTotalRevenue = 0;
                let hBookingsCount = 0;

                // 🚀 FIX: Ignore Revenue & Booking count if Hotel is not Approved
                if (h.status === "Approved") {
                    const hRevenueRes = await Booking.aggregate([
                        {
                            $match: {
                                hotelId: h._id,
                                ...revenueMatch // Base revenue match, avoiding the global array
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $ifNull: ["$finalAmount", { $ifNull: ["$totalAmount", "$amount"] }] } }
                            }
                        }
                    ]);
                    hTotalRevenue = hRevenueRes[0]?.totalRevenue || 0;

                    hBookingsCount = await Booking.countDocuments({
                        hotelId: h._id,
                        ...bookingMatch
                    });
                }

                const hRooms = await Room.find({ hotelId: h._id });
                const hTotalRooms = hRooms.length > 0 ? hRooms.length : Number(h.totalRooms || 1);
                const hBookedRooms = hRooms.filter(r => r.bookingStatus === "Booked" || r.status === "Booked" || r.isBooked).length;
                const hOccupancy = hTotalRooms > 0 ? Math.round((hBookedRooms / hTotalRooms) * 100) : 0;

                return {
                    ...h.toObject(),
                    totalRevenue: hTotalRevenue,
                    totalBookings: hBookingsCount,
                    occupancyRate: hOccupancy
                };
            })
        );

        if (sortBy === "latest") hotelsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sortBy === "oldest") hotelsWithDetails.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (sortBy === "rooms") hotelsWithDetails.sort((a, b) => Number(b.totalRooms || 0) - Number(a.totalRooms || 0));
        else if (sortBy === "revenue") hotelsWithDetails.sort((a, b) => b.totalRevenue - a.totalRevenue);
        else if (sortBy === "bookings") hotelsWithDetails.sort((a, b) => b.totalBookings - a.totalBookings);
        else if (sortBy === "occupancy") hotelsWithDetails.sort((a, b) => b.occupancyRate - a.occupancyRate);
        else hotelsWithDetails.sort((a, b) => (a.city?.cityName || "").localeCompare(b.city?.cityName || ""));

        return res.status(200).json({
            success: true,
            analytics: {
                kpis: {
                    totalHotels, totalRooms, totalBookings, totalCustomers, totalRevenue, occupancyRate,
                    averageRating: 4.5, activeOwners: totalHotels, approvedHotels, pendingHotels
                },
                monthlyRevenue, hotelsAddedTrend, hotelStatusBreakdown, hotelsByCity,
                topPerformingHotels, occupancyComparison,
                tableData: { hotels: hotelsWithDetails, total: totalTableHotels, page: pageNum, totalPages: Math.ceil(totalTableHotels / limitNum) }
            }
        });

    } catch (error) {
        console.error("Platform Analytics Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.exportPlatformAnalytics = async (req, res) => {
    try {
        const {
            range = "all",
            hotelId = "all",
            status = "All",
            city = "",
            search = "",
            sortBy = "city",
        } = req.query;

        // 1. Date Range Constraints (For Revenue)
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === "7days") startDate.setDate(startDate.getDate() - 6);
        else if (range === "30days") startDate.setDate(startDate.getDate() - 29);
        else if (range === "year") startDate = new Date(`${new Date().getFullYear()}-01-01`);
        else if (range === "all") startDate = new Date(0);

        let revenueMatch = {
            $or: [
                { bookingStatus: { $in: SUCCESS_BOOKINGS } },
                { status: { $in: SUCCESS_BOOKINGS } }
            ],
            createdAt: { $gte: startDate, $lte: endDate }
        };

        // 2. Base Query & Admin Role Verification
        let hotelMatch = {};

        if (req.user && req.user.role === "admin") {
            const adminHotels = await Hotel.find({ adminId: req.user._id }, "_id");
            const hotelIds = adminHotels.map(h => h._id);

            if (hotelId && hotelId !== "all" && mongoose.Types.ObjectId.isValid(hotelId)) {
                const objectIdHotelId = new mongoose.Types.ObjectId(hotelId);
                const isOwned = hotelIds.some(hId => hId.toString() === objectIdHotelId.toString());

                if (isOwned) {
                    hotelMatch._id = objectIdHotelId;
                } else {
                    hotelMatch._id = { $in: hotelIds };
                }
            } else {
                hotelMatch._id = { $in: hotelIds };
            }
        }

        // Apply UI Filters
        if (status && status !== "All") hotelMatch.status = status;
        if (city && mongoose.Types.ObjectId.isValid(city)) hotelMatch.city = new mongoose.Types.ObjectId(city);
        if (search.trim()) {
            const searchRegex = new RegExp(search, "i");
            hotelMatch.$or = [
                { hotelName: searchRegex },
                { hotelEmail: searchRegex },
                { trackingId: searchRegex }
            ];
        }

        // 3. Fetch Hotels (NO PAGINATION for EXCEL) with deep populate
        const hotelsList = await Hotel.find(hotelMatch)
            .populate({
                path: "city",
                select: "cityName districtId",
                populate: {
                    path: "districtId",
                    select: "districtName stateId",
                    populate: {
                        path: "stateId",
                        select: "stateName",
                    },
                },
            });

        // 4. Calculate Revenue & Rooms for Excel
        const hotelsWithDetails = await Promise.all(
            hotelsList.map(async (h) => {
                let hTotalRevenue = 0;

                // Revenue only counts for Approved hotels
                if (h.status === "Approved") {
                    const hRevenueRes = await Booking.aggregate([
                        {
                            $match: {
                                hotelId: h._id,
                                ...revenueMatch
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $ifNull: ["$finalAmount", { $ifNull: ["$totalAmount", "$amount"] }] } }
                            }
                        }
                    ]);
                    hTotalRevenue = hRevenueRes[0]?.totalRevenue || 0;
                }

                const hRooms = await Room.find({ hotelId: h._id });
                const hTotalRooms = hRooms.length > 0 ? hRooms.length : Number(h.totalRooms || 0);

                return {
                    ...h.toObject(),
                    totalRevenue: hTotalRevenue,
                    totalRooms: hTotalRooms
                };
            })
        );

        // 5. Apply Sorting
        if (sortBy === "latest") hotelsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sortBy === "oldest") hotelsWithDetails.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (sortBy === "rooms") hotelsWithDetails.sort((a, b) => Number(b.totalRooms || 0) - Number(a.totalRooms || 0));
        else if (sortBy === "revenue") hotelsWithDetails.sort((a, b) => b.totalRevenue - a.totalRevenue);
        else hotelsWithDetails.sort((a, b) => (a.city?.cityName || "").localeCompare(b.city?.cityName || ""));

        // 6. Map Data to Excel Sheet format
        const excelData = hotelsWithDetails.map((hotel, index) => ({
            "S.No": index + 1,
            "Hotel Name": hotel.hotelName || "",
            "Hotel Email": hotel.hotelEmail || "",
            "City": hotel.city?.cityName || "",
            "District": hotel.city?.districtId?.districtName || "",
            "State": hotel.city?.districtId?.stateId?.stateName || "",
            "Rooms": hotel.totalRooms || 0,
            "Revenue": hotel.totalRevenue || 0,
            "Status": hotel.status || "",
            "Created Date": hotel.createdAt ? dayjs(hotel.createdAt).format("DD-MM-YYYY") : "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Styling columns width
        worksheet["!cols"] = [
            { wch: 8 }, { wch: 25 }, { wch: 25 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
            { wch: 12 }, { wch: 15 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hotels");

        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        res.setHeader("Content-Disposition", `attachment; filename=hotel-report-${Date.now()}.xlsx`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return res.send(buffer);

    } catch (error) {
        console.error("Export Platform Analytics Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};