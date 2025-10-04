import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextTypes';
import { useEffect, useState } from 'react';
import ErrorModal from '../../components/ErrorModal';
import NotificationModal from '../../components/NotificationModal';
import Toast from '../../components/Toast/Toast';
import type { ErrorInfo } from '../../components/ErrorModal';
import type { NotificationInfo } from '../../components/NotificationModal';
import { parseAuthResponse } from '../../utils/authResponseParser';

const schema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resendStatus, setResendStatus] = useState<{
    isLoading: boolean;
    message: string | null;
  }>({
    isLoading: false,
    message: null,
  });

  const [showVerificationToast, setShowVerificationToast] = useState(false);

  useEffect(() => {
    if (location.state?.showVerificationMessage) {
      setShowVerificationToast(true);
    }
  }, [location.state]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'error' | 'notification' | null;
    data: ErrorInfo | NotificationInfo | null;
  }>({
    isOpen: false,
    type: null,
    data: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Load saved credentials on component mount
  useEffect(() => {
    const saved = localStorage.getItem('windbooks_credentials');
    if (saved) {
      try {
        const credentials = JSON.parse(saved);
        setValue('email', credentials.email);
        setValue('password', credentials.password);
        setValue('rememberMe', true);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('windbooks_credentials');
      }
    }
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data.email, data.password);

      // Save credentials if remember me is checked
      if (data.rememberMe) {
        const credentials = { email: data.email, password: data.password };
        localStorage.setItem('windbooks_credentials', JSON.stringify(credentials));
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('windbooks_credentials');
      }

      navigate('/user');
    } catch (error: unknown) {
      console.error('Login failed:', error);

      // Check if this is an unverified account error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiMessage = (error as any)?.response?.data?.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMessage = (error as any)?.message;
      const message = apiMessage || axiosMessage || 'An unexpected error occurred';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusCode = (error as any)?.response?.status;

      // Special handling for unverified account
      const isUnverified = statusCode === 401 && (
        message.includes('not active and unverified') ||
        message.includes('User account is not active and unverified') ||
        message.toLowerCase().includes('unverified') ||
        message.toLowerCase().includes('not active')
      );

      if (isUnverified) {
        // Show notification with resend functionality
        setModalState({
          isOpen: true,
          type: 'notification',
          data: {
            type: 'warning',
            title: 'Email Verification Required',
            message: resendStatus.message || 'Your account needs to be verified before you can log in. Please check your email for a verification link that was sent to you during registration.',
            actionText: resendStatus.isLoading ? 'Sending...' : 'Resend Verification Email',
            onAction: handleResendVerification,
          },
        });
      } else {
        // Use the standard error parser for other errors
        const responseResult = parseAuthResponse(error);
        setModalState({
          isOpen: true,
          type: responseResult.type,
          data: responseResult.data,
        });
      }

      console.log('🎭 Modal State Debug:', {
        responseType: modalState.type,
        responseData: modalState.data,
        willShowError: modalState.type === 'error',
        willShowNotification: modalState.type === 'notification'
      });
    }
  });

  const handleResendVerification = async () => {
    const email = watch('email'); // Get current email from form
    if (!email) {
      setResendStatus({
        isLoading: false,
        message: 'Please enter your email address.',
      });
      return;
    }

    setResendStatus({ isLoading: true, message: null });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendStatus({
          isLoading: false,
          message: 'Verification email sent successfully. Please check your inbox.',
        });
      } else {
        setResendStatus({
          isLoading: false,
          message: 'Failed to send verification email. Please try again.',
        });
      }
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setResendStatus({
        isLoading: false,
        message: 'Network error occurred. Please try again.',
      });
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      data: null,
    });
    // Clear resend status when closing modal
    setResendStatus({ isLoading: false, message: null });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
      <div className="w-full max-w-md">
        <Toast
          message="Please verify your email. We’ve sent a verification link to your registered email address. Kindly check your inbox (or spam folder) and click the link to activate your account."
          isVisible={showVerificationToast}
          onClose={() => setShowVerificationToast(false)}
        />
        <form onSubmit={onSubmit} className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border-2 border-gray-200 ring-1 ring-gray-100">
        <h2 className="text-3xl mb-6 text-center text-gray-800 font-semibold">Login</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm font-medium">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 text-sm font-medium">Password</label>
          <input
            {...register('password')}
            type="password"
            placeholder="Enter your password"
            className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div className="mb-6 flex justify-between items-center">
          <label className="flex items-center">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
          <Link
            to="/auth/reset-password"
            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            Reset Password
          </Link>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 text-white p-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          Login
        </button>
        <div className="mt-4 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link
            to="/auth/register"
            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            Register Now
          </Link>
        </div>
      </form>

      <ErrorModal
        isOpen={modalState.isOpen && modalState.type === 'error'}
        onClose={closeModal}
        error={modalState.type === 'error' ? modalState.data as ErrorInfo : null}
      />

      <NotificationModal
        isOpen={modalState.isOpen && modalState.type === 'notification'}
        onClose={closeModal}
        notification={modalState.type === 'notification' ? modalState.data as NotificationInfo : null}
      />
      </div>
    </div>
  );
};

export default Login;