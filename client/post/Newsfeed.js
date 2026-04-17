import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import auth from './../auth/auth-helper';
import PostList from './PostList';
import { listNewsFeed } from './api-post.js';
import NewPost from './NewPost';

const styles = theme => ({
    card: {
        margin: 'auto',
        paddingTop: 0,
        paddingBottom: 8 * 3
    },
    title: {
        padding: `${8 * 3}px ${8 * 2.5}px ${8 * 2}px`,
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
                <Typography variant="h6" className={classes.title}>
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