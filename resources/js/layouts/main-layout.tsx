import { usePage } from '@inertiajs/react';
import Sidebar from "@/components/sidebar/NewSidebar";

export default function MainLayout({ children }: {children: React.ReactNode}) {
    const { auth } = usePage().props  as any;

    return (
        <div className="flex">
            <Sidebar user={auth.user} />

            <main className="flex-1 bg-gray-50 min-h-screen">
                {children}
            </main>
        </div>

    )
}
