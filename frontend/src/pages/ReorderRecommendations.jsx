import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const ReorderRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await api.get("/analytics/reorder-recommendations");
            setRecommendations(response.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch reorder recommendations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "Reorder Now":
            case "Reorder Now (Static)":
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">{status}</span>;
            case "Reorder Soon":
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md">{status}</span>;
            case "Stock Sufficient":
                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">{status}</span>;
            case "Insufficient Sales History":
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">{status}</span>;
            default:
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">{status}</span>;
        }
    };

    return (
        <>
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#006179]">Smart Reorder Recommendations</h1>
                    <p className="text-gray-500 mt-1">Data-driven suggestions based on 30-day historical demand.</p>
                </div>
                <button
                    onClick={fetchRecommendations}
                    className="bg-[#009FC6] hover:bg-[#006179] text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 border border-blue-200 text-sm">
                <strong>Methodology:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Average Daily Demand (ADD):</strong> Total unexpired units sold over the last 30 days ÷ 30.</li>
                    <li><strong>Reorder Point:</strong> (ADD × Supplier Lead Time) + Safety Stock.</li>
                    <li><strong>Suggested Quantity:</strong> Stock required to maintain 30 days of coverage minus current eligible stock.</li>
                </ul>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-semibold border border-red-100">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-500">
                    <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#009FC6] rounded-full" role="status" aria-label="loading"></div>
                    <p className="mt-4 font-medium">Analyzing sales data and calculating recommendations...</p>
                </div>
            ) : recommendations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-medium">No medicines found to recommend.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-[#009FC6]/5 text-[#246879] uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Medicine</th>
                                    <th className="px-6 py-4">Current Stock</th>
                                    <th className="px-6 py-4">Avg. Daily Demand</th>
                                    <th className="px-6 py-4">Est. Days Remaining</th>
                                    <th className="px-6 py-4">Reorder Point</th>
                                    <th className="px-6 py-4 text-center">Suggested Order</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recommendations.map((rec) => (
                                    <tr key={rec.medicineId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            {rec.medicineName} <br />
                                            <span className="text-xs text-gray-400 font-normal">{rec.genericName}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {rec.currentStock}
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.averageDailyDemand}
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.estimatedDaysRemaining}
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.reorderPoint}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {rec.suggestedReorderQuantity > 0 ? (
                                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
                                                    {rec.suggestedReorderQuantity}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(rec.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
        <Footer />
        </>
    );
};

export default ReorderRecommendations;
