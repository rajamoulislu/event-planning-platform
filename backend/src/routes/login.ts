
// src/routes/login.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginRequest } from '@/interface';
import express, { Request, Response, Router } from 'express';
import prisma from '../../../frontend/src/prisma/PrismaClient';

const router: Router = express.Router();

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