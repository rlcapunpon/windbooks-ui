import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Windbooks UI</h1>
        <p className="text-lg mb-8 text-gray-600">Secure authentication and authorization platform</p>
        <div className="space-x-4">
          <Link
            to="/auth/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;