
const Mongoose = require('mongoose');

const Joi = require('joi');
const { request } = require('wreck');

//connect to mongodb

Mongoose.connect("mongodb://localhost:27017/IssueDB");

var ObjectId = Mongoose.Types.ObjectId;

const issueModel = Mongoose.model("issues",{
    id: ObjectId,
    title: String,
    state: String
});

const CommentModel = Mongoose.model('comments',{
    id: ObjectId,
    username: String,
    text: String,
    issueId: ObjectId
});


//Routes

exports.configureRoutes = (server) => {
    //server.route accepts an object of array
    return server.route([{
        method:"GET",
        path: "/issues",
        handler: async(request, h) => {
            var issues = await issueModel.find().exec();
            return h.response(issues); 
        }
    },{
        method:"GET",
        path: "/issues/{id}",
        handler: async(request, h) => {
                var issue = await issueModel.findById(request.params.id).exec();
                return h.response(issue);
        } 
    },{
        method: "POST",
        path: "/issues",
        options: {
            validate: {
                payload: Joi.object ({
                   title: Joi.string().min(3).max(30),
                   state: Joi.string().required()
                })
            }
        },
        handler: async(request, h) => {
                var issue = new issueModel(request.payload);
                var result = await issue.save();
                return h.response(result);
        } 
    },{
        method:"PUT",
        path: "/issues/{id}",
        options:{
            validate: {
                payload: Joi.object ({
                    title: Joi.string().min(3),
                    state: Joi.string().required()
                })
            }
        },
        handler: async(request, h) => {
                var result = await issueModel.findByIdAndUpdate(request.params.id,request.payload, {new: true});
                return h.response(result);
        } 
    },{
        method:"DELETE",
        path: "/issues/{id}",
        handler: async(request, h) => {
                var result = await issueModel.findByIdAndDelete(request.params.id);
                return h.response(result);
        }  
    },{ // Comments routes

        method:'POST',
        path: '/comments',
        handler: async (request, h) => {
            var comment = new CommentModel(request.payload)
            var result = await comment.save()

            return h.response(result)
        }
    },{
        method: 'GET',
        path: '/comments/{issueId?}',
        handler: async(request, h) => {
            
            if(request.params.issueId){
                var comments = await CommentModel.find(request.params.issueId);
                
                return h.response(comments);
            }
            var allcomments = await CommentModel.find();
            return h.response(allcomments);
        }
    }
    ])
}