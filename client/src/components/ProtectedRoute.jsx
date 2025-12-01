import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="text-center py-20">Loading user...</div>;
    }

    if (!user) {
        // Redirect to login, saving the intended location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles || !allowedRoles.includes(user.role)) {
        // User is logged in but lacks permission, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
