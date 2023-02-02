const express = require("express");
const router = express.Router();
const importDatarController = require('../controllers/import_data');
require("dotenv").config();

router.post("/", importDatarController.addDossier);

module.exports = router;
