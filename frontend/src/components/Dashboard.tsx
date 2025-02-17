'use client';
import { useRouter } from 'next/navigation';
import styles from '@/css/Dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        Logout
                    </button>
                </div>
                <div className={styles.content}>
                    <h2 className={styles.contentTitle}>Welcome to your Dashboard</h2>
                    <p>Your content goes here...</p>
                </div>
            </div>
        </div>
    );
}