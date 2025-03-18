// src/routes/register.ts
import bcrypt from 'bcryptjs';
import { RegisterRequest } from '@/interface';
import express, { Request, Response, Router } from 'express';
import prisma from '../../../frontend/src/prisma/PrismaClient';

const router: Router = express.Router();

router.post('/', (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const handleRegister = async () => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            } 

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                },
            });

            return res.status(201).json({ message: 'User created', userId: user.id });
        } catch (error) {
            console.error('Server error:', error);
            return res.status(500).json({ error: `Error creating user: ${error}` });
        }
    };

    handleRegister();
});

export default router;
