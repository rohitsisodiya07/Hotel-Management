const Coupon = require('../Model/couponModel');
const XLSX = require('xlsx')


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

exports.bulkImportCoupons = async (req, res) => {
    try {
        console.log("========== FINAL BULK IMPORT ==========");
        let coupons = [];

        // Parse JSON coupons from preview
        if (req.body?.coupons) {
            try {
                coupons = typeof req.body.coupons === "string" ? JSON.parse(req.body.coupons) : req.body.coupons;
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid coupon data" });
            }
            if (!Array.isArray(coupons)) {
                return res.status(400).json({ success: false, message: "Coupons must be an array" });
            }
        } 
        // Direct Excel file upload fallback
        else if (req.files?.file) {
            const file = req.files.file;
            const workbook = XLSX.read(file.data, { type: "buffer", cellDates: true });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) return res.status(400).json({ success: false, message: "Excel file does not contain any sheet" });

            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: true });
            if (!rows.length) return res.status(400).json({ success: false, message: "Excel file is empty" });

            coupons = rows.map((row) => ({
                couponCode: String(row.couponCode || "").trim().toUpperCase(),
                discountType: String(row.discountType || "").trim(),
                discountValue: Number(row.discountValue),
                maxDiscount: row.maxDiscount === "" || row.maxDiscount === undefined ? null : Number(row.maxDiscount),
                minBookingAmount: row.minBookingAmount === "" || row.minBookingAmount === undefined ? 0 : Number(row.minBookingAmount),
                startDate: row.startDate ? new Date(row.startDate) : new Date(),
                expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
                maxUses: row.maxUses === "" || row.maxUses === undefined ? 100 : Number(row.maxUses),
                usedCount: 0,
                status: String(row.status || "Active").trim(),
            }));
        } else {
            return res.status(400).json({ success: false, message: "No coupon data or Excel file provided" });
        }

        // Filter valid preview rows
        coupons = coupons.filter((coupon) => coupon && coupon.couponCode && coupon.discountType && Number.isFinite(Number(coupon.discountValue)));
        if (coupons.length === 0) return res.status(400).json({ success: false, message: "No valid coupons available for import" });

        // Normalize Data Fields
        coupons = coupons.map((coupon) => ({
            couponCode: String(coupon.couponCode).trim().toUpperCase(),
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
            maxDiscount: coupon.discountType === "Percentage" ? (coupon.maxDiscount === null || coupon.maxDiscount === undefined || coupon.maxDiscount === "" ? null : Number(coupon.maxDiscount)) : null,
            minBookingAmount: Number(coupon.minBookingAmount || 0),
            startDate: new Date(coupon.startDate),
            expiryDate: new Date(coupon.expiryDate),
            maxUses: Number(coupon.maxUses || 100),
            usedCount: 0,
            status: coupon.status || "Active",
        }));

        // Final Backend Validation
        const errors = [];
        const validCoupons = [];

        for (let i = 0; i < coupons.length; i++) {
            const coupon = coupons[i];
            if (!coupon.couponCode) { errors.push({ couponCode: "", message: "Coupon code is required" }); continue; }
            if (!["Percentage", "Fixed Amount"].includes(coupon.discountType)) { errors.push({ couponCode: coupon.couponCode, message: "Invalid discount type" }); continue; }
            if (!Number.isFinite(coupon.discountValue) || coupon.discountValue <= 0) { errors.push({ couponCode: coupon.couponCode, message: "Discount value must be greater than 0" }); continue; }
            if (coupon.discountType === "Percentage" && coupon.discountValue > 100) { errors.push({ couponCode: coupon.couponCode, message: "Percentage discount cannot exceed 100" }); continue; }
            if (!Number.isFinite(coupon.minBookingAmount) || coupon.minBookingAmount < 0) { errors.push({ couponCode: coupon.couponCode, message: "Invalid minimum booking amount" }); continue; }
            if (Number.isNaN(coupon.startDate.getTime())) { errors.push({ couponCode: coupon.couponCode, message: "Invalid start date" }); continue; }
            if (Number.isNaN(coupon.expiryDate.getTime())) { errors.push({ couponCode: coupon.couponCode, message: "Invalid expiry date" }); continue; }
            if (coupon.expiryDate <= coupon.startDate) { errors.push({ couponCode: coupon.couponCode, message: "Expiry date must be after start date" }); continue; }
            if (!Number.isFinite(coupon.maxUses) || coupon.maxUses < 1) { errors.push({ couponCode: coupon.couponCode, message: "Maximum uses must be at least 1" }); continue; }
            if (!["Active", "Inactive"].includes(coupon.status)) { errors.push({ couponCode: coupon.couponCode, message: "Invalid coupon status" }); continue; }
            validCoupons.push(coupon);
        }

        // Check Existing in Database
        const couponCodes = validCoupons.map((coupon) => coupon.couponCode);
        const existingCoupons = await Coupon.find({ couponCode: { $in: couponCodes } }).select("couponCode");
        const existingCodes = new Set(existingCoupons.map((coupon) => coupon.couponCode));

        const finalCoupons = [];
        validCoupons.forEach((coupon) => {
            if (existingCodes.has(coupon.couponCode)) {
                errors.push({ couponCode: coupon.couponCode, message: "Coupon already exists" });
            } else {
                finalCoupons.push(coupon);
            }
        });

        // Check Internal Duplicates
        const seenCodes = new Set();
        const uniqueCoupons = [];
        finalCoupons.forEach((coupon) => {
            if (seenCodes.has(coupon.couponCode)) {
                errors.push({ couponCode: coupon.couponCode, message: "Duplicate coupon code" });
            } else {
                seenCodes.add(coupon.couponCode);
                uniqueCoupons.push(coupon);
            }
        });

        let insertedCoupons = [];
        if (uniqueCoupons.length > 0) {
            insertedCoupons = await Coupon.insertMany(uniqueCoupons, { ordered: false });
        }

        return res.status(200).json({
            success: true,
            message: "Bulk coupon import completed",
            summary: { totalRows: coupons.length, imported: insertedCoupons.length, failed: errors.length },
            errors,
        });
    } catch (error) {
        console.error("Bulk Coupon Import Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.bulkPreviewCoupons = async (req, res) => {
    try {
        console.log("========== BULK PREVIEW ==========");
        const file = req.files?.file;
        if (!file) return res.status(400).json({ success: false, message: "Please upload an Excel file" });

        const workbook = XLSX.read(file.data, { type: "buffer", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) return res.status(400).json({ success: false, message: "Excel file does not contain any sheet" });

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: true });
        if (!rows.length) return res.status(400).json({ success: false, message: "Excel file is empty" });

        const couponCodes = rows.map((row) => String(row.couponCode || "").trim().toUpperCase()).filter(Boolean);
        const existingCoupons = await Coupon.find({ couponCode: { $in: couponCodes } }).select("couponCode");
        const existingCodes = new Set(existingCoupons.map((coupon) => coupon.couponCode));

        const seenCodes = new Set();
        const previewRows = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;
            const couponCode = String(row.couponCode || "").trim().toUpperCase();
            const discountType = String(row.discountType || "").trim();
            const discountValue = Number(row.discountValue);
            const maxDiscount = row.maxDiscount === "" || row.maxDiscount === undefined ? null : Number(row.maxDiscount);
            const minBookingAmount = row.minBookingAmount === "" || row.minBookingAmount === undefined ? 0 : Number(row.minBookingAmount);
            const startDate = row.startDate ? new Date(row.startDate) : new Date();
            const expiryDate = row.expiryDate ? new Date(row.expiryDate) : null;
            const maxUses = row.maxUses === "" || row.maxUses === undefined ? 100 : Number(row.maxUses);
            const status = String(row.status || "Active").trim();

            const errors = [];
            if (!couponCode) errors.push("Coupon code is required");
            if (couponCode) {
                if (seenCodes.has(couponCode)) errors.push("Duplicate coupon code in Excel");
                else seenCodes.add(couponCode);
            }
            if (couponCode && existingCodes.has(couponCode)) errors.push("Coupon already exists");
            if (!["Percentage", "Fixed Amount"].includes(discountType)) errors.push("Invalid discount type");
            if (!Number.isFinite(discountValue) || discountValue <= 0) errors.push("Discount value must be greater than 0");
            if (discountType === "Percentage" && discountValue > 100) errors.push("Percentage discount cannot exceed 100");
            if (discountType === "Fixed Amount" && maxDiscount !== null) errors.push("Maximum discount is only applicable for percentage coupons");
            if (!Number.isFinite(minBookingAmount) || minBookingAmount < 0) errors.push("Invalid minimum booking amount");
            if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) errors.push("Invalid maximum discount");
            if (!startDate || Number.isNaN(startDate.getTime())) errors.push("Invalid start date");
            if (!expiryDate || Number.isNaN(expiryDate.getTime())) errors.push("Invalid expiry date");
            if (startDate && expiryDate && expiryDate <= startDate) errors.push("Expiry date must be after start date");
            if (!Number.isFinite(maxUses) || maxUses < 1) errors.push("Maximum uses must be at least 1");
            if (!["Active", "Inactive"].includes(status)) errors.push("Invalid status");

            previewRows.push({
                rowNumber,
                couponCode,
                discountType,
                discountValue,
                maxDiscount,
                minBookingAmount,
                startDate,
                expiryDate,
                maxUses,
                status,
                valid: errors.length === 0,
                errors,
            });
        }

        const validCount = previewRows.filter((row) => row.valid).length;
        const invalidCount = previewRows.filter((row) => !row.valid).length;

        return res.status(200).json({
            success: true,
            message: "Coupon preview generated",
            summary: { totalRows: previewRows.length, valid: validCount, invalid: invalidCount },
            rows: previewRows,
        });
    } catch (error) {
        console.error("Bulk Coupon Preview Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};