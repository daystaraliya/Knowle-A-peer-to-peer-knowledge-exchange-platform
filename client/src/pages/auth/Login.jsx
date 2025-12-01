import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import { login as loginApi } from "../../api/userApi";
import { useTranslation } from "react-i18next";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await loginApi(formData);
            const user = response.data.user;
            // The token is now in an httpOnly cookie, so we don't pass it here.
            login(user);

            if (!user.onboardingCompleted) {
                navigate("/onboarding");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to log in. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-textPrimary">
                    {t("login.title")}
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-textSecondary"
                        >
                            {t("login.email")}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            onChange={handleChange}
                            value={formData.email}
                            className="w-full px-3 py-2 mt-1 border bg-surface border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-textSecondary"
                        >
                            {t("login.password")}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            onChange={handleChange}
                            value={formData.password}
                            className="w-full px-3 py-2 mt-1 border bg-surface border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-textSecondary"
                            >
                                {t("login.rememberMe")}
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                state={{ background: location }}
                                className="font-medium text-primary hover:text-indigo-500"
                            >
                                {t("login.forgotPassword")}
                            </Link>
                        </div>
                    </div>
                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? t("login.signingIn") : t("login.signIn")}
                        </Button>
                    </div>
                </form>
                <p className="text-center text-sm text-textSecondary">
                    {t("login.noAccount")}{" "}
                    <Link
                        to="/register"
                        className="font-medium text-primary hover:text-indigo-500"
                    >
                        {t("login.signUpLink")}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
