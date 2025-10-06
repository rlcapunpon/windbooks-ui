import { Link } from 'react-router-dom';
import Banner from '../../components/Banner';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background-primary">
      <Banner
        title=""
        subtitle=""
        variant="hero"
        logoSrc="/wb_icon_02.png"
      >
        <div className="flex space-x-4">
          <Link
            to="/auth/login"
            className="btn-secondary"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="btn-secondary"
          >
            Register
          </Link>
        </div>
      </Banner>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem-3rem)] px-4">
        <div className="text-center max-w-6xl">
          <h1 className="text-heading text-5xl mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent leading-tight">
            Tax Operations Simplified
          </h1>
          <p className="text-body text-2xl mb-12 leading-relaxed max-w-4xl mx-auto">
            Our proprietary bookkeeping platform that automates BIR-compliant tax filings, and enhances team productivity across all locations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              to="/auth/login"
              className="btn-primary py-4 px-8 rounded-xl text-lg"
            >
              Access Platform
            </Link>
            <Link
              to="/auth/register"
              className="btn-primary py-4 px-8 rounded-xl text-lg"
            >
              Create Account
            </Link>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-green-600 mb-2">30-50%</div>
              <div className="text-gray-700 font-semibold">Faster Processing</div>
              <div className="text-sm text-gray-500">BIR form completion time</div>
            </div>
            <div className="card bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-primary mb-2">20-30%</div>
              <div className="text-gray-700 font-semibold">Increased Capacity</div>
              <div className="text-sm text-gray-500">per bookkeeper monthly</div>
            </div>
            <div className="card bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">&lt;2%</div>
              <div className="text-gray-700 font-semibold">Error Rate</div>
              <div className="text-sm text-gray-500">filing accuracy maintained</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-subheading text-5xl mb-6">
              Built for DV Consulting Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform designed specifically for our bookkeeping and compliance teams,
              ensuring consistent, accurate, and efficient tax processing across all locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">BIR-Compliant Automation</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically generate accurate BIR forms (1701Q, 2551Q, 1601C) with built-in
                validation. Ensures consistent compliance across all team members and locations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Offline-First Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Work seamlessly in areas with poor connectivity. All data syncs automatically when
                back online, ensuring our field teams can continue working without interruption.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Streamlined Workflows</h3>
              <p className="text-gray-600 leading-relaxed">
                Centralized platform that standardizes processes across all team members.
                Eliminates redundant work and ensures consistent quality in all tax filings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Team Performance Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive dashboards for managers to track filing statuses, deadlines, and team
                productivity. Monitor workload distribution and identify areas for improvement.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Role-Based Access Control</h3>
              <p className="text-gray-600 leading-relaxed">
                Secure access controls ensure team members only see data relevant to their role.
                Complete audit logs track all activities for compliance and accountability.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Scalable Architecture</h3>
              <p className="text-gray-600 leading-relaxed">
                Built to grow with DV Consulting. Supports multiple teams, locations, and future
                expansion while maintaining consistent performance and security standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-5xl font-bold text-white mb-8">
            Join the DV Consulting Digital Transformation
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Be part of our journey to modernize tax compliance processes. Windbooks empowers our teams
            to work more efficiently, maintain higher accuracy, and deliver better service to our clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/auth/register"
              className="btn-primary py-4 px-10 rounded-xl text-lg hover:bg-gray-50"
            >
              Get Started
            </Link>
            <Link
              to="/auth/login"
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-xl hover:bg-white hover:text-primary transition-all duration-300 text-lg"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-200 mt-8 text-sm">
            For DV Consulting Team Members Only
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Windbooks</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              DV Consulting's proprietary bookkeeping and tax compliance platform.
              Built for our teams, by our teams, to deliver exceptional service to our clients.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2025 DV Consulting</span>
              <span>•</span>
              <span>Internal Use Only</span>
              <span>•</span>
              <span>BIR-Compliant Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;