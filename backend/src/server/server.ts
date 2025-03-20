import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticateToken } from '../middleware/auth';
import loginRouter from '../routes/login';
import registerRouter from '../routes/register';
import verifyRouter from '../routes/verify';
import guestRoutes from '../routes/guestRoutes'; // Import the guest routes
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URI,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add options preflight for all routes
app.options('*', cors(corsOptions));

// Routes
app.use('/api/auth/login', loginRouter);
app.use('/api/auth/register', registerRouter);
app.use('/api/verify-token', verifyRouter);
app.use('/api', guestRoutes);

// Protected routes
app.get('/api/protected', authenticateToken, (req: Request, res: Response) => {
    res.json({ message: 'This is a protected route' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;