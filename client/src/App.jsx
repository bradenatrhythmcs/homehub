import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChildDashboard from './pages/ChildDashboard';
import Admin from './pages/Admin';
import Passwords from './pages/Passwords';
import Bills from './pages/Bills';
import Accounts from './pages/Accounts';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { useAuth } from './contexts/AuthContext';
import ProfileSettings from './pages/ProfileSettings';

// Protected route wrapper component
const ProtectedRoute = ({ children, requireParent = false, requireAdmin = false }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireParent && user?.account_type !== 'PARENT') {
        return <Navigate to="/dashboard" />;
    }

    if (requireAdmin && user?.is_admin !== 1) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

// Admin route wrapper component
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user?.is_admin) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const AppRoutes = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/dashboard" />
                            ) : (
                                <Login />
                            )
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/dashboard" />
                            ) : (
                                <Register />
                            )
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                {user?.account_type === 'CHILD' ? <ChildDashboard /> : <Dashboard />}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/settings"
                        element={
                            <ProtectedRoute>
                                <ProfileSettings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/passwords"
                        element={
                            <ProtectedRoute requireParent={true}>
                                <Passwords />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/bills"
                        element={
                            <ProtectedRoute requireParent={true} requireAdmin={true}>
                                <Bills />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/accounts"
                        element={
                            <ProtectedRoute requireParent={true} requireAdmin={true}>
                                <Accounts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin={true}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <DarkModeProvider>
            <Router>
                <AuthProvider>
                    <AppRoutes />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
                </AuthProvider>
            </Router>
        </DarkModeProvider>
    );
};

export default App; 