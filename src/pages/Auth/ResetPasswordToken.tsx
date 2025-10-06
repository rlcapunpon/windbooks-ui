import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordToken = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_password: formData.newPassword,
          new_password_confirmation: formData.confirmPassword,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Password reset successfully! You can now log in with your new password.');
      } else {
        let errorMessage = 'Password reset failed. Please try again later.';
        
        try {
          const errorData = await response.json();
          console.error('Password reset API error:', errorData);

          if (response.status === 400) {
            // Handle specific 400 error messages
            if (errorData.message) {
              if (errorData.message.includes('Password confirmation does not match')) {
                errorMessage = 'Password confirmation does not match.';
              } else {
                errorMessage = errorData.message;
              }
            } else {
              errorMessage = 'Password reset failed. Please check your input and try again.';
            }
          } else if (response.status === 401) {
            errorMessage = 'Invalid token';
          } else if (response.status === 404) {
            errorMessage = 'User not found';
          } else if (response.status === 500) {
            errorMessage = 'Internal server error';
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          // Fallback to generic error message if JSON parsing fails
          if (response.status === 400) {
            errorMessage = 'Password reset failed. Please check your input and try again.';
          } else if (response.status === 401) {
            errorMessage = 'Password reset failed. The reset link may be invalid or expired.';
          }
        }

        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Password reset network error:', error);
      setMessage('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200 ring-1 ring-gray-100">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full bg-gradient-to-r from-primary via-purple-600 to-cyan-500 text-white p-3 rounded-lg hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-500 text-white p-3 rounded-lg hover:shadow-lg hover:shadow-gray-500/25 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200 ring-1 ring-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-gray-700 mb-2 text-sm font-medium">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password"
              className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
              required
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 text-sm font-medium">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
              className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {message && (
            <div className="text-center">
              <p className={`text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary via-purple-600 to-cyan-500 text-white p-3 rounded-lg hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordToken;