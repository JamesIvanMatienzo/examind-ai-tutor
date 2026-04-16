import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background px-6 py-6">
      <button onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
      <p className="text-muted-foreground text-sm mb-8">Log in to continue studying</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" placeholder="you@email.com" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-12 rounded-xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button className="text-sm text-primary font-medium">Forgot Password?</button>
        </div>

        <Button className="w-full h-12 rounded-xl text-base font-semibold mt-4" onClick={() => navigate("/home")}>
          Log In
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
        </div>

        <Button variant="outline" className="w-full h-12 rounded-xl text-base">
          <img src="https://www.google.com/favicon.ico" className="h-5 w-5 mr-2" alt="" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="text-primary font-semibold">Sign Up</button>
        </p>
      </div>
    </div>
  );
}
