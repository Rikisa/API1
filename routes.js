
const Hapi = require('@hapi/hapi');
const Mongoose = require('mongoose');
const Joi = require('joi');
const wreck = require('wreck');
const walk = require('walk');
const fs =require('fs');
const stream = require('stream');
const inert = require('@hapi/inert');
const path = require('path');


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
                   description: Joi.string().required(),
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
                    description: Joi.string().required(),
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
                var comments = await CommentModel.find({issueId: request.params.issueId});
                
                return h.response(comments);
            }
            var allcomments = await CommentModel.find();
            return h.response(allcomments);
        }
    },{
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
            const handleFileUpload = file => {
            return new Promise((resolve, reject) => {
                var filename = request.params.id;
                var filext = path.extname(file.hapi.filename);
                var data = file._data;
                var filepath = './upload/';

                if (!fs.existsSync(filepath)) {
                        fs.mkdirSync(filepath);

                        fs.writeFile('./upload/' + filename + filext, data, err => {
                            if (err) {
                            reject(err)
                            }
                            resolve({ message: 'Upload successfully!' })
                        })
                }
                else{
                        fs.writeFile('./upload/' + filename + filext, data, err => {
                            if (err) {
                            reject(err)
                            }
                            resolve({ message: 'Upload successfully!' })
                        })
                }
            })
        };

            const { payload } = request;
            const response = handleFileUpload(payload.file);

            return response 
        }
    },{ //List of all files 
        method: 'GET',
        path: '/upload',
        handler: async(reguest, h) => {
            const testFolder = './upload/';

            fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                console.log(file);
            });
            });
        }
    }
])};

//Function for upload



