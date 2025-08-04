import { useState, useContext } from "react";
import { signup, login } from "../services/api";
import RoleSelect from "../components/RoleSelect";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
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
      // First, create the account
      await signup(form);

      setMessage("Account created successfully! Signing you in...");
      setMessageType("success");

      // Then automatically log them in
      const loginRes = await login({
        email: form.email,
        password: form.password,
        role: form.role
      });

      const token = loginRes.data.token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      localStorage.setItem("trustissue_token", token);
      setAuth({
        token,
        role: payload.role,
        email: payload.email,
      });

      // Show success message briefly before redirecting
      setMessage("Welcome to trusTissue! Redirecting to your dashboard...");

      // Redirect to their dashboard after a short delay
      setTimeout(() => {
        navigate(`/dashboard/${payload.role}`);
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed. Please try again.");
      setMessageType("error");
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join trusTissue and start trading safely</p>
        </div>

        {/* Signup Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

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
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <RoleSelect 
                value={form.role} 
                onChange={handleChange} 
                allowed="signup" 
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose buyer to purchase items or seller to list products
              </p>
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Why trusTissue?</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Secure third-party verification</li>
            <li>• Escrow protection for all transactions</li>
            <li>• 24/7 customer support</li>
            <li>• Global marketplace access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;
