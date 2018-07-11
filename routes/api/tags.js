var router = require ("express").Router();
var mongoose = require ("mongoose");
var Article = mongoose.model("Article");


// a route to get set of tags used on articles
router.get("/", function(req, res, next){
    Article.find().distinct("tagList").then(function(tags){
        return res.json({tags: tags});
    }).catch(next);
});

module.exports = router;
