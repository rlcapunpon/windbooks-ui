import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background-secondary text-text-primary">
      <nav className="bg-background-surface/5 backdrop-blur-md p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent">Windbooks UI</h1>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-state-error to-accent-purple text-text-primary px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-state-error/25 transition-all duration-300 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent">Welcome back 🚀</h1>
          <p className="text-lg md:text-xl text-text-secondary mb-4">Admin Dashboard</p>
          <p className="text-sm text-text-disabled">Hello, {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;