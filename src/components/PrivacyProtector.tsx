import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * PrivacyProtector
 * 
 * Enforces strict privacy by signing the user out when they:
 * 1. Refresh the page (beforeunload)
 * 2. Close the tab (beforeunload)
 * 3. Navigate back out of the protected area? (handled via cleanup/checks)
 * 
 * NOTE: This is aggressive. It means ANY reload kills the session.
 */
export const PrivacyProtector = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleUnload = async () => {
            // This is synchronous mostly, but we trigger the signout.
            // navigator.sendBeacon could be used if we had an API endpoint,
            // but here we just try to clear local state and notify supabase if possible.
            // Supabase JS client might not complete the async call on unload,
            // but we can clear the session from storage.
            await supabase.auth.signOut();
            localStorage.clear(); // Aggressive clear
        };

        window.addEventListener('beforeunload', handleUnload);

        // Also check on mount if we have a user, if not redirect
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/auth');
            }
        };
        checkAuth();

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [navigate]);

    return <>{children}</>;
};
