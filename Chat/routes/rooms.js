var express = require("express"),
    router = express.Router({mergeParams: true}),
    middleware = require("../middleware/index"),
    User = require("../models/user"),
    Room = require("../models/room"),
    Message = require("../models/message")

router.get("/", middleware.isLoggedIn, function(req, res){
    res.redirect("/rooms")
})

router.get("/rooms", middleware.isLoggedIn, (req, res)=>{
    Room.find({},(err, foundRooms)=>{
        if(err){
            console.log(err.message)
        }else{
            console.log(foundRooms)
            res.render("rooms", {rooms:foundRooms, currentUser:req.user});
        }
    })
});

router.get("/new-room", middleware.isLoggedIn, (req, res)=>{
    res.render("newRoom")
})

router.post("/new-room", middleware.isLoggedIn, (req, res)=>{
    var titel = req.body.room.title;
    var description = req.body.room.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newRoom = {titel: titel, description: description, author: author}
    Room.create(newRoom, (err, room)=>{
        if(err){
            console.log(err.message)
        }else{
            res.redirect("/rooms");
        }

    })
})


router.get("/rooms/:id", middleware.isLoggedIn, (req, res)=>{
    Room.findById(req.params.id).populate("messages").exec(function(err, foundRoom){
        if(err){
            console.log(err.message)
        }else{
            res.render("chat", {room:foundRoom, currentUser:req.user});
        }
    })
})

router.get("/rooms/:id/edit-room", middleware.isLoggedIn, (req, res)=>{
    if(req.isAuthenticated()){
        Room.findById(req.params.id, function(err,foundRoom){
            res.render("editRoom", {room: foundRoom})
        })
    }
})

router.put("/rooms/:id", middleware.checkRoomOwnership, function(req, res){
    Room.findByIdAndUpdate(req.params.id, req.body.room, function(err){
        if(err){
            console.log(err);
        }else{
            // req.flash("success", "Campground was updateed");
            res.redirect("/rooms");
        }
    })
})

router.delete("/rooms/:id/delete-room", middleware.checkRoomOwnership, (req, res)=>{
    Room.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log("We have an error: " + err.message)
        }else{
            // req.flash("success", "Campground was deleted");
            res.redirect("/rooms");
        }
    })
})

router.post("/rooms/:id/message/new", middleware.isLoggedIn, (req, res)=>{
    var text = req.body.message.text;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newMessage = {text: text, author: author}
    Room.findById(req.params.id, (err, room)=>{
        if(err){
            console.log(err.message)
        }else {
            Message.create(newMessage, (err, message)=>{
                if(err){
                    console.log(err.message)
                }else {
                    if(req.xhr){
                        res.json(message)
                        message.author.id = req.user._id;
                        message.author.username = req.user.username;
                        message.save();
                        console.log(room)
                        room.messages.push(message);
                        room.save()
                        console.log("Created new message");
                    } else {
                        // res.redirect("/rooms")
                    }
                }
            })
        }
    })
})

module.exports = router;