// app/events/[id]/budget/page.tsx
'use client';
import axios from 'axios';
import { Event } from '@/interface';
import { useState, useEffect } from 'react';
import styles from '@/css/Budget.module.css';
import { useRouter, useParams } from 'next/navigation';

export default function BudgetPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id;
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setIsLoading(false);
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
                            <button className={styles.addItemButton}>+ Add Expense</button>
                        </div>
                        <div className={styles.budgetSummary}>
                            <div className={styles.budgetOverview}>
                                <div className={styles.budgetItem}>
                                    <span>Total Budget:</span>
                                    <span>$0.00</span>
                                </div>
                                <div className={styles.budgetItem}>
                                    <span>Total Expenses:</span>
                                    <span>$0.00</span>
                                </div>
                                <div className={styles.budgetItem}>
                                    <span>Remaining:</span>
                                    <span>$0.00</span>
                                </div>
                            </div>
                            <div className={styles.expenseList}>
                                <p className={styles.emptyListMessage}>No expenses added yet. Add your first expense to track your budget!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}