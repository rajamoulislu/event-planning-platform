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
                <h1 className={styles.title}>{event.title} - Guest List</h1>
            </div>

            <div className={styles.contentContainer}>
                <GuestList eventId={eventId} />
            </div>
        </div>
    );
}

// Guest List component
function GuestList({ eventId }: any) {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [image, setImage] = useState<string>('');
    const [rsvpDate, setRsvpDate] = useState('');

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
        if (!firstName) return;

        const fullName = lastName ? `${firstName} ${lastName}` : firstName;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/events/${eventId}/guests`,
                {
                    name: fullName,
                    image: image,
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
            setFirstName('');
            setLastName('');
            setImage('');
            setRsvpDate('');

        } catch (error) {
            console.error('Error adding guest:', error);
        }
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

    // Split the name into first and last name for display
    const getNameParts = (fullName : string) => {
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            return {
                firstName: parts[0],
                lastName: parts.slice(1).join(' ')
            };
        }
        return {
            firstName: fullName,
            lastName: ''
        };
    };

    return (
        <div className={styles.guestListContainer}>
            <h3>Guest Management</h3>
            <p>Track your guests with ease and stay organized.</p>

            <div className={styles.formContainer}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles.inputField}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                />
            </div>

            <div className={styles.guestCount}>
                <strong>Total Guests:</strong> {guests.length}
            </div>

            <div className={styles.buttonContainer}>
                <button onClick={addGuest} className={`${styles.button} ${styles.addButton}`}>
                    ➕ Add Guest
                </button>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading guests...</div>
            ) : (
                <div className={styles.guestList}>
                    {guests.length > 0 ? (
                        guests.map((guest: Guest) => {
                            const { firstName, lastName } = getNameParts(guest.name);
                            return (
                                <div key={guest.id} className={styles.guestCard}>
                                    <div className={styles.imageWrapper}>
                                        {guest.image ? (
                                            <Image src={guest.image} width={50}  height={50} alt="Guest" className={styles.guestImage} />
                                        ) : (
                                            <div className={styles.defaultImage}>
                                                {firstName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.details}>
                                        <p className={styles.guestName}>{firstName} {lastName}</p>
                                        <p className={styles.eventDate}>
                                            📅 {guest.rsvpDate ? new Date(guest.rsvpDate).toLocaleDateString() : 'No RSVP date'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeGuest(guest.id)}
                                        className={styles.removeButton}
                                    >
                                        ❌
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <p className={styles.noGuests}>No guests added yet</p>
                    )}
                </div>
            )}
        </div>
    );
}