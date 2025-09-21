"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function RegisterForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        return newErrors;
    };

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
            console.log("Register attempt:", formData);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            router.push("/dashboard");
        } catch (error) {
            setErrors({ general: "Registration failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative py-8"
            style={{ backgroundImage: "url(/images/bgs/auth_bg.jpg)" }}
        >
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="text-center mb-8 relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">SMART</h1>
                <p className="text-lg text-gray-200">Sukmajaya Market & Trade</p>
            </div>

            <div className="card w-full max-w-md mx-4 relative mb-5 z-10 bg-white shadow-2xl rounded-lg">
                <div className="card-body p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mt-4">
                            Daftar ke SMART
                        </h2>
                        <p className="text-sm text-gray-600">
                            Sudah Punya Akun?{' '}
                            <Link
                                href="/auth/login"
                                className="text-orange-500 hover:text-orange-600 font-medium"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                    <button
                        type="button"
                        // onClick={handleGoogleLogin}
                        className="btn btn-outline btn-block flex items-center justify-center gap-2 border-gray-300  text-gray-800 hover:bg-orange-500 hover:text-white hover: shadow-md"
                    >
                        <FcGoogle className="w-5 h-5" />
                        Google
                    </button>

                    <div className="divider text-sm text-gray-500 my-4 w-full flex items-center justify-between gap-5">
                        <span className="bg-gray-300 h-[1px] w-full"></span>
                        <span className="mx-auto">Atau</span>
                        <span className="bg-gray-300 h-[1px] w-full"></span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <input
                                type="email"
                                name="email"
                                placeholder="Nomor HP atau Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-200 text-gray-500 p-2 rounded-md"
                                required
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                            <span className="text-sm text-gray-500">Contoh : botmail@gmail.com</span>
                        </div>

                        <div className="form-control">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-200 text-gray-500 p-2 rounded-md"
                                required
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div className="form-control">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Konfirmasi password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-200 text-gray-500 p-2 rounded-md"
                                required
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {errors.general && (
                            <div className="text-center text-sm text-red-600">
                                {errors.general}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`btn bg-orange-500 p-2 w-full mb-2 mt-5 hover:bg-orange-400 text-white border-none rounded-md shadow-md flex items-center justify-center gap-2`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center w-full">
                                    <span className="loading loading-spinner text-white mr-2"></span>
                                    Mendaftar...
                                </span>
                            ) : (
                                "Daftar"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
