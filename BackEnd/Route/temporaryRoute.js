const express = require('express');
const router = express.Router();

const temporaryController = require('../Controller/temporaryController')
const auth = require('../Middleware/authMiddleware')


router.post('/hold', auth, temporaryController.holdRoom)

router.delete('/cancel/:holdId', auth, temporaryController.cancelHold)

module.exports = router;