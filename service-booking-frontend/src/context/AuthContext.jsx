import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
    fetchUser();
    } else {
    setLoading(false);
    }
}, []);

const fetchUser = async () => {
    try {
    const response = await api.get('/auth/me');
    setUser(response.data);
    } catch (error) {
    logout();
    } finally {
    setLoading(false);
    }
};

const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.access_token);
    await fetchUser();
    return response.data;
};

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
};

return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
    {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);