import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

const Screenshots = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-10">
      <button
        onClick={handleLogout}
        className="flex border-2 hover:cursor-pointer"
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
};

export default Screenshots;
