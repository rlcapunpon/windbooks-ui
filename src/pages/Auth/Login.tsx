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
  const [showExpiredSessionToast, setShowExpiredSessionToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  useEffect(() => {
    if (location.state?.showVerificationMessage) {
      setShowVerificationToast(true);
    }
  }, [location.state]);

  // Check for expired session query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('e') === 'login-expired') {
      setShowExpiredSessionToast(true);
    }
  }, [location.search]);

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
        <Toast
          message="User session expired. Please login again."
          isVisible={showExpiredSessionToast}
          onClose={() => setShowExpiredSessionToast(false)}
        />
        <form onSubmit={onSubmit} className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border-2 border-gray-200 ring-1 ring-gray-100">
        <h2 className="text-heading text-3xl mb-6 text-center font-semibold">Login</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm font-medium">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className="form-input w-full p-3"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 text-sm font-medium">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="form-input w-full p-3 pr-12"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="toggle password visibility"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M 2.458 12 C 3.732 7.943 7.523 5 12 5 c 4.478 0 8.268 2.943 9.542 7 c -1.274 4.057 -5.064 7 -9.542 7 c -4.477 0 -8.268 -2.943 -9.542 -7 Z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div className="mb-6 flex justify-between items-center">
          <label className="flex items-center">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
          <Link
            to="/auth/reset-password"
            className="text-emerald-500 hover:text-emerald-700 text-sm transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          className="btn-primary w-full p-3 rounded-lg font-semibold"
        >
          Login
        </button>
        <div className="mt-4 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center text-emerald-500 hover:text-emerald-700 text-sm transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link
            to="/auth/register"
            className="text-emerald-500 hover:text-emerald-700 text-sm transition-colors"
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