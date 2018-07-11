var mongoose = require ("mongoose");
var uniqueValidator = require ("mongoose-unique-validator");
var slug = require ("slug");
var User = mongoose.model("User");

var ArticleSchema = new mongoose.Schema({
    slug: {type: String, lowercase: true, unique: true},
    title: String,
    description: String,
    body: String,
    favoritesCount: {type: Number, default: 0},
    tagList: [{type: String}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User"}

}, {timestamps: true});

ArticleSchema.plugin(uniqueValidator, {message: "is already taken"});

// using Mongoose middleware to invoke slugify method
ArticleSchema.pre("validate", function(next){
    if (!this.slug){
        this.slugify();
    }

    next();
});


// model method to generating unique article slugs
ArticleSchema.methods.slugify = function(){
    this.slug = slug(this.title) + "-" + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};


// a method to return the JSON of an article
ArticleSchema.methods.toJSONFor = function(user){
    return {
        slug: this.slug,
        title: this.title,
        description: this.description,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        tagList: this.tagList,
        favorited: user ? user.isFavorite(this._id) : false,
        favoritesCount: this.favoritesCount,
        author: this.author.toProfileJSONFor(user),
        comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
    };
};

// a method to see how many favorites an article has received
ArticleSchema.methods.updateFavoriteCount = function(){
    var article = this;

    return User.count({favorites: {$in: [article._id]}}).then(function(count){
        article.favoritesCount = count;

        return article.save();
    });
};

mongoose.model("Article", ArticleSchema);