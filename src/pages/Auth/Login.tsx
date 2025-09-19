import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

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

  const {
    register,
    handleSubmit,
    setValue,
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
    } catch (error) {
      console.error('Login failed:', error);
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
      <form onSubmit={onSubmit} className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200 ring-1 ring-gray-100">
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
        <div className="mb-6">
          <label className="flex items-center">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
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
          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">Forgot password?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;