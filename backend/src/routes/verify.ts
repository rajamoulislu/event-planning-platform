import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Block browser access middleware
const blockBrowserAccess = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== process.env.INTERNAL_API_KEY) {
        res.status(404).json({ error: 'Not Found' });
        return;
    }

    next();
};

// Token verification endpoint
router.get('/', blockBrowserAccess, (req: Request, res: Response): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ authenticated: false });
        return;
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string);
        res.status(200).json({ authenticated: true, userId: (user as any).userId });
    } catch (error) {
        res.status(401).json({ authenticated: false });
    }
});

export default router;