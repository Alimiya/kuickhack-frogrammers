const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
require("dotenv").config({path: "config/.env"})

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)

app.set('view engine', 'html')
app.set('layout', 'layouts/layout')

app.use('/views', express.static(path.join(__dirname + '/views')))
app.use('/public', express.static(path.join(__dirname + '/public')))

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(expressLayouts)
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

const renderRoute = require('./routes/renderRoute')
const uploadRoute = require('./routes/uploadRoute')

app.use(renderRoute)
app.use('/api', uploadRoute)

app.use((req, res, next) => {
    res.status(404).render('errors/404')
})


const start = async () => {
    try {
        await mongoose
            .connect(process.env.MONGODB_URI)
            .then(() => {
                console.log("Database is connected")
            })
            .catch((err) => {
                logger.error(err.message)
                console.error('Internal server error')
            })
        app.listen(process.env.PORT, () => {
            console.log(`http://localhost:${process.env.PORT}`)
        })
    } catch (err) {
        console.error('Internal server error')
    }
}

start()

module.exports = app