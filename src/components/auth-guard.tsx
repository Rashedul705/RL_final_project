
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run this check on the client
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

      // If on an admin page and not authenticated, redirect to login
      if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !isAuthenticated) {
        router.replace('/admin/login');
      } else {
        setIsChecking(false);
      }
    }
  }, [pathname, router]);

  // If we are on an admin page and still checking, show a loading state
  if (isChecking && pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If the logic allows, render the children
  return <>{children}</>;
}
