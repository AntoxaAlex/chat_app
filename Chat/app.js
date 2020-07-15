const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http);

require('dotenv').config();

var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    session = require("express-session"),
    flash = require("connect-flash"),
    multer  = require('multer'),
    path = require('path');

let port = process.env.PORT,
    key = process.env.CLOUDINARY_API_KEY,
    secret = process.env.CLOUDINARY_API_SECRET;

const storage = multer.diskStorage({
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
    upload = multer({
        storage: storage,
        limits:{fileSize: 1000000},
        fileFilter: (req, file, cb)=>{
            checkFileType(file, cb);
        }
    }).single('avatar')

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'antoxaalex',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



var User = require("./models/user"),
    Room = require("./models/room"),
    Message = require("./models/message"),
    Profile = require("./models/profile")

var authRoutes = require("./routes/index"),
    roomRoutes = require("./routes/rooms")


mongoose.connect("mongodb://localhost/chat", {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})
    .then(() => console.log("DB is successfully connected"))
    .catch(err =>{
        console.log("DB did not connected: " + err.message)
    })

// set the template engine ejs
app.set("view engine", "ejs");

// middleware
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

//auth
app.use(session({
    secret: 'kuma zloy pes',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(authRoutes);
app.use(roomRoutes);

//Check File Type

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




//Routes

app.post('/upload', (req, res)=>{
    upload(req, res, (err)=>{
        if(err){
            req.flash("error", "Something wrong")
            console.log(err);
            res.redirect("/rooms")
        } else {
            if(req.file == undefined){
                req.flash("error", "No file was selected")
                res.redirect("/rooms")
            }else {

                        Profile.findById(req.user._id, (err, foundProfile)=>{
                            if(err){
                                console.log(err.message)
                            }else{
                                foundProfile.avatar = "/uploads/"+req.file.filename;
                                console.log(foundProfile.avatar)
                                res.render("rooms", {profile: foundProfile})
                            }
                        })



            }
        }
    })
})


const users = {};

io.on("connection", (socket)=>{

    socket.on('newUser', (name)=>{

        users[socket.id] = name;
        console.log(name)
        socket.broadcast.emit('user-connected', name);
        io.emit('user-online', name)
        socket.emit('scroll');
    })



    socket.on('chat message', (data) => {
        io.emit('chat message', {message: data.msg, useravatar:data.avatar, name:users[socket.id]});
    });

    socket.on('typing', (name)=>{
        socket.broadcast.emit("user-typing", name)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.broadcast.emit();
    });
})








http.listen(port,()=>{
    console.log(process.env.PORT)
    console.log("Server is running")
})