// src/pages/api/auth/register.ts
import { Router, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '@/prisma/PrismaClient';
import { validateEmail } from '@/utils';
import { RegisterResponse, RegisterRequestBody } from '@/interface';

const router = Router();

const registerHandler: RequestHandler<
    object,
    RegisterResponse,
    RegisterRequestBody
> = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        if (!validateEmail(email)) {
            res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
            return;
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt
            }
        });
        return;

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        return;
    }
};

router.post('/', registerHandler);

export default router;