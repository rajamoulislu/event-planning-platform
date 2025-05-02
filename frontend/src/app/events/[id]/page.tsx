// app/events/[id]/guests/page.tsx
'use client';
import React from 'react'
import AuthLayout from '@/components/layouts/AuthLayout';
import EventDetailsPage from '@/components/EventDetailsPage';

export default function page() {
    return (
        <div>
            <AuthLayout>
                <EventDetailsPage />
            </AuthLayout>
        </div>
    )
}
