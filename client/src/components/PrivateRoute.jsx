import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, adminRequired = false, parentRequired = false }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (adminRequired && (!user || user.is_admin !== 1)) {
        return <Navigate to="/" replace />;
    }

    if (parentRequired && (!user || user.account_type !== 'PARENT')) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PrivateRoute; 