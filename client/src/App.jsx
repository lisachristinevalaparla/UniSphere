import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIChatWidget from './components/AIChatWidget';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
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

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-200">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
          className: 'glass-panel !bg-slate-900/90 !text-white !border-slate-700/60 !shadow-xl text-xs font-medium',
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
        {/* Public auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

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

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default App;
