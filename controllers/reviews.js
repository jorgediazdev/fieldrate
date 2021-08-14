const Review = require("../models/review")
const Field = require("../models/field")

module.exports.create = async (req, res) => {
    const { id } = req.params
    const { body, rating } = req.body
    const review = new Review({ body: body, rating: rating })
    review.author = req.user._id
    const field = await Field.findById(id)
    field.reviews.push(review)
    await field.save()
    await review.save()
    req.flash("success", "Review has been added successfully.")
    res.redirect(`/fields/${id}`)
}

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params
    await Field.findOneAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review has been deleted successfully.")
    res.redirect(`/fields/${id}`)
}