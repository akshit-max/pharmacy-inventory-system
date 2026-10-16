import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar"
import Footer from "../components/footer";
import { useNavigate, useParams } from "react-router-dom";

function MedicineForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: "",
        genericName: "",
        category: "",
        manufacturer: "",
        unit: "",
        reorderLevel: 10,
        safetyStock: 20,
        supplierLeadTime: 5,
        prescriptionRequired: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEditing = Boolean(id);

    useEffect(() => {
        if (!id) return;

        const fetchMedicine = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await api.get(`/medicines/${id}`);
                setFormData({
                    name: response.data.name || "",
                    genericName: response.data.genericName || "",
                    category: response.data.category || "",
                    manufacturer: response.data.manufacturer || "",
                    unit: response.data.unit || "",
                    reorderLevel: response.data.reorderLevel ?? 10,
                    safetyStock: response.data.safetyStock ?? 20,
                    supplierLeadTime: response.data.supplierLeadTime ?? 5,
                    prescriptionRequired: Boolean(response.data.prescriptionRequired)
                });
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load medicine");
            } finally {
                setLoading(false);
            }
        };

        fetchMedicine();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            // Number inputs give strings, so convert them before sending
            const medicineData = {
                ...formData,
                reorderLevel: Number(formData.reorderLevel),
                safetyStock: Number(formData.safetyStock),
                supplierLeadTime: Number(formData.supplierLeadTime)
            };

            if (isEditing) {
                await api.put(`/medicines/${id}`, medicineData);
            } else {
                await api.post("/medicines", medicineData);
            }

            navigate("/medicines");
        } catch (error) {
            setError(
                error.response?.data?.message || `Failed to ${isEditing ? "update" : "add"} medicine`
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#006179] outline-none transition-all placeholder:text-slate-400 focus:border-[#009FC6] focus:bg-white focus:ring-4 focus:ring-[#4DDCFF]/20";
    const labelClasses = "block text-sm font-bold text-[#246879]";

    return (
        <div className="flex min-h-screen flex-col bg-[#f7fafb]">
            <Navbar />
            <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <section className="w-full max-w-2xl rounded-2xl border border-slate-200 border-t-4 border-t-[#00C8F9] bg-white p-6 shadow-[0_12px_35px_rgba(0,97,121,0.08)] sm:p-8 lg:p-10">
                    <div className="mb-8">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#009FC6]">Medicine catalog</p>
                        <h2 className="text-3xl font-extrabold tracking-tight text-[#006179] sm:text-4xl">
                            {isEditing ? "Edit Medicine" : "Add New Medicine"}
                        </h2>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                            Add the basic details your team needs to identify and replenish this medicine.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className={labelClasses}>Medicine Name</label>
                        <input
                            name="name"
                            placeholder="e.g., Amoxicillin 500mg"
                            value={formData.name}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Generic Name</label>
                        <input
                            name="genericName"
                            placeholder="e.g., Amoxicillin"
                            value={formData.genericName}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className={labelClasses}>Category</label>
                            <input
                                name="category"
                                placeholder="e.g., Antibiotic"
                                value={formData.category}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Manufacturer</label>
                            <input
                                name="manufacturer"
                                placeholder="e.g., Pfizer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className={labelClasses}>Unit</label>
                            <input
                                name="unit"
                                placeholder="e.g., Tablet, Bottle"
                                value={formData.unit}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Reorder Level</label>
                            <input
                                type="number"
                                name="reorderLevel"
                                value={formData.reorderLevel}
                                onChange={handleChange}
                                min="0"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className={labelClasses}>Safety Stock</label>
                            <input
                                type="number"
                                name="safetyStock"
                                value={formData.safetyStock}
                                onChange={handleChange}
                                min="0"
                                className={inputClasses}
                            />
                            <p className="mt-1 text-xs text-slate-400">Extra units to always keep in reserve.</p>
                        </div>
                        <div>
                            <label className={labelClasses}>Supplier Lead Time (days)</label>
                            <input
                                type="number"
                                name="supplierLeadTime"
                                value={formData.supplierLeadTime}
                                onChange={handleChange}
                                min="0"
                                className={inputClasses}
                            />
                            <p className="mt-1 text-xs text-slate-400">Days the supplier takes to deliver.</p>
                        </div>
                    </div>

                    <div className="flex items-center border-t border-slate-100 pt-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="prescriptionRequired"
                                checked={formData.prescriptionRequired}
                                onChange={handleChange}
                                className="h-5 w-5 cursor-pointer rounded border-slate-300 text-[#009FC6] focus:ring-[#4DDCFF]"
                            />
                            <span className="ml-3 text-sm font-bold text-[#246879]">
                                Prescription Required
                            </span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#009FC6] px-6 py-2.5 font-bold text-white shadow-md transition-all duration-200 hover:bg-[#006179] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#009FC6]/60 sm:w-auto sm:min-w-40"
                    >
                        {loading && (
                            <svg
                                className="w-4 h-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12" cy="12" r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-90"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                        )}
                        <span>
                            {loading
                                ? "Saving..."
                                : isEditing
                                    ? "Update Medicine"
                                    : "Add Medicine"}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/medicines")}
                        disabled={loading}
                        className="min-h-11 w-full rounded-lg border border-slate-200 px-6 py-2.5 font-bold text-[#246879] transition-all duration-200 hover:border-[#009FC6] hover:bg-[#4DDCFF]/10 hover:text-[#009FC6] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        Cancel
                    </button>
                    </div>

                    </form>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default MedicineForm;
