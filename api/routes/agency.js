const express = require("express");
const router = express.Router();
const agencyController = require('../controllers/agency');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, agencyController.addAgency);
router.delete("/delete", checkAuth, agencyController.deleteAgency);
router.put("/edit", checkAuth, agencyController.editAgency);

module.exports = router;
