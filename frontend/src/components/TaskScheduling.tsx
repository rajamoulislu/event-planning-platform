// app/events/[id]/tasks/page.tsx
'use client';
import axios from 'axios';
import { Event } from '@/interface';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '@/css/TaskScheduling.module.css';

export default function TaskSchedulingPage() {
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
                <h1 className={styles.title}>{event.title} - Task Scheduling</h1>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.tasksTab}>
                    <h3>Task Management</h3>
                    <p>Stay on top of every task and never miss a deadline.</p>
                    <div className={styles.featureContent}>
                        <div className={styles.taskControls}>
                            <button className={styles.addItemButton}>+ Add Task</button>
                        </div>
                        <div className={styles.taskList}>
                            <p className={styles.emptyListMessage}>No tasks added yet. Add your first task to get started!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}