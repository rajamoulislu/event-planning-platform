/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// app/events/[id]/guests/page.tsx
'use client';
import axios from 'axios';
import { Event } from '@/interface';
import { Guest } from '@prisma/client';
import { useState, useEffect } from 'react';
import styles from '@/css/GuestManagement.module.css';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

export default function GuestListPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id;
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingEvent, setIsEditingEvent] = useState(false);

    // Event form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [url, setUrl] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);
    const [color, setColor] = useState('');

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

    const startEditingEvent = () => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description || '');
            setStartDate(event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '');
            setEndDate(event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '');
            setLocation(event.location || '');
            setUrl(event.url || '');
            setIsAllDay(event.isAllDay || false);
            setColor(event.color || '');
            setIsEditingEvent(true);
        }
    };

    const cancelEditingEvent = () => {
        setIsEditingEvent(false);
    };

    const updateEvent = async () => {
        if (!title || !startDate) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `/api/events/${eventId}`,
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
            setIsEditingEvent(false);
        } catch (error) {
            console.error('Error updating event:', error);
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
                <h1 className={styles.title}>{event.title} - Guest List</h1>
                {/* <button onClick={startEditingEvent} className={styles.editButton}>
                    ✏️ Edit Event
                </button> */}
            </div>

            {isEditingEvent && (
                <div className={styles.eventEditForm}>
                    <h3>Edit Event Details</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={styles.inputField}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.textareaField}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Start Date *</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.inputField}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className={styles.colorField}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={isAllDay}
                                    onChange={(e) => setIsAllDay(e.target.checked)}
                                    className={styles.checkboxField}
                                />
                                All Day Event
                            </label>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            onClick={updateEvent}
                            className={`${styles.button} ${styles.saveButton}`}
                        >
                            💾 Save Changes
                        </button>
                        <button
                            onClick={cancelEditingEvent}
                            className={`${styles.button} ${styles.cancelButton}`}
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.contentContainer}>
                <GuestList eventId={eventId as string} />
            </div>
        </div>
    );
}

// Guest List component
function GuestList({ eventId }: { eventId: string }) {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [image, setImage] = useState<string>('');
    const [rsvpDate, setRsvpDate] = useState('');
    const [isEditing, setIsEditing] = useState<number | null>(null);

    useEffect(() => {
        fetchGuests();
    }, [eventId]);

    const fetchGuests = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/events/${eventId}/guests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setGuests(response.data);
        } catch (error) {
            console.error('Error fetching guests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addGuest = async () => {
        if (!name) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/events/${eventId}/guests`,
                {
                    name,
                    image,
                    rsvpDate: rsvpDate || null
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setGuests([...guests, response.data]);

            // Reset form fields
            setName('');
            setImage('');
            setRsvpDate('');

        } catch (error) {
            console.error('Error adding guest:', error);
        }
    };

    const updateGuest = async (guestId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `/api/events/${eventId}/guests/${guestId}`,
                {
                    name,
                    image,
                    rsvpDate: rsvpDate || null
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setGuests(guests.map(guest =>
                guest.id === guestId ? response.data : guest
            ));

            // Reset form and editing state
            setName('');
            setImage('');
            setRsvpDate('');
            setIsEditing(null);

        } catch (error) {
            console.error('Error updating guest:', error);
        }
    };

    const startEditing = (guest: Guest) => {
        setName(guest.name);
        setImage(guest.image || '');
        setRsvpDate(guest.rsvpDate ? new Date(guest.rsvpDate).toISOString().split('T')[0] : '');
        setIsEditing(guest.id);
    };

    const cancelEditing = () => {
        setName('');
        setImage('');
        setRsvpDate('');
        setIsEditing(null);
    };

    const removeGuest = async (guestId: number) => {
        if (!confirm('Are you sure you want to remove this guest?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/events/${eventId}/guests/${guestId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setGuests(guests.filter(guest => guest.id !== guestId));
        } catch (error) {
            console.error('Error deleting guest:', error);
        }
    };

    const handleImageUpload = (event: any) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.guestListContainer}>
            <h3>Guest Management</h3>
            <p>Track your guests with ease and stay organized.</p>

            <div className={styles.formContainer}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputField}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.inputField}
                />
                <input
                    type="date"
                    value={rsvpDate}
                    onChange={(e) => setRsvpDate(e.target.value)}
                    className={styles.inputField}
                    placeholder="RSVP Date"
                />

                <div className={styles.buttonContainer}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => updateGuest(isEditing)}
                                className={`${styles.button} ${styles.updateButton}`}
                            >
                                ✓ Update Guest
                            </button>
                            <button
                                onClick={cancelEditing}
                                className={`${styles.button} ${styles.cancelButton}`}
                            >
                                ✕ Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={addGuest}
                            className={`${styles.button} ${styles.addButton}`}
                        >
                            ➕ Add Guest
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.guestCount}>
                <strong>Total Guests:</strong> {guests.length}
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading guests...</div>
            ) : (
                <div className={styles.guestList}>
                    {guests.length > 0 ? (
                        guests.map((guest: Guest) => (
                            <div key={guest.id} className={styles.guestCard}>
                                <div className={styles.imageWrapper}>
                                    {guest.image ? (
                                        <Image src={guest.image} width={50} height={50} alt="Guest" className={styles.guestImage} />
                                    ) : (
                                        <div className={styles.defaultImage}>
                                            {guest.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.details}>
                                    <p className={styles.guestName}>{guest.name}</p>
                                    <p className={styles.eventDate}>
                                        📅 {guest.rsvpDate ? new Date(guest.rsvpDate).toLocaleDateString() : 'No RSVP date'}
                                    </p>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => startEditing(guest)}
                                        className={styles.editButton}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => removeGuest(guest.id)}
                                        className={styles.removeButton}
                                    >
                                        ❌
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noGuests}>No guests added yet</p>
                    )}
                </div>
            )}
        </div>
    );
}