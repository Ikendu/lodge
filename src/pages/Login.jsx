import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import {
  FaGoogle,
  FaYahoo,
  FaApple,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";

import {
  googleProvider,
  yahooProvider,
  appleProvider,
  facebookProvider,
  twitterProvider,
  socialSignIn,
} from "../firebaseConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (email === "demo@email.com" && password === "123456") {
      alert("Login successful ✅");
      setError("");
    } else {
      setError("Invalid email or password.");
    }
  };

  const handleSocialLogin = async (providerName) => {
    try {
      const providerMap = {
        Google: googleProvider,
        Yahoo: yahooProvider,
        Apple: appleProvider,
        Facebook: facebookProvider,
        X: twitterProvider,
      };

      const provider = providerMap[providerName];
      await socialSignIn(provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transition-all duration-500 hover:shadow-blue-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to continue exploring lodges
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 mb-4 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email Address
            </label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">or login with</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
          <button
            onClick={() => handleSocialLogin("Google")}
            className="p-3 rounded-full border hover:bg-red-50 transition duration-300 hover:scale-105"
          >
            <FaGoogle className="text-red-500 text-xl mx-auto" />
          </button>
          <button
            onClick={() => handleSocialLogin("Yahoo")}
            className="p-3 rounded-full border hover:bg-purple-50 transition duration-300 hover:scale-105"
          >
            <FaYahoo className="text-purple-500 text-xl mx-auto" />
          </button>
          <button
            onClick={() => handleSocialLogin("Apple")}
            className="p-3 rounded-full border hover:bg-gray-100 transition duration-300 hover:scale-105"
          >
            <FaApple className="text-gray-800 text-xl mx-auto" />
          </button>
          <button
            onClick={() => handleSocialLogin("Facebook")}
            className="p-3 rounded-full border hover:bg-blue-50 transition duration-300 hover:scale-105"
          >
            <FaFacebookF className="text-blue-600 text-xl mx-auto" />
          </button>
          <button
            onClick={() => handleSocialLogin("X")}
            className="p-3 rounded-full border hover:bg-gray-50 transition duration-300 hover:scale-105"
          >
            <FaXTwitter className="text-black text-xl mx-auto" />
          </button>
        </div>

        {/* Extra links */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/registeruser"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
