'use client';

import { usePathname } from 'next/navigation';

export function HeaderTitle({ role }: { role: string }) {
    const pathname = usePathname();
    const isLinkAdmin = pathname?.includes('/admin');

    const displayRole = (isLinkAdmin || role === 'admin' || role === 'service_role') ? 'Admin' : role;

    return (
        <h2 className="font-semibold text-lg capitalize">{displayRole} Portal</h2>
    );
}
