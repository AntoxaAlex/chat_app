var Room = require('../models/room')

var middlewareObj = {}

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error', 'Please login first')
    res.redirect('/login')
}

middlewareObj.checkRoomOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Room.findById(req.params.id, function(err, foundRoom) {
            if (err) {
                req.flash('error', 'Room not found')
            } else {
                if (foundRoom.author.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash('error', 'You have not an access')
                    res.redirect('/rooms')
                }
            }
        })
    } else {
        req.flash('error', 'Please login first')
        res.redirect('rooms')
    }
}

module.exports = middlewareObj
