import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!code) {
      // No verification code provided, redirect to landing page
      const errorMessage = 'No verification code provided in URL';
      console.error('Email verification error:', errorMessage);
      alert(`Verification Error: ${errorMessage}. Redirecting to home page.`);
      navigate('/');
      return;
    }

    // Basic protection against malicious attacks - validate UUID format
    const uuidRegex = /^[a-f0-9]{32}$/i;
    if (!uuidRegex.test(code)) {
      const errorMessage = `Invalid verification code format: ${code}`;
      console.error('Email verification error:', errorMessage);
      alert(`Verification Error: ${errorMessage}. Redirecting to home page.`);
      navigate('/');
      return;
    }

    // Call verification API directly to avoid multiple calls
    const performVerification = async (verificationCode: string) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify/${verificationCode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login page...');
          
          // Auto redirect after 10 seconds
          setTimeout(() => {
            navigate('/auth/login');
          }, 10000);
        } else {
          const errorData = await response.text();
          const errorMessage = `Email verification failed with status ${response.status}: ${errorData}`;
          console.error('Email verification API error:', errorMessage);
          setStatus('error');
          setMessage('Email verification failed. Please try again.');
        }
      } catch (error) {
        const errorMessage = `Network error during email verification: ${error}`;
        console.error('Email verification network error:', errorMessage);
        setStatus('error');
        setMessage('Network error occurred. Please try again.');
      }
    };

    performVerification(code);
  }, [code, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      const errorMessage = 'No email address provided for resend verification';
      console.error('Resend verification error:', errorMessage);
      setMessage('Please enter your email address.');
      return;
    }

    console.log('Attempting to resend verification email to:', email);
    setIsResending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const successMessage = 'Verification email sent successfully to: ' + email;
        console.log('Resend verification success:', successMessage);
        setMessage('Verification email sent successfully. Please check your inbox.');
      } else {
        const errorData = await response.text();
        const errorMessage = `Failed to resend verification email with status ${response.status}: ${errorData}`;
        console.error('Resend verification API error:', errorMessage);
        setMessage('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      const errorMessage = `Network error during resend verification: ${error}`;
      console.error('Resend verification network error:', errorMessage);
      setMessage('Network error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200 ring-1 ring-gray-100">
        <div className="text-center">
          {status === 'success' ? (
            <div>
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 text-white p-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div>
              <div className="text-red-500 text-6xl mb-4">✗</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="mb-4">
                <label htmlFor="resend-email" className="block text-gray-700 mb-2 text-sm font-medium">Email Address</label>
                <input
                  id="resend-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
                />
              </div>

              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 text-white p-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;