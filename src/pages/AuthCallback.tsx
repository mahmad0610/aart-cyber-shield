import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PageLoader from '@/components/PageLoader';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const user = session?.user;
        // Check if this is their first time
        const isNewUser = user?.created_at === user?.last_sign_in_at;
        
        if (isNewUser) {
          toast.success('Welcome to AART! Setting up your workspace...');
          navigate('/onboarding/connect');
        } else {
          toast.success('Successfully authenticated.');
          navigate('/dashboard');
        }
      }
      
      if (event === 'INITIAL_SESSION') {
          // If no session found, we might be in middle of auth
      }
    });

    // Handle potential errors/timeout
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          toast.error('Authentication check timed out.');
          navigate('/login');
        }
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <PageLoader onComplete={() => {}} />;
};

export default AuthCallback;
