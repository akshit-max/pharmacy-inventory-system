import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/auth/register", { name, email, password });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
            navigate("/dashboard");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to create your account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 font-sans">
            <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
                <header className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#009FC6]/10">
                        <svg className="h-8 w-8 text-[#00C8F9]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#006179]">Create your account</h1>
                    <p className="mt-2 text-slate-500">Join PharmaSys to manage your pharmacy</p>
                </header>

                {error && (
                    <div role="alert" className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label htmlFor="signup-name" className="mb-1 block text-sm font-bold text-[#246879]">Full name</label>
                        <input
                            id="signup-name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            maxLength={100}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all focus:border-[#009FC6] focus:ring-2 focus:ring-[#009FC6]/20"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-email" className="mb-1 block text-sm font-bold text-[#246879]">Email address</label>
                        <input
                            id="signup-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all focus:border-[#009FC6] focus:ring-2 focus:ring-[#009FC6]/20"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-password" className="mb-1 block text-sm font-bold text-[#246879]">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            minLength={8}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all focus:border-[#009FC6] focus:ring-2 focus:ring-[#009FC6]/20"
                            placeholder="At least 8 characters"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-confirm-password" className="mb-1 block text-sm font-bold text-[#246879]">Confirm password</label>
                        <input
                            id="signup-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                            minLength={8}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all focus:border-[#009FC6] focus:ring-2 focus:ring-[#009FC6]/20"
                            placeholder="Re-enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#009FC6] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#006179] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-[#009FC6] hover:text-[#006179]">Sign in</Link>
                </p>
                <p className="mt-3 text-center text-xs text-slate-400">New accounts are created with the Cashier role.</p>
            </section>
        </main>
    );
}

export default Signup;