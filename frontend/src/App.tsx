import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './components/custom/authContext';
import SignupPage from './pages/signupPage';
import SigninPage from './pages/signinPage';
import OtpPage from './pages/otpPage';
import ForgetPasswordPage from './pages/forgetPasswordPage';
import ResetPasswordPage from './pages/resetPasswordPage';
import NotFoundPage from './pages/notFoundPage';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/signup" replace />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/login" element={<SigninPage />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route path="/otp-verification" element={<OtpPage />} />
            <Route path="/forgot-password" element={<ForgetPasswordPage />} />
            <Route path="/forgot-password/:link" element={<ResetPasswordPage />} />
            <Route path='/reset-password' element={ <Navigate to={"/forgot-password"} replace /> } />
            <Route path='/reset-password/:link' element={ <Navigate to={"/forgot-password/:link"} replace /> } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
