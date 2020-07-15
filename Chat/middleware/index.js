var Room = require("../models/room"),
    Message = require("../models/message"),
    Contact = require("../models/profile");

var middlewareObj = {};


middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login")

}

// middlewareObj.isNameExist = function(req, res, next){
//     Contact.find({name: req.user.username}, function (err, docs) {
//         if (docs.length){
//             console.log('Name exists already');
//             res.redirect("/rooms")
//         }else{
//             next();
//         }
//     });
//
// }


middlewareObj.checkRoomOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Room.findById(req.params.id, function(err,foundRoom){
            if(err){
                req.flash("error", "Campground not found");
                // res.redirect("back");
            }else{
                if(foundRoom.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "You have not an access");
                    res.redirect("/rooms");
                }
            }
        })
    }else{
        req.flash("error", "Please login first");
        res.redirect("rooms");
    }
}

// middlewareObj.checkMessageOwnership = function(req, res, next){
//     if(req.isAuthenticated()){
//         Message.findById(req.params.comment_id, function(err,foundMessage){
//             if(err){
//                 res.redirect("back");
//             }else{
//                 if(foundMessage.author.id.equals(req.user._id)){
//                     next();
//                 }else{
//                     res.redirect("back");
//                 }
//             }
//         })
//     }else{
//         res.redirect("back");
//     }

module.exports = middlewareObj;