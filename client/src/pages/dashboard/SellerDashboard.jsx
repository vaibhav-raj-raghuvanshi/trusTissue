import { useState, useEffect } from "react";
import axios from "axios";

// Use the same base URL as the main API service
const BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API_BASE = `${BASE}/api`;

const SellerDashboard = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    file: null,
  });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [interestRequests, setInterestRequests] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("trustissue_token");

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/seller/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
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
          description: "This is a sample product listing",
          price: 15000,
          category: "Electronics",
          status: "approved",
          fileUrl: null
        },
        {
          _id: "2",
          name: "Demo Product 2",
          description: "Another sample product",
          price: 2500,
          category: "Clothing",
          status: "pending",
          fileUrl: null
        },
        {
          _id: "3",
          name: "Demo Product 3",
          description: "A rejected product example",
          price: 8000,
          category: "Books",
          status: "rejected",
          fileUrl: null
        }
      ]);
    }
  };

  const fetchInterestRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/seller/interest-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterestRequests(res.data);
    } catch (err) {
      console.error("Interest fetch error:", err);

      // Set demo data for offline mode
      setInterestRequests([
        {
          _id: "1",
          product: { name: "Demo Product 1" },
          buyer: { email: "buyer1@demo.com" },
          featuresRequested: ["warranty", "original_packaging"],
          featureStatus: [
            { name: "warranty", status: "present" },
            { name: "original_packaging", status: "absent" }
          ]
        },
        {
          _id: "2",
          product: { name: "Demo Product 2" },
          buyer: { email: "buyer2@demo.com" },
          featuresRequested: ["accessories", "manual"],
          featureStatus: []
        }
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchInterestRequests()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isOfflineMode) {
      // Handle offline mode
      if (editingId) {
        const updatedProducts = products.map(p =>
          p._id === editingId ? {
            ...p,
            name: form.name,
            description: form.description,
            price: form.price,
            category: form.category
          } : p
        );
        setProducts(updatedProducts);
        setMessage("✅ Product updated (offline mode)");
      } else {
        const newProduct = {
          _id: Date.now().toString(),
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.category,
          status: "pending",
          fileUrl: null
        };
        setProducts([...products, newProduct]);
        setMessage("✅ Product uploaded (offline mode)");
      }
      setForm({ name: "", description: "", price: "", category: "", file: null });
      setEditingId(null);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    if (form.file) formData.append("file", form.file);

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/seller/edit-product/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setMessage("Product updated successfully");
      } else {
        await axios.post(`${API_BASE}/seller/upload-product`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("Product uploaded successfully");
      }

      setForm({ name: "", description: "", price: "", category: "", file: null });
      setEditingId(null);
      fetchProducts();
      fetchInterestRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      file: null,
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    if (isOfflineMode) {
      const updatedProducts = products.filter(p => p._id !== id);
      setProducts(updatedProducts);
      setMessage("✅ Product deleted (offline mode)");
      return;
    }

    try {
      await axios.delete(`${API_BASE}/seller/delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Product deleted successfully");
      fetchProducts();
      fetchInterestRequests();
    } catch (err) {
      setMessage("Delete failed");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
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

      <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
        {editingId ? "Edit Product" : "Upload a Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required className="w-full border p-2 rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="w-full border p-2 rounded" />
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" required className="w-full border p-2 rounded" />
        <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full border p-2 rounded" />
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          {editingId ? "Update Product" : "Submit Product"}
        </button>
        {message && <p className="text-center text-sm text-gray-700">{message}</p>}
      </form>

      <h3 className="text-xl font-semibold mb-2">Your Products</h3>
      <table className="w-full text-sm border text-center mb-10">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">File</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border px-2 py-1">{p.name}</td>
              <td className="border px-2 py-1">₹{p.price}</td>
              <td className={`border px-2 py-1 font-semibold ${
                p.status === "approved" ? "text-green-600" : p.status === "rejected" ? "text-red-500" : "text-yellow-500"
              }`}>{p.status}</td>
              <td className="border px-2 py-1">
                {p.fileUrl ? (
                  <a
                    href={isOfflineMode ? "#" : `${BASE}${p.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isOfflineMode ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'} underline`}
                    onClick={isOfflineMode ? (e) => e.preventDefault() : undefined}
                  >
                    View{isOfflineMode && " (offline)"}
                  </a>
                ) : "—"}
              </td>
              <td className="border px-2 py-1 space-x-2">
                <button onClick={() => handleEdit(p)} className="bg-yellow-400 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-2">Incoming Interest Requests</h3>
      {interestRequests.length === 0 ? (
        <p className="text-gray-500 text-sm">No interest requests yet.</p>
      ) : (
        <table className="w-full text-sm border text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Product</th>
              <th className="border px-2 py-1">Buyer</th>
              <th className="border px-2 py-1">Features Requested</th>
              <th className="border px-2 py-1">Verification Result</th>
            </tr>
          </thead>
          <tbody>
            {interestRequests.map((i) => (
              <tr key={i._id}>
                <td className="border px-2 py-1">{i.product?.name || "N/A"}</td>
                <td className="border px-2 py-1">{i.buyer?.email}</td>
                <td className="border px-2 py-1">
                  {i.featuresRequested?.join(", ")}
                </td>
                <td className="border px-2 py-1">
                  {i.featureStatus?.length > 0 ? (
                    <ul className="text-left list-disc list-inside">
                      {i.featureStatus.map((f, idx) => (
                        <li key={idx}>
                          {f.name} -{" "}
                          <span className={f.status === "present" ? "text-green-600" : "text-red-500"}>
                            {f.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SellerDashboard;
