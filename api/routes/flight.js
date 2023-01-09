const express = require("express");
const router = express.Router();
const flightController = require('../controllers/flight');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, flightController.addFlight);
router.delete("/delete", checkAuth, flightController.deleteFlight);
// router.put("/edit", checkAuth, flightController.);
router.get("/", checkAuth, flightController.getFlights);

module.exports = router;
