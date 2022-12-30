const express = require("express");
const router = express.Router();
const circuitController = require('../controllers/circuit');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, circuitController.addCircuit);
router.delete("/delete", checkAuth, circuitController.deleteCircuit);
router.put("/edit", checkAuth, circuitController.editCircuit);
router.get("/", checkAuth, circuitController.getCircuits);

module.exports = router;
