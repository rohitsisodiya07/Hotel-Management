const express = require('express') ;

const router = express.Router() ;


const authMiddleware = require('../Middleware/authMiddleware') ;

const bookingController = require('../Controller/bookingController') ;

router.post('/create', authMiddleware,  bookingController.createBooking) ;



module.exports = router ;