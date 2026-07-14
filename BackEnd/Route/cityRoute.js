const express = require('express');

const router = express.Router();

const cityController = require('../Controller/cityController')
router.post(
    "/create",
    cityController.createCity
);

router.get(
    "/active",
    cityController.getAllCities
);

router.get(
    "/inactive",
    cityController.getInactiveCities
);

router.get(
    "/:id",
    cityController.getCityById
);

router.patch(
    "/update/:id",
    cityController.updateCity
);

router.patch(
    "/inactive/:id",
    cityController.inactiveCity
);

router.patch(
    "/restore/:id",
    cityController.restoreCity
);

router.delete(
    "/:id",
    cityController.deleteCity
);

module.exports = router

