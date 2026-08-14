const express = require('express');
const router = express.Router();

const couponController = require('../Controller/couponController');
// const fileUpload = require('express-fileupload')

const verifyToken = require('../Middleware/authMiddleware');
const isAdmin = require('../Middleware/admin');


// ==============================
// Admin Write Routes
// ==============================

router.post(
    '/create',
    verifyToken,
    isAdmin,
    couponController.createCoupon
);

router.post(
    "/bulk-preview",
    verifyToken,
    isAdmin,
    couponController.bulkPreviewCoupons
);

router.post(
    "/bulk-import",
    verifyToken,
    isAdmin,
    couponController.bulkImportCoupons
);

router.patch(
    '/update/:id',
    verifyToken,
    isAdmin,
    couponController.updateCoupon
);

router.patch(
    '/toggle-status/:id',
    verifyToken,
    isAdmin,
    couponController.toggleCouponStatus
);

router.delete(
    '/delete/:id',
    verifyToken,
    isAdmin,
    couponController.deleteCoupon
);


// ==============================
// Checkout Coupon Validation
// ==============================

router.post(
    '/validate',
    verifyToken,
    couponController.validateCoupon
);


// ==============================
// Customer Coupons
// ==============================

router.get(
    '/available',
    verifyToken,
    couponController.getAvailableCoupons
);


// ==============================
// Admin Read Routes
// ==============================

router.get(
    '/all',
    verifyToken,
    isAdmin,
    couponController.getAllCoupons
);

router.get(
    '/:id',
    verifyToken,
    isAdmin,
    couponController.getSingleCoupon
);


module.exports = router;