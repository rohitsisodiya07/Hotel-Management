const cron = require("node-cron");
const Booking = require("../Model/bookingModel");

const scheduleNoShowCancellations = () => {
    console.log("🕛 No Show Cron Initialized");

    cron.schedule(
        "0 0 * * *", // Every day at 12:00 AM
        async () => {
            console.log("🚀 Running Auto Cancellation Cron...");

            try {
                const currentTime = new Date();

                const filter = {
                    checkIn: { $lt: currentTime },
                    bookingStatus: {
                        $in: ["Pending", "Confirmed"],
                    },
                };

                const result = await Booking.updateMany(filter, {
                    $set: {
                        bookingStatus: "Cancelled",
                        cancellationReason: "Auto Cancelled (Guest did not check in)",
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