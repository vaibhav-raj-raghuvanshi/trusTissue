import { useState, useContext } from "react";
import { login } from "../services/api";
import RoleSelect from "../components/RoleSelect";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(form);
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Save token and update context
      localStorage.setItem("trustissue_token", token);
      setAuth({
        token,
        role: payload.role,
        email: payload.email,
      });

      setMessage("Login successful ✅");

      // 🔁 Redirect based on role
      navigate(`/dashboard/${payload.role}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-center">Login (All Roles)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border rounded p-2 w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border rounded p-2 w-full"
          required
        />
        <RoleSelect value={form.role} onChange={handleChange} allowed="login" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Login
        </button>
        {message && <p className="text-center text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
};

export default Login;
