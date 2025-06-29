const RoleSelect = ({ value, onChange, allowed }) => {
  const roles = {
    signup: ["buyer", "seller"],
    login: ["admin", "verifier", "buyer", "seller"],
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Select Role:</p>
      <div className="flex flex-wrap gap-4">
        {roles[allowed].map((role) => (
          <label key={role} className="inline-flex items-center space-x-2">
            <input
              type="radio"
              name="role"
              value={role}
              checked={value === role}
              onChange={onChange}
              className="accent-blue-500"
              required
            />
            <span className="capitalize">{role}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RoleSelect;
