const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Review = require("./review")

const imageSchema = new Schema({
    url: String,
    fileName: String
})

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})

const options = { toJSON: { virtuals: true } }
const fieldScema = new Schema({
    name: String,
    images: [imageSchema],
    type: String,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, options)

fieldScema.virtual("properties.popupText").get(function () {
    return `<a href="fields/${this._id}">${this.name}</a>`
})

fieldScema.post("findOneAndDelete", async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Field", fieldScema)