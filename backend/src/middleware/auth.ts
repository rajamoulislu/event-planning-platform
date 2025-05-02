import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../interface';

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {  // Add return type void
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({
            message: 'Authentication required',
            success: false
        });
        return;  // Add explicit return
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as AuthenticatedRequest).user = user;
        next();
    } catch (error) {
        res.status(403).json({
            message: 'Invalid or expired token',
            success: false
        });
        return;  // Add explicit return
    }
};