import { ShoppingBag, Store, Shield, Users } from "lucide-react";

const RoleSelect = ({ value, onChange, allowed, disabled = false }) => {
  const roles = {
    signup: ["buyer", "seller"],
    login: ["admin", "verifier", "buyer", "seller"],
  };

  const roleInfo = {
    buyer: {
      icon: ShoppingBag,
      title: "Buyer",
      description: "Purchase verified products",
      color: "blue"
    },
    seller: {
      icon: Store,
      title: "Seller",
      description: "List and sell products",
      color: "green"
    },
    admin: {
      icon: Shield,
      title: "Admin",
      description: "Platform management",
      color: "purple"
    },
    verifier: {
      icon: Users,
      title: "Verifier",
      description: "Verify transactions",
      color: "orange"
    }
  };

  const getColorClasses = (role, isSelected) => {
    const colors = {
      blue: isSelected 
        ? "bg-blue-50 border-blue-500 text-blue-700" 
        : "bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50",
      green: isSelected 
        ? "bg-green-50 border-green-500 text-green-700" 
        : "bg-white border-gray-300 text-gray-700 hover:border-green-300 hover:bg-green-50",
      purple: isSelected 
        ? "bg-purple-50 border-purple-500 text-purple-700" 
        : "bg-white border-gray-300 text-gray-700 hover:border-purple-300 hover:bg-purple-50",
      orange: isSelected 
        ? "bg-orange-50 border-orange-500 text-orange-700" 
        : "bg-white border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
    };
    return colors[roleInfo[role].color];
  };

  const getIconColorClasses = (role, isSelected) => {
    const colors = {
      blue: isSelected ? "text-blue-600" : "text-gray-500",
      green: isSelected ? "text-green-600" : "text-gray-500",
      purple: isSelected ? "text-purple-600" : "text-gray-500",
      orange: isSelected ? "text-orange-600" : "text-gray-500"
    };
    return colors[roleInfo[role].color];
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles[allowed].map((role) => {
          const isSelected = value === role;
          const Icon = roleInfo[role].icon;
          
          return (
            <label 
              key={role} 
              className={`relative cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 ${
                getColorClasses(role, isSelected)
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
            >
              <input
                type="radio"
                name="role"
                value={role}
                checked={isSelected}
                onChange={onChange}
                className="sr-only"
                required
                disabled={disabled}
              />
              
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 ${getIconColorClasses(role, isSelected)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {roleInfo[role].title}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {roleInfo[role].description}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full ${
                    roleInfo[role].color === 'blue' ? 'bg-blue-600' :
                    roleInfo[role].color === 'green' ? 'bg-green-600' :
                    roleInfo[role].color === 'purple' ? 'bg-purple-600' :
                    'bg-orange-600'
                  }`}></div>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelect;
