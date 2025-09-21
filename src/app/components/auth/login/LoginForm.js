"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Replace with actual authentication logic
      console.log("Login attempt:", { email, password });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle successful login here
      // Redirect to dashboard using App Router
      router.push("/dashboard");
    } catch (error) {
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login attempt");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative py-8"
      style={{ backgroundImage: "url(/images/bgs/auth_bg.jpg)" }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Header section */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">SMART</h1>
        <p className="text-lg text-gray-200">Sukmajaya Market & Trade</p>
      </div>

      {/* Card section */}
      <div className="card w-full max-w-md mx-4 relative mb-5 z-10 bg-white shadow-2xl rounded-lg">
        <div className="card-body p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mt-4">
              Masuk ke SMART
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <input
                type="text"
                placeholder="Nomor HP atau Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-200 text-gray-500 p-2 rounded-md"
                required
              />
            </div>

            <div className="form-control">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-200 text-gray-500 p-2 rounded-md"
                required
              />
              <div className="text-right mt-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Butuh bantuan?
                </Link>
              </div>
            </div>

            {errors.general && (
              <div className="text-center text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="btn bg-orange-500 p-2 w-full mb-2 hover:bg-orange-400 text-white border-none rounded-md shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center w-full">
                  <span className="loading loading-spinner text-white mr-2"></span>
                  Signing in...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="divider text-sm text-gray-500 my-4 w-full flex items-center justify-between gap-5">
            <span className="bg-gray-300 h-[1px] w-full"></span>
            <span className="mx-auto">Atau masuk dengan</span>
            <span className="bg-gray-300 h-[1px] w-full"></span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-outline btn-block flex items-center justify-center gap-2 border-gray-300  text-gray-800 hover:bg-orange-500 hover:text-white hover: shadow-md"
          >
            <FcGoogle className="w-5 h-5" />
            Google
          </button>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              Belum Punya Akun?{" "}
              <a
                href="/auth/register"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Register
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}