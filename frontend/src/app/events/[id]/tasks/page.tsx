// app/events/[id]/tasks/page.tsx
'use client';
import React from 'react'
import AuthLayout from '@/components/layouts/AuthLayout';
import TaskSchedulingPage from '@/components/TaskScheduling';

export default function page() {
    return (
        <div>
            <AuthLayout>
                <TaskSchedulingPage />
            </AuthLayout>
        </div>
    )
}
