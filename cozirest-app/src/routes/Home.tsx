import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { saveAuth } from "../lib/utils/auth";
import { logIn, register } from "../services/userService";
import { User, UserLogIn } from "../types/User";
import { LoggedInUser } from "../types/Utils";

function Home() {
  const [userType, setUserType] = useState("guest");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const emptyUser: User = {
    id: 0,
    name: "",
    contact_number: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  };

  const logInUser: UserLogIn = {
    email: "",
    password: "",
  };

  const [user, setUser] = useState<User>(emptyUser);
  const [userLogIn, setUserLogIn] = useState<UserLogIn>(logInUser);
  const [userSuccess, setUserSuccessLogIn] = useState<LoggedInUser>();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user.password !== user.password_confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsRegistering(true);

      const response = await register(user);
      toast.success("Registered successfully!");
      setShowRegister(false);
      setUser(emptyUser);
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors;

        const firstError = Object.values(errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error("Registration failed. Please try again.");
      }

      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userLogIn.email || !userLogIn.password) {
      toast.error("Email and Password must not be empty.");
      return;
    }

    try {
      setIsLoggingIn(true);

      const response = await logIn(userLogIn);

      toast.success("Login successful!");
      setShowLogin(false);
      saveAuth(response.token, response.data);
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleLogInInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserLogIn((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const showRegisterModal = () => {
    setUser((prevUser) => ({
      ...prevUser,
      role: "guest",
    }));
    setShowRegister(true);
  };

  const handleChangeType = (r: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      role: r,
    }));
    setUserType(r);
  };

  return (
    <div className="min-h-screen bg-[#ECF0F1] px-4 flex flex-col">
      <header className="py-12 text-center">
        <h1 className="text-5xl font-bold text-[#FDC835] font-cozi mb-3">
          CozyRest
        </h1>
        <p className="text-xl text-gray-600 italic">
          "Rest in a cozy place - anywhere in the world"
        </p>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center mb-16">
        <div className="max-w-4xl text-center mb-12 px-4 ">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Discover Perfect Sleep Spaces
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            CozyRest connects you with handpicked sleep sanctuaries worldwide.
            Whether you need a nap pod, overnight capsule, or premium bedroom
            rental, find your perfect rest space with our global community.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-10 ">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition duration-300 hover:scale-105 hover:shadow-xl hover:border-[#FDC835]">
              <div className="text-[#FDC835] text-3xl mb-4">🏡</div>
              <h3 className="font-bold mb-3 text-gray-800">Unique Stays</h3>
              <p className="text-gray-600">
                From luxury bedrooms to minimalist sleep pods, find spaces
                designed specifically for quality rest.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition duration-300 hover:scale-105 hover:shadow-xl hover:border-[#FDC835]">
              <div className="text-[#FDC835] text-3xl mb-4">⭐</div>
              <h3 className="font-bold mb-3 text-gray-800">Verified Reviews</h3>
              <p className="text-gray-600">
                Real sleep quality ratings from verified guests who prioritize
                rest like you do.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition duration-300 hover:scale-105 hover:shadow-xl hover:border-[#FDC835]">
              <div className="text-[#FDC835] text-3xl mb-4">🔒</div>
              <h3 className="font-bold mb-3 text-gray-800">Sleep Guarantee</h3>
              <p className="text-gray-600">
                Every space meets our strict sleep-quality standards for noise,
                comfort, and darkness.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-medium text-gray-700 mb-6">
            Ready to find your rest?
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={showRegisterModal}
              className="bg-[#FDC835] hover:bg-yellow-400 text-black px-8 py-4 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-xl transform hover:-translate-y-1"
            >
              Join CozyRest
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-xl transition-all duration-300 font-bold border border-gray-200 shadow-md hover:shadow-xl"
            >
              Log In to CozyRest
            </button>
          </div>
        </div>
      </section>

      <Modal visible={showLogin} onClose={() => setShowLogin(false)}>
        <div className="p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h2>
            <p className="text-gray-500">Sign in to your CozyRest account</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                value={userLogIn.email}
                onChange={handleLogInInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleLogInInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
              />
            </div>

            <button
              onClick={handleLogIn}
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md
                  ${
                    isLoggingIn
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#FDC835] hover:bg-yellow-400 text-gray-900"
                  }
                `}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
                className="text-[#FDC835] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </Modal>

      <Modal visible={showRegister} onClose={() => setShowRegister(false)}>
        <div className="p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Join CozyRest
            </h2>
            <p className="text-gray-500">Create your account in minutes</p>
          </div>

          <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                userType === "guest"
                  ? "bg-white shadow-sm text-[#FDC835] font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => handleChangeType("guest")}
            >
              <span className="flex items-center justify-center gap-2">
                <span>👤</span> I'm a Guest
              </span>
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                userType === "host"
                  ? "bg-white shadow-sm text-[#FDC835] font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => handleChangeType("host")}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🏠</span> I'm a Host
              </span>
            </button>
          </div>

          <div className="space-y-4">
            {[
              { name: "name", type: "text", placeholder: "Full Name" },
              {
                name: "contact_number",
                type: "tel",
                placeholder: "Phone Number",
              },
              { name: "email", type: "email", placeholder: "Email Address" },
              {
                name: "password",
                type: "password",
                placeholder: "Create Password",
              },
              {
                name: "password_confirmation",
                type: "password",
                placeholder: "Confirm Password",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.name.replace("_", " ")}
                </label>
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={user[field.name] || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
                />
              </div>
            ))}

            {userType === "host" && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p>
                  As a host, you'll be able to list your space after verifying
                  your identity.
                </p>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md mt-4
                ${
                  isRegistering
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#FDC835] hover:bg-yellow-400 text-gray-900"
                }
              `}
            >
              {isRegistering ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Registering...
                </div>
              ) : userType === "guest" ? (
                "Join as Guest"
              ) : (
                "Become a Host"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
                className="text-[#FDC835] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </Modal>
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CozyRest</p>
      </footer>
    </div>
  );
}

export default Home;
