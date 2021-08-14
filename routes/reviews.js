const express = require("express")
const router = express.Router({ mergeParams: true })
const reviews = require("../controllers/reviews")
const catchAsync = require("../utilities/catchAsync")
const Review = require("../models/review")
const Field = require("../models/field")
const { validateReviewData, isLoggedIn, isReviewAuthor } = require("../middleware")

router.post("/", isLoggedIn, validateReviewData, catchAsync(reviews.create))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.delete))

module.exports = router