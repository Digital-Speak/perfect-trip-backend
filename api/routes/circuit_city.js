const express = require("express");
const router = express.Router();
const circuitCityController = require('../controllers/circuit_city');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, circuitCityController.addCircuitCity);

module.exports = router;
