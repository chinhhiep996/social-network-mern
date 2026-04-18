import _ from 'lodash';
import fs from 'fs';
import formidable from 'formidable';

import User from '../models/user.model';
import errorHandler from '../helpers/dbErrorHandler';
import profileImage from './../../client/assets/images/profile-pic.png';

const create = async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        return res.status(200).json({
            message: 'Successfully signed up!'
        });
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

const list = async (req, res) => {
    try {
        let users = await User.find().select('name email updated created');
        res.json(users);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

const userByID = async (req, res, next, id) => {
    try {
        let user = await User.findById(id)
            .populate('following', '_id name')
            .populate('followers', '_id name');
        if (!user)
            return res.status(400).json({
                error: 'User not found'
            });
        req.profile = user;
        next();
    } catch (err) {
        return res.status(400).json({
            error: 'Could not retrieve user'
        });
    }
}

const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

const update = async (req, res) => {
    let form = formidable({});
    try {
        const [fields, files] = await form.parse(req);
        let user = req.profile;
        user = _.extend(user, fields);
        user.updated = Date.now();
        if (files.photo) {
            const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;
            user.photo.data = fs.readFileSync(photo.filepath);
            user.photo.contentType = photo.mimetype;
        }
        await user.save();
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    } catch (err) {
        return res.status(400).json({
            error: "Photo could not be uploaded"
        });
    }
}

const addFollowing = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.body.userId, { $push: { following: req.body.followId } });
        next();
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

const addFollower = async (req, res) => {
    try {
        let result = await User.findByIdAndUpdate(req.body.followId, { $push: { followers: req.body.userId } }, { new: true })
            .populate('following', '_id name')
            .populate('followers', '_id name');
        result.hashed_password = undefined;
        result.salt = undefined;
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

const removeFollowing = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.body.userId, { $pull: { following: req.body.unfollowId } });
        next();
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

const removeFollower = async (req, res) => {
    try {
        let result = await User.findByIdAndUpdate(req.body.unfollowId, { $pull: { followers: req.body.userId } }, { new: true })
            .populate('following', '_id name')
            .populate('followers', '_id name');
        result.hashed_password = undefined;
        result.salt = undefined;
        res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

const findPeople = async (req, res) => {
    try {
        let following = req.profile.following;
        following.push(req.profile._id);
        let users = await User.find({ _id: { $nin: following } }).select('name');
        res.json(users);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

const photo = (req, res, next) => {
    if (req.profile.photo.data) {
        res.set("Content-Type", req.profile.photo.contentType);
        return res.send(req.profile.photo.data);
    }

    next();
}

const defaultPhoto = (req, res) => {
    return res.sendFile(process.cwd() + profileImage);
}

const remove = async (req, res) => {
    try {
        let user = req.profile;
        let deletedUser = await user.deleteOne();
        deletedUser.hashed_password = undefined;
        deletedUser.salt = undefined;
        res.json(deletedUser);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

export default { create, userByID, read, list, remove, update, photo, defaultPhoto, addFollowing, addFollower, removeFollowing, removeFollower, findPeople };