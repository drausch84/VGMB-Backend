var mongoose = require ("mongoose");
var router = require ("express").Router();
var passport = require ("passport");
var User = mongoose.model("User");
var auth = require ("../auth");

// our registration route
router.post("/users", function(req, res, next){
    var user = new User();
    
    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);

    user.save().then(function(){
        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

// our login route
router.post("/users/login", function(req, res, next){
    // checking to make sure an email and password was provided on the front-end
    if (!req.body.user.email){
        return res.status(422).json({errors: {email: "can't be blank"}});
    }
    if (!req.body.user.password){
        return res.status(422).json({errors: {password: "can't be blank"}});
    }
    // using local strategy to generate tokens and avoid passport from using sessions hence we set session to false
    passport.authenticate("local", {session: false}, function(err, user, info){
        if (err){return next(err);}

        if (user){
            user.token = user.generateJWT();
            return res.json({user: user.toAuthJSON()});
        }else{
            return res.status(422).json(info);
        }
    })(req, res, next);
});

// an endpoint to get the current user's auth payload from their token
// this get function is used as a failsafe in case a user is deleted from the database and their JWT is invalid
router.get("/user", auth.required, function(req, res, next){
    User.findById(req.payload.id).then(function(user){
        if (!user){ return res.sendStatus(401);}

        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

// an endpoint to update users
router.put("user", auth.required, function(req, res, next){
    User.findById(req.payload.id).then(function(user){
        if (!user){ return res.sendStatus(401);}

        // only updating fields that were actually passed to avoid setting any field to null or undefined
        if (typeof req.body.user.username !== "undefined"){
            user.username = req.body.user.username;
        }
        if (typeof req.body.user.email !== "undefined"){
            user.email = req.body.user.email;
        }
        if (typeof req.body.user.bio !== "undefined"){
            user.bio = req.body.user.bio;
        }
        if (typeof req.body.user.image !== "undefined"){
            user.image = req.body.user.image;
        }
        if (typeof req.body.user.password !== "undefined"){
            user.setPassword(req.body.user.password);
        }

        return user.save().then(function(){
            return res.json({user: user.toAuthJSON()});
        });
    }).catch(next);
});

module.exports = router;
