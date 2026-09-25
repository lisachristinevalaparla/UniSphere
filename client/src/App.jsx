import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIChatWidget from './components/AIChatWidget';
import FloatingControlPill from './components/FloatingControlPill';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import Dashboard from './pages/Dashboard';
import AIAssistantPage from './pages/AIAssistantPage';
import AttendancePage from './pages/AttendancePage';
import AssignmentsPage from './pages/AssignmentsPage';
import ExamsPage from './pages/ExamsPage';
import MaterialsPage from './pages/MaterialsPage';
import EventsPage from './pages/EventsPage';
import PlacementsPage from './pages/PlacementsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import ProfilePage from './pages/ProfilePage';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-full min-h-screen bg-[#f8f9fd] dark:bg-[#111215] text-[#121212] dark:text-[#f3f4f6] transition-colors duration-200">
      {/* Shared Ambient 2-Color Gradient for Dashboard */}
      <div className="animated-ambient-bg ambient-dashboard" />

      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating AI Assistant Widget across all pages */}
      <AIChatWidget />
      
      {/* Corner floating mode pill */}
      <FloatingControlPill />
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white dark:bg-[#18191d] text-[#121212] dark:text-white border border-[#e2e5f0] dark:border-[#272a33] shadow-xl rounded-2xl text-xs font-semibold px-4 py-3',
          duration: 3500,
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public auth & OTP routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <VerifyOtp />} />

        {/* Protected workspace routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <Layout><AIAssistantPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout><AttendancePage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <Layout><AssignmentsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <Layout><ExamsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <Layout><MaterialsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout><EventsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/placements"
          element={
            <ProtectedRoute>
              <Layout><PlacementsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={['admin', 'faculty']}>
              <Layout><AdminAnalyticsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout><NotificationsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
