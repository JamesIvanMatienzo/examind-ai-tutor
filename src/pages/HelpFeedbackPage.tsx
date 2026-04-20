import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, HelpCircle, Mail, MessageSquare, Send, Info, Globe, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const FAQS = [
  {
    q: "How do I add a new subject?",
    a: "Go to the Subjects tab and tap the + button. Enter your subject name, choose a color, and start uploading materials.",
  },
  {
    q: "How does the AI generate quizzes?",
    a: "Our AI analyzes your uploaded notes and PDFs, then generates personalized practice questions based on the key concepts in each subject.",
  },
  {
    q: "Can I use the app offline?",
    a: "You can review previously loaded subjects and notes offline, but AI features and syncing require an internet connection.",
  },
  {
    q: "How is my data stored and secured?",
    a: "Your data is encrypted in transit and at rest. We never share your study materials with third parties.",
  },
  {
    q: "How do I track my exam progress?",
    a: "Use the Score Tracker (Profile → Score Tracker) to log exam results and visualize your improvement over time.",
  },
  {
    q: "What does the AI Study Plan do?",
    a: "Based on your exam dates and current scores, our AI generates a daily study schedule that prioritizes weak areas.",
  },
];

const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255),
  category: z.string().min(1, "Select a category"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message too long"),
});

const CATEGORIES = ["Bug Report", "Feature Request", "General Feedback", "Account Help"];

export default function HelpFeedbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", category: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = feedbackSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", category: "", message: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">Help & Feedback</h1>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">How can we help?</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Browse common questions or send us a message — we usually reply within 24 hours.
          </p>
        </div>

        {/* FAQ */}
        <section>
          <h3 className="text-sm font-semibold mb-2 px-1">Frequently Asked Questions</h3>
          <div className="bg-card border rounded-2xl px-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className={i === FAQS.length - 1 ? "border-b-0" : ""}>
                  <AccordionTrigger className="text-sm text-left hover:no-underline py-3.5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <h3 className="text-sm font-semibold mb-2 px-1 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" /> Contact Us
          </h3>
          <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                maxLength={100}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                maxLength={255}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.category === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs">Message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what's on your mind..."
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between">
                {errors.message ? (
                  <p className="text-xs text-destructive">{errors.message}</p>
                ) : <span />}
                <p className="text-[10px] text-muted-foreground">{form.message.length}/1000</p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </section>

        {/* Quick Contact */}
        <section className="grid grid-cols-2 gap-2.5">
          <a
            href="mailto:support@studyapp.com"
            className="bg-card border rounded-xl p-3 flex flex-col items-start gap-1 hover:bg-muted transition-colors"
          >
            <Mail className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Email</p>
            <p className="text-[10px] text-muted-foreground">support@studyapp.com</p>
          </a>
          <a
            href="https://studyapp.com"
            target="_blank"
            rel="noreferrer"
            className="bg-card border rounded-xl p-3 flex flex-col items-start gap-1 hover:bg-muted transition-colors"
          >
            <Globe className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Website</p>
            <p className="text-[10px] text-muted-foreground">studyapp.com</p>
          </a>
        </section>

        {/* App Info */}
        <section className="bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">About</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-medium">2026.04.20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">Web</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4 pt-3 border-t items-center">
            <Star className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            <span className="ml-auto text-[10px] text-muted-foreground">© 2026 StudyApp</span>
          </div>
        </section>
      </div>
    </div>
  );
}
