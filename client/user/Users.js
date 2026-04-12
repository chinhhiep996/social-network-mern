import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List, { ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Person from '@mui/icons-material/Person';
import IconButton from '@mui/material/IconButton';
import { withStyles } from '@mui/styles';

import { list } from './api-user';

const styles = theme => ({
    root: theme.mixins.gutters({
        padding: 8,
        margin: 8 * 5
    }),
    title: {
        margin: `${8 * 4}px 0 ${8 * 2}px`,
        color: theme.palette.openTitle
    },
    bigAvatar: {
        width: 60,
        height: 60,
        margin: 10
    }
});

class Users extends Component {
    state = { users: [] }

    componentDidMount = () => {
        list().then((data) => {
            if (data.error)
                console.log(error);
            else
                this.setState({ users: data })
        })
    }

    render() {
        const { classes } = this.props
        return (
            <Paper className={classes.root} elevation={4}>
                <Typography variant="h6" className={classes.title}>
                    All Users
                </Typography>
                <List dense>
                    {
                        this.state.users.map(function (user, i) {
                            return (
                                <Link to={"/user/" + user._id} key={i}>
                                    <ListItem button>
                                        <ListItemAvatar>
                                            <Avatar src={`/api/users/photo/${user._id}?${new Date().getTime()}`}
                                                className={classes.bigAvatar} 
                                            />
                                        </ListItemAvatar>
                                        <ListItemText primary={user.name} />
                                        <ListItemSecondaryAction>
                                            <IconButton>
                                                <ArrowForward />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </Link>
                            )
                        })
                    }
                </List>
            </Paper>
        )
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Users);