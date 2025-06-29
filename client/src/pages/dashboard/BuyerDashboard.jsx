import { useEffect, useState } from "react";
import axios from "axios";

const BuyerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [interestedProductIds, setInterestedProductIds] = useState([]);
  const [verifiedInterests, setVerifiedInterests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [interestFeatures, setInterestFeatures] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("trustissue_token");

  useEffect(() => {
    fetchApprovedProducts();
    fetchMyInterests();
    fetchVerifiedInterests();
    fetchPurchases();
  }, []);

  const fetchApprovedProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/buyer/approved-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching approved products", err);
    }
  };

  const fetchMyInterests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/buyer/my-interests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = res.data.map((interest) => interest.product._id);
      setInterestedProductIds(ids);
    } catch (err) {
      console.error("Error fetching interests", err);
    }
  };

  const fetchVerifiedInterests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/buyer/verified-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerifiedInterests(res.data);
    } catch (err) {
      console.error("Error fetching verified interests", err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/buyer/my-purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(res.data);
    } catch (err) {
      console.error("Error fetching purchases", err);
    }
  };

  const handleInterestSubmit = async () => {
    try {
      const featuresArray = interestFeatures
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await axios.post(
        "http://localhost:5000/api/buyer/express-interest",
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

  const availableProducts = products
    .filter((p) => !interestedProductIds.includes(p._id))
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const interestedProducts = products.filter((p) => interestedProductIds.includes(p._id));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Approved Products
      </h2>

      {message && <p className="text-center text-green-600 mb-4">{message}</p>}

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

                  const formData = new FormData();
                  formData.append("proof", file);

                  try {
                    const res = await axios.post(
                      `http://localhost:5000/api/buyer/upload-payment/${interest._id}`,
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
                  Upload Payment Proof
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
                  href={`http://localhost:5000${item.product.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mt-2 block"
                >
                  Download Product File
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
