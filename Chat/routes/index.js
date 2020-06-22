var express = require("express"),
    router = express.Router({mergeParams: true}),
    passport = require("passport"),
    User = require("../models/user");

router.get("/register", function(req, res){
    res.render("register")
})

router.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log("Error: " + err.message);
            res.redirect('/register');
        }
        passport.authenticate("local")(req, res, function(){
            console.log("A new user "+ req.body.username +" is successfuly registered")
            req.flash("success", "You successfuly registered as:" + req.body.username);
            res.redirect("/");
        })
    })
})

router.get("/login", function(req, res){
    res.render("login");
})

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        successFlash: 'Welcome!',
        failureRedirect: "/login",
        failureFlash: 'Somethong went wrong!',
    }), function(req, res){
    // console.log("The user "+ req.user.username +" is successfully logged in");
})

router.get("/logout",function(req, res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/login");
    console.log("The user "+ req.body.username +" is successfuly loged out");
})

module.exports = router;