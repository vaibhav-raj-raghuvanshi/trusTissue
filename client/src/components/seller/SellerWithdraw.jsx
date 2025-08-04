import { useEffect, useState } from "react";
import axios from "axios";

// Use the same base URL as the main API service
const BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API_BASE = `${BASE}/api`;

const SellerWithdraw = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("trustissue_token");

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/seller/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBalance(res.data.balance);
      setIsOfflineMode(false);
    } catch (err) {
      console.error("Balance fetch error:", err);
      setIsOfflineMode(true);
      setMessage("⚠️ Running in offline mode. Backend server is not available.");

      // Set demo balance for offline mode
      setBalance(45750); // Demo balance amount
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return setMessage("Enter a valid withdrawal amount");
    }

    const withdrawAmount = Number(amount);

    if (withdrawAmount > balance) {
      return setMessage("Insufficient balance");
    }

    if (isOfflineMode) {
      // Handle offline mode
      setBalance(balance - withdrawAmount);
      setMessage(`✅ Withdrawal request for ₹${withdrawAmount} submitted (offline mode)`);
      setAmount("");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/seller/withdraw`,
        { amount: withdrawAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(res.data.message);
      setAmount("");
      fetchBalance();
    } catch (err) {
      console.error("Withdrawal error:", err);
      setMessage(err.response?.data?.message || "Withdrawal failed");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchBalance();
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading balance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
        💸 Withdraw Balance
      </h2>

      {isOfflineMode && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-orange-600 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Offline Mode</h3>
              <p className="text-sm text-orange-700">
                Backend server is not available. You're viewing demo data and changes won't be saved.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-lg text-center text-green-700 mb-4">
        Current Balance: ₹{balance.toLocaleString()}
      </p>

      {message && (
        <p className={`text-center text-sm mb-4 ${
          message.includes('✅') ? 'text-green-700' :
          message.includes('⚠️') ? 'text-orange-700' :
          'text-indigo-700'
        }`}>{message}</p>
      )}

      <form onSubmit={handleWithdraw} className="space-y-4">
        <input
          type="number"
          min="1"
          max={balance}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Enter amount to withdraw (max: ₹${balance.toLocaleString()})`}
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={balance === 0}
        >
          Request Withdrawal {isOfflineMode && "(Demo)"}
        </button>

        {balance === 0 && (
          <p className="text-center text-sm text-gray-500">
            No balance available for withdrawal
          </p>
        )}
      </form>
    </div>
  );
};

export default SellerWithdraw;
