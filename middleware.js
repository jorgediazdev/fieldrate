const Field = require("./models/field")
const { reviewSchema, fieldSchema } = require("./joiSchemas")
const AppError = require("./utilities/AppError")
const Review = require("./models/review")

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash("error", "You must be logged in.")
        res.redirect("/login")
    } else {
        next()
    }
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params
    const field = await Field.findById(id)
    if (field.author.equals(req.user._id)) {
        next()
    } else {
        req.flash("error", "You do not have permission to do that.")
        res.redirect(`/fields/${id}`)
    }
}

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (review.author.equals(req.user._id)) {
        next()
    } else {
        req.flash("error", "You do not have permission to do that.")
        res.redirect(`/fields/${id}`)
    }
}

const validateReviewData = (req, res, next) => {
    const result = reviewSchema.validate(req.body)
    if (result.error) {
        const message = result.error.details.map(err => err.message).join(",")
        throw new AppError(400, message)
    } else {
        next()
    }
}

const validateFieldData = (req, res, next) => {
    const result = fieldSchema.validate(req.body)
    if (result.error) {
        const message = result.error.details.map(err => err.message).join(",")
        throw new AppError(400, message)
    } else {
        next()
    }
}

module.exports = {
    isLoggedIn: isLoggedIn,
    isAuthor: isAuthor,
    validateReviewData: validateReviewData,
    isReviewAuthor: isReviewAuthor,
    validateFieldData: validateFieldData
}