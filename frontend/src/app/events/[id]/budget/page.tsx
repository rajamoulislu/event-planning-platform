// app/events/[id]/budget/page.tsx
'use client';
import React from 'react'
import BudgetPage from '@/components/Budget';
import AuthLayout from '@/components/layouts/AuthLayout';

export default function page() {
    return (
        <div>
            <AuthLayout>
                <BudgetPage />
            </AuthLayout>
        </div>
    )
}
