'use client';
import { useRouter } from 'next/navigation';
import styles from '@/css/Dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const navigateTo = (page: string) => {
        router.push(`/${page}`);
    };

    return (
        <div className={styles.container}>
            {/* Top Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>

            {/* Hero Section */}
            <div className={styles.hero}>
                <img src="/main.jpg" alt="Event Banner" className={styles.heroImage} />
                <div className={styles.heroText}>
                    <h2>Plan Your Events with Elegance</h2>
                    <p>Effortlessly manage guests, schedules, and budgets.</p>
                </div>
            </div>

            {/* Feature Sections */}
            <div className={styles.features}>
                <div className={styles.featureBox} onClick={() => navigateTo('Guest_list')}>
                    <img src="/guest.jfif" alt="Guest List" className={styles.featureImage} />
                    <h3>Guest List</h3>
                    <p>Track your guests with ease and stay organized.</p>
                </div>
                <div className={styles.featureBox} onClick={() => navigateTo('TaskScheduling')}>
                    <img src="/task.png" alt="Task Scheduling" className={styles.featureImage} />
                    <h3>Task Scheduling</h3>
                    <p>Stay on top of every task and never miss a deadline.</p>
                </div>
                <div className={styles.featureBox} onClick={() => navigateTo('Budgeting')}>
                    <img src="/budget.jfif" alt="Budgeting" className={styles.featureImage} />
                    <h3>Budgeting</h3>
                    <p>Efficiently manage your event budget and expenses.</p>
                </div>
            </div>

            {/* Event Gallery */}
            <div className={styles.gallery}>
                <h2>Recent Events</h2>
                <div className={styles.imageGrid}>
                    <img src="/event1.jpg" alt="Event 1" />
                    <img src="/event2.jpg" alt="Event 2" />
                    <img src="/event3.jfif" alt="Event 3" />
                </div>
            </div>
        </div>
    );
}
