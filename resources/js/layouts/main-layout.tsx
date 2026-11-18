import { usePage } from '@inertiajs/react';
import Header from "@/components/layouts/NewHeader";
import Sidebar from "@/components/layouts/NewSidebar";


export default function MainLayout({ children }: {children: React.ReactNode}) {
    const { auth } = usePage().props  as any;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar user={auth.user} />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header />
                <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>

    )

}
