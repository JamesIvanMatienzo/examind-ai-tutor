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
        // #region agent log
        const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H1',location:'src/hooks/useAuth.tsx:checkMockSession',message:'authprovider_check_mock_session',data:{storedAuthPresent:!!storedAuth,loadingBefore:true},timestamp:Date.now()};
        fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        // #endregion agent log
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          const mockSession = authData.session;
          
          // Check if this is a mock session and if it's still valid
          if (mockSession && mockSession.access_token === "mock-dev-token") {
            if (mockSession.expires_at && mockSession.expires_at > Math.floor(Date.now() / 1000)) {
              // Mock session is still valid
              setSession(mockSession as Session);
              setLoading(false);
              // #region agent log
              const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H1',location:'src/hooks/useAuth.tsx:checkMockSession',message:'authprovider_mock_session_accepted',data:{expiresAt:mockSession.expires_at,nowSec:Math.floor(Date.now()/1000)},timestamp:Date.now()};
              fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
              fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
              // #endregion agent log
              return true;
            } else {
              // Mock session expired, clean it up
              localStorage.removeItem("examind-mock-auth");
              // Also clean up Supabase storage
              const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.replace(/^https?:\/\//, '').replace(/\./g, '-')}-auth-token`;
              if (storageKey) {
                localStorage.removeItem(storageKey);
              }
              // #region agent log
              const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H2',location:'src/hooks/useAuth.tsx:checkMockSession',message:'authprovider_mock_session_expired_cleanup',data:{hadMockToken:true,expiresAt:mockSession.expires_at,nowSec:Math.floor(Date.now()/1000)},timestamp:Date.now()};
              fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
              fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
              // #endregion agent log
            }
          }
        }
      } catch (error) {
        // If there's an error parsing, clean up the stored data
        localStorage.removeItem("examind-mock-auth");
        // #region agent log
        const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H3',location:'src/hooks/useAuth.tsx:checkMockSession',message:'authprovider_mock_session_parse_error_cleanup',data:{errorName:(error as any)?.name||'unknown'},timestamp:Date.now()};
        fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        // #endregion agent log
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
        // #region agent log
        const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H4',location:'src/hooks/useAuth.tsx:onAuthStateChange',message:'authprovider_supabase_auth_state_change',data:{event:_event,hasSession:!!newSession,hasUser:!!newSession?.user},timestamp:Date.now()};
        fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        // #endregion agent log
      });

      // THEN check existing Supabase session
      supabase.auth.getSession().then(({ data: { session: existing } }) => {
        setSession(existing);
        setLoading(false);
        // #region agent log
        const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H4',location:'src/hooks/useAuth.tsx:getSession',message:'authprovider_supabase_getSession_result',data:{hasSession:!!existing,hasUser:!!existing?.user},timestamp:Date.now()};
        fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
        // #endregion agent log
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
