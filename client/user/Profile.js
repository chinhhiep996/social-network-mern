import React, { Component } from 'react';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from '@mui/material'
import { Navigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router-dom';

import auth from './../auth/auth-helper';
import { read } from './api-user';
import DeleteUser from './DeleteUser';
import FollowProfileButton from './../user/FollowProfileButton';
import { listByUser } from './../post/api-post';
import ProfileTabs from './ProfileTabs';
import {withRouter} from '../withRouter';

const styles = theme => ({
    root: {
        maxWidth: 600,
        margin: 'auto',
        padding: theme.spacing(3),
        marginTop: theme.spacing(5)
    },
    title: {
        margin: `${8 * 3}px 0 ${8 * 2}px`,
        color: theme.palette.protectedTitle
    },
    bigAvatar: {
        width: 60,
        height: 60,
        margin: 10
    }
});

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            posts: [],
            redirectToSignin: false,
            following: false
        }
        this.match = props.router.params
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
        this.init(this.props.router.params.userId);
    }

    componentWillReceiveProps = (props) => {
        this.init(props.router.params.userId);
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
            return <Navigate to='/signin' replace />

        return (
            <div>
                <Paper className={classes.root} elevation={4}>
                    <Typography variant="h6" className={classes.title}> Profile </Typography>
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

export default withRouter(withStyles(styles)(Profile));
