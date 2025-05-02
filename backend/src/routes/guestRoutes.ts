import { AuthenticatedRequest } from '@/interface';
import { authenticateToken } from '../middleware/auth';
import express, { Request, Response, Router } from 'express';
import prisma from '../../../frontend/src/prisma/PrismaClient';

const router: Router = express.Router();

// Get all guests for an event
router.get('/:eventId/guests', authenticateToken, (req: Request, res: Response) => {
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
router.post('/:eventId/guests', authenticateToken, (req: Request, res: Response) => {
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
router.put('/:eventId/guests/:id', authenticateToken, (req: Request, res: Response) => {
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
router.delete('/:eventId/guests/:id', authenticateToken, (req: Request, res: Response) => {
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