const express = require("express")
const router = express.Router()
const users = require("../controllers/users")
const catchAsync = require("../utilities/catchAsync")
const passport = require("passport")

router.route("/register")
    .get(users.renderRegisterForm)
    .post(catchAsync(users.create))

router.route("/login")
    .get(users.renderLoginForm)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login)

router.get("/logout", users.logout)

module.exports = router