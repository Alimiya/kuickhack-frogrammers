const express = require('express')
const router = express.Router()
const Controller = require('../controllers/uploadController')

router.post('/compare', Controller.compare)
router.get('/get/:id', Controller.get)
router.get('/get', Controller.getOne)

module.exports = router