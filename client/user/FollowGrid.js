import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import ImageList, { ImageListItem } from '@mui/material/ImageList';

const styles = theme => ({
    root: {
        paddingTop: 8 * 2,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        background: theme.palette.background.paper,
    },
    bigAvatar: {
        width: 60,
        height: 60,
        margin: 'auto'
    },
    gridList: {
        width: 500,
        height: 220,
    },
    tileText: {
        textAlign: 'center',
        marginTop: 10
    }
});

class FollowGrid extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <ImageList cellHeight={160} className={classes.gridList} cols={4}>
                    {
                        this.props.people.map((person, i) => {
                            return <ImageListItem styles={{'height': 120}} key={i}>
                                <Link to={`/user/${person._id}`}>
                                    <Avatar src={`/api/users/photo/${person._id}`} className={classes.bigAvatar} />
                                    <Typography className={classes.tileText}>
                                        {person.name}
                                    </Typography>
                                </Link>
                            </ImageListItem>
                        })
                    }
                </ImageList>
            </div>
        );
    }
}

FollowGrid.propTypes = {
    classes: PropTypes.object.isRequired,
    people: PropTypes.array.isRequired
}

export default withStyles(styles)(FollowGrid);