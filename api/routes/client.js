const express = require("express");
const router = express.Router();
const clientController = require('../controllers/client');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/add", checkAuth, clientController.addClient);
router.get("/", checkAuth, clientController.getClients);

module.exports = router;
