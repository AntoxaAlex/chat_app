var express = require("express"),
    router = express.Router({mergeParams: true}),
    middleware = require("../middleware/index"),
    User = require("../models/user"),
    Room = require("../models/room"),
    Message = require("../models/message"),
    Profile = require("../models/profile"),
    multer  = require('multer'),
    path = require('path')
    storage = multer.diskStorage({
    filename: (req, file, cb)=>{
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })
upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: (req, file, cb)=>{
        checkFileType(file, cb);
    }
});
cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'antoxaalex',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function checkFileType(file, cb){
    //Allowed ext
    const fileTypes = /jpeg|jpg|png|gif/;
    //Check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    //Check mime
    const mimeType = fileTypes.test(file.mimetype);
    console.log(mimeType, extname)

    if(mimeType && extname){
        return cb(null, true)
    } else{
        cb(new Error("Only images"))

    }
}


router.get("/", middleware.isLoggedIn, function(req, res){
    res.redirect("/rooms")
})

router.get("/rooms", middleware.isLoggedIn, (req, res)=>{
    Room.find({},(err, foundRooms)=>{
        if(err){
            console.log(err.message)
        }else{
            // console.log(foundRooms)
            Profile.findById(req.user._id, (err, foundProfile)=>{
                if(err){
                    console.log(err.message)
                }else{
                    res.render("rooms", {rooms:foundRooms, profile: foundProfile, currentUser:req.user});
                }
            })
        }
    })
});

router.get("/new-room", middleware.isLoggedIn, (req, res)=>{
    Profile.findById(req.user._id, (err, foundProfile)=>{
        res.render("newRoom", {profile: foundProfile})
    })
})

router.post("/new-room", middleware.isLoggedIn, upload.single("room[image]"), (req, res)=>{
    cloudinary.uploader.upload(req.file.path, function(result) {
        var title = req.body.room.title;
        var image = result.secure_url;
        var description = req.body.room.description;
        var password = req.body.room.password;
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newRoom = {title: title, image: image, description: description, password: password, author: author}
        Room.create(newRoom, (err, room) => {
            if (err) {
                console.log(err.message)
            } else {
                res.redirect("/rooms");
            }

        })
    })
})

router.get("/rooms/:id/checkuser", middleware.isLoggedIn, (req, res)=>{
    Room.findById(req.params.id, (err, foundRoom)=>{
        if(err){
            console.log(err.message)
        }else{
            Profile.findById(req.user._id, (err, foundProfile)=>{
                res.render("checkUser", {profile: foundProfile, room:foundRoom})
            })
        }
    })
})

router.post("/rooms/:id/join-room",  middleware.isLoggedIn, (req,res)=>{
    var password = req.body.room.password;
        Room.findById(req.params.id).populate("messages").exec(function(err, foundRoom){
            if(err){
                console.log(err.message)
            }else{
                if(password == foundRoom.password){
                    Profile.findById(req.user._id, (err, foundProfile)=>{
                        Profile.find({}, (err, foundProfiles)=>{
                                res.render("chat", {contacts: foundProfiles, room:foundRoom, profile: foundProfile})
                        })
                    })
                }else {
                    res.redirect("/rooms")
                }
            }
        })
});


router.get("/rooms/:id/edit-room", middleware.isLoggedIn, (req, res)=>{
    if(req.isAuthenticated()){
        Room.findById(req.params.id, function(err,foundRoom){
            Profile.findById(req.user._id, (err, foundProfile)=>{
                res.render("editRoom", {profile: foundProfile, room:foundRoom})
            })
        })
    }
})

router.put("/rooms/:id", middleware.checkRoomOwnership, upload.single("room[image]"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        var title = req.body.room.title;
        var description = req.body.room.description;
        var image = result.secure_url;
        Room.findByIdAndUpdate(req.params.id, {title: title, image:image, description: description}, function (err) {
            if (err) {
                console.log(err);
            } else {
                req.flash("success", "Campground was updated");
                res.redirect("/rooms");
            }
        })
    })
})

router.delete("/rooms/:id/delete-room", middleware.checkRoomOwnership, (req, res)=>{
    Room.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log("We have an error: " + err.message)
        }else{
            req.flash("success", "Campground was deleted");
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
            Profile.findById(req.user._id,(err, foundProfile)=>{
                if(err){
                    console.log(err.message)
                }else {
                    Message.create(newMessage, (err, message)=>{
                        if(err){
                            console.log(err.message)
                        }else {
                            if(req.xhr){
                                console.log("kldjfalksf: "+foundProfile)
                                res.json(message)
                                message.author.id = req.user._id;
                                message.author.username = req.user.username;
                                message.author.avatar = foundProfile.avatar
                                message.save();
                                // console.log(room)
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
        }
    })
})

router.get("/edit-profile/:id", middleware.isLoggedIn, (req, res)=>{
    Profile.findById(req.params.id, (err, foundProfile)=>{
        res.render("editProfile", {profile: foundProfile})
    })
})

router.put("/rooms/:id", middleware.checkRoomOwnership, upload.single("room[image]"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        var title = req.body.room.title;
        var description = req.body.room.description;
        var image = result.secure_url;
        Room.findByIdAndUpdate(req.params.id, {title: title, image:image, description: description}, function (err) {
            if (err) {
                console.log(err);
            } else {
                req.flash("success", "Campground was updated");
                res.redirect("/rooms");
            }
        })
    })
})

router.put("/edit-profile/:id", middleware.isLoggedIn,  upload.single("profileObj[avatar]"), (req, res)=>{
    cloudinary.uploader.upload(req.file.path, function(result) {
        var firstName = req.body.profileObj.firstName
        var lastName = req.body.profileObj.lastName
        var avatar = result.secure_url;
        Profile.findByIdAndUpdate(req.params.id, {firstName: firstName, lastName: lastName, avatar: avatar}, function (err) {
            if (err) {
                console.log(err);
            } else {
                req.flash("success", "User was updated");
                res.redirect("/rooms");
            }
        })
    })
})


module.exports = router;