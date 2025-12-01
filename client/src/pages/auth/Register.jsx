import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { register as registerApi } from "../../api/userApi";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await registerApi(formData);
            setSuccess("Registration successful! Please log in.");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-textPrimary">
                    Create a new account
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-textSecondary"
                        >
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border bg-surface border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-textSecondary"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border bg-surface border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-textSecondary"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border bg-surface border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-textSecondary"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            onChange={handleChange}
                            className="w-full px-3 py-2 mt-1 border bg-surface border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && (
                        <p className="text-sm text-green-600">{success}</p>
                    )}
                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </Button>
                    </div>
                </form>
                <p className="text-center text-sm text-textSecondary">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-primary hover:text-indigo-500"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
