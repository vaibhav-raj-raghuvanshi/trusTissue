import { useEffect, useState } from "react";
import axios from "axios";

const VerifierPaymentDashboard = () => {
  const [uploadedPayments, setUploadedPayments] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("trustissue_token");

  const fetchUploadedPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/verifier/uploaded-payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedPayments(res.data);
    } catch (err) {
      console.error("Error fetching uploaded payments:", err);
      setMessage("Failed to load uploaded payments");
    }
  };

  useEffect(() => {
    fetchUploadedPayments();
  }, []);

  const handlePaymentAction = async (interestId, action) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/verifier/confirm-payment/${interestId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setUploadedPayments((prev) => prev.filter((i) => i._id !== interestId));
    } catch (err) {
      console.error("Payment action error:", err);
      setMessage("Failed to update payment status");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-4">
        Payment Confirmations
      </h1>
      {message && <p className="text-center text-green-600 mb-4">{message}</p>}

      {uploadedPayments.length === 0 ? (
        <p className="text-gray-500 text-center">No uploaded payments at the moment 🎉</p>
      ) : (
        <div className="space-y-6">
          {uploadedPayments.map((interest) => (
            <div key={interest._id} className="border rounded p-4 shadow bg-white">
              <h3 className="text-lg font-bold">{interest.product.name}</h3>
              <p>Buyer: {interest.buyer?.email}</p>
              <p className="text-sm text-gray-600 mb-2">Category: {interest.product.category}</p>
              <p className="text-sm mb-2">Price: ₹{interest.product.price}</p>

              <p className="font-medium">Payment Proof:</p>
              <a
                href={`http://localhost:5000${interest.paymentProofUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Proof
              </a>

              <div className="mt-3 flex gap-3">
                <button
                  className="bg-green-600 text-white px-4 py-1 rounded"
                  onClick={() => handlePaymentAction(interest._id, "confirmed")}
                >
                  Confirm Payment
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded"
                  onClick={() => handlePaymentAction(interest._id, "rejected")}
                >
                  Reject Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerifierPaymentDashboard;
