import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfoFromToken } from '../utils/jwt.utils';

type AuthContextType = {
    isAuthenticated: boolean;
    userId: string | null;
    userRol: string | null;
    setIsAuthenticated: (value: boolean) => void;
    setUserInfo: (info: { userId: string, userRol: string }) => void;
    logout: () => Promise<void>;
    reloadUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    userId: null,
    userRol: null,
    setIsAuthenticated: () => { },
    setUserInfo: () => { },
    logout: async () => { },
    reloadUserData: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [userId, setUserId] = useState<string | null>('temp-user-id');
    const [userRol, setUserRol] = useState<string | null>('usuario');

    const loadUserData = async () => {
        try {
            const skipLoginForDevelopment = true; //cambiar a false para entrar a login 
            
            if (skipLoginForDevelopment) {
                console.log('Se omite el log in (cambiar en AuthContext.tsx)');
                return; 
            }

            const token = await AsyncStorage.getItem('token');
            console.log('token: ', token);
            
            if (token) {
                const userInfo = await getUserInfoFromToken();
                if (userInfo) {
                    setUserId(userInfo.profileId);
                    await AsyncStorage.setItem('userId', String(userInfo.profileId));
                    setUserRol(userInfo.rol);
                    console.log('userInfo: ', userInfo);
                    setIsAuthenticated(true);
                }
            } else {
                setIsAuthenticated(false);
                setUserId(null);
                setUserRol(null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setIsAuthenticated(false);
            setUserId(null);
            setUserRol(null);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const reloadUserData = async () => {
        await loadUserData();
    };

    const setUserInfo = (info: { userId: string, userRol: string }) => {
        setUserId(info.userId);
        setUserRol(info.userRol);
    };

    const logout = async () => {
        const skipLoginForDevelopment = true;
        
        if (!skipLoginForDevelopment) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            setUserId(null);
            setUserRol(null);
            setIsAuthenticated(false);
        } else {
            console.log('Logout desactivado en modo desarrollo');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, userRol, setIsAuthenticated, setUserInfo, logout, reloadUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useMyAuth = () => useContext(AuthContext);