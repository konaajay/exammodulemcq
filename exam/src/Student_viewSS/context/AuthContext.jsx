/* src/context/AuthContext.jsx */
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AUTH_TOKEN_KEY } from '../services/auth.constants';
import { studentService } from '../services/studentService';
import { decodeJWT, ROLE_PERMISSIONS } from '../services/auth.utils';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initUserFromToken = async (token, existingUserData = {}) => {
        const decoded = decodeJWT(token);
        if (!decoded) return null;

        const rawRole = decoded.role || (decoded.roles && decoded.roles[0]) || (decoded.authorities && decoded.authorities[0]) || existingUserData.role;
        const derivedRole = String(rawRole || '').replace('ROLE_', '').replace(/^\[/, '').replace(/\]$/, '').toUpperCase();

        let userData = {
            userId: decoded.userId || decoded.id || decoded.sub,
            email: decoded.sub || decoded.email,
            tenant: decoded.tenantDb || decoded.tenant,
            firstName: "Student",
            name: "Student",
            permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
            ...existingUserData,
            role: derivedRole
        };

        // Enrich student data from the Management Service (Port 5151)
        if (derivedRole === 'STUDENT') {
            try {
                const studentId = decoded.userId || decoded.id; 
                const data = await studentService.getStudentDashboard(studentId).catch(() => null);
                
                if (data && data.studentInfo) {
                    const info = data.studentInfo;
                    const fullName = info.studentName || info.name || "Student";
                    const names = fullName.split(' ');
                    
                    userData = {
                        ...userData,
                        firstName: names[0] || "Student",
                        lastName: names.slice(1).join(' ') || "",
                        name: fullName,
                        avatar: info.profilePicture || info.avatar || `https://ui-avatars.com/api/?name=${fullName}&background=6366f1&color=fff`,
                        phone: info.mobileNumber || info.phone,
                        email: info.emailId || userData.email
                    };
                }
            } catch (e) {
                console.warn("Management Service sync skipped:", e.message);
            }
        }

        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return userData;
    };

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            const savedUser = localStorage.getItem('auth_user');
            if (token) {
                try {
                    const userObj = savedUser ? JSON.parse(savedUser) : {};
                    // Only set local storage state initially, then refresh silently
                    if (savedUser) setUser(userObj);
                    await initUserFromToken(token, userObj);
                } catch (e) {
                    logout();
                }
            }
            setLoading(false);
        };
        restoreSession();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            const token = data.token || data.jwt;
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            return await initUserFromToken(token, { email });
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('auth_user');
        setUser(null);
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.permissions?.includes(permission)) return true;
        return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};
