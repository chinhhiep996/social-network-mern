import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardActions, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import FileUpload from '@mui/icons-material/FileUpload';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Avatar from '@mui/material/Avatar';

import { read, update } from './api-user';
import auth from './../auth/auth-helper';
import {withRouter} from '../withRouter';

const styles = theme => ({
    card: {
        maxWidth: 600,
        margin: 'auto',
        textAlign: 'center',
        marginTop: 8 * 5,
        paddingBottom: 8 * 2
    },
    title: {
        margin: 8 * 2,
        color: theme.palette.protectedTitle
    },
    error: {
        verticalAlign: 'middle'
    },
    textField: {
        marginLeft: 8,
        marginRight: 8,
        width: 300
    },
    submit: {
        margin: 'auto',
        marginBottom: 8 * 2
    },
    bigAvatar: {
        width: 60,
        height: 60,
        margin: 'auto'
    },
    input: {
        display: 'none'
    },
    filename: {
        marginLeft: '10px'
    }
});

class EditProfile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '',
            about: '',
            email: '',
            password: '',
            redirectToProfile: false,
            error: ''
        }
        this.match = props.router.params;
    }

    componentDidMount = () => {
        this.userData = new FormData();
        const jwt = auth.isAuthenticated();

        read({
            userId: this.props.router.params.userId
        }, { t: jwt.token }).then((data) => {
            if (data.error)
                this.setState({ error: data.error });
            else
                this.setState({
                    id: data._id,
                    name: data.name,
                    email: data.email,
                    about: data.about
                });
        });
    }

    clickSubmit = () => {
        const jwt = auth.isAuthenticated();

        update({
            userId: this.props.router.params.userId
        }, {
            t: jwt.token
        }, this.userData).then((data) => {
            if (data.error)
                this.setState({ 
                    error: data.error 
                });
            else
                this.setState({ 
                    'redirectToProfile': true
                });
        });
    }

    handleChange = name => event => {
        const value = name === 'photo'
            ? event.target.files[0]
            : event.target.value;
        this.userData.set(name, value);
        this.setState({ [name]: value });
    }

    render() {
        const { classes } = this.props;
        const photoUrl = this.state.id
            ? `/api/users/photo/${this.state.id}?${new Date().getTime()}`
            : `/api/users/defaultphoto`;

        if (this.state.redirectToProfile)
            return (<Redirect to={'/user/' + this.state.id} />);

        return (
            <Card className={classes.card}>
                <CardContent>
                    <Typography
                        variant="h5"
                        component="h2"
                        className={classes.title}
                    >
                        Edit Profile
                    </Typography>
                    <Avatar src={photoUrl} className={classes.bigAvatar} />
                    <br />
                    <input accept="image/*" type="file"
                        onChange={this.handleChange('photo')}
                        className={classes.input}
                        id="icon-button-file" />
                    <label htmlFor="icon-button-file">
                        <Button variant="contained" color="default" component="span">
                            Upload <FileUpload />
                        </Button>
                    </label>
                    <span className={classes.filename}>
                        {this.state.photo ? this.state.photo.name : ""}
                    </span>
                    <br />
                    <TextField
                        id="name"
                        label="Name"
                        className={classes.textField}
                        value={this.state.name}
                        onChange={this.handleChange('name')}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    /><br />
                    <TextField
                        id="multiline-flexible"
                        label="About"
                        multiline
                        rows="2"
                        value={this.state.about}
                        onChange={this.handleChange('about')}
                        className={classes.textField}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    /><br />
                    <TextField
                        id="email"
                        type="email"
                        label="Email"
                        className={classes.textField}
                        value={this.state.email}
                        onChange={this.handleChange('email')}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    /><br />
                    <TextField
                        id="password"
                        type="password"
                        label="Password"
                        className={classes.textField}
                        value={this.state.password}
                        onChange={this.handleChange('password')}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    /><br />
                    {
                        this.state.error && (<Typography component="p" color="error">
                            <Icon
                                color="error"
                                className={classes.error}>
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
                        onClick={this.clickSubmit}
                        className={classes.submit}
                    >
                        Submit
                    </Button>
                </CardActions>
            </Card>
        )
    }
}

EditProfile.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withRouter(withStyles(styles)(EditProfile));