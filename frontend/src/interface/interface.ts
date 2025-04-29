import { ReactNode } from "react";

interface LoginRequestBody {
    email: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    token?: string;
    user?: {
        id: number;
        email: string;
    };
    message?: string;
}

interface RegisterRequestBody {
    email: string;
    password: string;
}

interface RegisterResponse {
    success: boolean;
    message: string;
    user?: {
        id: number;
        email: string;
        createdAt: Date;
    };
}

interface User {
    id: number;
    email: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
    events?: Event[];
    guests?: Guest[];
    tasks?: Task[];
    expenses?: Expense[];
    budgets?: Budget[];
}

interface Event {
    id: number;
    title: string;
    description?: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    location?: string;
    url?: string;
    isAllDay: boolean;
    color?: string;
    userId: number;
    createdBy?: User;
    guests?: Guest[];
    tasks?: Task[];
    expenses?: Expense[];
    budgets?: Budget[];
    createdAt: Date | string;
    updatedAt: Date | string;
    _count?: {
        guests: number;
        tasks?: number;
        expenses?: number;
        budgets?: number;
    };
}

interface Guest {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    image?: string;
    eventId: number;
    event?: Event;
    userId: number;
    createdBy?: User;
    rsvpDate?: Date | string | null;
    rsvpStatus?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface Task {
    id: number;
    title: string;
    description?: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    completed: boolean;
    priority?: string;
    assignedTo?: string;
    eventId: number;
    event?: Event;
    userId: number;
    createdBy?: User;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface Budget {
    id: number;
    name: string;
    totalAmount: number;
    eventId: number;
    event?: Event;
    userId: number;
    createdBy?: User;
    expenses?: Expense[];
    createdAt: Date | string;
    updatedAt: Date | string;
    _count?: {
        expenses: number;
    };
}

interface Expense {
    id: number;
    title: string;
    amount: number;
    date: Date | string;
    receipt?: string;
    notes?: string;
    eventId: number;
    event?: Event;
    budgetId?: number | null;
    budget?: Budget;
    userId: number;
    createdBy?: User;
    category?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        email: string;
    };
}

interface AuthLayoutProps {
    children: ReactNode;
    requireAuth?: boolean;
}

export type {
    LoginRequestBody,
    LoginResponse,
    RegisterRequestBody,
    RegisterResponse,
    User,
    Event,
    Guest,
    Task,
    Budget,
    Expense,
    AuthenticatedRequest,
    AuthLayoutProps
};