const express = require("express");
const router = express.Router();
const hotelController = require('../controllers/hotel');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, hotelController.addHotel);
router.delete("/delete", checkAuth, hotelController.deleteHotel);
router.put("/edit", checkAuth, hotelController.editHotel);
router.get("/circuit_city_hotels", checkAuth, hotelController.getCircuitCityHotels);

module.exports = router;
