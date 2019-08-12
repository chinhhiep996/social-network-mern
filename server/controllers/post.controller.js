import formidable from 'formidable';
import fs from 'fs';

import Post from '../models/post.model';
import User from '../models/user.model';
import errorHandler from '../helpers/dbErrorHandler';

function listNewsFeed(req, res) {
    let following = req.profile.following;
    following.push(req.profile._id);
    
    Post.find({ postedBy: { $in: req.profile.following } })
        // .populate('comments', 'text created')
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .sort('-created')
        .exec((err, posts) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMassage(err)
                })
            }
            res.json(posts);
        })
}

function listByUser(req, res) {
    Post.find({ postedBy: req.profile._id })
        .populate('comments', 'text created')
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .sort('-created')
        .exec((err, posts) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMassage(err)
                })
            }
            res.json(posts);
        })
}

function create(req, res, next) {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            })
        }
        let post = new Post(fields);
        post.postedBy = req.profile;
        if(files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }
        post.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMassage(err)
                })
            }
            res.json(result);
        })
    })
}

function photo(req, res, next) {
    res.set("Content-Type", req.post.photo.contentType);
    return res.send(req.post.photo.data);
}

function postById(req, res, next, id) {
    Post.findById(id)
        .populate('postedBy', '_id name')
        .exec((err, post) => {
            if(err || !post) {
                return res.status(400).json({
                    error: 'Post not found'
                });
            }
            req.post = post;
            next();
        });
}

function isPoster(req, res, next) {
    let isPoster = req.post && req.auth && req.post.postById._id == req.auth._id;
    if(!isPoster) {
        return res.status(403).json({
            error: 'User is not authorized'
        });
    }
    next();
}

function remove(req, res) {
    let post = req.post;
    console.log("TCL: remove -> post", post)
    post.remove((err, deletedPost) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler.getErrorMassage(err)
            })
        }
        res.json(deletedPost);
    });
}

function like(req, res) {
    Post.findByIdAndUpdate(req.body.postId,{
        $push: {likes: req.body.userId}
    }, {new: true})
        .exec((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMassage(err)
                })
            }
            res.json(result);
        })
}

function unlike(req, res) {
    Post.findByIdAndUpdate(req.body.postId,{
        $pull: {likes: req.body.userId}
    }, {new: true})
        .exec((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMassage(err)
                })
            }
            res.json(result);
        })
}

const comment = (req, res) => {
    let comment = req.body.comment;
    comment.postedBy = req.body.userId;

    Post.findByIdAndUpdate(req.body.postId, {
        $push: {comments: comment}
    }, {new: true})
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .exec((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMassage(err)
                })
            }
            res.json(result);
        })
}

const uncomment = (req, res) => {
    let comment = req.body.comment;

    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {comments: {_id: comment._id}}
    }, {new: true})
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .exec((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMassage(err)
                })
            }
            res.json(result);
        })
}


export default { 
    listNewsFeed, 
    listByUser, 
    create, 
    photo, 
    postById, 
    isPoster, 
    remove, 
    like, 
    unlike, 
    comment,
    uncomment
};