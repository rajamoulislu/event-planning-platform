// routes/budgetRoutes.js
import { AuthenticatedRequest } from '@/interface';
import { authenticateToken } from '../middleware/auth';
import express, { Request, Response, Router } from 'express';
import prisma from '../../../frontend/src/prisma/PrismaClient';

const router: Router = express.Router();

router.get('/:eventId/budget', authenticateToken, (req: Request, res: Response) => {
    const fetchBudget = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if event exists and belongs to user
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to access this event budget' });
            }

            // Find the budget associated with this event
            const budget = await prisma.budget.findFirst({
                where: { eventId }
            });

            // Get expenses related to this event
            const expenses = await prisma.expense.findMany({
                where: { eventId },
                orderBy: { date: 'desc' }
            });

            res.json({ budget, expenses });
        } catch (error) {
            console.error('Error fetching budget:', error);
            res.status(500).json({ message: 'Failed to fetch budget' });
        }
    };

    fetchBudget();
});

router.post('/:eventId/budget', authenticateToken, (req: Request, res: Response) => {
    const createBudget = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const { name, totalAmount } = req.body;
            const userId = (req as AuthenticatedRequest).user.userId;

            if (!name) {
                return res.status(400).json({ message: 'Budget name is required' });
            }

            if (!totalAmount && totalAmount !== 0) {
                return res.status(400).json({ message: 'Total amount is required' });
            }

            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to create budget for this event' });
            }

            // Check if a budget already exists for this event
            const existingBudget = await prisma.budget.findFirst({
                where: { eventId }
            });

            if (existingBudget) {
                return res.status(409).json({ message: 'A budget already exists for this event' });
            }

            // Create a new budget
            const budget = await prisma.budget.create({
                data: {
                    name,
                    totalAmount: parseFloat(totalAmount.toString()),
                    event: {
                        connect: { id: eventId }
                    },
                    createdBy: {
                        connect: { id: userId }
                    }
                }
            });

            res.status(201).json(budget);
        } catch (error) {
            console.error('Error creating budget:', error);
            res.status(500).json({ message: 'Failed to create budget', error: String(error) });
        }
    };

    createBudget();
});

// Update an existing budget
router.put('/:eventId/budget/:budgetId', authenticateToken, (req: Request, res: Response) => {
    const updateBudget = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const budgetId = parseInt(req.params.budgetId);
            const { name, totalAmount } = req.body;
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if budget exists and belongs to user's event
            const budget = await prisma.budget.findUnique({
                where: { id: budgetId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!budget) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            if (budget.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to update this budget' });
            }

            if (budget.eventId !== eventId) {
                return res.status(400).json({ message: 'Budget does not belong to specified event' });
            }

            const updatedBudget = await prisma.budget.update({
                where: { id: budgetId },
                data: {
                    name: name !== undefined ? name : undefined,
                    totalAmount: totalAmount !== undefined ? parseFloat(totalAmount.toString()) : undefined
                }
            });

            res.json(updatedBudget);
        } catch (error) {
            console.error('Error updating budget:', error);
            res.status(500).json({ message: 'Failed to update budget' });
        }
    };

    updateBudget();
});

// Delete a budget
router.delete('/:eventId/budget/:budgetId', authenticateToken, (req: Request, res: Response) => {
    const deleteBudget = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const budgetId = parseInt(req.params.budgetId);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if budget exists and belongs to user's event
            const budget = await prisma.budget.findUnique({
                where: { id: budgetId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!budget) {
                return res.status(404).json({ message: 'Budget not found' });
            }

            if (budget.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to delete this budget' });
            }

            if (budget.eventId !== eventId) {
                return res.status(400).json({ message: 'Budget does not belong to specified event' });
            }

            // Delete the budget (this will cascade delete expenses linked to this budget)
            await prisma.budget.delete({
                where: { id: budgetId }
            });

            res.json({ message: 'Budget deleted successfully' });
        } catch (error) {
            console.error('Error deleting budget:', error);
            res.status(500).json({ message: 'Failed to delete budget' });
        }
    };

    deleteBudget();
});

// Add an expense
router.post('/:eventId/expenses', authenticateToken, (req: Request, res: Response) => {
    const createExpense = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const { title, amount, date, category, notes, budgetId } = req.body;
            const userId = (req as AuthenticatedRequest).user.userId;

            if (!title) {
                return res.status(400).json({ message: 'Expense title is required' });
            }

            if (!amount && amount !== 0) {
                return res.status(400).json({ message: 'Amount is required' });
            }

            if (!date) {
                return res.status(400).json({ message: 'Date is required' });
            }

            // Check if event exists and belongs to user
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to add expenses to this event' });
            }

            // If budgetId is provided, check if the budget exists and belongs to this event
            if (budgetId) {
                const budget = await prisma.budget.findFirst({
                    where: {
                        id: parseInt(budgetId.toString()),
                        eventId
                    }
                });

                if (!budget) {
                    return res.status(404).json({ message: 'Budget not found or does not belong to this event' });
                }
            }

            // Create the expense
            const expense = await prisma.expense.create({
                data: {
                    title,
                    amount: parseFloat(amount.toString()),
                    date: new Date(date),
                    category,
                    notes,
                    event: {
                        connect: { id: eventId }
                    },
                    budget: budgetId
                        ? { connect: { id: parseInt(budgetId.toString()) } }
                        : undefined,
                    createdBy: {
                        connect: { id: userId }
                    }
                }
            });

            res.status(201).json(expense);
        } catch (error) {
            console.error('Error creating expense:', error);
            res.status(500).json({ message: 'Failed to create expense', error: String(error) });
        }
    };

    createExpense();
});

// Get all expenses for an event
router.get('/:eventId/expenses', authenticateToken, (req: Request, res: Response) => {
    const fetchExpenses = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if event exists and belongs to user
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to access this event expenses' });
            }

            // Get all expenses for the event
            const expenses = await prisma.expense.findMany({
                where: { eventId },
                orderBy: { date: 'desc' }
            });

            res.json(expenses);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            res.status(500).json({ message: 'Failed to fetch expenses' });
        }
    };

    fetchExpenses();
});

// Update an expense
router.put('/:eventId/expenses/:expenseId', authenticateToken, (req: Request, res: Response) => {
    const updateExpense = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const expenseId = parseInt(req.params.expenseId);
            const { title, amount, date, category, notes, budgetId } = req.body;
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if expense exists and belongs to user's event
            const expense = await prisma.expense.findUnique({
                where: { id: expenseId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!expense) {
                return res.status(404).json({ message: 'Expense not found' });
            }

            if (expense.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to update this expense' });
            }

            if (expense.eventId !== eventId) {
                return res.status(400).json({ message: 'Expense does not belong to specified event' });
            }

            // If budgetId is provided, check if the budget exists and belongs to this event
            if (budgetId) {
                const budget = await prisma.budget.findFirst({
                    where: {
                        id: parseInt(budgetId.toString()),
                        eventId
                    }
                });

                if (!budget) {
                    return res.status(404).json({ message: 'Budget not found or does not belong to this event' });
                }
            }

            // Update the expense
            const updatedExpense = await prisma.expense.update({
                where: { id: expenseId },
                data: {
                    title: title !== undefined ? title : undefined,
                    amount: amount !== undefined ? parseFloat(amount.toString()) : undefined,
                    date: date ? new Date(date) : undefined,
                    category: category !== undefined ? category : undefined,
                    notes: notes !== undefined ? notes : undefined,
                    budget: budgetId !== undefined
                        ? budgetId
                            ? { connect: { id: parseInt(budgetId.toString()) } }
                            : { disconnect: true }
                        : undefined
                }
            });

            res.json(updatedExpense);
        } catch (error) {
            console.error('Error updating expense:', error);
            res.status(500).json({ message: 'Failed to update expense' });
        }
    };

    updateExpense();
});

// Delete an expense
router.delete('/:eventId/expenses/:expenseId', authenticateToken, (req: Request, res: Response) => {
    const deleteExpense = async () => {
        try {
            const eventId = parseInt(req.params.eventId);
            const expenseId = parseInt(req.params.expenseId);
            const userId = (req as AuthenticatedRequest).user.userId;

            // Check if expense exists and belongs to user's event
            const expense = await prisma.expense.findUnique({
                where: { id: expenseId },
                include: {
                    event: {
                        select: { userId: true }
                    }
                }
            });

            if (!expense) {
                return res.status(404).json({ message: 'Expense not found' });
            }

            if (expense.event.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to delete this expense' });
            }

            if (expense.eventId !== eventId) {
                return res.status(400).json({ message: 'Expense does not belong to specified event' });
            }

            // Delete the expense
            await prisma.expense.delete({
                where: { id: expenseId }
            });

            res.json({ message: 'Expense deleted successfully' });
        } catch (error) {
            console.error('Error deleting expense:', error);
            res.status(500).json({ message: 'Failed to delete expense' });
        }
    };

    deleteExpense();
});

export default router;