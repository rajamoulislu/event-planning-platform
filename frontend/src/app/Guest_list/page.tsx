import React from 'react'
import AuthLayout from '@/components/layouts/AuthLayout';
import GuestManagement from '@/components/GuestManagement';

export default function page() {
  return (
    <div>
        <AuthLayout>
            <GuestManagement/>
        </AuthLayout>
    
    </div>
  )
}
