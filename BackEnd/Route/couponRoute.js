const express = require('express');
const router = express.Router();
const couponController = require('../Controller/couponController');

const verifyToken = require('../Middleware/authMiddleware');
const isAdmin = require('../Middleware/admin');

// Admin Write Rules Control Layer
router.post('/create', verifyToken, isAdmin, couponController.createCoupon);
router.patch('/update/:id', verifyToken, isAdmin, couponController.updateCoupon);
router.patch('/toggle-status/:id', verifyToken, isAdmin, couponController.toggleCouponStatus);
router.delete('/delete/:id', verifyToken, isAdmin, couponController.deleteCoupon);

// Admin Read Optimization Layer
router.get('/all', verifyToken, isAdmin, couponController.getAllCoupons);
router.get('/:id', verifyToken, isAdmin, couponController.getSingleCoupon);

// Checkout System Public Validation Verification Mapping
router.post('/validate', verifyToken, couponController.validateCoupon);

module.exports = router;