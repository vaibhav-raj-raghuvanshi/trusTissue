import { useEffect, useState } from "react";
import axios from "axios";

// Use the same base URL as the main API service
const BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API_BASE = `${BASE}/api`;

const BuyerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [interestedProductIds, setInterestedProductIds] = useState([]);
  const [verifiedInterests, setVerifiedInterests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [interestFeatures, setInterestFeatures] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("trustissue_token");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchApprovedProducts(),
        fetchMyInterests(),
        fetchVerifiedInterests(),
        fetchPurchases()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const fetchApprovedProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/buyer/approved-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      setIsOfflineMode(false);
    } catch (err) {
      console.error("Error fetching approved products", err);
      setIsOfflineMode(true);
      setMessage("⚠️ Running in offline mode. Backend server is not available.");

      // Set demo data for offline mode
      setProducts([
        {
          _id: "1",
          name: "Premium Smartphone",
          description: "Latest flagship smartphone with advanced features",
          category: "Electronics",
          price: 45000,
          seller: { email: "seller1@demo.com" }
        },
        {
          _id: "2",
          name: "Wireless Headphones",
          description: "High-quality noise-cancelling wireless headphones",
          category: "Electronics",
          price: 8500,
          seller: { email: "seller2@demo.com" }
        },
        {
          _id: "3",
          name: "Gaming Laptop",
          description: "High-performance gaming laptop for professionals",
          category: "Electronics",
          price: 85000,
          seller: { email: "seller3@demo.com" }
        }
      ]);
    }
  };

  const fetchMyInterests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/buyer/my-interests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = res.data.map((interest) => interest.product._id);
      setInterestedProductIds(ids);
    } catch (err) {
      console.error("Error fetching interests", err);

      // Set demo data for offline mode
      setInterestedProductIds([]); // No products showing interest initially in demo
    }
  };

  const fetchVerifiedInterests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/buyer/verified-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerifiedInterests(res.data);
    } catch (err) {
      console.error("Error fetching verified interests", err);

      // Set demo data for offline mode
      setVerifiedInterests([
        {
          _id: "v1",
          product: {
            name: "Demo Verified Product",
            description: "A product that has been verified",
            price: 25000
          },
          verifiedBy: { email: "verifier@demo.com" },
          featureStatus: [
            { name: "warranty", status: "present" },
            { name: "original_packaging", status: "present" },
            { name: "accessories", status: "absent" }
          ],
          paymentStatus: "pending"
        }
      ]);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API_BASE}/buyer/my-purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(res.data);
    } catch (err) {
      console.error("Error fetching purchases", err);

      // Set demo data for offline mode
      setPurchases([
        {
          _id: "p1",
          product: {
            name: "Demo Purchase 1",
            price: 15000,
            category: "Electronics",
            fileUrl: "/demo-file.pdf"
          },
          paymentStatus: "confirmed",
          verifiedBy: { email: "verifier@demo.com" }
        },
        {
          _id: "p2",
          product: {
            name: "Demo Purchase 2",
            price: 8000,
            category: "Accessories"
          },
          paymentStatus: "failed",
          verifiedBy: { email: "verifier@demo.com" }
        }
      ]);
    }
  };

  const handleInterestSubmit = async () => {
    const featuresArray = interestFeatures
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    if (featuresArray.length === 0) {
      setMessage("Please enter at least one feature requirement");
      return;
    }

    if (isOfflineMode) {
      // Handle offline mode
      setMessage("✅ Interest submitted (offline mode)");
      setInterestedProductIds((prev) => [...prev, selectedProductId]);
      setSelectedProductId(null);
      setInterestFeatures("");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/buyer/express-interest`,
        {
          productId: selectedProductId,
          features: featuresArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);
      setInterestedProductIds((prev) => [...prev, selectedProductId]);
      setSelectedProductId(null);
      setInterestFeatures("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit interest");
    }
  };

  const handleDismissFailedPurchase = (id) => {
    setPurchases((prev) => prev.filter((p) => p._id !== id));
  };

  // Get IDs of products that are already verified to exclude them from other sections
  const verifiedProductIds = verifiedInterests.map(interest => interest.product._id || interest.product.id);

  const availableProducts = products
    .filter((p) => !interestedProductIds.includes(p._id))
    .filter((p) => !verifiedProductIds.includes(p._id))
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Only show products that are interested but NOT yet verified
  const interestedProducts = products
    .filter((p) => interestedProductIds.includes(p._id))
    .filter((p) => !verifiedProductIds.includes(p._id));

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading buyer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Approved Products
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

      {message && <p className={`text-center mb-4 ${
        message.includes('✅') ? 'text-green-600' :
        message.includes('⚠️') ? 'text-orange-600' :
        'text-green-600'
      }`}>{message}</p>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableProducts.map((product) => (
          <div key={product._id} className="border rounded p-4 shadow">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p>{product.description}</p>
            <p className="text-sm text-gray-500">Category: {product.category}</p>
            <p className="text-sm text-gray-500 font-medium text-green-700">Price: ₹{product.price}</p>
            <p className="text-sm">Seller: {product.seller?.email}</p>
            <button
              className="mt-3 px-3 py-1 bg-green-600 text-white rounded text-sm"
              onClick={() => setSelectedProductId(product._id)}
            >
              I'm Interested
            </button>
          </div>
        ))}
      </div>

      {selectedProductId && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-bold mb-2">Enter Required Features</h3>
          <input
            type="text"
            placeholder="E.g. fast charging, metal body"
            value={interestFeatures}
            onChange={(e) => setInterestFeatures(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded"
              onClick={handleInterestSubmit}
            >
              Submit
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-1 rounded"
              onClick={() => {
                setSelectedProductId(null);
                setInterestFeatures("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-yellow-700 mb-4">
          Products Getting Verified
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interestedProducts.map((product) => (
            <div key={product._id} className="border rounded p-4 bg-yellow-50 shadow">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p>{product.description}</p>
              <p className="text-sm text-gray-500">Category: {product.category}</p>
              <p className="text-sm text-gray-500 font-medium text-green-700">Price: ₹{product.price}</p>
              <p className="text-sm">Seller: {product.seller?.email}</p>
              <p className="text-xs italic text-yellow-700 mt-2">
                Awaiting verifier approval...
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-green-700 mb-4">
          Verified Products (Ready to Buy)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifiedInterests.map((interest) => (
            <div key={interest._id} className="border rounded p-4 bg-green-50 shadow">
              <h3 className="text-lg font-semibold">{interest.product.name}</h3>
              <p>{interest.product.description}</p>
              <p className="text-sm text-gray-500 font-medium text-green-700">Price: ₹{interest.product.price}</p>
              <p className="text-sm text-gray-500">
                Verified By: {interest.verifiedBy?.email}
              </p>
              <p className="text-sm mt-2 font-medium">Feature Status:</p>
              <ul className="list-disc list-inside text-sm">
                {interest.featureStatus.map((f, i) => (
                  <li key={i}>
                    {f.name} -{" "}
                    <span
                      className={f.status === "present" ? "text-green-600" : "text-red-500"}
                    >
                      {f.status}
                    </span>
                  </li>
                ))}
              </ul>

              <form
                className="mt-3 flex flex-col gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const file = e.target.elements.proof.files[0];
                  if (!file) return alert("Please select a file");

                  if (isOfflineMode) {
                    alert("✅ Payment proof uploaded (offline mode)");
                    return;
                  }

                  const formData = new FormData();
                  formData.append("proof", file);

                  try {
                    const res = await axios.post(
                      `${API_BASE}/buyer/upload-payment/${interest._id}`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );
                    alert("Payment proof uploaded!");
                    fetchVerifiedInterests();
                    fetchPurchases();
                  } catch (err) {
                    console.error(err);
                    alert("Failed to upload payment proof");
                  }
                }}
              >
                <input type="file" name="proof" accept="image/*,application/pdf" />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Upload Payment Proof {isOfflineMode && "(Demo)"}
                </button>
              </form>


              {interest.paymentStatus && (
                <p className="text-xs text-gray-600 mt-1">
                  Payment Status:{" "}
                  <span className="font-medium">{interest.paymentStatus}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>


      <div className="mt-12">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">My Purchases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purchases.map((item) => (
            <div key={item._id} className="border rounded p-4 shadow bg-white">
              <h3 className="text-lg font-bold">{item.product.name}</h3>
              <p className="text-sm">Price: ₹{item.product.price}</p>
              <p className="text-sm">Category: {item.product.category}</p>

              {item.paymentStatus === "confirmed" ? (
                <a
                  href={isOfflineMode ? "#" : `${BASE}${item.product.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isOfflineMode ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'} underline mt-2 block`}
                  onClick={isOfflineMode ? (e) => e.preventDefault() : undefined}
                >
                  Download Product File {isOfflineMode && "(Not available in offline mode)"}
                </a>
              ) : (
                <>
                  <p className="text-red-600 text-sm mt-2">
                    Payment failed. Contact verifier:{" "}
                    <a href={`mailto:${item.verifiedBy?.email}`} className="underline">
                      {item.verifiedBy?.email}
                    </a>
                  </p>
                  <button
                    onClick={() => handleDismissFailedPurchase(item._id)}
                    className="mt-2 text-sm px-3 py-1 bg-gray-400 text-white rounded"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
