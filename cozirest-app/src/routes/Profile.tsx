import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GuestNavbar from "../components/GuestNavbar";
import HostNavbar from "../components/HostNavbar";
import { getLoggedInUser, saveUser } from "../lib/utils/auth";
import { updateUser } from "../services/userService";
import { UserDetails } from "../types/User";

export default function Profile() {
  const [form, setForm] = useState<UserDetails>({
    id: 0,
    name: "",
    email: "",
    contact_number: "",
  });

  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const user = getLoggedInUser();

  useEffect(() => {
    setForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      contact_number: user.contact_number || "",
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await updateUser(form);
      if (response && response.data) {
        saveUser(response.data);
        setSuccessMessage("Profile updated successfully.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {user.role == "guest" ? <GuestNavbar /> : <HostNavbar />}

      <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#FDC835]">
          Edit Profile
        </h2>

        {successMessage && (
          <div className="mb-4 text-green-600 font-medium text-center">
            {successMessage}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC835]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Number
            </label>
            <input
              name="contact_number"
              value={form.contact_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC835]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC835]"
              required
            />
          </div>

          <hr className="my-4" />

          <button
            onClick={handleSave}
            className="w-full bg-[#FDC835] hover:bg-yellow-400 text-black font-semibold py-3 rounded-lg shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
