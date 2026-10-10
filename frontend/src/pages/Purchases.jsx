import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function Purchases() {
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    
    // Purchase form state
    const [supplier, setSupplier] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([]);
    
    // Current item being added
    const [currentItem, setCurrentItem] = useState({
        medicine: "",
        batchNumber: "",
        expiryDate: "",
        quantity: 1,
        purchasePrice: 0,
        sellingPrice: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [suppliersRes, medicinesRes] = await Promise.all([
                    api.get("/suppliers"),
                    api.get("/medicines?limit=1000") // Assuming we want all for dropdown
                ]);
                setSuppliers(suppliersRes.data);
                setMedicines(medicinesRes.data.medicines || []);
            } catch (err) {
                console.error("Failed to load initial data", err);
                setError("Failed to load suppliers or medicines.");
            }
        };
        fetchInitialData();
    }, []);

    const handleCurrentItemChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    const addItem = () => {
        if (!currentItem.medicine || !currentItem.batchNumber || !currentItem.expiryDate || currentItem.quantity < 1 || currentItem.purchasePrice < 0 || currentItem.sellingPrice < 0) {
            alert("Please fill in all item fields correctly.");
            return;
        }

        const selectedMed = medicines.find(m => m._id === currentItem.medicine);

        setItems(prev => [...prev, { 
            ...currentItem, 
            quantity: Number(currentItem.quantity),
            purchasePrice: Number(currentItem.purchasePrice),
            sellingPrice: Number(currentItem.sellingPrice),
            medicineName: selectedMed?.name 
        }]);

        // Reset current item (keep medicine selected for convenience, or clear it)
        setCurrentItem({
            medicine: "",
            batchNumber: "",
            expiryDate: "",
            quantity: 1,
            purchasePrice: 0,
            sellingPrice: 0
        });
    };

    const removeItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const totalAmount = items.reduce((total, item) => total + (item.quantity * item.purchasePrice), 0);

    const submitPurchase = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!supplier || !invoiceNumber || !purchaseDate) {
            setError("Supplier, Invoice Number, and Purchase Date are required.");
            return;
        }

        if (items.length === 0) {
            setError("Add at least one medicine to the purchase.");
            return;
        }

        setLoading(true);
        try {
            const purchaseData = {
                supplier,
                invoiceNumber,
                purchaseDate,
                items: items.map(item => ({
                    medicine: item.medicine,
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice,
                    sellingPrice: item.sellingPrice
                }))
            };

            await api.post("/purchase", purchaseData);
            setSuccessMessage("Purchase recorded successfully! Inventory updated.");
            
            // Reset form
            setSupplier("");
            setInvoiceNumber("");
            setItems([]);
        } catch (err) {
            console.error("Purchase error", err);
            setError(err.response?.data?.message || "Failed to submit purchase.");
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
                        <h1 className="text-4xl font-black text-[#006179]">Record Purchase</h1>
                        <p className="text-[#246879] mt-2">Add new stock and update inventory automatically.</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>}
                    {successMessage && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200">{successMessage}</div>}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-[#006179] mb-4">Invoice Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Supplier *</span>
                                        <select value={supplier} onChange={e => setSupplier(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#009FC6]">
                                            <option value="">Select Supplier</option>
                                            {suppliers.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Invoice Number *</span>
                                        <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV-1234" className="mt-1 w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Purchase Date *</span>
                                        <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-[#006179] mb-4">Add Medicines</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                    <label className="block lg:col-span-3">
                                        <span className="text-sm font-semibold text-gray-700">Medicine</span>
                                        <select name="medicine" value={currentItem.medicine} onChange={handleCurrentItemChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]">
                                            <option value="">Select Medicine</option>
                                            {medicines.map(m => (
                                                <option key={m._id} value={m._id}>{m.name} {m.genericName ? `(${m.genericName})` : ''}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Batch Number</span>
                                        <input type="text" name="batchNumber" value={currentItem.batchNumber} onChange={handleCurrentItemChange} placeholder="BATCH-001" className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Expiry Date</span>
                                        <input type="date" name="expiryDate" value={currentItem.expiryDate} onChange={handleCurrentItemChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Quantity</span>
                                        <input type="number" name="quantity" min="1" value={currentItem.quantity} onChange={handleCurrentItemChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Purchase Price (per unit)</span>
                                        <input type="number" name="purchasePrice" min="0" step="0.01" value={currentItem.purchasePrice} onChange={handleCurrentItemChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700">Selling Price (per unit)</span>
                                        <input type="number" name="sellingPrice" min="0" step="0.01" value={currentItem.sellingPrice} onChange={handleCurrentItemChange} className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#009FC6]" />
                                    </label>
                                    <div className="lg:col-span-3 flex justify-end">
                                        <button type="button" onClick={addItem} className="bg-[#4DDCFF]/20 text-[#009FC6] hover:bg-[#009FC6] hover:text-white px-4 py-2 rounded-lg font-bold transition-colors">
                                            + Add to List
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                                <h2 className="text-xl font-bold text-[#006179] mb-4 border-b pb-2">Purchase Summary</h2>
                                
                                <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                                    {items.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-4">No items added yet.</p>
                                    ) : (
                                        items.map((item, index) => (
                                            <div key={index} className="bg-slate-50 p-3 rounded-xl flex justify-between items-start border border-slate-100">
                                                <div>
                                                    <p className="font-bold text-[#006179] text-sm">{item.medicineName}</p>
                                                    <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
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
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Purchases;
