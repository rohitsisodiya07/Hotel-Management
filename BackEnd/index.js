require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: false, }));

const port = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URL)
    .then(async () => {
        console.log("MongoDB Connected");

        // ⭐ AUTOMATIC FIX FOR THE HOTEL ID INDEX ERROR
        try {
            await mongoose.connection.collection('reviews').dropIndex('hotelId_1');
            console.log("Old hotelId_1 index successfully removed from database!");
        } catch (err) {
            // Agar index pehle se hi nahi hoga toh ye silent rahega
        }
    })
    .catch((err) => console.log(err));

const signupRoute = require("./Route/signupRoute");
const stateRoute = require('./Route/stateRoute');
const districtRoute = require('./Route/districtRoute')
const cityRoute = require('./Route/cityRoute')
const adminRoute = require('./Route/adminRoute')
const hotelRoute = require('./Route/hotelRoute');
const couponRoute = require('./Route/couponRoute')
const roomRoute = require('./Route/roomRoute')
const bookingRoute = require('./Route/bookingRoute')
const temporaryRoute = require('./Route/temporaryRoute');
const reviewRoute = require('./Route/reviewRoute');
const dashboardRoute = require('./Route/dashboardRoute');

app.use("/userSignup", signupRoute);
app.use("/state", stateRoute);
app.use('/district', districtRoute);
app.use('/city', cityRoute);
app.use('/admin', adminRoute)
app.use('/hotel', hotelRoute);
app.use('/coupon', couponRoute);
app.use('/room', roomRoute);
app.use('/booking', bookingRoute);
app.use('/temporary', temporaryRoute);
app.use('/review', reviewRoute);
app.use('/dashboard', dashboardRoute)

const { scheduleNoShowCancellations } = require('./Utilities/cronScheduling');

scheduleNoShowCancellations();

app.listen(port, () => {
    console.log(`Server is Running on Port ${port}`)
});