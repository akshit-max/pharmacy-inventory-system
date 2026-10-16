import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { errorMessage } from "../utils/auth";

function AuditTrail() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMovements = async () => {
            try {
                const response = await api.get("/stockMovements");
                setMovements(response.data);
            } catch (err) {
                setError(errorMessage(err, "Could not load inventory movement history."));
            } finally {
                setLoading(false);
            }
        };
        loadMovements();
    }, []);

    const getBadgeStyle = (type) => {
        switch (type) {
            case "PURCHASE": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "SALE": return "bg-blue-50 text-blue-700 border-blue-200";
            case "ADJUSTMENT": return "bg-amber-50 text-amber-700 border-amber-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", { 
            day: "2-digit", month: "short", year: "numeric", 
            hour: "2-digit", minute: "2-digit" 
        });
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-[#006179]">Inventory Audit Trail</h1>
                        <p className="text-[#246879] mt-2">Track all stock movements, purchases, and sales.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <p className="p-8 text-center text-gray-500 font-semibold">Loading history...</p>
                        ) : error ? (
                            <p className="p-8 text-center text-red-500 font-semibold">{error}</p>
                        ) : movements.length === 0 ? (
                            <p className="p-8 text-center text-gray-500 font-semibold">No stock movements found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-[#246879] text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 border-b border-gray-100">Date & Time</th>
                                            <th className="px-6 py-4 border-b border-gray-100">Type</th>
                                            <th className="px-6 py-4 border-b border-gray-100">Medicine</th>
                                            <th className="px-6 py-4 border-b border-gray-100">Batch</th>
                                            <th className="px-6 py-4 border-b border-gray-100 text-right">Qty Change</th>
                                            <th className="px-6 py-4 border-b border-gray-100">User / Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {movements.map(movement => (
                                            <tr key={movement._id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                                    {formatDate(movement.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${getBadgeStyle(movement.type)}`}>
                                                        {movement.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-[#006179]">
                                                    {movement.medicine?.name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {movement.batch?.batchNumber || "Unknown"}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-black ${movement.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    <p className="italic">{movement.note || "System generated"}</p>
                                                    <p className="text-gray-400 mt-1">
                                                        User: {movement.performedBy ? movement.performedBy.name : "System"}
                                                    </p>
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

export default AuditTrail;
