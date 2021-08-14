const Field = require("../models/field")
const { cloudinary } = require("../cloudinaryConfig")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapboxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapboxToken })

module.exports.index = async (req, res) => {
    const fields = await Field.find({})
    res.render("fields", { fields })
}

module.exports.create = async (req, res) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const { name, location, image, price, description } = req.body
    const field = new Field({ name: name, location: location, image: image, price: price, description: description, author: req.user._id })
    field.geometry = geodata.body.features[0].geometry
    field.images = req.files.map(f => ({ url: f.path, fileName: f.filename }))
    await field.save()
    req.flash("success", "Successfully added a new field.")
    res.redirect(`/fields/${field._id}`)
}

module.exports.update = async (req, res) => {
    const { id } = req.params
    const { name, location, price, description } = req.body
    const field = await Field.findByIdAndUpdate({_id: id}, { name: name, location: location, price: price, description: description })
    const images = req.files.map(f => ({ url: f.path, fileName: f.filename }))
    field.images.push(...images)
    await field.save()
    if (req.body.deleteImages) {
        for (let fileName of req.body.deleteImages) {
            await cloudinary.uploader.destroy(fileName)
        }
        await field.updateOne({ $pull: { images: { fileName: { $in: req.body.deleteImages }}}})
    }
    req.flash("success", "Field updated successfully.")
    res.redirect(`/fields/${id}`)
}

module.exports.delete = async (req, res) => {
    const { id } = req.params
    await Field.findByIdAndDelete(id)
    req.flash("success", "Field has been deleted.")
    res.redirect("/fields")
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const field = await Field.findById(id)
    res.render("edit", { field })
}

module.exports.renderNewForm = (req, res) => {
    res.render("new")
}

module.exports.details = async (req, res) => {
    const { id } = req.params
    const field = await Field.findById(id).populate({ path: "reviews", populate: { path: "author" }}).populate("author")
    if (!field) {
        req.flash("error", "Field not found.")
        return res.redirect("/fields")
    }
    res.render("details", { field })
}