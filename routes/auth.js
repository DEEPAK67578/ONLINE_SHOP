const express = require("express");

const router = express.Router();

const authController = require('../controller/auth.controller')

router.get("/signup", authController.getSignUp);

router.post("/signup", authController.postSignup);

router.get("/login",authController.getLogin);

router.post("/login",authController.postLogin);

router.post('/logout',authController.postLogout)

module.exports = router;
