
const Mongoose = require('mongoose');

const Joi = require('joi');

const Boom = require('boom');
const { string } = require('joi');

//connect to mongodb

Mongoose.connect("mongodb://localhost:27017/IssueDB");

const issueModel = Mongoose.model("issues",{
    title: String,
    body: String
});

const Comment = Mongoose.model('comment',{
    commenter: String,
    body: String
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
        path: "/issue/{id}",
        handler: async(request, h) => {
                var issue = await issueModel.findById(request.params.id).exec();
                return h.response(issue);
        } 
    },{
        method: "POST",
        path: "/issue",
        options: {
            validate: {
                payload: Joi.object ({
                   title: Joi.string().min(3).max(30),
                   body: Joi.string().required()
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
        path: "/issue/{id}",
        options:{
            validate: {
                payload: Joi.object ({
                    title: Joi.string().min(3),
                    body: Joi.string().required()
                })
            }
        },
        handler: async(request, h) => {
                var result = await issueModel.findByIdAndUpdate(request.params.id,request.payload, {new: true});
                return h.response(result);
        } 
    },{
        method:"DELETE",
        path: "/issue/{id}",
        handler: async(request, h) => {
                var result = await issueModel.findByIdAndDelete(request.params.id);
                return h.response(result);
        }  
    }
    ])
}