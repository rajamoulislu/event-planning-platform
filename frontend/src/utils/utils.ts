/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const checkIfUserLoggedIn = async () => {
    const token = localStorage.getItem('token');

    if (!token) return { isLoggedIn: false };

    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_FRONTEND_URI}/api/verify-token`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-API-Key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY
            }
        });

        return { isLoggedIn: response.data.authenticated, userId: response.data.userId };

    } catch (error) {
        return { isLoggedIn: false };
    }
};


export { validateEmail, checkIfUserLoggedIn }