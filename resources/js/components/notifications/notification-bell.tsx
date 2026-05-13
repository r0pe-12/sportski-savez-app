import { usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

export function NotificationBell() {
    const { notifications } = usePage().props;
    const count = notifications.unread_count;

    return (
        <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Notifikacije"
        >
            <Bell className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-xs font-medium text-white">
                    {count}
                </span>
            )}
        </button>
    );
}
