import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Layout
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Explore from "@/pages/Explore";
import Profile from "@/pages/Profile";
import FindTeammates from "@/pages/FindTeammates";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import CreateProject from "@/pages/CreateProject";
import PostHackathon from "@/pages/PostHackathon";
import ExploreAndTeammates from "@/pages/ExploreAndTeamates";
import HackathonDetails from "@/pages/HackthonDetails";
import ProjectDetails from "@/pages/ProjectDetails";
import ViewProfile from "@/pages/ViewProfile"; // ✅ NEW

const queryClient = new QueryClient();

// 🔐 Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// 🌐 Public route wrapper
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          {/* 🔐 Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/post-hackathon" element={<ProtectedRoute><PostHackathon /></ProtectedRoute>} />
          <Route path="/post-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/find-teammates" element={<ProtectedRoute><FindTeammates /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/explore-and-teammates" element={<ProtectedRoute><ExploreAndTeammates /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* 📄 Detail Pages */}
          <Route path="/hackathon/:id" element={<ProtectedRoute><HackathonDetails /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/view-profile/:id" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />

          {/* 🚫 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster /> {/* shadcn/ui toast */}
          <Sonner />  {/* sonner toast */}
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
