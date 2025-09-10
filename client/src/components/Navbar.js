import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Upload, BarChart3, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OH</span>
            </div>
            <span className="font-semibold text-gray-900">Oral Health Screening</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Home size={16} />
                  <span>Home</span>
                </Link>

                {user.role === 'patient' && (
                  <>
                    <Link
                      to="/upload"
                      className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Upload size={16} />
                      <span>Upload</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <BarChart3 size={16} />
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <BarChart3 size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 text-gray-700">
                  <User size={16} />
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;