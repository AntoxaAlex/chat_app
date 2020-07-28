var express = require('express')
var router = express.Router({mergeParams: true})
var passport = require('passport')
var User = require('../models/user')
var Profile = require('../models/profile')
var multer  = require('multer')
var path = require('path')
var storage = multer.diskStorage({
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    })
var upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
        fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    }
    })

let key = process.env.CLOUDINARY_API_KEY
let secret = process.env.CLOUDINARY_API_SECRET

var cloudinary = require('cloudinary')

    cloudinary.config({
    cloud_name: 'antoxaalex',
    api_key: key,
    api_secret: secret
    })

function checkFileType(file, cb) {
    // Allowed ext
    const fileTypes = /jpeg|jpg|png|gif/
    // Check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    // Check mime
    const mimeType = fileTypes.test(file.mimetype)
    console.log(mimeType, extname)

    if (mimeType && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Only images'))
    }
}

router.get('/register', function(req, res) {
    res.render('register')
})

router.post('/register', upload.single('avatar'), (req, res) => {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log('Error: ' + err.message)
            res.redirect('/register')
        }
        cloudinary.uploader.upload(req.file.path, function(result) {
            Profile.create({
                _id: user._id,
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                userName: req.body.username,
                avatar: result.secure_url
            }, (err, profile) => {
                if (err) {
                    console.log('Error: ' + err)
                    res.redirect('/register')
                }
            })
        })
        passport.authenticate('local')(req, res, function() {
            console.log('A new user ' + req.body.username + ' is successfully registered')
            req.flash('success', 'You successfully registered as:' + req.body.username)
            res.redirect('/login')
        })
    })
})

router.get('/login', function(req, res) {
    res.render('login')
})

router.post('/login', passport.authenticate('local',
    {
        successRedirect: '/',
        successFlash: 'Welcome!',
        failureRedirect: '/login',
        failureFlash: 'Something went wrong!'
    }), function(req, res) {
    // console.log("The user "+ req.user.username +" is successfully logged in");
})

router.get('/logout', function(req, res) {
    req.logout()
    req.flash('success', 'Logged you out')
    res.redirect('/login')
    console.log('The user ' + req.body.username + ' is successfuly loged out')
})

module.exports = router
