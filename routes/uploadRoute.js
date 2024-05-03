const express = require('express')
const router = express.Router()
const Controller = require('../controllers/uploadController')
const uploadForgeModel = require("../middlewares/forgery-multer")

router.post('/compare', Controller.compare)
router.get('/get/:id', Controller.getOne)
router.get('/get', Controller.get)
router.post('/check/forgery', uploadForgeModel.single('file'), Controller.checkForForgery)

module.exports = router