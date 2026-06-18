import { usePage } from '@inertiajs/react';
import Header from "@/components/layouts/NewHeader";
import Sidebar from "@/components/layouts/NewSidebar";


export default function MainLayout({ children }: {children: React.ReactNode}) {
    const { auth } = usePage().props  as any;

    return (
        <div className="flex h-screen  overfow-hidden bg-gray-50">
            <Sidebar user={auth.user} />

            <main className="flex flex-col flex-1">
                <Header />
                <div className="flex-1 overflow-y-auto p-6">
                    {children}

                </div>
            </main>
        </div>

    )

}
