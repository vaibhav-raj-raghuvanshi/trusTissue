import { useEffect, useState } from "react";
import axios from "axios";

// Use the same base URL as the main API service
const BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API_BASE = `${BASE}/api`;

const VerifierDashboard = () => {
  const [products, setProducts] = useState([]);
  const [interests, setInterests] = useState([]);
  const [uploadedPayments, setUploadedPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [featureSelections, setFeatureSelections] = useState({});
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("trustissue_token");

  const fetchData = async () => {
    try {
      const [productRes, interestRes, paymentRes] = await Promise.all([
        axios.get(`${API_BASE}/verifier/pending-products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/verifier/pending-interests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/verifier/payment-uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProducts(productRes.data || []);
      setInterests(interestRes.data || []);
      setUploadedPayments(paymentRes.data || []);
      setIsOfflineMode(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setIsOfflineMode(true);
      setMessage("⚠️ Running in offline mode. Backend server is not available.");

      // Set demo data for offline mode
      setProducts([
        {
          _id: "1",
          name: "Demo Product 1",
          description: "This is a sample product for verification",
          category: "Electronics",
          price: 25000,
          fileUrl: null
        },
        {
          _id: "2",
          name: "Demo Product 2",
          description: "Another sample product listing",
          category: "Clothing",
          price: 1200,
          fileUrl: null
        }
      ]);

      setInterests([
        {
          _id: "1",
          product: {
            name: "Sample Interest Product",
            category: "Electronics",
            price: 15000,
            fileUrl: null
          },
          buyer: { email: "buyer@demo.com" },
          featuresRequested: ["warranty", "original_packaging", "accessories"]
        }
      ]);

      setUploadedPayments([
        {
          _id: "1",
          product: {
            name: "Payment Demo Product",
            price: 8000
          },
          buyer: { email: "payment-buyer@demo.com" },
          paymentProofUrl: null
        }
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleProductAction = async (id, action) => {
    if (isOfflineMode) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setMessage(`✅ Product ${action} (offline mode)`);
      return;
    }

    try {
      const res = await axios.patch(
        `${API_BASE}/verifier/verify/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Action error:", err);
      setMessage("Product verification failed");
    }
  };

  const handleFeatureChange = (interestId, feature, status) => {
    setFeatureSelections((prev) => ({
      ...prev,
      [interestId]: {
        ...(prev[interestId] || {}),
        [feature]: status,
      },
    }));
  };

  const submitInterestVerification = async (interest) => {
    const selections = featureSelections[interest._id];
    if (!selections) return setMessage("Please mark all features");

    const featureStatus = interest.featuresRequested.map((f) => ({
      name: f,
      status: selections[f] || "absent",
    }));

    if (isOfflineMode) {
      setInterests((prev) => prev.filter((i) => i._id !== interest._id));
      setMessage("✅ Interest verification submitted (offline mode)");
      return;
    }

    try {
      const res = await axios.patch(
        `${API_BASE}/verifier/verify-interest/${interest._id}`,
        { featureStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setInterests((prev) => prev.filter((i) => i._id !== interest._id));
    } catch (err) {
      console.error("Interest verification error:", err);
      setMessage("Interest verification failed");
    }
  };

  const handlePaymentAction = async (id, action) => {
    if (isOfflineMode) {
      setUploadedPayments((prev) => prev.filter((p) => p._id !== id));
      setMessage(`✅ Payment ${action} (offline mode)`);
      return;
    }

    try {
      const res = await axios.patch(
        `${API_BASE}/verifier/confirm-payment/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setUploadedPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Payment confirmation error:", err);
      setMessage("Payment action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verifier dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-4">
        Verifier Dashboard
      </h1>

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

      {message && <p className="text-center text-green-600 mb-4">{message}</p>}

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-3">🛠 Pending Product Listings</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No pending products 🎉</p>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <div key={product._id} className="border rounded p-4 shadow bg-white">
                <h3 className="text-lg font-bold">{product?.name || "Unnamed Product"}</h3>
                <p>{product?.description || "No description"}</p>
                <p className="text-sm text-gray-600">Category: {product?.category || "N/A"}</p>
                <p className="text-sm">Price: ₹{product?.price || 0}</p>
                {product?.fileUrl && (
                  <a
                    href={isOfflineMode ? "#" : `${BASE}${product.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isOfflineMode ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'} underline`}
                    onClick={isOfflineMode ? (e) => e.preventDefault() : undefined}
                  >
                    View File {isOfflineMode && "(Not available in offline mode)"}
                  </a>
                )}
                <div className="mt-3 flex gap-4">
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded"
                    onClick={() => handleProductAction(product._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-1 rounded"
                    onClick={() => handleProductAction(product._id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-3">📩 Pending Interest Verifications</h2>
        {interests.length === 0 ? (
          <p className="text-gray-500">No pending interests</p>
        ) : (
          interests.map((interest) => (
            <div key={interest._id} className="border rounded p-4 mb-6 shadow bg-white">
              <h3 className="text-lg font-bold">{interest?.product?.name || "Unnamed Product"}</h3>
              <p className="text-gray-600">Buyer: {interest?.buyer?.email || "Unknown"}</p>
              <p className="text-sm text-gray-600">Category: {interest?.product?.category || "N/A"}</p>
              <p className="text-sm">Price: ₹{interest?.product?.price || 0}</p>
              {interest?.product?.fileUrl && (
                <a
                  href={isOfflineMode ? "#" : `${BASE}${interest.product.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isOfflineMode ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'} underline block my-1`}
                  onClick={isOfflineMode ? (e) => e.preventDefault() : undefined}
                >
                  View Product File {isOfflineMode && "(Not available in offline mode)"}
                </a>
              )}
              <p className="mb-2 font-medium">Requested Features:</p>
              <ul className="mb-3">
                {interest?.featuresRequested?.map((feature, idx) => (
                  <li key={idx} className="mb-2">
                    <span className="font-mono mr-2">{feature}</span>
                    <label className="mr-2">
                      <input
                        type="radio"
                        name={`${interest._id}_${feature}`}
                        onChange={() =>
                          handleFeatureChange(interest._id, feature, "present")
                        }
                      />{" "}
                      Present
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`${interest._id}_${feature}`}
                        onChange={() =>
                          handleFeatureChange(interest._id, feature, "absent")
                        }
                      />{" "}
                      Absent
                    </label>
                  </li>
                ))}
              </ul>
              <button
                className="bg-indigo-600 text-white px-4 py-1 rounded"
                onClick={() => submitInterestVerification(interest)}
              >
                Submit Verification
              </button>
            </div>
          ))
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">💳 Uploaded Payment Proofs</h2>
        {uploadedPayments.length === 0 ? (
          <p className="text-gray-500">No uploaded payments</p>
        ) : (
          uploadedPayments.map((interest) => (
            <div key={interest._id} className="border rounded p-4 mb-6 shadow bg-white">
              <h3 className="text-lg font-bold">{interest?.product?.name || "Unnamed Product"}</h3>
              <p className="text-sm">Buyer: {interest?.buyer?.email || "Unknown"}</p>
              <p className="text-sm text-gray-600">Price: ₹{interest?.product?.price || 0}</p>
              {interest?.paymentProofUrl && (
                <a
                  href={isOfflineMode ? "#" : `${BASE}${interest.paymentProofUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isOfflineMode ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'} underline block my-1`}
                  onClick={isOfflineMode ? (e) => e.preventDefault() : undefined}
                >
                  View Payment Proof {isOfflineMode && "(Not available in offline mode)"}
                </a>
              )}
              <div className="mt-3 flex gap-4">
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
          ))
        )}
      </section>
    </div>
  );
};

export default VerifierDashboard;
