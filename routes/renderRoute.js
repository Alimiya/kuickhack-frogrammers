const express = require('express')
const router = express.Router()
const Controller = require('../controllers/renderController')

// router.use((req, res, next) => {
//     const user = req.cookies.user;  
//     res.locals.isUser = user;
//     next();
// });

router.get('/', Controller.getIndex)

module.exports = router