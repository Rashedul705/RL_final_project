'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { isAdminEmail } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Wait for Auth to initialize
    if (loading) return;

    const checkPermission = async () => {
      // 2. Define what an "Admin Page" is
      const isAdminPage = pathname.startsWith('/admin');
      const isLoginPage = pathname.startsWith('/admin/login');

      if (!isAdminPage) {
        setRoleLoading(false);
        return;
      }

      if (isLoginPage) {
        // If on login page and already logged in + authorized, redirect to dashboard
        if (user) {
          if (isAdminEmail(user.email)) {
            router.replace('/admin');
          } else {
            // Check Firestore
            const docRef = doc(db, 'team_members', user.email!);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              router.replace('/admin');
            }
          }
        }
        setRoleLoading(false);
        return;
      }

      // We are on a protected /admin page (and not /admin/login)
      if (!user) {
        router.replace('/admin/login');
        return;
      }

      // 3. Authorization Check
      // First check hardcoded super-admins
      if (isAdminEmail(user.email)) {
        setIsAuthorized(true);
        setRoleLoading(false);
        return;
      }

      // Then check Firestore
      if (user.email) {
        try {
          const docRef = doc(db, 'team_members', user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            // Optional: Check specific role for specific pages
            // e.g. if (pathname === '/admin/settings' && data.role !== 'admin') ...
            // For now, simple existence check for generic /admin access
            setIsAuthorized(true);
          } else {
            // Not authorized
            router.replace('/admin/login');
          }
        } catch (error) {
          console.error("Auth permission check failed", error);
          // router.replace('/admin/login'); // Keep them potentially if error? Better to fail safe.
        }
      }

      setRoleLoading(false);
    };

    checkPermission();

  }, [user, loading, pathname, router]);

  if (loading || (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && roleLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Prevent flash of unauthorized content
  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  if (isAdminPage && !isAuthorized && !loading && !roleLoading) {
    return null;
  }

  return <>{children}</>;
}
