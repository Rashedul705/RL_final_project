"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { IUser } from '@/lib/models'; // We can use the interface type on frontend safely if it's just type def

// Simplified User Type for Frontend
type User = {
    _id: string; // Mongoose ID
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'manager' | 'editor' | 'user';
}

type AuthContextType = {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load from localStorage on mount
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/admin/login');
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
