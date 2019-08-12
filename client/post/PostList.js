import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Post from './Post';

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