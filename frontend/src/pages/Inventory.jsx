import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const InventoryAnimations = () => (
    <style>{`
        @keyframes inventoryRiseIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .inventory-rise-in { animation: inventoryRiseIn .5s cubic-bezier(.16, 1, .3, 1) both; }
        @media (prefers-reduced-motion: reduce) { .inventory-rise-in { animation: none; } }
    `}</style>
);

const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);
const formatDate = (date) => {
    const parsed = new Date(date);
    return date && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const fetchInventory = async () => {
        try {
            setLoading(true); setError("");
            const response = await api.get("/inventory");
            setInventory(Array.isArray(response.data?.inventory) ? response.data.inventory : []);
            setLowStockCount(Number(response.data?.summary?.lowStockMedicines) || 0);
        } catch (requestError) {
            console.error("Failed to load inventory", requestError);
            setError("We couldn't load your inventory. Please try again.");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const getStatus = (item) => {
        const expiryDate = new Date(item.expiryDate);
        if (!Number.isNaN(expiryDate.getTime()) && expiryDate < new Date()) return { label: "Expired", classes: "bg-red-50 text-red-700" };
        const isLow = item.isLowStock !== undefined
            ? item.isLowStock
            : (item.medicine && item.quantity <= (item.medicine.reorderLevel ?? 10));
        if (isLow) return { label: "Low stock", classes: "bg-orange-50 text-orange-700" };
        return { label: "In stock", classes: "bg-emerald-50 text-emerald-700" };
    };

    const summary = useMemo(() => ({
        total: inventory.length,
        units: inventory.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
        lowStock: lowStockCount,
        expired: inventory.filter((item) => getStatus(item).label === "Expired").length,
    }), [inventory, lowStockCount]);

    const visibleInventory = useMemo(() => {
        const query = search.trim().toLowerCase();
        return inventory.filter((item) => {
            const matchesSearch = !query || [item.medicine?.name, item.medicine?.genericName, item.batchNumber].filter(Boolean).some((value) => value.toLowerCase().includes(query));
            return matchesSearch && (filter === "all" || getStatus(item).label.toLowerCase() === filter);
        });
    }, [inventory, search, filter]);

    const stats = [
        { label: "Total batches", value: summary.total, detail: "tracked in inventory", color: "#009FC6", icon: "M20 7h-3V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 4h6v3H9V4zm9 14H6v-2h12v2zm0-4H6v-3h12v3z" },
        { label: "Units in stock", value: summary.units.toLocaleString("en-IN"), detail: "across all batches", color: "#00C8F9", icon: "M3 7h18M6 3v4m12-4v4m-1 4H7a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5 2 2 0 00-2-2z" },
        { label: "Low stock alerts", value: summary.lowStock, detail: "need reordering", color: "#f97316", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
        { label: "Expired batches", value: summary.expired, detail: "require attention", color: "#ef4444", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
                <InventoryAnimations />
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="inventory-rise-in flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div><h1 className="text-4xl font-extrabold text-[#006179]">Inventory</h1><p className="text-[#246879] mt-2">Monitor stock levels, batch details, and expiry dates.</p></div>
                        <Link to="/addmedicine" className="bg-[#009FC6] hover:bg-[#006179] active:scale-[.97] text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all duration-200 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add medicine</Link>
                    </header>

                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{stats.map((stat, index) => <article key={stat.label} style={{ animationDelay: `${index * 70}ms`, borderBottomColor: stat.color }} className="inventory-rise-in bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-b-[3px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[#246879] mb-1">{stat.label}</p><p className="text-3xl font-extrabold text-[#006179] tabular-nums">{stat.value}</p><p className="text-xs text-gray-400 mt-1">{stat.detail}</p></div><div style={{ backgroundColor: `${stat.color}1A`, color: stat.color }} className="p-3 rounded-full shrink-0"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg></div></div></article>)}</section>

                    <section className="inventory-rise-in bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6" style={{ animationDelay: "220ms" }}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-gray-100"><div><h2 className="text-lg font-bold text-[#006179]">Stock overview</h2><p className="text-sm text-gray-400 mt-1">{visibleInventory.length} of {inventory.length} batches shown</p></div><div className="flex flex-col sm:flex-row gap-3"><label className="relative"><span className="sr-only">Search inventory</span><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicine or batch" className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#00C8F9]/30 focus:border-[#009FC6]" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-[#246879] outline-none focus:ring-2 focus:ring-[#00C8F9]/30"><option value="all">All statuses</option><option value="in stock">In stock</option><option value="low stock">Low stock</option><option value="expired">Expired</option></select></div></div>
                        {loading ? <div className="py-16 text-center text-[#246879]">Loading inventory…</div> : error ? <div className="py-14 text-center"><p className="text-red-600 font-medium">{error}</p><button onClick={fetchInventory} className="mt-4 text-sm font-semibold text-[#009FC6] hover:text-[#006179]">Try again</button></div> : visibleInventory.length === 0 ? <div className="py-16 text-center"><p className="font-semibold text-[#006179]">No inventory found</p><p className="text-sm text-gray-400 mt-1">Try another search or status filter.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-212.5 text-left border-collapse"><thead><tr className="text-xs font-semibold uppercase tracking-wide text-[#246879] border-b border-gray-100"><th className="pb-3 px-4">Medicine</th><th className="pb-3 px-4">Batch</th><th className="pb-3 px-4">Expiry</th><th className="pb-3 px-4 text-right">Quantity</th><th className="pb-3 px-4 text-right">Purchase price</th><th className="pb-3 px-4 text-right">Selling price</th><th className="pb-3 px-4">Status</th></tr></thead><tbody className="text-sm text-gray-700">{visibleInventory.map((item) => { const status = getStatus(item); return <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"><td className="py-4 px-4"><p className="font-semibold text-gray-800">{item.medicine?.name || "Unknown medicine"}</p>{item.medicine?.genericName && <p className="text-xs text-gray-400 mt-0.5">{item.medicine.genericName}</p>}</td><td className="py-4 px-4 font-medium text-[#246879]">{item.batchNumber || "—"}</td><td className="py-4 px-4">{formatDate(item.expiryDate)}</td><td className="py-4 px-4 text-right font-semibold tabular-nums">{item.quantity ?? 0}</td><td className="py-4 px-4 text-right tabular-nums">{formatCurrency(item.purchasePrice)}</td><td className="py-4 px-4 text-right font-semibold text-[#006179] tabular-nums">{formatCurrency(item.sellingPrice)}</td><td className="py-4 px-4"><span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${status.classes}`}>{status.label}</span></td></tr>; })}</tbody></table></div>}
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Inventory;
