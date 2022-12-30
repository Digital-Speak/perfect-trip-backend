const express = require("express");
const router = express.Router();
const cityController = require('../controllers/city');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, cityController.addCity);
router.delete("/delete", checkAuth, cityController.deleteCity);
router.put("/edit", checkAuth, cityController.editCity);
router.get("/", checkAuth, cityController.getCities);

module.exports = router;
