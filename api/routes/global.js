const express = require("express");
const router = express.Router();
const globalController = require('../controllers/global');
// const checkAuth = require('../middlewares/checkAuth');
// require("dotenv").config();

router.post("/refreshtoken", globalController.refreshToken);

module.exports = router;
