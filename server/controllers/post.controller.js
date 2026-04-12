import formidable from 'formidable';
import fs from 'fs';

import Post from '../models/post.model';
import User from '../models/user.model';
import errorHandler from '../helpers/dbErrorHandler';

async function listNewsFeed(req, res) {
    try {
        let following = req.profile.following;
        following.push(req.profile._id);

        let posts = await Post.find({ postedBy: { $in: following } })
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .sort('-created');
        res.json(posts);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

async function listByUser(req, res) {
    try {
        let posts = await Post.find({ postedBy: req.profile._id })
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .sort('-created');
        res.json(posts);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

async function create(req, res) {
    let form = formidable({});
    try {
        const [fields, files] = await form.parse(req);
        let postData = {};
        for (const key in fields) {
            postData[key] = fields[key][0];
        }
        let post = new Post(postData);
        post.postedBy = req.profile;
        if (files.photo) {
            const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;
            post.photo.data = fs.readFileSync(photo.filepath);
            post.photo.contentType = photo.mimetype;
        }
        let result = await post.save();
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: 'Image could not be uploaded'
        })
    }
}

function photo(req, res, next) {
    res.set("Content-Type", req.post.photo.contentType);
    return res.send(req.post.photo.data);
}

async function postById(req, res, next, id) {
    try {
        let post = await Post.findById(id)
            .populate('postedBy', '_id name');
        if (!post) {
            return res.status(400).json({
                error: 'Post not found'
            });
        }
        req.post = post;
        next();
    } catch (err) {
        return res.status(400).json({
            error: 'Could not retrieve post'
        });
    }
}

function isPoster(req, res, next) {
    let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
    if (!isPoster) {
        return res.status(403).json({
            error: 'User is not authorized'
        });
    }
    next();
}

async function remove(req, res) {
    try {
        let post = req.post;
        let deletedPost = await post.deleteOne();
        res.json(deletedPost);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

async function like(req, res) {
    try {
        let result = await Post.findByIdAndUpdate(req.body.postId, {
            $push: { likes: req.body.userId }
        }, { new: true });
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

async function unlike(req, res) {
    try {
        let result = await Post.findByIdAndUpdate(req.body.postId, {
            $pull: { likes: req.body.userId }
        }, { new: true });
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

async function comment(req, res) {
    try {
        let comment = req.body.comment;
        comment.postedBy = req.body.userId;

        let result = await Post.findByIdAndUpdate(req.body.postId, {
            $push: { comments: comment }
        }, { new: true })
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name');
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

async function uncomment(req, res) {
    try {
        let comment = req.body.comment;
        let result = await Post.findByIdAndUpdate(req.body.postId, {
            $pull: { comments: { _id: comment._id } }
        }, { new: true })
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name');
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
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