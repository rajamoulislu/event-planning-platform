// app/events/[id]/budget/page.tsx
'use client';
import axios from 'axios';
import { Event, Budget, Expense } from '@/interface';
import { useState, useEffect } from 'react';
import styles from '@/css/Budget.module.css';
import { useRouter, useParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function BudgetPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id;
    const [event, setEvent] = useState<Event | null>(null);
    const [budget, setBudget] = useState<Budget | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
    const [showUpdateBudgetModal, setShowUpdateBudgetModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [expenseAmount, setExpenseAmount] = useState<number>(0);
    const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);

    // Colors for the pie chart
    const COLORS = ['#4f46e5', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    const fetchEventDetails = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEvent(response.data);
            fetchBudgetDetails();
        } catch (error) {
            console.error('Error fetching event details:', error);
            setIsLoading(false);
        }
    };

    const fetchBudgetDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/events/${eventId}/budget`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Assuming the API returns budget and expenses
            if (response.data.budget) {
                setBudget(response.data.budget);
                setTotalAmount(response.data.budget.totalAmount || 0);
            }

            if (response.data.expenses) {
                setExpenses(response.data.expenses);

                // Calculate total expenses
                const total = response.data.expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
                setExpenseAmount(total);

                // Calculate category breakdown
                const categories: { [key: string]: number } = {};
                const totalExpenseAmount = response.data.expenses.reduce(
                    (sum: number, expense: Expense) => sum + expense.amount,
                    0
                );
                response.data.expenses.forEach((expense: Expense) => {
                    const category = expense.category || 'Uncategorized';
                    categories[category] = (categories[category] || 0) + expense.amount;
                });

                // Convert to array for the chart
                const breakdownData = Object.keys(categories).map(key => {
                    const value = categories[key];
                    const percentage = ((value / totalExpenseAmount) * 100).toFixed(0);
                    return {
                        name: key,
                        value: categories[key],
                        percentage: parseInt(percentage)
                    };
                });

                setCategoryBreakdown(breakdownData);
            }
        } catch (error) {
            console.error('Error fetching budget details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBudget = async (budgetData: any) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/events/${eventId}/budget`, budgetData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchBudgetDetails();
            setShowAddBudgetModal(false);
        } catch (error) {
            console.error('Error adding budget:', error);
        }
    };

    const handleUpdateBudget = async (budgetData: any) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/events/${eventId}/budget/${budget?.id}`, budgetData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchBudgetDetails();
            setShowUpdateBudgetModal(false);
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };

    const handleAddExpense = async (expenseData: any) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/events/${eventId}/expenses`, expenseData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchBudgetDetails();
            setShowAddExpenseModal(false);
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <span className="loader"></span>
            </div>
        );
    }

    if (!event) {
        return <div className={styles.error}>Event not found</div>;
    }

    // Calculate remaining budget
    const remainingBudget = totalAmount - expenseAmount;
    const budgetPercentage = totalAmount > 0 ? (expenseAmount / totalAmount) * 100 : 0;

    // Data for the main budget usage pie chart
    const budgetData = [
        { name: 'Spent', value: expenseAmount },
        { name: 'Remaining', value: remainingBudget > 0 ? remainingBudget : 0 },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => router.push(`/events/${eventId}`)} className={styles.backButton}>
                    ← Back to Event
                </button>
                <h1 className={styles.title}>{event.title} - Budget Planning</h1>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.budgetTab}>
                    <h3>Budget Planning</h3>
                    <p>Efficiently manage your event budget and expenses.</p>

                    <div className={styles.featureContent}>
                        <div className={styles.budgetControls}>
                            {!budget ? (
                                <button
                                    className={styles.addItemButton}
                                    onClick={() => setShowAddBudgetModal(true)}
                                >
                                    + Create Budget
                                </button>
                            ) : (
                                <button
                                    className={styles.addItemButton}
                                    onClick={() => setShowAddExpenseModal(true)}
                                >
                                    + Add Expense
                                </button>
                            )}
                        </div>

                        {!budget ? (
                            <div className={styles.emptyListMessage}>
                                No budget created yet. Create a budget to start tracking expenses!
                            </div>
                        ) : (
                            <div className={styles.budgetSummary}>
                                <div className={styles.budgetVisualContainer}>
                                    <div className={styles.budgetOverview}>
                                        <div className={styles.budgetOverviewHeader}>
                                            <h4>Budget Overview</h4>
                                            <button
                                                className={styles.editButton}
                                                onClick={() => setShowUpdateBudgetModal(true)}
                                            >
                                                Edit Budget
                                            </button>
                                        </div>
                                        <div className={styles.budgetItem}>
                                            <span>Total Budget:</span>
                                            <span>${totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className={styles.budgetItem}>
                                            <span>Total Expenses:</span>
                                            <span>${expenseAmount.toFixed(2)}</span>
                                        </div>
                                        <div className={styles.budgetItem}>
                                            <span>Remaining:</span>
                                            <span>${remainingBudget.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className={styles.chartContainer}>
                                        <h4>Budget Usage</h4>
                                        <div className={styles.budgetProgressContainer}>
                                            <div className={styles.budgetProgressOuter}>
                                                <div
                                                    className={styles.budgetProgressInner}
                                                    style={{
                                                        width: `${Math.min(budgetPercentage, 100)}%`,
                                                        backgroundColor: budgetPercentage > 80 ? '#e74c3c' :
                                                            budgetPercentage > 50 ? '#f39c12' : '#2ecc71'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className={styles.budgetProgressLabel}>
                                                {budgetPercentage.toFixed(1)}% used
                                            </div>
                                        </div>

                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={budgetData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                >
                                                    <Cell key="spent" fill="#4f46e5" />
                                                    <Cell key="remaining" fill="#000000" />
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {categoryBreakdown.length > 0 && (
                                    <div className={styles.categoryBreakdown}>
                                        <h4>Expense Categories</h4>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={categoryBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, value }) => {
                                                        // Calculate percentage directly in the label function
                                                        const totalExpenseAmount = categoryBreakdown.reduce((sum, item) => sum + item.value, 0);
                                                        const actualPercent = Math.round((value / totalExpenseAmount) * 100);
                                                        return `${name} ${actualPercent}%`;
                                                    }}
                                                >
                                                    {categoryBreakdown.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                <div className={styles.expenseListContainer}>
                                    <h4>Expense List</h4>
                                    <div className={styles.expenseList}>
                                        {expenses.length === 0 ? (
                                            <p className={styles.emptyListMessage}>
                                                No expenses added yet. Add your first expense to track your budget!
                                            </p>
                                        ) : (
                                            <div className={styles.expenseTable}>
                                                <div className={styles.expenseTableHeader}>
                                                    <div>Title</div>
                                                    <div>Category</div>
                                                    <div>Date</div>
                                                    <div>Amount</div>
                                                </div>
                                                {expenses.map((expense) => (
                                                    <div key={expense.id} className={styles.expenseTableRow}>
                                                        <div>{expense.title}</div>
                                                        <div>{expense.category || 'Uncategorized'}</div>
                                                        <div>{new Date(expense.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</div>
                                                        <div>${expense.amount.toFixed(2)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Budget Modal */}
            {showAddBudgetModal && (
                <AddBudgetModal
                    onClose={() => setShowAddBudgetModal(false)}
                    onAdd={handleAddBudget}
                />
            )}

            {/* Update Budget Modal */}
            {showUpdateBudgetModal && budget && (
                <UpdateBudgetModal
                    onClose={() => setShowUpdateBudgetModal(false)}
                    onUpdate={handleUpdateBudget}
                    currentBudget={budget}
                />
            )}

            {/* Add Expense Modal */}
            {showAddExpenseModal && (
                <AddExpenseModal
                    onClose={() => setShowAddExpenseModal(false)}
                    onAdd={handleAddExpense}
                    budgetId={budget?.id}
                />
            )}
        </div>
    );
}

// Add Budget Modal Component
function AddBudgetModal({ onClose, onAdd }: any) {
    const [name, setName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!name || !totalAmount) return;

        onAdd({
            name,
            totalAmount: parseFloat(totalAmount)
        });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Create Budget</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.createForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Budget Name *</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter budget name"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="totalAmount">Total Amount *</label>
                        <input
                            type="number"
                            id="totalAmount"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            placeholder="Enter amount"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="submit" className={styles.createButton}>Create Budget</button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Update Budget Modal Component
function UpdateBudgetModal({ onClose, onUpdate, currentBudget }: any) {
    const [name, setName] = useState(currentBudget.name || '');
    const [totalAmount, setTotalAmount] = useState(currentBudget.totalAmount?.toString() || '');

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!name || !totalAmount) return;

        onUpdate({
            name,
            totalAmount: parseFloat(totalAmount)
        });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Update Budget</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.createForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Budget Name *</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter budget name"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="totalAmount">Total Amount *</label>
                        <input
                            type="number"
                            id="totalAmount"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            placeholder="Enter amount"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="submit" className={styles.updateButton}>Update Budget</button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Add Expense Modal Component
function AddExpenseModal({ onClose, onAdd, budgetId }: any) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!title || !amount || !date) return;

        onAdd({
            title,
            amount: parseFloat(amount),
            date,
            category,
            notes,
            budgetId
        });
    };

    // Common expense categories
    const categories = [
        'Venue', 'Food & Drinks', 'Decorations', 'Entertainment',
        'Transportation', 'Accommodation', 'Marketing', 'Staff', 'Other'
    ];

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Add Expense</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.createForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Expense Title *</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter expense title"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="amount">Amount *</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="date">Date *</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes"
                            rows={3}
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="submit" className={styles.createButton}>Add Expense</button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}