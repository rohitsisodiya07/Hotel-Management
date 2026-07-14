const express = require('express');

const router = express.Router();

const districtController = require('../Controller/districtController');

//Create
router.post("/create", districtController.createDistrict);

//active
router.get("/active", districtController.getAllDistricts);

//Inactive
router.get("/inactive", districtController.getInactiveDistricts);

//GetOne
router.get("/:id", districtController.getDistrictById);

//Update
router.patch("/update/:id", districtController.updateDistrict);

//Active-Inactive
router.patch("/inactive/:id", districtController.inactiveDistrict);

//Restore
router.patch("/restore/:id", districtController.restoreDistrict);

router.delete("/:id", districtController.deleteDistrict);


module.exports = router;