const Mongoose = require('mongoose');

var ObjectId = Mongoose.Types.ObjectId;


exports.issueModel = Mongoose.model("issues",{
    id: ObjectId,
    title: String,
    description: String,
    state: String
});

exports.CommentModel = Mongoose.model('comments',{
    id: ObjectId,
    username: String,
    text: String,
    issueId: ObjectId
});