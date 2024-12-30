import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loading from '../components/Loading';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        const isAdmin = user?.is_admin === 1;

        if (adminOnly && !isAdmin) {
            navigate('/dashboard');
            return;
        }

        setIsAuthenticated(true);
        setIsAuthorized(true);
        setIsLoading(false);
    }, [navigate]);

    if (isLoading) {
        return <Loading />;
    }

    return isAuthenticated && isAuthorized ? children : null;
};

export default ProtectedRoute; 