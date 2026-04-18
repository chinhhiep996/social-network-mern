import React, { Component } from 'react';
import { CardHeader } from '@mui/material';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Icon from '@mui/material/Icon';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Link } from 'react-router-dom';

import { comment, uncomment } from './api-post';
import auth from './../auth/auth-helper';

const styles = theme => ({
    cardHeader: {
        paddingTop: 8,
        paddingBottom: 8
    },
    smallAvatar: {
        width: 25,
        height: 25
    },
    commentField: {
        width: '96%'
    },
    commentText: {
        backgroundColor: 'white',
        padding: 8,
        margin: `2px ${8 * 2}px 2px 2px`
    },
    commentDate: {
        display: 'block',
        color: 'gray',
        fontSize: '0.8em'
    },
    commentDelete: {
        fontSize: '1.6em',
        verticalAlign: 'middle',
        cursor: 'pointer'
    }
});

class Comments extends Component {
    state = {
        text: ''
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.value })
    }

    addComment = (event) => {
        if (event.keyCode == 13 && event.target.value) {
            event.preventDefault();;
            const jwt = auth.isAuthenticated();
            comment({
                userId: jwt.user._id
            }, {
                    t: jwt.token
                }, this.props.postId, { text: this.state.text }).then((data) => {
                    if (data.error) {
                        console.log(data.error);
                    } else {
                        this.setState({ text: '' });
                        this.props.updateComments(data.comments);
                    }
                });
        }
    }

    deleteComment = comment => event => {
        const jwt = auth.isAuthenticated();

        uncomment({
            userId: jwt.user._id
        }, {
            t: jwt.token
        }, this.props.postId, comment).then((data) => {
            if(data.error) {
                console.log(data.error);
            } else {
                this.props.updateComments(data.comments);
            }
        })
    }

    render() {
        const { classes } = this.props;
        const commentBody = item => {
            return (
                <p className={classes.commentText}>
                    <Link to={`/user/${item.postedBy._id}`}>
                        {item.postedBy.name}
                    </Link>
                    <br />
                    {item.text}
                    <span className={classes.commentDate}>
                        {(new Date(item.created)).toDateString()} | 
                        {auth.isAuthenticated().user._id === item.postedBy._id &&
                            <Icon onClick={this.deleteComment(item)}
                                className={classes.commentDelete}>
                                    delete
                            </Icon>
                        }
                    </span>
                </p>
            );
        }

        return (
            <div>
                <CardHeader
                    avatar={<Avatar className={classes.smallAvatar}
                        src={`/api/users/photo/${auth.isAuthenticated().user._id}`} />}
                    title={<TextField
                        onKeyDown={this.addComment}
                        multiline
                        value={this.state.text}
                        onChange={this.handleChange('text')}
                        placeholder="Write something ..."
                        className={classes.commentField}
                        margin="normal" />}
                    className={classes.cardHeader}
                />

                {
                    this.props.comments.map((comment, i) => {
                        return <CardHeader
                            avatar={<Avatar src={comment.postedBy?._id ? `/api/users/photo/${comment.postedBy._id}` : `/api/users/defaultphoto`} />}
                            title={commentBody(comment)}
                            className={classes.cardHeader}
                            key={i}
                        />
                    })
                }
            </div>
        );
    }
}

Comments.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Comments);