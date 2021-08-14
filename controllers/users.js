const User = require("../models/user")

module.exports.renderRegisterForm = (req, res) => {
    res.render("register")
}

module.exports.create = async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username: username, email: email })
        const newUser = await User.register(user, password)
        req.login(newUser, err => {
            if (err) {
                return next(err)
            } else {
                req.flash("success", "Welcome to FieldRate")
                res.redirect("/fields")
            }
        })
    } catch (err) {
        if (err.code === 11000) {
            req.flash("error", "An account with that email already exists.")
            res.redirect("/register")
        } else {
            req.flash("error", err.message)
            res.redirect("/register")
        }
    }
}

module.exports.renderLoginForm = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/fields")
    } else {
        res.render("login")
    }
}

module.exports.login = (req, res) => {
    const originalUrl = req.session.returnTo || "/fields"
    delete req.session.returnTo
    req.flash("success", "Welcome back.")
    res.redirect(originalUrl)
}

module.exports.logout = (req, res) => {
    req.logout()
    req.flash("success", "You have been logged out.")
    res.redirect("/fields")
}