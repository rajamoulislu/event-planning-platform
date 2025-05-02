// /backend/src/routes/guestRoutes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all events for the authenticated user
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
 
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
});

// Create a new event
router.post('/events', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

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
        res.status(500).json({ message: 'Failed to create event' });
    }
});

// Get event by ID
router.get('/events/:id', authenticateToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const userId = req.user.id;

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

        if (event.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized to access this event' });
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
});

// Update event
router.put('/events/:id', authenticateToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { title, description } = req.body;
        const userId = req.user.id;

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
});

// Delete event
router.delete('/events/:id', authenticateToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const userId = req.user.id;

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
});

// GUEST ROUTES

// Get all guests for an event
router.get('/events/:eventId/guests', authenticateToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const userId = req.user.id;

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
});

// Add a guest to an event
router.post('/events/:eventId/guests', authenticateToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const userId = req.user.id;
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
});

// Update a guest
router.put('/events/:eventId/guests/:id', authenticateToken, async (req, res) => {
    try {
        const guestId = parseInt(req.params.id);
        const userId = req.user.id;
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
});

// Delete a guest
router.delete('/events/:eventId/guests/:id', authenticateToken, async (req, res) => {
    try {
        const guestId = parseInt(req.params.id);
        const userId = req.user.id;

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
});

export default router;