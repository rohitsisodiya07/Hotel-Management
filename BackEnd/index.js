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
// console.log(">>>>>>port", process.env.PORT);

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

const signupRoute = require("./Route/signupRoute");
const stateRoute = require('./Route/stateRoute');
const districtRoute = require('./Route/districtRoute')
const cityRoute = require('./Route/cityRoute')
const adminRoute = require('./Route/adminRoute')
const hotelRoute = require('./Route/hotelRoute');
const couponRoute = require('./Route/couponRoute')

app.use("/userSignup", signupRoute);

app.use("/state", stateRoute);

app.use('/district', districtRoute);

app.use('/city', cityRoute);

app.use('/admin', adminRoute)

app.use('/hotel', hotelRoute);

app.use('/coupon', couponRoute);

app.get("/", (req, res) => {
    res.send("Server is Running.......");
});

app.listen(port, () => {
    console.log(`Server is Running on Port ${port}`)
});