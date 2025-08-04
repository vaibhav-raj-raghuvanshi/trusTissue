import { useEffect, useState } from "react";
import axios from "axios";

// Use the same base URL as the main API service
const BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API_BASE = `${BASE}/api`;

const AdminDashboard = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [verifiers, setVerifiers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("trustissue_token");
  const itemsPerPage = 5;

  const fetchVerifiers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/verifiers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerifiers(res.data);
      setIsOfflineMode(false);
    } catch (err) {
      console.error("Error fetching verifiers", err);
      setIsOfflineMode(true);
      setMessage("⚠️ Running in offline mode. Backend server is not available.");
      // Set demo data for offline mode
      setVerifiers([
        { _id: "1", name: "Demo Verifier 1", email: "verifier1@demo.com" },
        { _id: "2", name: "Demo Verifier 2", email: "verifier2@demo.com" },
        { _id: "3", name: "Sample Verifier", email: "sample@trustissue.com" }
      ]);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawals(res.data);
    } catch (err) {
      console.error("Error fetching withdrawals", err);
      // Set demo data for offline mode
      setWithdrawals([
        {
          _id: "1",
          amount: 1500,
          seller: { name: "Demo Seller 1", email: "seller1@demo.com" },
          createdAt: new Date()
        },
        {
          _id: "2",
          amount: 2750,
          seller: { name: "Demo Seller 2", email: "seller2@demo.com" },
          createdAt: new Date()
        }
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchVerifiers(), fetchWithdrawals()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isOfflineMode) {
      // Handle offline mode
      if (editingId) {
        const updatedVerifiers = verifiers.map(v =>
          v._id === editingId ? { ...v, name: form.name, email: form.email } : v
        );
        setVerifiers(updatedVerifiers);
        setMessage("✅ Verifier updated (offline mode)");
      } else {
        const newVerifier = {
          _id: Date.now().toString(),
          name: form.name,
          email: form.email
        };
        setVerifiers([...verifiers, newVerifier]);
        setMessage("✅ Verifier created (offline mode)");
      }
      setForm({ name: "", email: "", password: "" });
      setEditingId(null);
      return;
    }

    try {
      if (editingId) {
        const res = await axios.put(
          `${API_BASE}/admin/edit-verifier/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage(res.data.message);
      } else {
        const res = await axios.post(
          `${API_BASE}/admin/create-verifier`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage(res.data.message);
      }
      setForm({ name: "", email: "", password: "" });
      setEditingId(null);
      fetchVerifiers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (verifier) => {
    setForm({ name: verifier.name, email: verifier.email, password: "" });
    setEditingId(verifier._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this verifier?")) return;

    if (isOfflineMode) {
      const updatedVerifiers = verifiers.filter(v => v._id !== id);
      setVerifiers(updatedVerifiers);
      setMessage("✅ Verifier deleted (offline mode)");
      return;
    }

    try {
      const res = await axios.delete(
        `${API_BASE}/admin/delete-verifier/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      fetchVerifiers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  const handleWithdrawalAction = async (id, action) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/admin/withdrawals/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      fetchWithdrawals();
    } catch (err) {
      setMessage(err.response?.data?.message || "Withdrawal update failed");
    }
  };

  const filteredVerifiers = verifiers.filter((v) =>
    `${v.name} ${v.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVerifiers.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filteredVerifiers.slice(start, start + itemsPerPage);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
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

      <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
        {editingId ? "Edit Verifier" : "Create a Verifier"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          name="name"
          placeholder="Verifier Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Verifier Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder={editingId ? "New Password (optional)" : "Verifier Password"}
          value={form.password}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required={!editingId}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {editingId ? "Update Verifier" : "Create Verifier"}
        </button>
        {message && <p className="text-center text-sm text-gray-700">{message}</p>}
      </form>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className="border p-2 rounded mb-4 w-full"
      />

      <h3 className="text-xl font-semibold mb-2">All Verifiers:</h3>
      <table className="w-full border text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((v) => (
            <tr key={v._id}>
              <td className="border px-2 py-1">{v.name}</td>
              <td className="border px-2 py-1">{v.email}</td>
              <td className="border px-2 py-1 text-center space-x-2">
                <button
                  onClick={() => handleEdit(v)}
                  className="text-sm px-2 py-1 bg-yellow-400 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="text-sm px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-3">💸 Seller Withdrawal Requests</h3>
        {withdrawals.length === 0 ? (
          <p className="text-gray-500">No pending withdrawals</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Seller</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Amount</th>
                <th className="border px-2 py-1">Requested At</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id}>
                  <td className="border px-2 py-1">{w.seller?.name}</td>
                  <td className="border px-2 py-1">{w.seller?.email}</td>
                  <td className="border px-2 py-1">₹{w.amount}</td>
                  <td className="border px-2 py-1">{new Date(w.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    <button
                      onClick={() => handleWithdrawalAction(w._id, "processed")}
                      className="text-sm px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleWithdrawalAction(w._id, "rejected")}
                      className="text-sm px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
