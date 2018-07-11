var mongoose = require ("mongoose");

var CommentSchema = new mongoose.Schema({
    body: String,
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    article: {type: mongoose.Schema.Types.ObjectId, ref: "Article"}
}, {timestamps: true});

// toJSONFor method since it requires population of author
CommentSchema.methods.toJSONFor = function(user){
    return{
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        author: this.author.toJSONFor(user)
    };
};

mongoose.model("Comment", CommentSchema);