// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../interface';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({
            message: 'Authentication required',
            success: false
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if (typeof decoded === 'object') {
            (req as AuthenticatedRequest).user = {
                userId: (decoded as any).userId,
                email: (decoded as any).email
            };
            next();
        } else {
            throw new Error('Invalid token format');
        }
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(403).json({
            message: 'Invalid or expired token',
            success: false
        });
        return;
    }
}