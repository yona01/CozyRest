import { useNavigate } from "react-router-dom";
import { logOut } from "../lib/utils/auth";

export default function HostNavbar() {
  const navigate = useNavigate();

  function logOutUser() {
    logOut();
    window.location.reload();
  }

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-[#FDC835] cursor-pointer"
          onClick={() => navigate("/properties")}
        >
          CozyRest
        </h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/profile")}
            className="bg-[#FDC835] hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium transition"
          >
            Profile
          </button>
          <button
            onClick={logOutUser}
            className="bg-[#FDC835] hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
