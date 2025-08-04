import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, Shield, User, LogOut } from "lucide-react";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            <Shield className="w-8 h-8 text-blue-600" />
            <span>trusTissue</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {auth.token ? (
              <>
                <Link
                  to={`/dashboard/${auth.role}`}
                  className={`nav-link ${isActive(`/dashboard/${auth.role}`) ? 'active' : ''}`}
                >
                  Dashboard
                </Link>

                {auth.role === "seller" && (
                  <Link
                    to="/seller/withdraw"
                    className={`nav-link ${isActive('/seller/withdraw') ? 'active' : ''}`}
                  >
                    Withdraw
                  </Link>
                )}

                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="capitalize font-medium">{auth.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {auth.token ? (
              <>
                <Link
                  to={`/dashboard/${auth.role}`}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {auth.role === "seller" && (
                  <Link
                    to="/seller/withdraw"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Withdraw
                  </Link>
                )}

                <div className="px-3 py-2 text-sm text-gray-500 border-t border-gray-200 mt-3 pt-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4" />
                    <span className="capitalize font-medium">{auth.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-center font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
