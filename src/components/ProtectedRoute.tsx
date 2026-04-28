import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  // #region agent log
  const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H1',location:'src/components/ProtectedRoute.tsx:render',message:'protectedroute_render',data:{loading,hasSession:!!session,sessionAccessTokenPrefix:session?.access_token?.slice?.(0,12)||null},timestamp:Date.now()};
  fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
  fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
  // #endregion agent log
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!session) return <Navigate to="/welcome" replace />;
  return children;
}
