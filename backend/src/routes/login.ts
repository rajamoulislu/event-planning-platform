
// src/routes/login.ts
import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../../frontend/src/prisma/PrismaCilent';

const router: Router = express.Router();

interface LoginRequest {
    email: string;
    password: string;
}

router.post('/', (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const handleLogin = async () => {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET!,
                { expiresIn: '1d' }
            );

            return res.status(200).json({ token });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    handleLogin();
});

export default router;