const Hapi = require('@hapi/hapi');

const Mongoose = require('mongoose');

const Joi = require('joi');
const { request } = require('wreck');


//start hapi server

const server = new Hapi.server({
    host: "localhost",
    port: 3000
});

//connect to mongodb

Mongoose.connect("mongodb://localhost:27017/IssueDB");

const issueModel = Mongoose.model("issues",{
    issueName: String,
    complete: Boolean,
    comment: String
});

//Adding issue

server.route({
    method: "POST",
    path: "/issue",
  /*  options: {
        validate: {
            payload: {
               issueName: Joi.string().min(3).required(),
                comment: Joi.string().required()
            },
            failAction: (request, h, error) => {
                return error.isJoi ? h.response(error.detaild[0]).takeover() : h.response(error).takeover();
            }
        }
    },*/
    handler: async(request, h) => {
        try {
            var issue = new issueModel(request.payload);
            var result = await issue.save();
            return h.response(result);
        } catch (error) {
            return h.respons(error).code(500);
        }
    }
});

//Getting all issues

server.route({
    method:"GET",
    path: "/issues",
    handler: async(request, h) => {
        try{
            var issues = await issueModel.find().exec();
            return h.response(issues);
        }catch(error) {
            return h.response(error).code(500);
        }
    }
});

//Getting one issue by id

server.route({
    method:"GET",
    path: "/issue/{id}",
    handler: async(request, h) => {
        try{
            var issue = await issueModel.findById(request.params.id).exec();
            return h.response(issue);
        }catch(error) {
            return h.response(error).code(500);
        }
    }
});

//Update issue

server.route({
    method:"PUT",
    path: "/issue/{id}",
   /* options:{
        validate: {
            payload: {
                issueName: Joi.string().optional(),
                comment: Joi.string().optional()
            },
            failAction: (request, h, error) => {
                return error.isJoi ? h.response(error.detaild[0]).takeover() : h.response(error).takeover();
            }
        }
    },*/
    handler: async(request, h) => {
        try{
            var result = await issueModel.findByIdAndUpdate(request.params.id,request.payload, {new: true});
            return h.response(result);
        }catch(error) {
            return h.response(error).code(500);
        }
    }
});

//Delete issue

server.route({
    method:"DELETE",
    path: "/issue/{id}",
    handler: async(request, h) => {
        try{
            var result = await issueModel.findByIdAndDelete(request.params.id);
            return h.response(result);
        }catch(error) {
            return h.response(error).code(500);
        }
    }
});


//start server

server.start();
