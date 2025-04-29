import { AuthenticatedRequest } from '@/interface';
import { authenticateToken } from '../middleware/auth';
import express, { Request, Response, Router } from 'express';
import prisma from '../../../frontend/src/prisma/PrismaClient';

const router: Router = express.Router();

// Get all tasks for an event
router.get('/:eventId/tasks', authenticateToken, (req: Request, res: Response) => {
    const fetchTasks = async () => {
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

            const tasks = await prisma.task.findMany({
                where: { eventId },
                orderBy: { startDate: 'asc' }
            });

            res.json(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({ message: 'Failed to fetch tasks' });
        }
    };

    fetchTasks();
});

// Add a task to an event
router.post('/:eventId/tasks', authenticateToken, (req: Request, res: Response) => {
    const addTask = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const userId = (req as AuthenticatedRequest).user.userId;
            const { title, description, startDate, endDate, priority, assignedTo } = req.body;

            if (!title) {
                return res.status(400).json({ message: 'Title is required' });
            }

            if (!startDate) {
                return res.status(400).json({ message: 'Start date is required' });
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

            // Create task with direct userId and eventId
            const task = await prisma.task.create({
                data: {
                    title,
                    description,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    priority,
                    assignedTo,
                    completed: false,
                    eventId,
                    userId
                }
            });

            res.status(201).json(task);
        } catch (error) {
            console.error('Error adding task:', error);
            res.status(500).json({ message: 'Failed to add task' });
        }
    };

    addTask();
});

// Update a task
router.put('/:eventId/tasks/:id', authenticateToken, (req: Request, res: Response) => {
    const updateTask = async () => {
        try {
            const taskId = parseInt(req.params.id);
            const userId = (req as AuthenticatedRequest).user.userId;
            const { title, description, startDate, endDate, completed, priority, assignedTo } = req.body;

            // Find the task and check ownership through the event
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            if (task.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to update this task' });
            }

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: {
                    title,
                    description,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : null,
                    completed: completed !== undefined ? completed : undefined,
                    priority,
                    assignedTo
                }
            });

            res.json(updatedTask);
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({ message: 'Failed to update task' });
        }
    };

    updateTask();
});

// Delete a task
router.delete('/:eventId/tasks/:id', authenticateToken, (req: Request, res: Response) => {
    const deleteTask = async () => {
        try {
            const taskId = parseInt(req.params.id);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Find the task and check ownership through the event
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            if (task.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to delete this task' });
            }

            await prisma.task.delete({
                where: { id: taskId }
            });

            res.json({ message: 'Task deleted successfully' });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({ message: 'Failed to delete task' });
        }
    };

    deleteTask();
});

// Toggle task completion status
router.patch('/:eventId/tasks/:id/toggle', authenticateToken, (req: Request, res: Response) => {
    const toggleTaskCompletion = async () => {
        try {
            const taskId = parseInt(req.params.id);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Find the task and check ownership through the event
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            if (task.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to update this task' });
            }

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: {
                    completed: !task.completed
                }
            });

            res.json(updatedTask);
        } catch (error) {
            console.error('Error toggling task completion:', error);
            res.status(500).json({ message: 'Failed to update task' });
        }
    };

    toggleTaskCompletion();
});

export default router;