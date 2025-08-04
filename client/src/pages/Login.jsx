import { useState, useContext } from "react";
import { login } from "../services/api";
import RoleSelect from "../components/RoleSelect";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Shield, AlertCircle, CheckCircle } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState(""); // success, error

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await login(form);
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      localStorage.setItem("trustissue_token", token);
      setAuth({
        token,
        role: payload.role,
        email: payload.email,
      });

      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        navigate(`/dashboard/${payload.role}`);
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your trusTissue account</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <RoleSelect 
                value={form.role} 
                onChange={handleChange} 
                allowed="login" 
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg flex items-center space-x-3 ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <p className={`text-sm font-medium ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Access</h3>
          <p className="text-xs text-blue-700">
            Use role-specific credentials to explore different dashboard views and features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
