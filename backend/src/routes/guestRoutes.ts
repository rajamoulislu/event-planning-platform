// /backend/src/routes/guestRoutes.ts
import { AuthenticatedRequest } from '@/interface';
import { authenticateToken } from '../middleware/auth';
import express, { Request, Response, Router } from 'express';
import prisma from '../../../frontend/src/prisma/PrismaClient';

const router: Router = express.Router();

// Get all events for the authenticated user
router.get('/events', authenticateToken, (req: Request, res: Response) => {
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

// Create a new event
router.post('/events', authenticateToken, (req: Request, res: Response) => {
    const createEvent = async () => {
        try {
            const { title, description } = req.body;
            const userEmail = (req as AuthenticatedRequest).user.email;

            if (!title) {
                return res.status(400).json({ message: 'Title is required' });
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
                    userId
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

// Get event by ID
// routes/guestRoutes.ts (or wherever your event routes are defined)
router.get('/events/:id', authenticateToken, (req: Request, res: Response) => {
    const fetchEvent = async () => {
        try {
            const eventId = parseInt(req.params.id);
            // Make sure we're using the correct property name
            const userId = (req as AuthenticatedRequest).user.userId;


            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    guests: {
                        orderBy: { name: 'asc' }
                    }
                }
            });


            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Ensure we're comparing the same types
            if (Number(event.userId) !== Number(userId)) {
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

// Update event
router.put('/events/:id', authenticateToken, (req: Request, res: Response) => {
    const updateEvent = async () => {
        try {
            const eventId = parseInt(req.params.id);
            const { title, description } = req.body;
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
                data: { title, description }
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
router.delete('/events/:id', authenticateToken, (req: Request, res: Response) => {
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


// Get all guests for an event
router.get('/events/:eventId/guests', authenticateToken, (req: Request, res: Response) => {
    const fetchGuests = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if event belongs to user
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to access this event' });
            }

            const guests = await prisma.guest.findMany({
                where: { eventId },
                orderBy: { name: 'asc' }
            });

            res.json(guests);
        } catch (error) {
            console.error('Error fetching guests:', error);
            res.status(500).json({ message: 'Failed to fetch guests' });
        }
    };

    fetchGuests();
});

// Add a guest to an event
router.post('/events/:eventId/guests', authenticateToken, (req: Request, res: Response) => {
    const addGuest = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const userId = (req as AuthenticatedRequest).user.userId;
            const { name, image, rsvpDate } = req.body;

            if (!name) {
                return res.status(400).json({ message: 'Name is required' });
            }

            // Check if event belongs to user
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to modify this event' });
            }

            // Create guest with direct userId and eventId
            const guest = await prisma.guest.create({
                data: {
                    name,
                    image,
                    rsvpDate: rsvpDate ? new Date(rsvpDate) : null,
                    eventId,
                    userId
                }
            });

            res.status(201).json(guest);
        } catch (error) {
            console.error('Error adding guest:', error);
            res.status(500).json({ message: 'Failed to add guest' });
        }
    };

    addGuest();
});

// Update a guest
router.put('/events/:eventId/guests/:id', authenticateToken, (req: Request, res: Response) => {
    const updateGuest = async () => {
        try {
            const guestId = parseInt(req.params.id);
            const userId = (req as AuthenticatedRequest).user.userId;
            const { name, image, rsvpDate } = req.body;

            // Find the guest and check ownership through the event
            const guest = await prisma.guest.findUnique({
                where: { id: guestId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!guest) {
                return res.status(404).json({ message: 'Guest not found' });
            }

            if (guest.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to update this guest' });
            }

            const updatedGuest = await prisma.guest.update({
                where: { id: guestId },
                data: {
                    name,
                    image,
                    rsvpDate: rsvpDate ? new Date(rsvpDate) : null
                }
            });

            res.json(updatedGuest);
        } catch (error) {
            console.error('Error updating guest:', error);
            res.status(500).json({ message: 'Failed to update guest' });
        }
    };

    updateGuest();
});

// Delete a guest
router.delete('/events/:eventId/guests/:id', authenticateToken, (req: Request, res: Response) => {
    const deleteGuest = async () => {
        try {
            const guestId = parseInt(req.params.id);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Find the guest and check ownership through the event
            const guest = await prisma.guest.findUnique({
                where: { id: guestId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!guest) {
                return res.status(404).json({ message: 'Guest not found' });
            }

            if (guest.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to delete this guest' });
            }

            await prisma.guest.delete({
                where: { id: guestId }
            });

            res.json({ message: 'Guest deleted successfully' });
        } catch (error) {
            console.error('Error deleting guest:', error);
            res.status(500).json({ message: 'Failed to delete guest' });
        }
    };

    deleteGuest();
});

export default router;