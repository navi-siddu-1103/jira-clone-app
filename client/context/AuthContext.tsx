"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    group?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("jira_user");
            const storedToken = localStorage.getItem("jira_token");

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            if (storedToken) {
                setToken(storedToken);
            }
        } catch (error) {
            console.error(
                "Failed to restore authentication:",
                error
            );

            localStorage.removeItem("jira_user");
            localStorage.removeItem("jira_token");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (user: User, token: string) => {
        localStorage.setItem(
            "jira_user",
            JSON.stringify(user)
        );

        localStorage.setItem("jira_token", token);

        setUser(user);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem("jira_user");
        localStorage.removeItem("jira_token");

        setUser(null);
        setToken(null);

        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user && !!token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};