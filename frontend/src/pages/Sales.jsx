import { useEffect, useState, useCallback, Fragment } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const inputClasses = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#009FC6] focus:bg-white focus:ring-4 focus:ring-[#4DDCFF]/20";

const SalesAnimations = () => <style>{`
  @keyframes salesRiseIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes salesPop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes modalIn { from { opacity: 0; transform: scale(.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .sales-rise-in { animation: salesRiseIn .5s cubic-bezier(.16,1,.3,1) both; }
  .sales-pop { animation: salesPop .25s cubic-bezier(.16,1,.3,1) both; }
  .modal-in { animation: modalIn .3s cubic-bezier(.16,1,.3,1) both; }
  @media (prefers-reduced-motion: reduce) { .sales-rise-in, .sales-pop, .modal-in { animation: none; } }
`}</style>;

// ─── Post-Sale Receipt Modal ──────────────────────────────────────────────────
function ReceiptModal({ sale, onDismiss }) {
    if (!sale) return null;
    const formattedDate = sale.saleDate ? new Date(sale.saleDate).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }) : "";
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Sale receipt"
        >
            <div className="modal-in w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-[#006179] px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#4DDCFF]">Sale Receipt</p>
                            <h2 className="text-xl font-extrabold mt-0.5">{sale.invoiceNumber}</h2>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20">
                            <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-xs text-[#a8d3de] mt-2">{formattedDate}</p>
                    {sale.customerName && (
                        <p className="text-sm font-semibold text-white/90 mt-1">
                            Customer: {sale.customerName}{sale.customerPhone ? ` · ${sale.customerPhone}` : ""}
                        </p>
                    )}
                </div>

                {/* Item lines */}
                <div className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto">
                    {sale.items.map((item, idx) => {
                        const medicineName = item.medicine?.name || item.name || "Medicine";
                        const genericName = item.medicine?.genericName || item.genericName || "";
                        return (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className="font-semibold text-[#006179] truncate">
                                        {medicineName}
                                    </p>
                                    {genericName && (
                                        <p className="text-xs text-slate-400 truncate">{genericName}</p>
                                    )}
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {item.quantity} × ₹{item.sellingPrice?.toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-bold text-slate-800 tabular-nums shrink-0">
                                    ₹{item.total?.toFixed(2)}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Total */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
                    <span className="font-bold text-slate-600">Total</span>
                    <span className="text-2xl font-extrabold text-[#006179] tabular-nums">
                        ₹{sale.totalAmount?.toFixed(2)}
                    </span>
                </div>

                {/* Dismiss */}
                <div className="px-6 pb-5 pt-3">
                    <button
                        onClick={onDismiss}
                        className="w-full rounded-xl bg-[#009FC6] py-3 font-bold text-white shadow-md transition-all hover:bg-[#006179] active:scale-[.98]"
                    >
                        Done — New Sale
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Sales History Table ──────────────────────────────────────────────────────
function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(null); // invoice being drilled into

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/sales");
            setSales(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load sales history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSales(); }, [fetchSales]);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const formatDateTime = (d) =>
        new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-[#246879]">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent mr-3" />
            Loading sales history…
        </div>
    );

    if (error) return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700 font-semibold text-sm flex items-center gap-3">
            <span>⚠</span> {error}
            <button onClick={fetchSales} className="ml-auto underline font-bold">Retry</button>
        </div>
    );

    if (sales.length === 0) return (
        <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">🧾</div>
            <p className="font-bold text-[#246879]">No sales recorded yet</p>
            <p className="text-sm text-slate-400 mt-1">Complete a sale from the New Sale tab to see it here.</p>
        </div>
    );

    return (
        <div className="space-y-4 sales-rise-in">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#246879]">{sales.length} sale{sales.length !== 1 ? "s" : ""} recorded</p>
                <button
                    onClick={fetchSales}
                    className="text-xs font-bold text-[#009FC6] hover:text-[#006179] transition-colors"
                >
                    ↻ Refresh
                </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[#246879] text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="px-5 py-4">Invoice #</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4 text-center">Items</th>
                            <th className="px-5 py-4 text-right">Total</th>
                            <th className="px-5 py-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sales.map((sale) => (
                            <Fragment key={sale._id}>
                                <tr className="hover:bg-[#4DDCFF]/5 transition-colors">
                                    <td className="px-5 py-4 font-bold text-[#006179]">{sale.invoiceNumber}</td>
                                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{formatDate(sale.saleDate)}</td>
                                    <td className="px-5 py-4 text-slate-700">
                                        {sale.customerName || <span className="italic text-slate-400">Walk-in</span>}
                                        {sale.customerPhone && <p className="text-xs text-slate-400">{sale.customerPhone}</p>}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex items-center justify-center min-w-7 h-7 rounded-full bg-[#009FC6]/10 text-[#006179] text-xs font-extrabold">
                                            {sale.items.length}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right font-extrabold text-[#006179] tabular-nums">
                                        ₹{sale.totalAmount?.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => setExpanded(expanded === sale._id ? null : sale._id)}
                                            className="text-xs font-bold text-[#009FC6] hover:text-[#006179] transition-colors"
                                            aria-expanded={expanded === sale._id}
                                        >
                                            {expanded === sale._id ? "▲ Hide" : "▼ View"}
                                        </button>
                                    </td>
                                </tr>

                                {/* Expanded item breakdown */}
                                {expanded === sale._id && (
                                    <tr key={`${sale._id}-detail`}>
                                        <td colSpan={6} className="px-5 pb-5 pt-0">
                                            <div className="sales-pop rounded-xl bg-slate-50 border border-slate-100 p-4">
                                                <p className="text-xs font-bold text-[#246879] uppercase tracking-wider mb-3">
                                                    {sale.invoiceNumber} · {formatDateTime(sale.saleDate)}
                                                </p>
                                                <div className="space-y-2">
                                                    {sale.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-sm">
                                                            <div>
                                                                <span className="font-semibold text-[#006179]">
                                                                    {item.medicine?.name || "Medicine"}
                                                                </span>
                                                                {item.medicine?.genericName && (
                                                                    <span className="ml-1 text-xs text-slate-400">({item.medicine.genericName})</span>
                                                                )}
                                                                <span className="ml-2 text-xs text-slate-500">
                                                                    {item.quantity} × ₹{item.sellingPrice?.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <span className="font-bold text-slate-700 tabular-nums">
                                                                ₹{item.total?.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total</span>
                                                    <span className="font-extrabold text-[#006179] tabular-nums">₹{sale.totalAmount?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── New Sale Form ─────────────────────────────────────────────────────────────
function NewSaleForm({ onSaleCompleted }) {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const response = await api.get("/medicines", { params: { search, page: 1, limit: 20 } });
                setMedicines(response.data.medicines || []);
            } catch (fetchError) { console.error("Failed to fetch medicines", fetchError); }
        };
        fetchMedicines();
    }, [search]);

    const addToCart = () => {
        const amount = Number(quantity);
        if (!selectedMedicine) return setError("Please select a medicine.");
        if (!Number.isFinite(amount) || amount < 1) return setError("Quantity must be at least 1.");
        setCart((current) => {
            const existing = current.find((item) => item.medicine === selectedMedicine._id);
            return existing
                ? current.map((item) => item.medicine === selectedMedicine._id ? { ...item, quantity: item.quantity + amount } : item)
                : [...current, { medicine: selectedMedicine._id, name: selectedMedicine.name, genericName: selectedMedicine.genericName, quantity: amount }];
        });
        setSelectedMedicine(null); setQuantity(1); setSearch(""); setError("");
    };

    const updateQuantity = (id, value) => {
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount < 1) return;
        setCart((current) => current.map((item) => item.medicine === id ? { ...item, quantity: amount } : item));
    };
    const removeFromCart = (id) => setCart((current) => current.filter((item) => item.medicine !== id));

    const createSale = async () => {
        if (!cart.length) return setError("Add at least one medicine before completing the sale.");
        try {
            setLoading(true); setError("");
            const response = await api.post("/sales", {
                invoiceNumber: `SALE-${Date.now()}`,
                customerName,
                customerPhone,
                items: cart.map((item) => ({ medicine: item.medicine, quantity: item.quantity })),
            });
            setCart([]); setCustomerName(""); setCustomerPhone("");
            // Pass the completed sale record up so the parent can show the receipt
            onSaleCompleted(response.data);
        } catch (saleError) {
            setError(saleError.response?.data?.message || "Failed to create sale.");
        } finally {
            setLoading(false);
        }
    };

    const totalUnits = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
            <div className="space-y-6">
                {/* Customer details */}
                <section className="sales-rise-in rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_35px_rgba(0,97,121,.06)] sm:p-7" style={{ animationDelay: "80ms" }}>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4DDCFF]/20 text-[#009FC6]">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.12a7.5 7.5 0 0 1 15 0" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-[#006179]">Customer details</h2>
                            <p className="text-xs text-slate-400">Optional information for this invoice</p>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#246879]">Customer name</span>
                            <input className={inputClasses} placeholder="e.g. Priya Sharma" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                        </label>
                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#246879]">Phone number</span>
                            <input className={inputClasses} type="tel" placeholder="e.g. 98765 43210" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                        </label>
                    </div>
                </section>

                {/* Medicine search */}
                <section className="sales-rise-in rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_35px_rgba(0,97,121,.06)] sm:p-7" style={{ animationDelay: "140ms" }}>
                    <div className="mb-5">
                        <h2 className="font-bold text-[#006179]">Add medicine</h2>
                        <p className="mt-1 text-sm text-slate-400">Find a medicine and choose the quantity to bill.</p>
                    </div>
                    <div className="relative">
                        <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
                        </svg>
                        <input
                            className={`${inputClasses} pl-11`}
                            type="search"
                            placeholder="Search by medicine name..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setSelectedMedicine(null); }}
                        />
                    </div>
                    {search && (
                        <div className="sales-pop mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            {medicines.length ? medicines.map((medicine) => (
                                <button
                                    key={medicine._id}
                                    onClick={() => { setSelectedMedicine(medicine); setError(""); }}
                                    className="group flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-[#4DDCFF]/10"
                                >
                                    <span>
                                        <span className="block font-bold text-[#006179] group-hover:text-[#009FC6]">{medicine.name}</span>
                                        {medicine.genericName && <span className="mt-0.5 block text-xs text-slate-400">{medicine.genericName}</span>}
                                    </span>
                                    <span className="text-lg text-[#009FC6] transition-transform group-hover:translate-x-1">›</span>
                                </button>
                            )) : (
                                <p className="px-4 py-5 text-center text-sm font-medium text-slate-400">No medicines found for "{search}".</p>
                            )}
                        </div>
                    )}
                    {selectedMedicine && (
                        <div className="sales-pop mt-4 flex flex-col gap-4 rounded-xl border border-[#4DDCFF]/40 bg-[#4DDCFF]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-bold text-[#006179]">{selectedMedicine.name}</p>
                                <p className="text-sm text-[#246879]">{selectedMedicine.genericName || "Selected medicine"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    className="w-20 rounded-lg border border-[#009FC6]/25 bg-white px-3 py-2 text-center font-bold text-[#006179] outline-none focus:ring-4 focus:ring-[#4DDCFF]/25"
                                    type="number" min="1" value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    aria-label="Quantity"
                                />
                                <button onClick={addToCart} className="rounded-lg bg-[#009FC6] px-4 py-2 font-bold text-white shadow-sm transition-all hover:bg-[#006179] active:scale-[.97]">Add</button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Order summary sidebar */}
            <aside className="sales-rise-in h-fit rounded-2xl border border-slate-100 bg-white shadow-[0_12px_35px_rgba(0,97,121,.08)] xl:sticky xl:top-6" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                    <div>
                        <h2 className="font-bold text-[#006179]">Order summary</h2>
                        <p className="mt-1 text-xs text-slate-400">{cart.length} {cart.length === 1 ? "medicine" : "medicines"} in cart</p>
                    </div>
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#009FC6]/10 px-2 text-sm font-extrabold text-[#009FC6]">{totalUnits}</span>
                </div>

                <div className="max-h-85 space-y-2 overflow-y-auto p-4 sm:p-5">
                    {cart.length ? cart.map((item) => (
                        <div key={item.medicine} className="sales-pop flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            <div className="min-w-0 grow">
                                <p className="truncate text-sm font-bold text-[#006179]">{item.name}</p>
                                {item.genericName && <p className="truncate text-xs text-slate-400">{item.genericName}</p>}
                            </div>
                            <input
                                className="w-14 rounded-lg border border-slate-200 bg-white px-1 py-1.5 text-center text-sm font-bold text-[#006179] outline-none focus:border-[#009FC6]"
                                type="number" min="1" value={item.quantity}
                                onChange={(e) => updateQuantity(item.medicine, e.target.value)}
                                aria-label={`${item.name} quantity`}
                            />
                            <button onClick={() => removeFromCart(item.medicine)} className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700" aria-label={`Remove ${item.name}`}>×</button>
                        </div>
                    )) : (
                        <div className="py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">+</div>
                            <p className="text-sm font-bold text-[#246879]">Your cart is empty</p>
                            <p className="mx-auto mt-1 max-w-50 text-xs leading-5 text-slate-400">Search for a medicine to start this sale.</p>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-500">Items</span>
                        <span className="font-bold text-[#006179]">{totalUnits} units</span>
                    </div>
                    {error && (
                        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={createSale}
                        disabled={loading || !cart.length}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#009FC6] px-4 py-3.5 font-bold text-white shadow-lg shadow-[#009FC6]/20 transition-all hover:bg-[#006179] active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                        {loading ? (
                            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Processing sale...</>
                        ) : (
                            <>Complete sale <span>→</span></>
                        )}
                    </button>
                </div>
            </aside>
        </div>
    );
}

// ─── Main Sales Page ───────────────────────────────────────────────────────────
function Sales() {
    const [activeTab, setActiveTab] = useState("new"); // "new" | "history"
    const [completedSale, setCompletedSale] = useState(null); // holds last sale for receipt

    const handleSaleCompleted = (sale) => {
        setCompletedSale(sale);
    };

    const handleDismissReceipt = () => {
        setCompletedSale(null);
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-slate-50 p-4 font-sans sm:p-6 md:p-10">
                <SalesAnimations />
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Page header */}
                    <header className="sales-rise-in flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#009FC6]">Point of sale</p>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#006179] sm:text-4xl">Sales</h1>
                            <p className="mt-2 text-sm font-medium text-[#246879] sm:text-base">
                                Create new sales and review transaction history.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#009FC6]/15 bg-white px-4 py-2 text-sm font-bold text-[#006179] shadow-sm md:self-auto">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live inventory
                        </div>
                    </header>

                    {/* Tabs */}
                    <div className="sales-rise-in flex gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit shadow-sm" style={{ animationDelay: "60ms" }}>
                        {[
                            { id: "new", label: "New Sale" },
                            { id: "history", label: "Sales History" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-lg px-5 py-2 text-sm font-bold transition-all ${
                                    activeTab === tab.id
                                        ? "bg-[#009FC6] text-white shadow-sm"
                                        : "text-[#246879] hover:bg-slate-50 hover:text-[#006179]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    {activeTab === "new" ? (
                        <NewSaleForm onSaleCompleted={handleSaleCompleted} />
                    ) : (
                        <SalesHistory />
                    )}
                </div>
            </main>
            <Footer />

            {/* Post-sale receipt modal — rendered outside the scroll flow */}
            {completedSale && (
                <ReceiptModal sale={completedSale} onDismiss={handleDismissReceipt} />
            )}
        </>
    );
}

export default Sales;
