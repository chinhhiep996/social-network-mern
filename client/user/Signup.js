import React, { Component } from 'react';
import { Card, CardActions, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';

import { create } from './api-user';

const styles = theme => ({
    card: {
        maxWidth: 600,
        margin: 'auto',
        textAlign: 'center',
        marginTop: 8 * 5,
        paddingBottom: 8 * 2
    },
    error: {
        verticalAlign: 'middle'
    },
    title: {
        marginTop: 8 * 2,
        color: theme.palette.openTitle
    },
    textField: {
        marginLeft: 8,
        marginRight: 8,
        width: 300
    },
    submit: {
        margin: 'auto',
        marginBottom: 8 * 2
    }
});

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            password: '',
            email: '',
            open: false,
            error: ''
        }
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    }

    clickSubmit = () => {
        const user = {
            name: this.state.name || undefined,
            email: this.state.email || undefined,
            password: this.state.password || undefined
        }
        create(user).then((data) => {
            if (data.error)
                this.setState({error: data.error});
            else
                this.setState({error: '', open: true});
        })
    }

    render() {
        const {classes} = this.props;
        return (
            <div>
                <Card className={classes.card}>
                <form onSubmit={(e) => { e.preventDefault(); this.clickSubmit(); }}>
                    <CardContent>
                        <Typography variant="h5" component="h2" className={classes.title}>
                            Sign Up
                        </Typography>
                        <TextField
                            id="name"
                            label="Name"
                            className={classes.textField}
                            value={this.state.name}
                            onChange={this.handleChange('name')}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        /> <br/>
                        <TextField
                            id="email"
                            type="email"
                            label="Email"
                            className={classes.textField}
                            value={this.state.email}
                            onChange={this.handleChange('email')}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        /> <br/>
                        <TextField
                            id="password"
                            type="password"
                            label="Password"
                            className={classes.textField}
                            value={this.state.password}
                            onChange={this.handleChange('password')}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        /> <br/>
                        {
                            this.state.error && (
                                <Typography component="p" color="error">
                                    <Icon
                                        color="error"
                                        className={classes.error}>
                                        error
                                    </Icon>
                                    {this.state.error}
                                </Typography>
                            )
                        }
                    </CardContent>
                    <CardActions>
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            className={classes.submit}
                        >
                            Submit
                        </Button>
                    </CardActions>
                </form>
                </Card>
                <Dialog open={this.state.open} onClose={(event, reason) => { if(reason !== 'backdropClick') this.setState({open: false}) }}>
                    <DialogTitle>New Account</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            New account successfully created.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Link to="/signin">
                            <Button
                                color="primary"
                                autoFocus="autoFocus"
                                variant="contained">
                                Sign In
                            </Button>
                        </Link>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

Signup.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Signup);