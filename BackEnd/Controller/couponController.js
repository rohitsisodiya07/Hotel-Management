const Coupon = require('../Model/couponModel');


exports.createCoupon = async (req, res) => {
    try {
        const {
            couponCode,
            discountType,
            discountValue,
            minBookingAmount,
            expiryDate,
            maxUses,
            status
        } = req.body;

        if (!couponCode || !discountType || !discountValue || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields: couponCode, discountType, discountValue, and expiryDate."
            });
        }

        const formattedCode = couponCode.trim().toUpperCase();

        const existingCoupon = await Coupon.findOne({ couponCode: formattedCode });
        if (existingCoupon) {
            return res.status(409).json({
                success: false,
                message: "A coupon token with this code already exists."
            });
        }

        if (discountType === "Percentage" && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({
                success: false,
                message: "Percentage value must fall accurately between 1% and 100%."
            });
        }

        const newCoupon = new Coupon({
            couponCode: formattedCode,
            discountType,
            discountValue,
            minBookingAmount: minBookingAmount || 0,
            expiryDate: new Date(expiryDate),
            maxUses: maxUses || 100,
            status: status || "Active"
        });

        await newCoupon.save();

        return res.status(201).json({
            success: true,
            message: "Coupon successfully deployed to the platform.",
            result: newCoupon
        });

    } catch (error) {
        console.error("Coupon creation error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server crash while writing coupon parameters."
        });
    }
};


exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { couponCode, discountType, discountValue, minBookingAmount, expiryDate, maxUses, status } = req.body;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "No coupon found matching this identity."
            });
        }

        // Check code duplicate changes logic
        if (couponCode) {
            const formattedCode = couponCode.trim().toUpperCase();
            if (formattedCode !== coupon.couponCode) {
                const duplicateCheck = await Coupon.findOne({ couponCode: formattedCode });
                if (duplicateCheck) {
                    return res.status(409).json({
                        success: false,
                        message: "Another active coupon is already using this code layout."
                    });
                }
                coupon.couponCode = formattedCode;
            }
        }

        // Percentage calculations protection check
        const finalType = discountType || coupon.discountType;
        const finalValue = discountValue !== undefined ? discountValue : coupon.discountValue;

        if (finalType === "Percentage" && (finalValue <= 0 || finalValue > 100)) {
            return res.status(400).json({
                success: false,
                message: "Percentage value must fall accurately between 1% and 100%."
            });
        }

        // Apply metadata payload modifications
        if (discountType) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = discountValue;
        if (minBookingAmount !== undefined) coupon.minBookingAmount = minBookingAmount;
        if (expiryDate) coupon.expiryDate = new Date(expiryDate);
        if (maxUses !== undefined) coupon.maxUses = maxUses;
        if (status) coupon.status = status;

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon configurations successfully modified.",
            result: coupon
        });
    } catch (error) {
        console.error("Coupon metadata modification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal framework exception executing metadata configuration overrides."
        });
    }
};


exports.toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "No coupon database maps found for this target id."
            });
        }

        // Natively status verification switcher
        coupon.status = coupon.status === "Active" ? "Inactive" : "Active";
        await coupon.save();

        return res.status(200).json({
            success: true,
            message: `Coupon campaign status successfully changed to ${coupon.status}.`,
            result: coupon
        });
    } catch (error) {
        console.error("Status switch crash error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to alter status variables logs."
        });
    }
};


exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: coupons.length,
            result: coupons
        });
    } catch (error) {
        console.error("Fetch coupons error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to pull system coupons metadata logs."
        });
    }
};


exports.getSingleCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Establishment coupon records missing matching this key."
            });
        }

        return res.status(200).json({
            success: true,
            result: coupon
        });
    } catch (error) {
        console.error("Get coupon node error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to track dynamic parameters maps from cluster."
        });
    }
};


exports.validateCoupon = async (req, res) => {
    try {
        const { couponCode, bookingAmount } = req.body;

        if (!couponCode || !bookingAmount) {
            return res.status(400).json({
                success: false,
                message: "Coupon code text and order total metrics required for comparison."
            });
        }

        const targetCode = couponCode.trim().toUpperCase();
        const coupon = await Coupon.findOne({ couponCode: targetCode });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid token key. This coupon configuration does not exist."
            });
        }

        if (coupon.status === "Inactive") {
            return res.status(400).json({
                success: false,
                message: "This marketing campaign is currently inactive or disabled."
            });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "This coupon code timeline parameter has expired."
            });
        }

        if (Number(bookingAmount) < Number(coupon.minBookingAmount)) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount to activate this token requires at least ₹${coupon.minBookingAmount}.`
            });
        }

        let finalDiscount = 0;
        if (coupon.discountType === "Percentage") {
            finalDiscount = (Number(bookingAmount) * Number(coupon.discountValue)) / 100;
        } else {
            finalDiscount = Number(coupon.discountValue);
        }

        return res.status(200).json({
            success: true,
            message: "Coupon validation compiled successfully.",
            data: {
                couponCode: coupon.couponCode,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                calculatedDeduction: finalDiscount
            }
        });

    } catch (error) {
        console.error("Validation error pipeline:", error);
        return res.status(500).json({
            success: false,
            message: "Error processing calculations on checkout voucher compilation."
        });
    }
};

// GET AVAILABLE COUPONS
exports.getAvailableCoupons = async (req, res) => {
    console.log("getAvailableCoupons Hit");
    try {
        const amount = Number(req.query.amount);
        console.log(">>>>Amount", amount);


        const coupons = await Coupon.find({
            status: "Active",
            expiryDate: { $gte: new Date() },
            minBookingAmount: { $lte: amount },
        });
        console.log(">>>>Coupons", coupons);


        return res.status(200).json({
            success: true,
            totalCoupons: coupons.length,
            coupons,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return res.status(404).json({
                success: false,
                message: "No coupon found matching the target database tracking identity."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon structure wiped out from production metrics successfully."
        });
    } catch (error) {
        console.error("Deletion controller crash:", error);
        return res.status(500).json({
            success: false,
            message: "Internal framework exception executing target node destruction payload."
        });
    }
};