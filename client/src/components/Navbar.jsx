import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);

  return (
    <nav className="flex justify-between p-4 bg-gray-900 text-white">
      <Link to="/" className="font-bold text-xl">trusTissue</Link>
      <div className="space-x-4">
        {auth.token ? (
          <>
            <Link to={`/dashboard/${auth.role}`}>Dashboard</Link>

            {auth.role === "seller" && (
              <Link to="/seller/withdraw">Withdraw</Link>
            )}

            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
