import Dashboard from '@/components/Dashboard';
import AuthLayout from '@/components/layouts/AuthLayout';

export default function DashboardPage() {
    return (
        <AuthLayout>
            <Dashboard />
        </AuthLayout>
    );
}