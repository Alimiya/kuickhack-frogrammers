const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    iin: {type: String},
    surName: {type:String},
    firstName: {type:String},
    lastName: {type:String},
    createdAt: {type:String},
    endsAt: {type:String}
})

const User = mongoose.model('User', userSchema)

module.exports = User
