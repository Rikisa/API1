
const Hapi = require('@hapi/hapi');
const Mongoose = require('mongoose');
const Joi = require('joi');
const fs = require('fs');
const {handleFileUpload} = require('./upload');
const Boom = require('boom');
const { request, STATUS_CODES } = require('http');
const { exist, bool } = require('joi');
const database = require('mime-db');
const { boomify } = require('boom');


//Database

Mongoose.connect("mongodb://localhost:27017/IssueDB", {useNewUrlParser: true, useUnifiedTopology:true });

var ObjectId = Mongoose.Types.ObjectId;

const issueModel = Mongoose.model("issues",{
    id: ObjectId,
    title: String,
    description: String,
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
        path: "/issues/{id?}",
        handler: async(request, h) => {

            var id = request.params.id;
        

            if(id){
                    var issues = await issueModel.findById(id);
                    return h.response(issues);  
            }
            else{
                issues = await issueModel.find();
 
                return h.response(issues);
                
            }   
        } 
    },{
        method: "POST",
        path: "/issues",
        options: {
            validate: {
                payload: Joi.object ({
                   title: Joi.string().min(3).max(30),
                   description: Joi.string().required(),
                   state: Joi.string().valid("complete", "pennding").required()
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
                    description: Joi.string(),
                    state: Joi.string().valid("complete", "pennding").required()
                })
            }
        },
        handler: async(request, h) => {
            var id = request.params.id;

            var result = await issueModel.findByIdAndUpdate(id,request.payload, {new: true});
            return h.response(result);
        }
    },{
        method:"DELETE",
        path: "/issues/{id}",
        handler: async(request, h) => {

                var issues = await issueModel.findByIdAndDelete(request.params.id);
                var comments = await CommentModel.deleteMany({issueId: request.params.id});
                
                return h.response(comments, issues);
        }  
    },{ // Comments routes

        method:'POST',
        path: '/comments',
        options:{
            validate: {
                payload: Joi.object ({
                    username: Joi.string().min(3).max(30),
                    text: Joi.string().required(),
                    issueId: Joi.string().required()
                })
            }
        },
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
                    var comments = await CommentModel.find({issueId: request.params.issueId});
                    
                    return h.response(comments);
                }
                else{
                    var allcomments = await CommentModel.find();
                    return h.response(allcomments);  
                }  
        }
    },{ // Upload files
        method:'POST',
        path:'/upload/{id}',
        options:{
            payload: {
              maxBytes: 209715200,
              multipart: {
                  output: 'stream',
              },
              parse: true,
              allow: 'multipart/form-data'
        }},
        handler: async(request, h) => {
            
            var foldername = request.params.id;
            var uploadfolder = './upload/';

            const { payload } = request;
            const response = handleFileUpload(payload.file, foldername, uploadfolder);

            return response 
        }
    },{ //List of all files 
        method: 'GET',
        path: '/upload/{id}',
        handler: (request, h) => {
            var issueid = request.params.id;
            const testFolder = './upload/' + issueid;
            var list = [];

            if(!fs.existsSync(testFolder)){
                return Boom.notFound(`Folder doesn't exists`)
            }
            else{
                fs.readdir(testFolder, (err, files) => {
                    files.forEach(file => {
                        list.push(file);
                        console.log(file);
                    });
                });
            
            //if we don't have timeout list will be empty
            return new Promise((resolve, rejects) => {
                    setTimeout(() => {
                        resolve(h.response(list))
                    })
                })
            }

        }
    },{ //Download files
        method: 'GET',
        path: '/download/{id}/{filename}',
        handler: (request, h) => {
            var issueid = request.params.id;
            var filename = request.params.filename;

            return h.file('./upload/'+ issueid + '/' + filename, {
                mode: 'attachment'
            });
      }
    }
])};
