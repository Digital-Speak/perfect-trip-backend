const express = require("express");
const router = express.Router();
const tourController = require('../controllers/tour');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, tourController.addTour);
// router.delete("/delete", checkAuth, tourController.deleteTour);
// router.put("/edit", checkAuth, tourController.editTour);

module.exports = router;
