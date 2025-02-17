// src/pages/api/auth/login.ts

import { Router, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/prisma/PrismaClient';
import { LoginRequestBody, LoginResponse } from '@/interface';

const router = Router();

const loginHandler: RequestHandler<
    object,
    LoginResponse,
    LoginRequestBody
> = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true
            }
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
        return;
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        return;
    }
};

router.post('/', loginHandler);

export default router;