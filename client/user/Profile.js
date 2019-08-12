import React, { Component } from 'react';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from 'material-ui/List'
import { Redirect } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Edit from 'material-ui-icons/Edit';
import Divider from 'material-ui/Divider';
import { Link } from 'react-router-dom';

import auth from './../auth/auth-helper';
import { read } from './api-user';
import DeleteUser from './DeleteUser';
import FollowProfileButton from './../user/FollowProfileButton';
import { listByUser } from './../post/api-post';
import ProfileTabs from './ProfileTabs';

const styles = theme => ({
    root: theme.mixins.gutters({
        maxWidth: 600,
        margin: 'auto',
        padding: theme.spacing.unit * 3,
        marginTop: theme.spacing.unit * 5
    }),
    title: {
        margin: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 2}px`,
        color: theme.palette.protectedTitle
    },
    bigAvatar: {
        width: 60,
        height: 60,
        margin: 10
    }
});

class Profile extends Component {
    constructor({ match }) {
        super();
        this.state = {
            user: '',
            posts: [],
            redirectToSignin: false,
            following: false
        }
        this.match = match
    }

    init = (userId) => {
        const jwt = auth.isAuthenticated();

        read({
            userId: userId
        }, { t: jwt.token }).then((data) => {
            if (data.error)
                this.setState({
                    redirectToSignin: true
                });
            else {
                let following = this.checkFollow(data);
                this.setState({
                    user: data,
                    following: following
                });
                this.loadPosts(data._id);
            }
        });
    }

    componentDidMount = () => {
        this.init(this.match.params.userId);
    }

    componentWillReceiveProps = (props) => {
        this.init(props.match.params.userId);
    }

    checkFollow = (user) => {
        const jwt = auth.isAuthenticated();
        const match = user.followers.find((follower) => {
            return follower._id == jwt.user._id;
        });
        return match;
    }

    clickFollowButton = (callApi) => {
        const jwt = auth.isAuthenticated();

        callApi({
            userId: jwt.user._id
        }, {
                t: jwt.token
            }, this.state.user._id).then((data) => {
                if (data.error) {
                    this.setState({
                        error: data.error
                    });
                } else {
                    this.setState({
                        user: data,
                        following: !this.state.following
                    });
                }
            });
    }

    removePost = (post) => {
        const updatedPosts = this.state.posts
        const index = updatedPosts.indexOf(post)
        updatedPosts.splice(index, 1)
        this.setState({ posts: updatedPosts })
        console.log(updatedPosts)
    }

    loadPosts = (user) => {
        const jwt = auth.isAuthenticated();
        listByUser({
            userId: user
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
        const redirectToSignin = this.state.redirectToSignin;
        const photoUrl = this.state.user._id
            ? `/api/users/photo/${this.state.user._id}?${new Date().getTime()}`
            : `/api/users/defaultphoto`;
        if (redirectToSignin)
            return <Redirect to='/signin' />

        return (
            <div>
                <Paper className={classes.root} elevation={4}>
                    <Typography type="title" className={classes.title}> Profile </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar src={photoUrl} className={classes.bigAvatar} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={this.state.user.name}
                                secondary={this.state.user.email}
                            />
                            {
                                auth.isAuthenticated().user && auth.isAuthenticated().user._id == this.state.user._id
                                    ? (
                                        <ListItemSecondaryAction>
                                            <Link to={`/user/edit/${this.state.user._id}`}>
                                                <IconButton color="primary">
                                                    <Edit />
                                                </IconButton>
                                            </Link>
                                            <DeleteUser userId={this.state.user._id} />
                                        </ListItemSecondaryAction>
                                    )
                                    : (
                                        <FollowProfileButton
                                            following={this.state.following}
                                            onButtonClick={this.clickFollowButton}
                                        />
                                    )
                            }
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText primary={this.state.user.about}
                                secondary={"Joined: " +
                                    (new Date(this.state.user.created)).toDateString()} />
                        </ListItem>
                    </List>
                    <ProfileTabs user={this.state.user} posts={this.state.posts} removePostUpdate={this.removePost} />
                </Paper>
            </div>
        );
    }
}

Profile.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Profile);