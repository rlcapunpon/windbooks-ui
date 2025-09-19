import { Link } from 'react-router-dom';
import Banner from '../../components/Banner';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background-primary">
      <Banner
        title="Windbooks"
        subtitle="Bookkeeping and tax filing platform"
        variant="hero"
      >
        <div className="flex space-x-4">
          <Link
            to="/auth/login"
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg backdrop-blur-sm transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg backdrop-blur-sm transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </Banner>

      <div className="flex items-center justify-center min-h-[calc(100vh-6rem-3rem)] px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold mb-6 text-gray-800 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            Welcome to Windbooks
          </h1>
          <p className="text-xl mb-12 text-gray-600 leading-relaxed">
            Simplify your bookkeeping and tax filing process with our modern,
            secure platform designed for businesses and accountants.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/auth/login"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/auth/register"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;