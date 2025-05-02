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

    // Updated to accept all event data fields
    const createEvent = async (eventData: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/events',
                eventData,
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
                                style={event.color ? { borderLeft: `5px solid ${event.color}` } : {}}
                            >
                                <h3>{event.title}</h3>
                                <p>{event.description}</p>
                                {event.startDate && (
                                    <p className={styles.eventDate}>
                                        📅 {new Date(event.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                        {event.isAllDay ? ' (All day)' : ''}
                                    </p>
                                )}
                                <div className={styles.eventCardFooter}>
                                    <span>{new Date(event.createdAt).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
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

// Create Event Modal Component - Updated with required fields
function CreateEventModal({ onClose, onCreate }: any) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [url, setUrl] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);
    const [color, setColor] = useState('#3788d8');

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!title || !startDate) return;

        // Send all event data to the create function
        onCreate({
            title,
            description,
            startDate,
            endDate: endDate || null,
            location,
            url,
            isAllDay,
            color
        });
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
                        <label htmlFor="title">Event Title *</label>
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
                            rows={3}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="startDate">Start Date *</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter event location"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="url">URL</label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter event URL"
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="color">Color</label>
                            <input
                                type="color"
                                id="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className={styles.colorPicker}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    id="isAllDay"
                                    checked={isAllDay}
                                    onChange={(e) => setIsAllDay(e.target.checked)}
                                />
                                <span>All Day Event</span>
                            </label>
                        </div>
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