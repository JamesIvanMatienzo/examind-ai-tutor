import { Home, FolderOpen, Zap, Calendar, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: FolderOpen, label: "Subjects", path: "/subjects" },
  { icon: Zap, label: "Practice", path: "/practice" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t z-50">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-[3px]"
            >
              {/* Sliding top indicator */}
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute top-0 w-10 h-[3px] rounded-b-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
                />
              )}

              <Icon
                className={`h-[20px] w-[20px] transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`text-[10px] leading-none font-medium transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
