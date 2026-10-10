import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: ""
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/suppliers");
            setSuppliers(response.data);
        } catch (err) {
            console.error("Failed to fetch suppliers", err);
            setError("Could not load suppliers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ _id: "", name: "", contactPerson: "", phone: "", email: "", address: "" });
        setShowForm(false);
        setIsEditing(false);
        setFormError("");
    };

    const handleEdit = (supplier) => {
        setFormData(supplier);
        setIsEditing(true);
        setShowForm(true);
        setFormError("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this supplier?")) return;
        try {
            await api.delete(`/suppliers/${id}`);
            setSuppliers(suppliers.filter(s => s._id !== id));
        } catch (err) {
            console.error("Failed to delete supplier", err);
            alert("Failed to delete supplier.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        if (!formData.name || !formData.phone) {
            setFormError("Name and Phone are required.");
            setFormLoading(false);
            return;
        }

        try {
            if (isEditing) {
                const response = await api.put(`/suppliers/${formData._id}`, formData);
                setSuppliers(suppliers.map(s => (s._id === formData._id ? response.data : s)));
            } else {
                const response = await api.post("/suppliers", formData);
                setSuppliers([response.data, ...suppliers]);
            }
            resetForm();
        } catch (err) {
            console.error("Error saving supplier", err);
            setFormError(err.response?.data?.message || "Failed to save supplier.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-black text-[#006179]">Suppliers</h1>
                            <p className="text-[#246879] mt-2">Manage your pharmacy's suppliers and vendors.</p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-[#009FC6] hover:bg-[#006179] text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
                            >
                                + Add Supplier
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#006179] mb-4">
                                {isEditing ? "Edit Supplier" : "Add New Supplier"}
                            </h2>
                            {formError && <p className="text-red-500 mb-4 font-semibold text-sm">{formError}</p>}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Supplier Name *</span>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" required />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Phone Number *</span>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" required />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Contact Person</span>
                                        <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Email Address</span>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="text-sm font-semibold text-gray-700">Physical Address</span>
                                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="submit" disabled={formLoading} className="bg-[#009FC6] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#006179]">
                                        {formLoading ? "Saving..." : "Save Supplier"}
                                    </button>
                                    <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-bold hover:bg-gray-300">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <p className="p-8 text-center text-gray-500 font-semibold">Loading suppliers...</p>
                        ) : error ? (
                            <p className="p-8 text-center text-red-500 font-semibold">{error}</p>
                        ) : suppliers.length === 0 ? (
                            <p className="p-8 text-center text-gray-500 font-semibold">No suppliers found. Add one to get started.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[#246879] text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Contact Person</th>
                                            <th className="px-6 py-4">Phone & Email</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {suppliers.map(supplier => (
                                            <tr key={supplier._id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-bold text-[#006179]">{supplier.name}</td>
                                                <td className="px-6 py-4 text-gray-700">{supplier.contactPerson || "—"}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-800">{supplier.phone}</p>
                                                    <p className="text-gray-500 text-xs">{supplier.email || "—"}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    <button onClick={() => handleEdit(supplier)} className="text-[#009FC6] font-bold hover:underline">Edit</button>
                                                    <button onClick={() => handleDelete(supplier._id)} className="text-red-500 font-bold hover:underline">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
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

export default Suppliers;
