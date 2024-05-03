const express = require('express')
const router = express.Router()
const Controller = require('../controllers/uploadController')

router.post('/compare', Controller.compare)
router.get('/get/:id', Controller.getOne)
router.get('/get', Controller.get)

module.exports = router