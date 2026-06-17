import { usePage } from '@inertiajs/react';
import Header from "@/components/layouts/NewHeader";
import Sidebar from "@/components/layouts/NewSidebar";


export default function MainLayout({ children }: {children: React.ReactNode}) {
    const { auth } = usePage().props  as any;

    return (
        <div className="flex">
            <Sidebar user={auth.user} />

            <main className="flex-1">
                <Header />
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
                    {children}

                </div>
            </main>
        </div>

    )

}
