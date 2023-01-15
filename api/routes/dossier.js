const express = require("express");
const router = express.Router();
const dossierController = require('../controllers/dossier');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/", checkAuth, dossierController.getDossiers);
router.post("/one", checkAuth, dossierController.getDossier);
router.post("/add", checkAuth, dossierController.addDossier);
router.put("/", checkAuth, dossierController.updateDossier);
router.post("/list", checkAuth, dossierController.getListDossiers);
router.delete("/", checkAuth, dossierController.deleteDossier);
router.get("/getlast", checkAuth, dossierController.getLastDossier);

module.exports = router;
