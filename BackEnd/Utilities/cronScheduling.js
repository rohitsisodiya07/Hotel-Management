const cron = require("node-cron");
const Booking = require("../Model/bookingModel");

const scheduleNoShowCancellations = () => {
    console.log("🕛 No Show Cron Initialized");

    cron.schedule(
        "0 0 * * *", // Every day at 12:00 AM
        async () => {
            console.log("🚀 Running Auto Cancellation Cron...");

            try {
                // Hospitality industry standard: Allow guest the entire check-in day + evening.
                // Mark No-Show only if 24 hours have passed since check-in start and status is still Pending/Confirmed.
                const pastCheckInCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

                const filter = {
                    checkIn: { $lt: pastCheckInCutoff },
                    bookingStatus: {
                        $in: ["Pending", "Confirmed"],
                    },
                };

                const result = await Booking.updateMany(filter, {
                    $set: {
                        bookingStatus: "Cancelled",
                        cancelReason: "Auto Cancelled (Guest did not check in within 24 hours of scheduled check-in)",
                        cancelledAt: new Date(),
                    },
                });

                console.log(
                    `✅ Auto Cancel Completed | Updated Bookings: ${result.modifiedCount}`
                );
            } catch (error) {
                console.error("❌ Auto Cancellation Cron Error:", error);
            }
        },
        {
            timezone: "Asia/Kolkata",
        }
    );
};

module.exports = { scheduleNoShowCancellations };