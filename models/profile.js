var mongoose = require('mongoose')

var profileSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    avatar: String
})

module.exports = mongoose.model('Profile', profileSchema)
