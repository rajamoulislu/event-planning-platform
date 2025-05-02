'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '@/css/RegisterForm.module.css';
import { useRouter } from 'next/navigation';
import { checkIfUserLoggedIn } from '@/utils';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const checkLogin = await checkIfUserLoggedIn();
            if (checkLogin?.isLoggedIn) router.push('/dashboard')
        };

        checkLoginStatus()

    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(process.env.NEXT_PUBLIC_FRONTEND_URI + '/api/auth/register', { email, password });
            router.push('/login');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.error || 'Registration failed';
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create an account</h2>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                            placeholder='Email address'
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                            placeholder='Password'
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Register
                    </button>
                </form>

                <div className={styles.loginPrompt}>
                    <button onClick={() => router.push('/login')} className={styles.loginLink}>
                        Already have an account? Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}