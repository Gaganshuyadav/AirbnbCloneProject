const express = require("express");
const router = express.Router({mergeParams: true}); 

const User = require("../models/user");
const passport = require("passport");

const asyncWrap = require("../utils/asyncWrap.js");
const {savedRedirectUrl} = require("../middleware(userauth).js");

const userController = require("../controllers/user.js");

//signupForm
router.get(
    "/signup",
    userController.renderSignupForm
);

//signup
router.post(
    "/signup", 
    userController.signup 
);

//LoginForm
router.get(
    "/login", 
    asyncWrap( userController.renderLoginForm )
);

//login
router.post(
    "/login", 
    savedRedirectUrl ,
    passport.authenticate("local", { failureRedirect: "/login",failureFlash: true}) , 
    asyncWrap ( userController.login )
);

//logout
router.get(
    "/logout", 
    userController.logout
);

module.exports = router;







