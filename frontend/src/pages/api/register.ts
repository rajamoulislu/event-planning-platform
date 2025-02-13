// pages/api/register.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../prisma/PrismaCilent';

export interface AuthenticatedRequest extends Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
}
// pages/api/register.ts
export default async function handler(req: AuthenticatedRequest, res: Response) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Add validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error) {
        console.error('Server error:', error);  // Add this line
        res.status(500).json({ error: `Error creating user: ${error}` });
    }
}