const express = require("express");
const router = express.Router();

const reviewController = require("../Controller/reviewController");
const auth = require("../Middleware/authMiddleware");

router.post("/create", auth, reviewController.createReview);

module.exports = router;