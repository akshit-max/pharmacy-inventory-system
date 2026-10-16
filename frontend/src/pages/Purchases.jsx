import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { errorMessage, hasRole } from "../utils/auth";

const today = () => new Date().toISOString().split("T")[0];

const emptyItem = {
    medicine: "",
    batchNumber: "",
    expiryDate: "",
    quantity: 1,
    purchasePrice: 0,
    sellingPrice: 0
};

const inputClasses = "mt-1 w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#009FC6] outline-none";

function Purchases() {
    const canCreate = hasRole("Admin"); // only Admin can record purchases

    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [purchases, setPurchases] = useState([]);

    // Purchase form
    const [supplier, setSupplier] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(today());
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(emptyItem);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [openPurchase, setOpenPurchase] = useState(null); // purchase whose items are shown
    const [reloadCount, setReloadCount] = useState(0); // bump to load the data again

    // Load data when the page opens, and again whenever reloadCount changes
    useEffect(() => {
        const loadPurchases = async () => {
            try {
                const response = await api.get("/purchase");
                setPurchases(response.data);
            } catch (err) {
                setError(errorMessage(err, "Failed to load purchase history."));
            }
        };
        const loadFormData = async () => {
            try {
                const suppliersRes = await api.get("/suppliers");
                const medicinesRes = await api.get("/medicines", { params: { limit: 1000 } });
                setSuppliers(suppliersRes.data);
                setMedicines(medicinesRes.data.medicines || []);
            } catch (err) {
                setError(errorMessage(err, "Failed to load suppliers or medicines."));
            }
        };
        loadFormData();
        loadPurchases();
    }, [reloadCount]);

    const handleCurrentItemChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({ ...currentItem, [name]: value });
    };

    const addItem = () => {
        setError("");
        const quantity = Number(currentItem.quantity);
        const purchasePrice = Number(currentItem.purchasePrice);
        const sellingPrice = Number(currentItem.sellingPrice);

        if (!currentItem.medicine || !currentItem.batchNumber.trim() || !currentItem.expiryDate) {
            setError("Please choose a medicine and enter batch number and expiry date.");
            return;
        }
        if (currentItem.expiryDate <= today()) {
            setError("Expiry date must be in the future. Expired stock cannot be purchased.");
            return;
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            setError("Quantity must be a whole number of at least 1.");
            return;
        }
        if (purchasePrice < 0 || sellingPrice < 0) {
            setError("Prices cannot be negative.");
            return;
        }

        const selectedMedicine = medicines.find(m => m._id === currentItem.medicine);

        setItems([...items, {
            ...currentItem,
            batchNumber: currentItem.batchNumber.trim(),
            quantity,
            purchasePrice,
            sellingPrice,
            medicineName: selectedMedicine?.name
        }]);
        setCurrentItem(emptyItem);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const totalAmount = items.reduce((total, item) => total + item.quantity * item.purchasePrice, 0);

    const submitPurchase = async () => {
        setError("");
        setSuccessMessage("");

        if (!supplier || !invoiceNumber.trim() || !purchaseDate) {
            setError("Supplier, Invoice Number, and Purchase Date are required.");
            return;
        }
        if (items.length === 0) {
            setError("Add at least one medicine to the purchase.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/purchase", {
                supplier,
                invoiceNumber: invoiceNumber.trim(),
                purchaseDate,
                items: items.map(item => ({
                    medicine: item.medicine,
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice,
                    sellingPrice: item.sellingPrice
                }))
            });
            setSuccessMessage("Purchase recorded successfully! Inventory updated.");
            setSupplier("");
            setInvoiceNumber("");
            setItems([]);
            setReloadCount(reloadCount + 1);
        } catch (err) {
            setError(errorMessage(err, "Failed to submit purchase."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-[#006179]">Purchases</h1>
                        <p className="text-[#246879] mt-2">Record stock bought from suppliers. Inventory is updated automatically.</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>}
                    {successMessage && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200">{successMessage}</div>}

                    {canCreate && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Form */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-[#006179] mb-4">Invoice Details</h2>
                                    {suppliers.length === 0 && (
                                        <p className="mb-4 text-sm text-amber-700">No suppliers yet — add one on the Suppliers page first.</p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Supplier *</span>
                                            <select value={supplier} onChange={e => setSupplier(e.target.value)} className={inputClasses}>
                                                <option value="">Select Supplier</option>
                                                {suppliers.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Invoice Number *</span>
                                            <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV-1234" className={inputClasses} />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Purchase Date *</span>
                                            <input type="date" value={purchaseDate} max={today()} onChange={e => setPurchaseDate(e.target.value)} className={inputClasses} />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-[#006179] mb-4">Add Medicines</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <label className="block lg:col-span-3">
                                            <span className="text-sm font-semibold text-gray-700">Medicine</span>
                                            <select name="medicine" value={currentItem.medicine} onChange={handleCurrentItemChange} className={inputClasses}>
                                                <option value="">Select Medicine</option>
                                                {medicines.map(m => (
                                                    <option key={m._id} value={m._id}>{m.name} {m.genericName ? `(${m.genericName})` : ""}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Batch Number</span>
                                            <input type="text" name="batchNumber" value={currentItem.batchNumber} onChange={handleCurrentItemChange} placeholder="BATCH-001" className={inputClasses} />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Expiry Date</span>
                                            <input type="date" name="expiryDate" min={today()} value={currentItem.expiryDate} onChange={handleCurrentItemChange} className={inputClasses} />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Quantity</span>
                                            <input type="number" name="quantity" min="1" value={currentItem.quantity} onChange={handleCurrentItemChange} className={inputClasses} />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Purchase Price (per unit)</span>
                                            <input type="number" name="purchasePrice" min="0" step="0.01" value={currentItem.purchasePrice} onChange={handleCurrentItemChange} className={inputClasses} />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700">Selling Price (per unit)</span>
                                            <input type="number" name="sellingPrice" min="0" step="0.01" value={currentItem.sellingPrice} onChange={handleCurrentItemChange} className={inputClasses} />
                                        </label>
                                        <div className="lg:col-span-3 flex justify-end">
                                            <button type="button" onClick={addItem} className="bg-[#4DDCFF]/20 text-[#009FC6] hover:bg-[#009FC6] hover:text-white px-4 py-2 rounded-lg font-bold transition-colors">
                                                + Add to List
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                                    <h2 className="text-xl font-bold text-[#006179] mb-4 border-b pb-2">Purchase Summary</h2>

                                    <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                                        {items.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-4">No items added yet.</p>
                                        ) : (
                                            items.map((item, index) => (
                                                <div key={index} className="bg-slate-50 p-3 rounded-xl flex justify-between items-start border border-slate-100">
                                                    <div>
                                                        <p className="font-bold text-[#006179] text-sm">{item.medicineName}</p>
                                                        <p className="text-xs text-gray-500">Batch: {item.batchNumber} · Exp: {item.expiryDate}</p>
                                                        <p className="text-xs text-gray-500">{item.quantity} units @ ₹{item.purchasePrice}</p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <p className="font-bold text-gray-800 text-sm">₹{(item.quantity * item.purchasePrice).toFixed(2)}</p>
                                                        <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="font-bold text-gray-600">Total Amount</span>
                                            <span className="text-2xl font-black text-[#009FC6]">₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={submitPurchase}
                                            disabled={loading || items.length === 0}
                                            className="w-full bg-[#009FC6] hover:bg-[#006179] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-md transition-all"
                                        >
                                            {loading ? "Processing..." : "Complete Purchase"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Purchase history */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <h2 className="text-xl font-bold text-[#006179] p-6 pb-4">Purchase History</h2>
                        {purchases.length === 0 ? (
                            <p className="px-6 pb-8 text-gray-500">No purchases recorded yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[#246879] text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">Invoice</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Supplier</th>
                                            <th className="px-6 py-3 text-center">Items</th>
                                            <th className="px-6 py-3 text-right">Total</th>
                                            <th className="px-6 py-3 text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {purchases.map(purchase => (
                                            <PurchaseRow
                                                key={purchase._id}
                                                purchase={purchase}
                                                isOpen={openPurchase === purchase._id}
                                                onToggle={() => setOpenPurchase(openPurchase === purchase._id ? null : purchase._id)}
                                            />
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

// One row of the history table, plus its item list when opened
function PurchaseRow({ purchase, isOpen, onToggle }) {
    return (
        <>
            <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-[#006179]">{purchase.invoiceNumber}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(purchase.purchaseDate).toLocaleDateString("en-IN")}</td>
                <td className="px-6 py-4">{purchase.supplier?.name || "Deleted supplier"}</td>
                <td className="px-6 py-4 text-center">{purchase.items.length}</td>
                <td className="px-6 py-4 text-right font-bold">₹{purchase.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                    <button onClick={onToggle} className="text-xs font-bold text-[#009FC6] hover:text-[#006179]">
                        {isOpen ? "▲ Hide" : "▼ View"}
                    </button>
                </td>
            </tr>
            {isOpen && (
                <tr>
                    <td colSpan={6} className="px-6 pb-4">
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                            {purchase.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>
                                        <b className="text-[#006179]">{item.medicine?.name || "Medicine"}</b>
                                        <span className="ml-2 text-xs text-slate-500">
                                            Batch {item.batchNumber} · Exp {new Date(item.expiryDate).toLocaleDateString("en-IN")} · {item.quantity} × ₹{item.purchasePrice}
                                        </span>
                                    </span>
                                    <b>₹{(item.quantity * item.purchasePrice).toFixed(2)}</b>
                                </div>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default Purchases;
