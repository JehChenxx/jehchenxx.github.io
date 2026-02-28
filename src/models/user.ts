import supabase from '@/utils/supabase';
import { useEffect, useState } from 'react';

export default () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => authListener.subscription.unsubscribe();
  }, []);

  return { user, setUser, loading };
};
