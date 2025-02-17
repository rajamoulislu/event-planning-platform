
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
}

interface AuthenticatedRequest extends Request {
    user?: JwtPayload | string;
}

export { LoginRequest, RegisterRequest, AuthenticatedRequest }