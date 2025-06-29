import { useEffect, useState } from "react";
import axios from "axios";

const SellerWithdraw = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("trustissue_token");

  const fetchBalance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/seller/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Balance fetch error:", err);
      setMessage("Failed to fetch balance");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return setMessage("Enter a valid withdrawal amount");
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/seller/withdraw",
        { amount: Number(amount) },
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
    fetchBalance();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
        💸 Withdraw Balance
      </h2>

      <p className="text-lg text-center text-green-700 mb-4">
        Current Balance: ₹{balance}
      </p>

      {message && (
        <p className="text-center text-sm text-indigo-700 mb-4">{message}</p>
      )}

      <form onSubmit={handleWithdraw} className="space-y-4">
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to withdraw"
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Request Withdrawal
        </button>
      </form>
    </div>
  );
};

export default SellerWithdraw;
