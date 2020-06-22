const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http);

var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    session = require("express-session"),
    flash = require("connect-flash");

var User = require("./models/user"),
    Room = require("./models/room"),
    Message = require("./models/message")

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




// routes
app.get("/", (req, res)=>{
    res.render("chat.ejs")
})

const users = {};

io.on("connection", (socket)=>{

    socket.on('new-user', (name)=>{
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
        console.log(name + " connected");
        socket.emit('scroll');
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', {message: msg, name:users[socket.id]});
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})



http.listen(3000,()=>{
    console.log("Server is running")
})
