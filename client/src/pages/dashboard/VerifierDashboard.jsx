import { useEffect, useState } from "react";
import axios from "axios";

const VerifierDashboard = () => {
  const [products, setProducts] = useState([]);
  const [interests, setInterests] = useState([]);
  const [uploadedPayments, setUploadedPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [featureSelections, setFeatureSelections] = useState({});

  const token = localStorage.getItem("trustissue_token");

  const fetchData = async () => {
    try {
      const [productRes, interestRes, paymentRes] = await Promise.all([
        axios.get("http://localhost:5000/api/verifier/pending-products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/verifier/pending-interests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/verifier/payment-uploads", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProducts(productRes.data || []);
      setInterests(interestRes.data || []);
      setUploadedPayments(paymentRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to load pending items");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductAction = async (id, action) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/verifier/verify/${id}`,
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

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/verifier/verify-interest/${interest._id}`,
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
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/verifier/confirm-payment/${id}`,
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

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-4">
        Verifier Dashboard
      </h1>
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
                    href={`http://localhost:5000${product.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View File
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
                  href={`http://localhost:5000${interest.product.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline block my-1"
                >
                  View Product File
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
                  href={`http://localhost:5000${interest.paymentProofUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline block my-1"
                >
                  View Payment Proof
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
