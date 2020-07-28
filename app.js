const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

require('dotenv').config()

var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var passport = require('passport')
var LocalStrategy = require('passport-local')
var session = require('express-session')
var flash = require('connect-flash')

var User = require('./models/user')

var authRoutes = require('./routes/index')
var roomRoutes = require('./routes/rooms')

let port = process.env.PORT

mongoose.connect('mongodb+srv://dbUser:anton1995@cluster0-fnigp.mongodb.net/chat?retryWrites=true&w=majority', {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})
    .then(() => console.log('DB is successfully connected'))
    .catch(err => {
        console.log('DB did not connected: ' + err.message)
    })

// set the template engine ejs
app.set('view engine', 'ejs')

// middleware
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.use(bodyParser.urlencoded({extended: true}))
app.use(flash())

// auth
app.use(session({
    secret: 'kuma zloy pes',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(function(req, res, next) {
    res.locals.currentUser = req.user
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    next()
})

// Routes
app.use(authRoutes)
app.use(roomRoutes)


// Server socker
const users = {}

io.on('connection', (socket) => {
    socket.on('newUser', (name) => {
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
        io.emit('user-online', name)
        socket.emit('scroll')
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', {message: msg, name:users[socket.id]})
    })

    socket.on('typing', (name) => {
        socket.broadcast.emit('user-typing', name)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        socket.broadcast.emit()
    })
})


// Listen port
http.listen(port, () => {
    console.log('Server is running')
})
