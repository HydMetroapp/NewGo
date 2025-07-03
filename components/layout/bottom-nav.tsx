
'use client';

import { Home, QrCode, CreditCard, MapPin, Route, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Maps', href: '/maps', icon: MapPin },
  { name: 'Journey', href: '/journey', icon: Route },
  { name: 'Card', href: '/card', icon: CreditCard },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors relative",
                isActive
                  ? "text-blue-600"
                  : "text-gray-600"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
              <span className={cn(isActive && "text-blue-600")}>{item.name}</span>
              {item.name === 'Profile' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
