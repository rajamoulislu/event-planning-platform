import { AuthenticatedRequest } from '@/interface';
import { authenticateToken } from '../middleware/auth';
import express, { Request, Response, Router } from 'express';
import prisma from '../../../frontend/src/prisma/PrismaClient';

const router: Router = express.Router();

// Get all events for the authenticated user
router.get('/', authenticateToken, (req: Request, res: Response) => {
    const fetchEvents = async () => {
        try {
            const userId = (req as AuthenticatedRequest).user.userId;

            const events = await prisma.event.findMany({
                where: { userId },
                include: {
                    _count: {
                        select: { guests: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Failed to fetch events' });
        }
    };

    fetchEvents();
});

// Get event by ID
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
    const fetchEvent = async () => {
        try {
            const eventId = parseInt(req.params.id);
            const userId = (req as AuthenticatedRequest).user.userId;

            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    _count: {
                        select: { guests: true }
                    }
                }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to access this event' });
            }

            res.json(event);
        } catch (error) {
            console.error('Error fetching event:', error);
            res.status(500).json({ message: 'Failed to fetch event' });
        }
    };

    fetchEvent();
});

// Create a new event
router.post('/', authenticateToken, (req: Request, res: Response) => {
    const createEvent = async () => {
        try {
            const { title, description, startDate, endDate, location, url, isAllDay, color } = req.body;
            const userEmail = (req as AuthenticatedRequest).user.email;

            if (!title) {
                return res.status(400).json({ message: 'Title is required' });
            }

            if (!startDate) {
                return res.status(400).json({ message: 'Start date is required' });
            }

            // Find the user based on their email
            const user = await prisma.user.findUnique({
                where: { email: userEmail }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userId = user.id;

            const event = await prisma.event.create({
                data: {
                    title,
                    description,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    location,
                    url,
                    isAllDay: isAllDay || false,
                    color,
                    createdBy: {
                        connect: { id: userId }
                    }
                }
            });

            res.status(201).json(event);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ message: 'Failed to create event', error: String(error) });
        }
    };

    createEvent();
});

// Update event
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
    const updateEvent = async () => {
        try {
            const eventId = parseInt(req.params.id);
            const { title, description, startDate, endDate, location, url, isAllDay, color } = req.body;
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if event exists and belongs to user
            const existingEvent = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!existingEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (existingEvent.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to update this event' });
            }

            const updatedEvent = await prisma.event.update({
                where: { id: eventId },
                data: {
                    title,
                    description,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : null,
                    location,
                    url,
                    isAllDay,
                    color
                }
            });

            res.json(updatedEvent);
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Failed to update event' });
        }
    };

    updateEvent();
});

// Delete event
router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
    const deleteEvent = async () => {
        try {
            const eventId = parseInt(req.params.id);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if event exists and belongs to user
            const existingEvent = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!existingEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (existingEvent.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to delete this event' });
            }

            await prisma.event.delete({
                where: { id: eventId }
            });

            res.json({ message: 'Event deleted successfully' });
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ message: 'Failed to delete event' });
        }
    };

    deleteEvent();
});

export default router;