const express = require("express");
const router = express.Router();
const dossierController = require('../controllers/dossier');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/", checkAuth, dossierController.getDossiers);
router.post("/add", checkAuth, dossierController.addDossier);
router.delete("/delete", checkAuth, dossierController.deleteDossier);
router.get("/getlast", checkAuth, dossierController.getLastDossier);

module.exports = router;
