import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Card, CardContent, CardMedia } from '@mui/material';
import Typography from '@mui/material/Typography';

import seashellImg from './../assets/images/seashell.jpeg'
import auth from '../auth/auth-helper';
import { Grid } from '@mui/material';
import Newsfeed from '../post/Newsfeed';
import FindPeople from '../user/FindPeople';

const styles = theme => ({
    root: {
        flexGrow: 1,
        margin: 30
    },
    card: {
        maxWidth: 600,
        margin: 'auto',
        marginTop: 8 * 5
    },
    title: {
        padding: `${8 * 3}px ${8 * 2.5}px
    ${8 * 2}px`,
        color: theme.palette.text.secondary
    },
    media: {
        minHeight: 330
    }
});

class Home extends Component {
    state = {
        defaultPage: true
    }

    init = () => {
        if (auth.isAuthenticated()) {
            this.setState({
                defaultPage: false
            })
        } else {
            this.setState({
                defaultPage: true
            })
        }
    }

    componentDidMount = () => {
        this.init();
    }

    componentWillReceiveProps = () => {
        this.init();
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                {
                    this.state.defaultPage &&
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card className={classes.card}>
                                <Typography variant="h5" component="h2" className={classes.title}>
                                    Home Page
                                </Typography>
                                <CardMedia className={classes.media} image={seashellImg} title="Unicorn Shells" />
                                <CardContent>
                                    <Typography variant="body1" component="p">
                                        Welcome to the Social Application home page
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                }
                {
                    !this.state.defaultPage &&
                    <Grid container spacing={3}>
                        <Grid item xs={8} sm={7}>
                            <Newsfeed />
                        </Grid>
                        <Grid item xs={6} sm={5}>
                            <FindPeople />
                        </Grid>
                    </Grid>
                }
            </div>
        )
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home);