import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { errorMessage, getUser } from "../utils/auth";

const ROLES = ["Admin", "Pharmacist", "Cashier"];
const emptyForm = { name: "", email: "", password: "", role: "Pharmacist" };
const inputClasses = "mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6] outline-none";

function Users() {
    const currentUser = getUser();

    const [users, setUsers] = useState([]);
    const [reloadCount, setReloadCount] = useState(0); // bump to load the data again
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // Load data when the page opens, and again whenever reloadCount changes
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await api.get("/auth/users");
                setUsers(response.data);
            } catch (err) {
                setError(errorMessage(err, "Could not load users."));
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, [reloadCount]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");

        if (formData.password.length < 8) {
            setFormError("Password must be at least 8 characters.");
            return;
        }

        setSaving(true);
        try {
            await api.post("/auth/users", formData);
            setFormData(emptyForm);
            setReloadCount(reloadCount + 1);
        } catch (err) {
            setFormError(errorMessage(err, "Failed to create user."));
        } finally {
            setSaving(false);
        }
    };

    const handleRoleChange = async (userId, role) => {
        setError("");
        try {
            await api.put(`/auth/users/${userId}/role`, { role });
            setReloadCount(reloadCount + 1);
        } catch (err) {
            setError(errorMessage(err, "Failed to change role."));
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Delete this user account?")) return;
        setError("");
        try {
            await api.delete(`/auth/users/${userId}`);
            setUsers(users.filter((user) => user._id !== userId));
        } catch (err) {
            setError(errorMessage(err, "Failed to delete user."));
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-[#006179]">Users</h1>
                        <p className="text-[#246879] mt-2">Create staff accounts and choose what each person can do.</p>
                    </div>

                    {/* Role explanation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white p-4 rounded-xl border border-gray-100"><b className="text-[#006179]">Admin</b> — everything, including purchases, suppliers and users.</div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100"><b className="text-[#006179]">Pharmacist</b> — medicines, sales, inventory, reports. Can view purchases and suppliers.</div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100"><b className="text-[#006179]">Cashier</b> — sales (billing), inventory and medicine list only.</div>
                    </div>

                    {/* Create user form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-[#006179] mb-4">Add Staff Member</h2>
                        {formError && <p className="text-red-500 mb-4 font-semibold text-sm">{formError}</p>}
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Name</span>
                                <input name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Email</span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Password (min 8)</span>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClasses} required />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-gray-700">Role</span>
                                <select name="role" value={formData.role} onChange={handleChange} className={inputClasses}>
                                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </label>
                            <div className="md:col-span-4">
                                <button type="submit" disabled={saving} className="bg-[#009FC6] hover:bg-[#006179] text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-60">
                                    {saving ? "Creating..." : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>}

                    {/* Users table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <p className="p-8 text-center text-gray-500 font-semibold">Loading users...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[#246879] text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => {
                                            const isMe = user._id === currentUser?.id;
                                            return (
                                                <tr key={user._id}>
                                                    <td className="px-6 py-4 font-bold text-[#006179]">
                                                        {user.name} {isMe && <span className="text-xs font-normal text-gray-400">(you)</span>}
                                                    </td>
                                                    <td className="px-6 py-4">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        {isMe ? (
                                                            user.role
                                                        ) : (
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                                className="p-1.5 border rounded-lg"
                                                            >
                                                                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {!isMe && (
                                                            <button onClick={() => handleDelete(user._id)} className="text-red-500 font-bold hover:underline">
                                                                Delete
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Users;
