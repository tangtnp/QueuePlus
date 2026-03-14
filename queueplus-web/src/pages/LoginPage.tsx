import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (field: "email" | "password", value: string) => {
        if (error) clearError();
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await login(form);

        if (success) {
            const currentUser = useAuthStore.getState().user;

            if (currentUser?.role === "user") {
                navigate("/profile");
            } else {
                navigate("/");
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
                <h1 className="mb-6 text-2xl font-bold">QueuePlus Login</h1>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="mb-3 w-full rounded-lg border border-slate-300 p-2"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="mb-4 w-full rounded-lg border border-slate-300 p-2"
                    />

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-blue-600 p-2 text-white disabled:opacity-60"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}