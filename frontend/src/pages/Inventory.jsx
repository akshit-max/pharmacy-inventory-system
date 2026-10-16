import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { errorMessage, hasRole } from "../utils/auth";

const formatCurrency = (value) => "₹" + Number(value || 0).toFixed(2);

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// Work out the status label and colour for one batch
const getStatus = (item) => {
    if (item.isExpired) return { label: "Expired", classes: "bg-red-50 text-red-700" };
    if (item.isLowStock) return { label: "Low stock", classes: "bg-orange-50 text-orange-700" };
    return { label: "In stock", classes: "bg-emerald-50 text-emerald-700" };
};

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [reloadCount, setReloadCount] = useState(0); // bump to load the data again
    const [lowStockCount, setLowStockCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    // Load data when the page opens, and again whenever reloadCount changes
    useEffect(() => {
        const loadInventory = async () => {
            try {
                const response = await api.get("/inventory");
                setInventory(response.data.inventory || []);
                setLowStockCount(response.data.summary?.lowStockMedicines || 0);
                setError("");
            } catch (err) {
                setError(errorMessage(err, "We couldn't load your inventory. Please try again."));
            } finally {
                setLoading(false);
            }
        };
        loadInventory();
    }, [reloadCount]);

    const retry = () => {
        setLoading(true);
        setReloadCount(reloadCount + 1);
    };

    // Summary numbers for the cards
    const totalUnits = inventory.reduce((total, item) => total + item.quantity, 0);
    const expiredCount = inventory.filter((item) => item.isExpired).length;

    // Apply search box and status filter
    const query = search.trim().toLowerCase();
    const visibleInventory = inventory.filter((item) => {
        const text = `${item.medicine?.name || ""} ${item.medicine?.genericName || ""} ${item.batchNumber}`.toLowerCase();
        const matchesSearch = text.includes(query);
        const matchesFilter = filter === "all" || getStatus(item).label.toLowerCase() === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = [
        { label: "Total batches", value: inventory.length, detail: "tracked in inventory", color: "#009FC6" },
        { label: "Units in stock", value: totalUnits.toLocaleString("en-IN"), detail: "across all batches", color: "#00C8F9" },
        { label: "Low stock medicines", value: lowStockCount, detail: "need reordering", color: "#f97316" },
        { label: "Expired batches", value: expiredCount, detail: "require attention", color: "#ef4444" },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-[#006179]">Inventory</h1>
                            <p className="text-[#246879] mt-2">Monitor stock levels, batch details, and expiry dates.</p>
                        </div>
                        {hasRole("Admin") && (
                            <Link to="/purchases" className="bg-[#009FC6] hover:bg-[#006179] text-white px-6 py-2.5 rounded-lg font-bold shadow-md">
                                + Add stock (record purchase)
                            </Link>
                        )}
                    </header>

                    {/* Summary cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <article
                                key={stat.label}
                                style={{ borderBottomColor: stat.color }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-b-[3px]"
                            >
                                <p className="text-sm font-semibold text-[#246879] mb-1">{stat.label}</p>
                                <p className="text-3xl font-extrabold text-[#006179]">{stat.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{stat.detail}</p>
                            </article>
                        ))}
                    </section>

                    {/* Table */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-[#006179]">Stock overview</h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    {visibleInventory.length} of {inventory.length} batches shown
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search medicine or batch"
                                    className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#009FC6]"
                                />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-[#246879] outline-none"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="in stock">In stock</option>
                                    <option value="low stock">Low stock</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-16 text-center text-[#246879]">Loading inventory…</div>
                        ) : error ? (
                            <div className="py-14 text-center">
                                <p className="text-red-600 font-medium">{error}</p>
                                <button onClick={retry} className="mt-4 text-sm font-semibold text-[#009FC6]">Try again</button>
                            </div>
                        ) : visibleInventory.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="font-semibold text-[#006179]">No inventory found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Stock is added by recording a purchase. Try another search or filter.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-200 text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs font-semibold uppercase tracking-wide text-[#246879] border-b border-gray-100">
                                            <th className="pb-3 px-4">Medicine</th>
                                            <th className="pb-3 px-4">Batch</th>
                                            <th className="pb-3 px-4">Expiry</th>
                                            <th className="pb-3 px-4 text-right">Quantity</th>
                                            <th className="pb-3 px-4 text-right">Purchase price</th>
                                            <th className="pb-3 px-4 text-right">Selling price</th>
                                            <th className="pb-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {visibleInventory.map((item) => {
                                            const status = getStatus(item);
                                            return (
                                                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-4 px-4">
                                                        <p className="font-semibold text-gray-800">{item.medicine?.name || "Unknown medicine"}</p>
                                                        <p className="text-xs text-gray-400">{item.medicine?.genericName}</p>
                                                    </td>
                                                    <td className="py-4 px-4 font-medium text-[#246879]">{item.batchNumber}</td>
                                                    <td className="py-4 px-4">{formatDate(item.expiryDate)}</td>
                                                    <td className="py-4 px-4 text-right font-semibold">{item.quantity}</td>
                                                    <td className="py-4 px-4 text-right">{formatCurrency(item.purchasePrice)}</td>
                                                    <td className="py-4 px-4 text-right font-semibold text-[#006179]">{formatCurrency(item.sellingPrice)}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${status.classes}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Inventory;
