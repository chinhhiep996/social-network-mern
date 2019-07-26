import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Card from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';

import auth from './../auth/auth-helper';
import PostList from './PostList';
import { listNewsFeed } from './api-post.js';
import NewPost from './NewPost';

const styles = theme => ({
    card: {
        margin: 'auto',
        paddingTop: 0,
        paddingBottom: theme.spacing.unit * 3
    },
    title: {
        padding: `${theme.spacing.unit * 3}px ${theme.spacing.unit * 2.5}px ${theme.spacing.unit * 2}px`,
        color: theme.palette.openTitle,
        fontSize: '1em'
    },
    media: {
        minHeight: 330
    }
});

class NewsFeed extends Component {
    state = {
        posts: []
    }

    componentDidMount = () => {
        this.loadPost();
    }

    addPost = (post) => {
        const updatePosts = this.state.posts;
        updatePosts.unshift(post);
        this.setState({
            posts: updatePosts
        });
    }

    removePost = (post) => {
        const updatePosts = this.state.posts;
        const index = updatePosts.indexOf(post);
        updatePosts.splice(index, 1);
        this.setState({
            posts: updatePosts
        });
    }

    loadPost = () => {
        const jwt = auth.isAuthenticated();

        listNewsFeed({
            userId: jwt.user._id
        }, {
                t: jwt.token
            }).then((data) => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    this.setState({
                        posts: data
                    });
                }
            })
    }

    render() {
        const { classes } = this.props;

        return (
            <Card className={classes.card}>
                <Typography type="title" className={classes.title}>
                    NewsFeed
                </Typography>
                <Divider />
                <NewPost addUpdate={this.addPost} />
                <Divider />
                <PostList removeUpdate={this.removePost} posts={this.state.posts} />
            </Card>
        );
    }
}

NewsFeed.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(NewsFeed);