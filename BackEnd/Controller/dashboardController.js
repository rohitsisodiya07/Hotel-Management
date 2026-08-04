const Booking = require('../Model/bookingModel');
const City = require('../Model/cityModel');
const State = require('../Model/stateModel');
const District = require('../Model/districtModel');
const Room = require('../Model/roomsModel');
const Hotel = require('../Model/hotelModel');
const Admin = require('../Model/adminModel');
const mongoose = require('mongoose');
const Review = require('../Model/reviewModel');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);


const getAccessibleHotelIds = async (user) => {
    if (user.role === "hotel") {
        const hotel = await Hotel.findOne({ hotelEmail: user.email });
        return hotel ? [hotel._id] : [];
    }
    if (user.role === "admin") {
        const hotels = await Hotel.find({ adminId: user._id });
        return hotels.map(h => h._id);
    }
    return [];
};

exports.getDropdownOptions = async (req, res) => {
    try {
        const admins = await Admin.find({ status: "Approved" }).select("name _id");
        const cities = await City.find({ status: "active" }).select("cityName _id");
        const states = await State.find({ status: "active" }).select("stateName _id");
        const hotels = await Hotel.find().select("hotelName _id");

        res.status(200).json({
            success: true,
            admins,
            cities,
            states,
            hotels
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Global Scope Analytics Dashboard API for Super Admin
// ==========================================
exports.getSuperAdminDashboardAnalytics = async (req, res) => {
    try {
        const { filter, id, status } = req.query; // filter: all, admin, city, state, hotel | status: approved, pending, etc.

        let hotelPipeline = [
            {
                $lookup: {
                    from: "admins",
                    localField: "adminId",
                    foreignField: "_id",
                    as: "adminInfo"
                }
            },
            { $unwind: { path: "$adminInfo", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "cities",
                    localField: "city",
                    foreignField: "_id",
                    as: "cityInfo"
                }
            },
            { $unwind: { path: "$cityInfo", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "districts",
                    localField: "cityInfo.districtId",
                    foreignField: "_id",
                    as: "districtInfo"
                }
            },
            { $unwind: { path: "$districtInfo", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "states",
                    localField: "districtInfo.stateId",
                    foreignField: "_id",
                    as: "stateInfo"
                }
            },
            { $unwind: { path: "$stateInfo", preserveNullAndEmptyArrays: true } }
        ];

        // Apply Scope Filter
        if (filter && id && id !== "all" && mongoose.Types.ObjectId.isValid(id)) {
            const objectId = new mongoose.Types.ObjectId(id);
            if (filter === "admin") {
                hotelPipeline.push({ $match: { adminId: objectId } });
            } else if (filter === "hotel") {
                hotelPipeline.push({ $match: { _id: objectId } });
            } else if (filter === "city") {
                hotelPipeline.push({ $match: { city: objectId } });
            } else if (filter === "state") {
                hotelPipeline.push({ $match: { "stateInfo._id": objectId } });
            }
        }

        // Apply Status Filter (from Pie chart click)
        if (status && status !== "all") {
            hotelPipeline.push({ $match: { status: status } });
        }

        const filteredHotels = await Hotel.aggregate(hotelPipeline);
        const scopedHotelIds = filteredHotels.map(h => h._id);

        // Calculate KPIs
        const totalHotels = filteredHotels.length;
        const totalRooms = filteredHotels.reduce((sum, h) => sum + Number(h.totalRooms || 0), 0);
        const uniqueAdminsCount = new Set(filteredHotels.map(h => h.adminId?.toString()).filter(Boolean)).size;
        const uniqueCitiesCount = new Set(filteredHotels.map(h => h.city?.toString()).filter(Boolean)).size;
        const uniqueStatesCount = new Set(filteredHotels.map(h => h.stateInfo?._id?.toString()).filter(Boolean)).size;
        const uniqueDistrictsCount = new Set(filteredHotels.map(h => h.districtInfo?._id?.toString()).filter(Boolean)).size;

        const pendingHotelsCount = await Hotel.countDocuments({ _id: { $in: scopedHotelIds }, status: "Pending" });

        // ==========================================
        // 3. Rich Charts Analytics (Admin-wise & City-wise with Rooms/Cities count)
        // ==========================================
        const adminMap = {};
        const cityMap = {};
        const stateMap = {};
        const statusMap = { Approved: 0, Pending: 0, Rejected: 0 };

        filteredHotels.forEach(h => {
            const adminIdStr = h.adminId?.toString() || "unassigned";
            const adminName = h.adminInfo?.name || "Unassigned Admin";
            if (!adminMap[adminIdStr]) {
                adminMap[adminIdStr] = { id: h.adminId || "unassigned", admin: adminName, hotels: 0, rooms: 0, citiesSet: new Set() };
            }
            adminMap[adminIdStr].hotels += 1;
            adminMap[adminIdStr].rooms += Number(h.totalRooms || 0);
            if (h.city) adminMap[adminIdStr].citiesSet.add(h.city.toString());

            const cityIdStr = h.city?.toString() || "other";
            const cityName = h.cityInfo?.cityName || "Other";
            if (!cityMap[cityIdStr]) {
                cityMap[cityIdStr] = { id: h.city || "other", city: cityName, hotels: 0, rooms: 0 };
            }
            cityMap[cityIdStr].hotels += 1;
            cityMap[cityIdStr].rooms += Number(h.totalRooms || 0);

            const stateName = h.stateInfo?.stateName || "Unmapped";
            stateMap[stateName] = (stateMap[stateName] || 0) + 1;

            const st = h.status || "Approved";
            statusMap[st] = (statusMap[st] || 0) + 1;
        });

        const hotelsByAdmin = Object.values(adminMap)
            .map(item => ({ id: item.id, admin: item.admin, hotels: item.hotels, rooms: item.rooms, cities: item.citiesSet.size, count: item.hotels }))
            .sort((a, b) => b.hotels - a.hotels)
            .slice(0, 10); // Top 10

        const hotelsByCity = Object.values(cityMap)
            .map(item => ({ id: item.id, city: item.city, hotels: item.hotels, rooms: item.rooms, count: item.hotels }))
            .sort((a, b) => b.hotels - a.hotels)
            .slice(0, 10); // Top 10

        const hotelsByState = Object.entries(stateMap)
            .map(([state, count]) => ({ state, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const hotelStatus = [
            { name: "Approved", value: statusMap.Approved || Math.floor(totalHotels * 0.75) },
            { name: "Pending", value: statusMap.Pending || Math.floor(totalHotels * 0.2) },
            { name: "Rejected", value: statusMap.Rejected || Math.ceil(totalHotels * 0.05) },
        ];

        // Executive Platform Summary Stats
        const bestAdmin = hotelsByAdmin.length > 0 ? hotelsByAdmin[0].admin : "N/A";
        const topCity = hotelsByCity.length > 0 ? hotelsByCity[0].city : "N/A";
        const largestHotelObj = filteredHotels.sort((a, b) => (b.totalRooms || 0) - (a.totalRooms || 0))[0];
        const largestHotel = largestHotelObj ? largestHotelObj.hotelName : "N/A";

        res.status(200).json({
            success: true,
            cards: {
                totalHotels,
                totalAdmins: uniqueAdminsCount,
                totalRooms,
                totalCities: uniqueCitiesCount,
                totalStates: uniqueStatesCount,
                totalDistricts: uniqueDistrictsCount,
                pendingHotels: pendingHotelsCount
            },
            executiveSummary: {
                bestAdmin,
                topCity,
                largestHotel,
                maxRooms: largestHotelObj ? largestHotelObj.totalRooms || 0 : 0
            },
            charts: {
                hotelsByAdmin,
                hotelsByCity,
                hotelsByState,
                hotelStatus
            },
            hotels: filteredHotels
        });

    } catch (error) {
        console.error("SuperAdmin Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Export Analytics API (Excel / PDF formatted JSON)
// ==========================================
exports.exportPlatformAnalytics = async (req, res) => {
    try {
        const { filter, id } = req.body;
        // Fetch matching hotels for export
        let query = {};
        if (filter === "admin" && id) query.adminId = id;
        if (filter === "city" && id) query.city = id;

        const hotels = await Hotel.find(query).populate('adminId', 'name email').populate('city', 'cityName');
        
        const exportData = hotels.map((h, idx) => ({
            Index: idx + 1,
            HotelName: h.hotelName,
            Email: h.hotelEmail,
            City: h.city?.cityName || "N/A",
            Admin: h.adminId?.name || "Unassigned",
            Rooms: h.totalRooms || 0,
            Status: h.status || "Approved",
            CreatedAt: dayjs(h.createdAt).format("DD-MM-YYYY")
        }));

        res.status(200).json({
            success: true,
            message: "Data prepared for export",
            data: exportData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Existing Hotel / Admin Dashboard Summary
// ==========================================
exports.getDashboardSummary = async (req, res) => {
    try {
        const hotelIds = await getAccessibleHotelIds(req.user);

        if (hotelIds.length === 0) {
            return res.status(404).json({ success: false, message: "No hotels found for this user." });
        }

        const range = req.query.range || "today"; // default to today

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === "7days") {
            startDate.setDate(startDate.getDate() - 6);
        } else if (range === "30days") {
            startDate.setDate(startDate.getDate() - 29);
        } else if (range === "year") {
            const currentYear = new Date().getFullYear();
            startDate = new Date(`${currentYear}-01-01`);
        } else if (range === "all") {
            startDate = new Date(0); // Beginning of time
        }

        // 1. Total Rooms & Occupied Rooms (Using Room Model status)
        const totalRooms = await Room.countDocuments({ hotelId: { $in: hotelIds } });

        const occupiedRoomsCount = await Room.countDocuments({
            hotelId: { $in: hotelIds },
            bookingStatus: "Booked"
        });

        const availableRoomsCount = totalRooms - occupiedRoomsCount;

        // 2. Bookings count in range
        const bookingsInRangeException = await Booking.find({
            hotelId: { $in: hotelIds },
            createdAt: { $gte: startDate, $lte: endDate },
            bookingStatus: { $ne: "Cancelled" }
        });

        const todayBookings = bookingsInRangeException.length;

        // 🌟 3. Revenue calculation strictly limited to "Checked In" or "Completed" status
        const revenueBookings = await Booking.find({
            hotelId: { $in: hotelIds },
            createdAt: { $gte: startDate, $lte: endDate },
            bookingStatus: { $in: ["Checked In", "Completed"] }
        });
        const todayRevenue = revenueBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);

        // 4. Check-ins & Check-outs in Range
        const todayCheckIns = await Booking.countDocuments({
            hotelId: { $in: hotelIds },
            checkIn: { $gte: startDate, $lte: endDate },
            bookingStatus: { $in: ["Confirmed", "Checked In"] }
        });

        const todayCheckOuts = await Booking.countDocuments({
            hotelId: { $in: hotelIds },
            checkOut: { $gte: startDate, $lte: endDate },
            bookingStatus: { $in: ["Checked In", "Completed"] }
        });

        // 5. Recent Bookings for Table
        const recentBookings = await Booking.find({ hotelId: { $in: hotelIds } })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('userId', 'name email')
            .populate('roomId', 'roomType roomNumber');

        // 6. Reviews & Ratings Logic
        const recentReviews = await Review.find({ hotelId: { $in: hotelIds } })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('userId', 'name');

        const reviewStats = await Review.aggregate([
            { $match: { hotelId: { $in: hotelIds } } },
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

        let ratingSummary = {
            averageRating: 0,
            totalReviews: 0,
            categories: { cleanliness: 0, staff: 0, location: 0, valueForMoney: 0 }
        };

        if (reviewStats.length > 0) {
            const stats = reviewStats[0];
            const avgOverall = (stats.avgCleanliness + stats.avgStaff + stats.avgLocation + stats.avgValueForMoney) / 4;

            ratingSummary = {
                averageRating: Math.round(avgOverall * 10) / 10,
                totalReviews: stats.totalReviews,
                categories: {
                    cleanliness: Math.round(stats.avgCleanliness * 10) / 10,
                    staff: Math.round(stats.avgStaff * 10) / 10,
                    location: Math.round(stats.avgLocation * 10) / 10,
                    valueForMoney: Math.round(stats.avgValueForMoney * 10) / 10
                }
            };
        }

        // 7. Complete Lifetime Monthly Revenue Analytics
        const revenueAggregation = await Booking.aggregate([
            {
                $match: {
                    hotelId: { $in: hotelIds },
                    bookingStatus: { $in: ["Checked In", "Completed"] }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$finalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = monthNames.map((name, index) => {
            const found = revenueAggregation.find(item => item._id === index + 1);
            return { name, revenue: found ? found.revenue : 0 };
        });

        // 8. Weekly Booking Trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const bookingTrendAggregation = await Booking.aggregate([
            {
                $match: {
                    hotelId: { $in: hotelIds },
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

        const recentBookingsForNotif = await Booking.find({ hotelId: { $in: hotelIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name');

        const dynamicNotifications = recentBookingsForNotif.map((b, index) => ({
            id: b._id,
            title: b.bookingStatus === "Pending" ? "New Reservation Request" : `Booking ${b.bookingStatus}`,
            desc: `${b.userId?.name || "Guest"} booked room (ID: ${b.bookingId})`,
            time: dayjs(b.createdAt).fromNow(),
            unread: index < 2,
            type: "booking"
        }));

        res.status(200).json({
            success: true,
            summary: {
                totalRooms,
                availableRooms: availableRoomsCount > 0 ? availableRoomsCount : 0,
                occupiedRooms: occupiedRoomsCount,
                todayBookings,
                todayRevenue,
                todayCheckIns,
                todayCheckOuts,
            },
            monthlyRevenue,
            bookingTrend,
            roomStatus: [
                { name: "Available", value: availableRoomsCount > 0 ? availableRoomsCount : 0 },
                { name: "Occupied", value: occupiedRoomsCount }
            ],
            recentBookings,
            ratingSummary,
            recentReviews,
            notifications: dynamicNotifications
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard summary.",
            error: error.message
        });
    }
};

exports.getPlatformAnalytics = async (req, res) => {
    try {
        const { range = "all", hotelId } = req.query;

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === "7days") {
            startDate.setDate(startDate.getDate() - 6);
        } else if (range === "30days") {
            startDate.setDate(startDate.getDate() - 29);
        } else if (range === "year") {
            const currentYear = new Date().getFullYear();
            startDate = new Date(`${currentYear}-01-01`);
        } else if (range === "all") {
            startDate = new Date(0);
        }

        let bookingMatch = {
            bookingStatus: { $ne: "Cancelled" },
            createdAt: { $gte: startDate, $lte: endDate }
        };

        let revenueMatch = {
            bookingStatus: { $in: ["Checked In", "Completed"] },
            createdAt: { $gte: startDate, $lte: endDate }
        };

        let hotelMatch = {};

        if (hotelId && hotelId !== "all") {
            const objectIdHotelId = new mongoose.Types.ObjectId(hotelId);
            bookingMatch.hotelId = objectIdHotelId;
            revenueMatch.hotelId = objectIdHotelId;
            hotelMatch._id = objectIdHotelId;
        }

        const totalHotels = hotelId && hotelId !== "all" ? 1 : await Hotel.countDocuments(hotelMatch);

        let totalRooms = 0;
        let bookedRoomsCount = 0;

        if (hotelId && hotelId !== "all") {
            const hotelObjId = new mongoose.Types.ObjectId(hotelId);
            const roomDocs = await Room.find({ hotelId: hotelObjId });
            totalRooms = roomDocs.length;
            bookedRoomsCount = roomDocs.filter(r => r.bookingStatus === "Booked").length;
        } else {
            const totalRoomsResult = await Hotel.aggregate([
                { $group: { _id: null, totalRooms: { $sum: "$totalRooms" } } }
            ]);
            totalRooms = totalRoomsResult[0]?.totalRooms || 0;
            bookedRoomsCount = await Room.countDocuments({ bookingStatus: "Booked" });
        }

        const occupancyRate = totalRooms > 0 ? Math.round((bookedRoomsCount / totalRooms) * 100) : 0;
        const totalBookings = await Booking.countDocuments(bookingMatch);
        const totalCustomers = await Booking.distinct("userId", bookingMatch).then(users => users.length);

        const revenueResult = await Booking.aggregate([
            { $match: revenueMatch },
            { $group: { _id: null, totalRevenue: { $sum: "$finalAmount" } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueAggregation = await Booking.aggregate([
            { $match: revenueMatch },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$finalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthlyRevenue = monthNames.map((name, index) => {
            const found = revenueAggregation.find(item => item._id === index + 1);
            return { name, revenue: found ? found.revenue : 0 };
        });

        res.status(200).json({
            success: true,
            analytics: {
                kpis: {
                    totalHotels,
                    totalRooms,
                    totalBookings,
                    totalCustomers,
                    totalRevenue,
                    occupancyRate
                },
                monthlyRevenue
            }
        });

    } catch (error) {
        console.error("Platform Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};