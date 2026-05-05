import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock session in localStorage first
    const checkMockSession = () => {
      try {
        const storedAuth = localStorage.getItem("examind-mock-auth");
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          const mockSession = authData.session;
          
          // Check if this is a mock session and if it's still valid
          if (mockSession && mockSession.access_token === "mock-dev-token") {
            if (mockSession.expires_at && mockSession.expires_at > Math.floor(Date.now() / 1000)) {
              // Mock session is still valid
              setSession(mockSession as Session);
              setLoading(false);
              return true;
            } else {
              // Mock session expired, clean it up
              localStorage.removeItem("examind-mock-auth");
              // Also clean up Supabase storage
              const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.replace(/^https?:\/\//, '').replace(/\./g, '-')}-auth-token`;
              if (storageKey) {
                localStorage.removeItem(storageKey);
              }
            }
          }
        }
      } catch (error) {
        // If there's an error parsing, clean up the stored data
        localStorage.removeItem("examind-mock-auth");
      }
      return false;
    };

    // If we found and set a mock session, we don't need to set up Supabase listeners
    const hasMockSession = checkMockSession();
    
    if (!hasMockSession) {
      // Set up Supabase listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setLoading(false);
      });

      // THEN check existing Supabase session
      supabase.auth.getSession().then(({ data: { session: existing } }) => {
        setSession(existing);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
