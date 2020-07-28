var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose')

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    profileObj: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        }
    ]
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)

