const multer = require('multer')

const storageForgeModel = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/image-forgery-detection/input/')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.toLowerCase().split(' ').join('-')
        cb(null, fileName)
    }
})

const uploadForgeModel = multer({ storage: storageForgeModel })

module.exports = uploadForgeModel