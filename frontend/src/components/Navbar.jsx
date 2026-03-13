import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
            <BookOpen size={24} className="text-blue-600" />
            <span className="text-xl font-bold tracking-tight">NeuroLearn</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
                <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={18} className="text-gray-400" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/auth" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-sm">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;