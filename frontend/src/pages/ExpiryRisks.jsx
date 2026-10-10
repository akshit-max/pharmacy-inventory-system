import React, { useState, useEffect } from "react";
import api from "../services/api";

const ExpiryRisks = () => {
    const [data, setData] = useState({ summary: {}, details: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchExpiryRisks = async () => {
        try {
            setLoading(true);
            const response = await api.get("/analytics/expiry-risks");
            setData(response.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch expiry risks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpiryRisks();
    }, []);

    const getStatusBadge = (category) => {
        switch (category) {
            case "Expired":
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">Expired</span>;
            case "Critical":
                return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">Critical (&lt; 7 Days)</span>;
            case "High Risk":
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md">High Risk (7-30 Days)</span>;
            case "Upcoming":
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">Upcoming (30-90 Days)</span>;
            case "Safe":
            default:
                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Safe (&gt; 90 Days)</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#006179]">Expiry Risk Monitoring</h1>
                    <p className="text-gray-500 mt-1">Identify and manage stock approaching expiration.</p>
                </div>
                <button
                    onClick={fetchExpiryRisks}
                    className="bg-[#009FC6] hover:bg-[#006179] text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {/* Summary Cards */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                        <h3 className="text-red-800 font-bold text-sm uppercase">Expired Batches</h3>
                        <p className="text-3xl font-extrabold text-red-600 mt-2">{data.summary.expiredCount || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <h3 className="text-orange-800 font-bold text-sm uppercase">Critical (0-7 Days)</h3>
                        <p className="text-3xl font-extrabold text-orange-600 mt-2">{data.summary.criticalCount || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <h3 className="text-yellow-800 font-bold text-sm uppercase">High Risk (7-30 Days)</h3>
                        <p className="text-3xl font-extrabold text-yellow-600 mt-2">{data.summary.highRiskCount || 0}</p>
                    </div>
                    <div className="bg-[#009FC6]/10 p-4 rounded-xl border border-[#009FC6]/20">
                        <h3 className="text-[#006179] font-bold text-sm uppercase">Total Units At Risk</h3>
                        <p className="text-3xl font-extrabold text-[#009FC6] mt-2">{data.summary.totalAtRiskQuantity || 0}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-semibold border border-red-100">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-500">
                    <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#009FC6] rounded-full" role="status" aria-label="loading"></div>
                    <p className="mt-4 font-medium">Scanning inventory for expiry risks...</p>
                </div>
            ) : data.details.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-medium">No active batches found in inventory.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-[#009FC6]/5 text-[#246879] uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Medicine</th>
                                    <th className="px-6 py-4">Batch No.</th>
                                    <th className="px-6 py-4">Expiry Date</th>
                                    <th className="px-6 py-4">Days Remaining</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Est. Value at Risk</th>
                                    <th className="px-6 py-4">Risk Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.details.map((batch) => (
                                    <tr key={batch.batchId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            {batch.medicineName} <br />
                                            <span className="text-xs text-gray-400 font-normal">{batch.genericName}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {batch.batchNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(batch.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {batch.category === "Expired" ? (
                                                <span className="text-red-500 font-bold">Expired</span>
                                            ) : (
                                                <span className="font-bold">{batch.daysRemaining} days</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {batch.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {batch.hasReliableValue ? (
                                                <span className="font-semibold text-gray-700">₹{batch.estimatedValue.toFixed(2)}</span>
                                            ) : (
                                                <span className="italic">Unavailable</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(batch.category)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpiryRisks;
