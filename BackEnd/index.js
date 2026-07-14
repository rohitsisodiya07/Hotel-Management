require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

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

app.use("/userSignup", signupRoute);

app.use("/state", stateRoute);

app.use('/district', districtRoute) ;

app.use('/city', cityRoute) ;

app.get("/", (req, res) => {
    res.send("Server is Running.......");
});

app.listen(port, () => {
    console.log(`Server is Running on Port ${port}`)
});