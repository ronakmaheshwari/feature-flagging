import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './components/custom/authContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/custom/protected-route';
import { DashboardLayout, PublicLayout } from './components/layout/dashboard-layout';
import SignupPage from './pages/signupPage';
import SigninPage from './pages/signinPage';
import OtpPage from './pages/otpPage';
import ForgetPasswordPage from './pages/forgetPasswordPage';
import ResetPasswordPage from './pages/resetPasswordPage';
import NotFoundPage from './pages/notFoundPage';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { FeatureFlagsPage } from './pages/dashboard/FeatureFlagsPage';
import { GroupsPage } from './pages/dashboard/GroupsPage';
import { RouteFlagsPage } from './pages/dashboard/RouteFlagsPage';
import { AuditLogsPage } from './pages/dashboard/AuditLogsPage';
import { ContentPage } from './pages/dashboard/ContentPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

const queryClient = new QueryClient()

function AdminGuard() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Outlet />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            {/* Public routes with centered layout */}
            <Route element={<PublicLayout />}>
              <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
              <Route path="/signin" element={<PublicOnlyRoute><SigninPage /></PublicOnlyRoute>} />
              <Route path="/login" element={<PublicOnlyRoute><SigninPage /></PublicOnlyRoute>} />
              <Route path="/otp" element={<PublicOnlyRoute><OtpPage /></PublicOnlyRoute>} />
              <Route path="/otp-verification" element={<PublicOnlyRoute><OtpPage /></PublicOnlyRoute>} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgetPasswordPage /></PublicOnlyRoute>} />
              <Route path="/forgot-password/:link" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/flags" element={<FeatureFlagsPage />} />
              <Route path="/dashboard/content" element={<ContentPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route element={<AdminGuard />}>
                <Route path="/dashboard/groups" element={<GroupsPage />} />
                <Route path="/dashboard/route-flags" element={<RouteFlagsPage />} />
                <Route path="/dashboard/audit" element={<AuditLogsPage />} />
                <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App