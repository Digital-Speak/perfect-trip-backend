const express = require("express");
const router = express.Router();
const userController = require('../controllers/user');
require("dotenv").config();

router.post("/login", userController.login);
router.post("/signup", userController.signUp);
router.delete("/delete", userController.delete_user);

module.exports = router;
