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

const Home = () => (
  <div className="text-center mt-10 text-2xl text-blue-700 font-semibold">
    Welcome to <span className="text-purple-600">trusTissue</span> 🚀
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
            <div className="text-center mt-10 text-red-600 text-lg font-medium">
              404 | Page Not Found 😢
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
