import { useState, useEffect } from "react";
import axios from "axios";

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

  const token = localStorage.getItem("trustissue_token");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/seller/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchInterestRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/seller/interest-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterestRequests(res.data);
    } catch (err) {
      console.error("Interest fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchInterestRequests();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    if (form.file) formData.append("file", form.file);

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/seller/edit-product/${editingId}`,
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
        await axios.post("http://localhost:5000/api/seller/upload-product", formData, {
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
    try {
      await axios.delete(`http://localhost:5000/api/seller/delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Product deleted successfully");
      fetchProducts();
      fetchInterestRequests();
    } catch (err) {
      setMessage("Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
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
              <td className="border px-2 py-1 underline text-blue-600">
                {p.fileUrl ? (
                  <a href={`http://localhost:5000${p.fileUrl}`} target="_blank" rel="noopener noreferrer">View</a>
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
