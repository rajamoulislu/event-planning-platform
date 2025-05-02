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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [url, setUrl] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);
    const [color, setColor] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (eventId) {
            if (!isNaN(Number(eventId))) {
                fetchEventDetails();
            } else {
                setError("Invalid event ID");
                setIsLoading(false);
            }
        }
    }, [eventId]);

    const fetchEventDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/');
                return;
            }

            const response = await axios.get(`/api/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const eventData = response.data;
            setEvent(eventData);
            setTitle(eventData.title || '');
            setDescription(eventData.description || '');
            setStartDate(eventData.startDate ? new Date(eventData.startDate).toISOString().split('T')[0] : '');
            setEndDate(eventData.endDate ? new Date(eventData.endDate).toISOString().split('T')[0] : '');
            setLocation(eventData.location || '');
            setUrl(eventData.url || '');
            setIsAllDay(eventData.isAllDay || false);
            setColor(eventData.color || '');
        } catch (error: any) {
            console.error('Error fetching event details:', error);
            if (error.response?.status === 404) {
                setError('Event not found. It may have been deleted or you may not have permission to view it.');
            } else {
                setError('An error occurred while loading the event. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!event) return;
        if (!title || !startDate) {
            alert('Title and start date are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/events/${eventId}`,
                {
                    title,
                    description,
                    startDate,
                    endDate: endDate || null,
                    location,
                    url,
                    isAllDay,
                    color
                },
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
            alert('Failed to update event. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!event) return;
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <span className="loader"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.error}>{error}</div>
                <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    if (!event) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.error}>Event not found</div>
                <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
                    ← Back to Dashboard
                </button>
            </div>
        );
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
                            required
                        />
                    ) : (
                        event.title
                    )}
                </h1>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.detailsTab}>
                    {isEditing ? (
                        <div className={styles.editForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={styles.editDescriptionInput}
                                    rows={5}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="startDate">Start Date *</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                        className={styles.dateInput}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="endDate">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className={styles.dateInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Event location"
                                    className={styles.textInput}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="url">URL</label>
                                <input
                                    type="url"
                                    id="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Event URL"
                                    className={styles.textInput}
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
                                        className={styles.colorInput}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={isAllDay}
                                            onChange={(e) => setIsAllDay(e.target.checked)}
                                            className={styles.checkbox}
                                        />
                                        <span>All Day Event</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.eventDetails}>
                            <p className={styles.description}>{event.description}</p>

                            {event.startDate && (
                                <div className={styles.eventMeta}>
                                    <div className={styles.eventDate}>
                                        <span className={styles.metaLabel}>Date:</span>
                                        {new Date(event.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}`}
                                        {event.isAllDay && ' (All day)'}
                                    </div>

                                    {event.location && (
                                        <div className={styles.eventLocation}>
                                            <span className={styles.metaLabel}>Location:</span> {event.location}
                                        </div>
                                    )}

                                    {event.url && (
                                        <div className={styles.eventUrl}>
                                            <span className={styles.metaLabel}>URL:</span>
                                            <a href={event.url} target="_blank" rel="noopener noreferrer">
                                                {event.url}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.eventCreated}>
                                <span className={styles.metaLabel}>Created:</span> {new Date(event.createdAt).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                            </div>
                        </div>
                    )}

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