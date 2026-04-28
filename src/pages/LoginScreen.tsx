import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // #region agent log
    const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H1',location:'src/pages/LoginScreen.tsx:handleLogin',message:'login_submit',data:{emailProvided:!!email,passwordProvided:!!password,emailDomain:(email.split('@')[1]||'')},timestamp:Date.now()};
    fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
    fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
    // #endregion agent log
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    
    // Check for hardcoded developer account
    if (email === "admin@examind.com" && password === "password123") {
      setLoading(true);
      
      // Create mock user session with proper Supabase User interface
      const mockUser = {
        id: "dev-1",
        email: "admin@examind.com",
        user_metadata: {
          full_name: "Examind Admin",
          name: "Examind Admin"
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: "",
        phone_confirmed_at: null,
        email_confirmed_at: new Date().toISOString(),
        role: "authenticated",
        last_sign_in_at: new Date().toISOString(),
      };

      const mockSession = {
        user: mockUser,
        access_token: "mock-dev-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
      };

      // Store mock session using Supabase's actual storage format
      const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.replace(/^https?:\/\//, '').replace(/\./g, '-')}-auth-token`;
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify({
          currentSession: mockSession,
          expiresAt: mockSession.expires_at,
        }));
      }

      // Also store a marker for our mock session
      localStorage.setItem("examind-mock-auth", JSON.stringify({
        user: mockUser,
        session: mockSession,
        expiresAt: mockSession.expires_at,
      }));

      // #region agent log
      const __debugPayload = {sessionId:'3fc829',runId:'pre-fix',hypothesisId:'H1',location:'src/pages/LoginScreen.tsx:dev_login',message:'dev_login_stored_mock_session',data:{hasMarker:!!localStorage.getItem('examind-mock-auth'),storageKey,expiresAt:mockSession.expires_at},timestamp:Date.now()};
      fetch('http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
      fetch('/__debug_ingest',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fc829'},body:JSON.stringify(__debugPayload)}).catch(()=>{});
      // #endregion agent log

      // Navigate immediately after storing the session
      // The AuthProvider will detect the mock session on next render
      setLoading(false);
      toast.success("Welcome back, Developer!");
      navigate("/home");
      
      return;
    }
    
    // Standard authentication flow for other credentials
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Invalid email or password" : error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate("/home");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/home",
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-6">
      <button onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
      <p className="text-muted-foreground text-sm mb-8">Log in to continue studying</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            type="email"
            placeholder="you@email.com"
            className="h-12 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-12 rounded-xl pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold mt-4">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
        </div>

        <Button type="button" variant="outline" disabled={googleLoading} onClick={handleGoogle} className="w-full h-12 rounded-xl text-base">
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" className="h-5 w-5 mr-2" alt="" />
              Continue with Google
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <button type="button" onClick={() => navigate("/signup")} className="text-primary font-semibold">Sign Up</button>
        </p>
      </form>
    </div>
  );
}
