const express = require('express')
const router = express.Router()
const Controller = require('../controllers/uploadController')
const upload = require("../middlewares/multer")

router.post('/compare', Controller.compare)
router.get('/get/:id', Controller.getOne)
router.get('/get', Controller.get)
router.post('/image', upload.single('file'), Controller.image)

module.exports = router