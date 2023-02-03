const express = require("express");
const router = express.Router();
const importDatarController = require('../controllers/import');
require("dotenv").config();

router.post("/", importDatarController.addDossier);

module.exports = router;
