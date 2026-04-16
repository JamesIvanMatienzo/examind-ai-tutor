import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignUpScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background px-6 py-6">
      <button onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <h1 className="text-2xl font-bold mb-1">Create Account</h1>
      <p className="text-muted-foreground text-sm mb-8">Start your smarter study journey</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input placeholder="Juan Dela Cruz" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" placeholder="you@email.com" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label>School Name</Label>
          <Input placeholder="University of the Philippines" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label>Year Level</Label>
          <Select>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select year level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
              <SelectItem value="grad">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
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
        </div>

        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input type="password" placeholder="Re-enter password" className="h-12 rounded-xl" />
        </div>

        <Button className="w-full h-12 rounded-xl text-base font-semibold mt-4" onClick={() => navigate("/onboarding")}>
          Sign Up
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
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">Log In</button>
        </p>
      </div>
    </div>
  );
}
