import { ReactNode } from "react";

interface LoginRequestBody {
    email: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    token?: string;
    user?: {
        id: number;
        email: string;
    };
    message?: string;
}

interface RegisterRequestBody {
    email: string;
    password: string;
}

interface RegisterResponse {
    success: boolean;
    message: string;
    user?: {
        id: number;
        email: string;
        createdAt: Date;
    };
}


interface AuthLayoutProps {
    children: ReactNode;
    requireAuth?: boolean;
}

export type { LoginRequestBody, LoginResponse, RegisterRequestBody, RegisterResponse, AuthLayoutProps };
