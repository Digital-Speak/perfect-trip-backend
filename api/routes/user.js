const express = require("express");
const router = express.Router();
const userController = require('../controllers/user');
const checkAuth = require('../middlewares/checkAuth');
require("dotenv").config();

router.post("/login", userController.login);
router.post("/signup", userController.signUp);
router.delete("/delete", checkAuth, userController.delete_user);
router.get("/", checkAuth, userController.getUsers);
router.get("/verifytoken/:token", userController.verifyToken);
router.post("/forgotpassword", userController.forgotPassword);

module.exports = router;
