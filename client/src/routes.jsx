import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import ProfileSettings from './pages/ProfileSettings';
import Bills from './pages/Bills';
import Accounts from './pages/Accounts';
import Passwords from './pages/Passwords';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={
                <ErrorBoundary>
                    <Home />
                </ErrorBoundary>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            } />
            <Route path="/admin" element={
                <PrivateRoute adminRequired>
                    <Admin />
                </PrivateRoute>
            } />
            <Route path="/settings" element={
                <PrivateRoute>
                    <ProfileSettings />
                </PrivateRoute>
            } />
            <Route path="/bills" element={
                <PrivateRoute parentRequired>
                    <Bills />
                </PrivateRoute>
            } />
            <Route path="/accounts" element={
                <PrivateRoute parentRequired>
                    <Accounts />
                </PrivateRoute>
            } />
            <Route path="/passwords" element={
                <PrivateRoute parentRequired>
                    <Passwords />
                </PrivateRoute>
            } />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes; 