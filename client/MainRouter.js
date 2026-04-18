import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from './core/Home';
import Menu from './core/Menu';
import Users from './user/Users';
import Signup from './user/Signup';
import Signin from './auth/Signin';
import Profile from './user/Profile';
import EditProfile from './user/EditProfile';
import PrivateRoute from './auth/PrivateRoute';
import ChatPage from './chat/ChatPage';

const MainRouter = () => {
    return (
        <div>
            <Menu />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/users" element={<Users />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route 
                    path="/user/edit/:userId" 
                    element={
                        <PrivateRoute>
                            <EditProfile />
                        </PrivateRoute>
                    } 
                />
                <Route path="/user/:userId" element={<Profile />} />
                <Route 
                    path="/chat" 
                    element={
                        <PrivateRoute>
                            <ChatPage />
                        </PrivateRoute>
                    } 
                />
            </Routes>
        </div>
    );
}

export default MainRouter;