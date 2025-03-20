'use client';
import { useState } from 'react';
import styles from '@/css/GuestList.module.css'; 

type Guest = {
  firstName: string;
  lastName: string;
  image: string; 
  eventDate: string;
  createdBy: string;
};

export default function GuestManagement() {
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState<string>(''); 
  const [eventDate, setEventDate] = useState('');
  const [createdBy, setCreatedBy] = useState('');

  const addGuest = () => {
    if (!firstName || !lastName || !eventDate || !createdBy) return;
    const newGuest: Guest = { firstName, lastName, image, eventDate, createdBy };
    setGuestList([...guestList, newGuest]);
    setFirstName('');
    setLastName('');
    setImage('');
    setEventDate('');
    setCreatedBy('');
  };

  const removeGuest = () => {
    setGuestList(guestList.slice(0, guestList.length - 1));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className={styles.container}>
      <h2 className={styles.title}>Guest Management</h2>

      

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
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Created By"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          className={styles.inputField}
        />
      </div>
      <div className={styles.guestCount}>
        <strong>Total Guests:</strong> {guestList.length}
      </div>
      <div className={styles.buttonContainer}>
        <button onClick={addGuest} className={`${styles.button} ${styles.addButton}`}>
          ➕ Add Guest
        </button>
        <button onClick={removeGuest} className={`${styles.button} ${styles.removeButton}`}>
          ❌ Remove Guest
        </button>
      </div>

      <div className={styles.guestList}>
        {guestList.length > 0 ? (
          guestList.map((guest, index) => (
            <div key={index} className={styles.guestCard}>
              <div className={styles.imageWrapper}>
                {guest.image && (
                  <img src={guest.image} alt="Guest" className={styles.guestImage} />
                )}
              </div>
              <div className={styles.details}>
                <p className={styles.guestName}>{guest.firstName} {guest.lastName}</p>
                <p className={styles.eventDate}>📅 {guest.eventDate}</p>
                <p className={styles.createdBy}>Created By: {guest.createdBy}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noGuests}>No guests added yet</p>
        )}
      </div>
    </div>
  );
}
