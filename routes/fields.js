const express = require("express")
const router = express.Router()
const fields = require("../controllers/fields")
const catchAsync = require("../utilities/catchAsync")
const { isLoggedIn, isAuthor, validateFieldData } = require("../middleware")
const multer  = require('multer')
const { storage } = require("../cloudinaryConfig")
const upload = multer({ storage })

router.get("/", catchAsync(fields.index))

router.post("/", isLoggedIn, upload.array("images"), validateFieldData, catchAsync(fields.create))

router.patch("/:id", isLoggedIn, isAuthor, upload.array("images"), validateFieldData, catchAsync(fields.update))

router.delete("/:id", catchAsync(fields.delete))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(fields.renderEditForm))

router.get("/new", isLoggedIn, fields.renderNewForm)

router.get("/:id", catchAsync(fields.details))

module.exports = router