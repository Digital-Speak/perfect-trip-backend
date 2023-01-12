const express = require("express");
const router = express.Router();
const userController = require('../controllers/user');
const checkAuth = require('../middlewares/checkAuth');
const checkJWT = require("../middlewares/checkJWT");
require("dotenv").config();

router.post("/login", userController.login);
router.post("/logout",checkAuth, userController.logOut);
router.post("/signup", userController.signUp);
router.delete("/delete", checkAuth, userController.delete_user);
router.get("/", checkAuth, userController.getUsers);
router.get("/invite", userController.InviteToChannel);
router.get("/invitetogroup", userController.InviteToGroup);
router.get("/invitetoprivategroup", userController.InviteToPrivateGroup);
router.post("/invitePrivate", userController.InviteToPrivateChannelOrGroup);
router.post("/invitePublic", userController.InviteToPublicChannelOrGroup);
// router.get("/invitePrivate", userController.InviteToPrivateChannel);
router.get("/verifytoken/:token", userController.verifyToken);
router.post("/forgotpassword", userController.forgotPassword);
router.post("/setnewpassword", userController.setNewPassword);
router.get("/checkauth", checkJWT);

module.exports = router;
