import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { errorMessage, hasRole } from "../utils/auth";

function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadCount, setReloadCount] = useState(0); // bump this to load the list again

    const navigate = useNavigate();
    const canEdit = hasRole("Admin", "Pharmacist");

    // Load medicines whenever the search text or page changes
    useEffect(() => {
        const loadMedicines = async () => {
            try {
                const response = await api.get("/medicines", {
                    params: { search, page, limit: 5 }
                });
                setMedicines(response.data.medicines);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                setError(errorMessage(err, "Failed to load medicines"));
            } finally {
                setLoading(false);
            }
        };
        loadMedicines();
    }, [search, page, reloadCount]);

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this medicine?");
        if (!confirmed) return;

        setError("");
        try {
            await api.delete(`/medicines/${id}`);
            setReloadCount(reloadCount + 1);
        } catch (err) {
            setError(errorMessage(err, "Failed to delete medicine"));
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <>
        <Navbar/>
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans selection:bg-[#4DDCFF] selection:text-[#006179]">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#006179] to-[#009FC6] tracking-tight">
                            Medicine Management
                        </h1>
                        <p className="text-[#246879] mt-3 text-lg font-medium">
                            Your medicine catalogue. Stock for each medicine is added through Purchases.
                        </p>
                    </div>
                    
                    {/* Add Medicine Button */}
                    {canEdit && (
                    <button
                        onClick={() => navigate('/medicines/add')}
                        className="inline-flex items-center gap-2 bg-[#009FC6] hover:bg-[#006179] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-[#009FC6]/20 transition-all transform hover:-translate-y-0.5 focus:ring-4 focus:ring-[#4DDCFF]/40"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add New Medicine
                    </button>
                    )}
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>
                )}

                {/* Inventory Table Container */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-[#006179] to-[#009FC6]"></div>
                    
                    {/* Table Header & Search */}
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#4DDCFF]/20 rounded-xl">
                                <svg className="w-6 h-6 text-[#009FC6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <h2 className="text-2xl font-extrabold text-[#006179]">Inventory Database</h2>
                        </div>
                        
                        <div className="w-full md:max-w-md relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-[#246879] group-focus-within:text-[#009FC6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, generic name or category..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full pl-11 pr-5 py-3.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#4DDCFF] focus:outline-none focus:ring-4 focus:ring-[#4DDCFF]/20 text-[#006179] placeholder-gray-400 font-medium transition-all"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-[#4DDCFF]/30 border-t-[#009FC6] rounded-full animate-spin"></div>
                                <p className="text-lg font-bold text-[#009FC6]">Syncing Database...</p>
                            </div>
                        ) : medicines.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <p className="text-xl font-bold text-[#246879]">No medicines found</p>
                                <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
                            </div>
                        ) : (
                            <table className="w-full min-w-262.5 text-left border-collapse">
                                <thead className="bg-slate-50/80 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 text-xs font-extrabold text-[#246879] uppercase tracking-widest">Medicine</th>
                                        <th className="px-6 py-5 text-xs font-extrabold text-[#246879] uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-5 text-xs font-extrabold text-[#246879] uppercase tracking-widest">Manufacturer</th>
                                        <th className="px-6 py-5 text-xs font-extrabold text-[#246879] uppercase tracking-widest">Unit</th>
                                        <th className="px-6 py-5 text-xs font-extrabold text-[#246879] uppercase tracking-widest">Reorder Level</th>
                                        <th className="px-6 py-5 text-xs font-extrabold text-[#246879] uppercase tracking-widest">Prescription</th>
                                        {canEdit && <th className="px-6 py-5 text-xs font-extrabold text-[#246879] uppercase tracking-widest text-right">Manage</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {medicines.map((medicine) => (
                                        <tr key={medicine._id} className="hover:bg-[#4DDCFF]/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <p className="font-extrabold text-[#006179] text-base group-hover:text-[#009FC6] transition-colors">{medicine.name}</p>
                                                <p className="text-xs font-medium text-gray-500 mt-1">{medicine.genericName}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#009FC6]/10 text-[#006179] text-xs font-bold border border-[#009FC6]/20">
                                                    {medicine.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-700">{medicine.manufacturer}</td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-600">{medicine.unit}</td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex min-w-10 justify-center rounded-md bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-700 border border-amber-200">
                                                    {medicine.reorderLevel ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {medicine.prescriptionRequired ? (
                                                    <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">Required</span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">Not required</span>
                                                )}
                                            </td>
                                            {canEdit && (
                                            <td className="px-6 py-5 text-right space-x-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/medicines/${medicine._id}/edit`)}
                                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-[#009FC6] bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-[#009FC6] hover:text-white hover:border-[#009FC6] transition-all focus:ring-2 focus:ring-[#4DDCFF] focus:outline-none"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(medicine._id)}
                                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-rose-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {!loading && totalPages > 1 && (
                        <div className="bg-slate-50/80 px-8 py-5 border-t border-gray-100 flex items-center justify-between">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-[#006179] rounded-xl font-bold hover:border-[#009FC6] hover:text-[#009FC6] transition-all shadow-sm disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-[#006179] disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                Prev
                            </button>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Page</span>
                                <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-extrabold text-[#006179] shadow-sm">
                                    {page}
                                </span>
                                <span className="text-sm font-medium text-gray-500">of {totalPages}</span>
                            </div>
                            
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-[#006179] rounded-xl font-bold hover:border-[#009FC6] hover:text-[#009FC6] transition-all shadow-sm disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-[#006179] disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <Footer/>
        </>
    );
}

export default Medicines;
