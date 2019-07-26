import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import List, { ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import ArrowForward from 'material-ui-icons/ArrowForward';
import Person from 'material-ui-icons/Person';
import IconButton from 'material-ui/IconButton';
import { withStyles } from 'material-ui/styles';

import { list } from './api-user';

const styles = theme => ({
    root: theme.mixins.gutters({
        padding: theme.spacing.unit,
        margin: theme.spacing.unit * 5
    }),
    title: {
        margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
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
                <Typography type="title" className={classes.title}>
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