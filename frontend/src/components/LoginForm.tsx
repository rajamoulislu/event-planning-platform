/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/css/Login.module.css';
import { checkIfUserLoggedIn } from '@/utils';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const checkLogin = await checkIfUserLoggedIn();
                if (checkLogin?.isLoggedIn) {
                    router.push('/dashboard');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_FRONTEND_URI + '/api/auth/login', { email, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            router.replace('/dashboard');
        } catch (error) {
            setError('Invalid credentials');
            return error
        }
    };


    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <span className="loader"></span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h2 className={styles.title}>Sign in to your account</h2>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
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
                    <div>
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
                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        Sign in
                    </button>
                </form>
                <div className={styles.registerContainer}>
                    <button
                        onClick={() => router.push('/register')}
                        className={styles.registerLink}
                    >
                        Don&apos;t have an account? Register
                    </button>
                </div>
            </div>
        </div>
    );
}