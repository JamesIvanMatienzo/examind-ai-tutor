import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import SplashScreen from "./pages/SplashScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import SignUpScreen from "./pages/SignUpScreen";
import LoginScreen from "./pages/LoginScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import HomeDashboard from "./pages/HomeDashboard";
import SubjectsPage from "./pages/SubjectsPage";
import AddSubjectScreen from "./pages/AddSubjectScreen";
import SubjectFolderScreen from "./pages/SubjectFolderScreen";
import AIChatScreen from "./pages/AIChatScreen";
import PracticePage from "./pages/PracticePage";
import PracticeSetupPage from "./pages/PracticeSetupPage";
import ActiveQuizPage from "./pages/ActiveQuizPage";
import QuizResultsPage from "./pages/QuizResultsPage";
import SchedulePage from "./pages/SchedulePage";
import AddExamDatePage from "./pages/AddExamDatePage";
import AIStudyPlanPage from "./pages/AIStudyPlanPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AppSettingsPage from "./pages/AppSettingsPage";
import ScoreTrackerPage from "./pages/ScoreTrackerPage";
import HelpFeedbackPage from "./pages/HelpFeedbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="mx-auto w-full max-w-[430px] min-h-screen relative bg-background shadow-2xl">
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/signup" element={<SignUpScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/onboarding" element={protect(<OnboardingScreen />)} />
              <Route path="/home" element={protect(<HomeDashboard />)} />
              <Route path="/subjects" element={protect(<SubjectsPage />)} />
              <Route path="/subjects/add" element={protect(<AddSubjectScreen />)} />
              <Route path="/subjects/:id" element={protect(<SubjectFolderScreen />)} />
              <Route path="/subjects/:id/chat" element={protect(<AIChatScreen />)} />
              <Route path="/practice/setup" element={protect(<PracticeSetupPage />)} />
              <Route path="/practice/quiz" element={protect(<ActiveQuizPage />)} />
              <Route path="/practice/results" element={protect(<QuizResultsPage />)} />
              <Route path="/practice" element={protect(<PracticePage />)} />
              <Route path="/schedule" element={protect(<SchedulePage />)} />
              <Route path="/schedule/add-exam" element={protect(<AddExamDatePage />)} />
              <Route path="/schedule/ai-plan" element={protect(<AIStudyPlanPage />)} />
              <Route path="/profile" element={protect(<ProfilePage />)} />
              <Route path="/profile/edit" element={protect(<EditProfilePage />)} />
              <Route path="/settings" element={protect(<AppSettingsPage />)} />
              <Route path="/scores" element={protect(<ScoreTrackerPage />)} />
              <Route path="/help" element={protect(<HelpFeedbackPage />)} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

