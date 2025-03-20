/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import axios from 'axios';
import Image from 'next/image';
import { Event } from '@/interface';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/css/Dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        // Fetch events when component mounts
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const openEventDetails = (event: Event) => {
        // Navigate to the event details page instead of showing a modal
        router.push(`/events/${event.id}`);
    };


    const createEvent = async (title: string, description: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/events',
                { title, description },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setEvents([response.data, ...events]);
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Top Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Event Dashboard</h1>
                <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>

            {/* Hero Section */}
            <div className={styles.hero}>
                <Image
                    src="/main.jpg"
                    alt="Event Banner"
                    className={styles.heroImage}
                    width={1200}  
                    height={400}  
                    priority      
                />
                <div className={styles.heroText}>
                    <h2>Plan Your Events with Elegance</h2>
                    <p>Effortlessly manage guests, schedules, and budgets all in one place.</p>
                </div>
            </div>

            {/* Events Section */}
            <div className={styles.eventsSection}>
                <div className={styles.eventsHeader}>
                    <h2>Your Events</h2>
                    <button
                        className={styles.addEventButton}
                        onClick={() => setShowCreateModal(true)}
                    >
                        + New Event
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loading}>Loading your events...</div>
                ) : (
                    <div className={styles.eventsGrid}>
                        {events.map(event => (
                            <div
                                key={event.id}
                                className={styles.eventCard}
                                onClick={() => openEventDetails(event)}
                            >
                                <h3>{event.title}</h3>
                                <p>{event.description}</p>
                                <div className={styles.eventCardFooter}>
                                    <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                                    <span>{event._count?.guests || 0} guests</span>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && (
                            <div className={styles.noEvents}>
                                <p>You don&apos;t have any events yet. Create your first event to get started!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <CreateEventModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createEvent}
                />
            )}
        </div>
    );
}

// Create Event Modal Component
function CreateEventModal({ onClose, onCreate }: any) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e:any) => {
        e.preventDefault();
        if (title.trim()) {
            onCreate(title, description);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Create New Event</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.createEventForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Event Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter event title"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Event Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter event description"
                            rows={5}
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="submit" className={styles.createButton}>Create Event</button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}