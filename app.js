if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const uri = `${process.env.MONGODB_URI}`
const ejsMate = require("ejs-mate")
const AppError = require("./utilities/AppError")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const fieldRoutes = require("./routes/fields")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const mongoSanitize = require("express-mongo-sanitize")

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log("Mongo connection open...")
    })
    .catch((error) => {
        console.log("Mongo connection error.")
        console.log(error)
    })

const app = express()
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(express.static("public"))
app.use(mongoSanitize())

const secret = process.env.SECRET

const store = new MongoStore({
    mongoUrl: uri,
    secret: secret,
    touchAfter: 24 * 60 *60 // Time period in seconds
})

store.on("error", function(err) {
    console.log("Session store error.", err)
})

const sessionConfig = {
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Time period in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7 // Time period in milliseconds
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

app.get("/", (req, res) => {
    res.render("home")
})

app.use("/", userRoutes)

app.use("/fields", fieldRoutes)

app.use("/fields/:id/reviews", reviewRoutes)

app.all("*", (req, res, next) => {
    next(new AppError(404, "Page not found."))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) {
        err.message = "Something went wrong."
    }
    res.status(status).render("error", { err })
})


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`App listening on port ${port}...`)
})