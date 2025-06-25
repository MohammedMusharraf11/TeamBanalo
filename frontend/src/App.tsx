// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Layout
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";

import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Explore from "@/pages/Explore";
import CreateProject from "@/pages/CreateProject";
import PostHackathon from "@/pages/PostHackathon";
import ExploreAndTeammates from "@/pages/ExploreAndTeamates";
import HackathonDetails from "@/pages/HackthonDetails";
import ProjectDetails from "@/pages/ProjectDetails";
import ViewProfile from "@/pages/viewprofile";
import FindTeammates from "@/pages/FindTeammates";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Protect routes from unauthenticated access
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

// Block logged-in users from accessing login
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
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/find-teammates" element={<ProtectedRoute><FindTeammates /></ProtectedRoute>} />
          <Route path="/explore-and-teammates" element={<ProtectedRoute><ExploreAndTeammates /></ProtectedRoute>} />
          <Route path="/post-hackathon" element={<ProtectedRoute><PostHackathon /></ProtectedRoute>} />
          <Route path="/post-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/hackathon/:id" element={<ProtectedRoute><HackathonDetails /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/view-profile/:id" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
