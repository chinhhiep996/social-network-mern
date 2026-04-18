import React, {Component} from 'react';
import { Card, CardActions, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import PropTypes from 'prop-types';
import {withStyles} from '@mui/styles';
import {Redirect} from 'react-router-dom';

import {signin} from './api-auth';
import auth from './auth-helper';
import {withRouter} from '../withRouter';

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
})

class Signin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: '',
            redirectToReferrer: false
        }
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    }

    clickSubmit = () => {
        const user = {
            email: this.state.email || undefined,
            password: this.state.password || undefined
        }
        signin(user).then((data) => {
            if (data.error)
                this.setState({
                    error: data.error
                });
            else
                auth.authenticate(data, () => {
                    this.setState({
                        redirectToReferrer: true
                    })
                });
        })
    }

    render() {
        const {classes} = this.props;
        const {from} = this.props.router.location.state || {
            from: {pathname: '/'}
        }
        const {redirectToReferrer} = this.state;
        if (redirectToReferrer)
            return (<Redirect to={from}/>);

        return (
            <Card className={classes.card}>
                <form onSubmit={(e) => { e.preventDefault(); this.clickSubmit(); }}>
                    <CardContent>
                        <Typography
                            variant="h5"
                            component="h2"
                            className={classes.title}
                        >
                            Sign In
                        </Typography>
                        <TextField
                            id="email"
                            type="email"
                            label="Email"
                            className={classes.textField}
                            value={this.state.email}
                            onChange={this.handleChange('email')}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        /><br/>
                        <TextField
                            id="password"
                            type="password"
                            label="Password"
                            className={classes.textField}
                            value={this.state.password}
                            onChange={this.handleChange('password')}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        /><br/>
                        {
                            this.state.error && (<Typography component="p" color="error">
                                <Icon
                                    color="error"
                                    className={classes.error}
                                >
                                    error
                                </Icon>
                                {this.state.error}
                            </Typography>)
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
        )
    }
}

Signin.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withRouter(withStyles(styles)(Signin));