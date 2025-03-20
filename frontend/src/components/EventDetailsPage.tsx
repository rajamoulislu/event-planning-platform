/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import axios from 'axios';
import { Event } from '@/interface';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '@/css/EventDetailsPage.module.css';
import Image from 'next/image';

export default function EventDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id;

    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

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
            setTitle(response.data.title);
            setDescription(response.data.description);
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!event) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/events/${event.id}`,
                { title, description },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setEvent(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDelete = async () => {
        if (!event) return;
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/events/${event.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Error deleting event:', error);
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
                <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
                    ← Back to Dashboard
                </button>
                <h1 className={styles.title}>
                    {isEditing ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.editTitleInput}
                        />
                    ) : (
                        event.title
                    )}
                </h1>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.detailsTab}>
                    {isEditing ? (
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.editDescriptionInput}
                            rows={5}
                        />
                    ) : (
                        <p>{event.description}</p>
                    )}

                    <div className={styles.eventDate}>
                        <strong>Created:</strong> {new Date(event.createdAt).toLocaleDateString()}
                    </div>

                    {/* Feature Cards */}
                    <div className={styles.featureCardContainer}>
                        <div
                            className={styles.featureCard}
                            onClick={() => router.push(`/events/${event.id}/guests`)}
                        >
                            <Image src="/guest.jfif" alt="Guest List" className={styles.featureImage} width={500} height={300} priority />
                            <div className={styles.featureText}>
                                <h3>Guest List</h3>
                                <p>Track your guests with ease and stay organized.</p>
                            </div>
                        </div>

                        <div
                            className={styles.featureCard}
                            onClick={() => router.push(`/events/${event.id}/tasks`)}
                        >
                            <Image src="/task.png" alt="Task Scheduling" className={styles.featureImage} width={500} height={300} priority />
                            <div className={styles.featureText}>
                                <h3>Task Scheduling</h3>
                                <p>Stay on top of every task and never miss a deadline.</p>
                            </div>
                        </div>

                        <div
                            className={styles.featureCard}
                            onClick={() => router.push(`/events/${event.id}/budget`)}
                        >
                            <Image src="/budget.jfif" alt="Budgeting" className={styles.featureImage} width={500} height={300} priority />
                            <div className={styles.featureText}>
                                <h3>Budgeting</h3>
                                <p>Efficiently manage your event budget and expenses.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actionButtons}>
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className={styles.saveButton}>Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>Cancel</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className={styles.editButton}>Edit Event</button>
                        <button onClick={handleDelete} className={styles.deleteButton}>Delete Event</button>
                    </>
                )}
            </div>
        </div>
    );
}