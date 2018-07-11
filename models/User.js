var mongoose = require ("mongoose");
var uniqueValidator = require ("mongoose-unique-validator");
var crypto = require ("crypto");
var jwt = require ("jsonwebtoken");
var secret = require ("../config").secret;

var UserSchema = new mongoose.Schema({
    username : {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    email : {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    bio : String,
    image: String,
    hash: String,
    salt: String,
    favorites: [{type: mongoose.Schema.Types.ObjectId, ref: "Article"}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: "is already taken"});

// a method to determine if the password is valid
UserSchema.methods.validPassword = function(password){
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
    return this.hash === hash;
};
// a method to encrypt a password
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

// a method to generate a passport token
UserSchema.methods.generateJWT = function(){
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate()+ 60);

    return jwt.sign({
        id: this.id,
        username: this.username,
        exp: parseInt(exp.getTime()/ 1000),
    }, secret);
};

// a method to send back an authorization JSON
UserSchema.methods.toAuthJSON = function(){
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};

// a method to to return a user's public profile, keeping JWT and password hidden
UserSchema.methods.toProfileJSONFor = function(user){
    return {
        username: this.username,
        bio: this.bio,
        // automatically add a basic profile picture in case the user doesn't add the url for their own
        image: this.image || "https://pbs.twimg.com/profile_images/650009155458109440/zLBIYWSW.png",
        following: user ? user.isFollowing(this._id) : false
    };
};

// a method for a user to favorite an article
UserSchema.methods.favorite = function(id){
    if (this.favorites.indexOf(id) === -1){
        this.favorites.push(id);
    }

    return this.save();
};

// a method for a user to unfavorite an article 
UserSchema.methods.unfavorite = function(id){
    this.favorites.remove(id);
    return this.save();
};

// a method for a user to see if they already favorited an article
UserSchema.methods.isFavorite = function(id){
    return this.favorites.some(function(favoriteId){
        return favoriteId.toString() === id.toString();
    });
};

// a method for following another user
UserSchema.methods.follow = function(id){
    if (this.following.indexOf(id) === -1){
        this.follwoing.push(id);
    }

    return this.save();
};

// a method to unfollow another user
UserSchema.methods.unfollow = function(id){
    this.following.remove(id);
    return this.save();
};

// a method to check if a user is following another user
UserSchema.methods.isFollowing = function(id){
    return this.following.some(function(followId){
        return followId.toString() === id.toString();
    });
};

mongoose.model("User", UserSchema);