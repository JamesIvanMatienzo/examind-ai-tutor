import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "Ivan Dela Cruz",
    email: "ivan.delacruz@up.edu.ph",
    university: "University of the Philippines",
    year: "3rd Year",
    course: "BS Computer Science",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    toast({ title: "Profile updated", description: "Your changes have been saved." });
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-card border-b">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
      </div>

      <div className="px-5 py-6">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-3xl font-bold">
                {form.name.charAt(0)}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center border-2 border-card">
              <Camera className="h-4 w-4 text-accent-foreground" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "university", label: "University" },
            { key: "course", label: "Course" },
            { key: "year", label: "Year Level" },
          ].map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{field.label}</Label>
              <Input
                value={form[field.key as keyof typeof form]}
                onChange={(e) => update(field.key, e.target.value)}
                className="bg-card border rounded-xl h-11"
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full mt-8 h-12 rounded-xl font-semibold">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
