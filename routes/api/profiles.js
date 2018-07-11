var router = require ("express").Router();
var mongoose = require ("mongoose");
var User = mongoose.model("User");
var auth = require("../auth");

// prepopulating req.profile with user data when :username param is contained within a route
router.param("username", function(req, res, next, username){
    User.findOne({username: username}).then(function(user){
        if (!user){ return res.sendStatus(404); }

        req.profile = user;

        return next();
    }).catch(next);
});

// an endpoint to fetch a user's profile by their username, also add in functionality to be able to follow a user or not
router.get("/:username", auth.optional, function(req, res, next){
   if (req.payload){
       User.findById(req.payload.id).then(function(user){
           if (!user){ return res.json({profile: req.profile.toProfileJSONFor(false)});}

           return res.json({profile: req.profile.toProfileJSONFor(user)});
       });
   }else{
       return res.json({profile: req.profile.toProfileJSONFor(false)});
   }
});

// an endpoint for following another user
router.post("/:username/follow", auth.required, function(req, res, next){
    var profileId = req.profile._id;

    User.findById(req.payload.id).then(function(user){
        if (!user){ return res.sendStatus(401); }

        return user.follow(profileId).then(function(){
            return res.json({profile: req.profile.toProfileJSONFor(user)});
        });
    }).catch(next);
});

// an endpoint for unfollowing another user
router.delete("/:username/follow", auth.required, function(req, res, next){
    var profileId = req.profile._id;

    User.findById(req.payload.id).then(function(user){
        if (!user){ return res.sendStatus(401); }

        return user.unfollow(profileId).then(function(){
            return res.json({profile: req.profile.toProfileJSONFor(user)});
        });
    }).catch(next);
});

module.exports = router;