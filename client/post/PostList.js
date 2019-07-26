import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Card from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';

import Post from './Post';

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

class PostList extends Component {
    render() {
        return (
            <div style={{marginTop: '24px'}}>
                {
                    this.props.posts.map((post, i) => {
                        return <Post post={post} key={i} onRemove={this.props.removeUpdate} />
                    })
                }
            </div>
        );
    }
}

PostList.propTypes = {
    posts: PropTypes.array.isRequired,
    removeUpdate: PropTypes.func.isRequired
}

export default PostList;