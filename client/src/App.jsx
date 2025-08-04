import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import VerifierDashboard from "./pages/dashboard/VerifierDashboard";
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import VerifierPaymentDashboard from "./pages/dashboard/VerifierPaymentDashboard";

import SellerWithdraw from "./components/seller/SellerWithdraw";
import { 
  Shield, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight, 
  Star,
  Lock,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="min-h-screen">
    {/* Hero Section */}
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%233b82f6\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8">
            <Shield className="w-4 h-4 mr-2" />
            Trusted by thousands of users worldwide
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Build Trust in
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Informal Markets</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            trusTissue is a comprehensive verification platform that enables secure transactions 
            in informal marketplaces through trusted third-party verification.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="btn-primary text-lg flex items-center space-x-2">
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg">
              Sign In
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">10k+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">50k+</div>
              <div className="text-gray-600">Verified Transactions</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">4.9/5</div>
              <div className="text-gray-600">User Rating</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose trusTissue?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform provides comprehensive solutions for secure, verified transactions 
            in informal marketplaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center group hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Verification</h3>
            <p className="text-gray-600 leading-relaxed">
              Professional verifiers ensure every transaction meets our strict security standards, 
              protecting both buyers and sellers.
            </p>
          </div>

          <div className="card text-center group hover:scale-105">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Trust Guarantee</h3>
            <p className="text-gray-600 leading-relaxed">
              Our escrow system and verification process guarantee secure transactions, 
              giving you peace of mind with every purchase.
            </p>
          </div>

          <div className="card text-center group hover:scale-105">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Reach</h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with verified users worldwide and expand your market reach while 
              maintaining the highest security standards.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Start Trading Safely?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Join thousands of users who trust trusTissue for their secure transactions 
          in informal marketplaces.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Create Account
          </Link>
          <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
            Sign In
          </Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">trusTissue</span>
          </div>
          <div className="text-gray-400 text-center md:text-right">
            <p>&copy; 2024 trusTissue. All rights reserved.</p>
            <p className="text-sm mt-1">Building trust in informal markets worldwide.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["verifier"]} />}>
          <Route path="/dashboard/verifier" element={<VerifierDashboard />} />
          <Route path="/verifier/payments" element={<VerifierPaymentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["buyer"]} />}>
          <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
          <Route path="/seller/withdraw" element={<SellerWithdraw />} />  
        </Route>

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
              <div className="text-center">
                <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                <Link to="/" className="btn-primary">
                  Go Home
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
