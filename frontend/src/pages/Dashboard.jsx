import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const LoadAnimations = () => (
    <style>{`
        @keyframes riseIn {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .rise-in {
            animation: riseIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
            .rise-in { animation: none; }
        }
    `}</style>
);

const Dashboard = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/analytics/dashboard');
                setStatsData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = statsData ? [
        { title: 'Total medicines', value: statsData.totalMedicines, detail: 'registered in system', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z', color: '#009FC6' },
        { title: 'Low stock alerts', value: statsData.lowStockAlerts, detail: 'medicines need reordering', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: '#f97316' },
        { title: 'Expiring soon', value: statsData.expiringSoon, detail: 'batches within 30 days', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#ef4444' },
        { title: "Today's sales", value: `₹${statsData.todaySalesAmount.toFixed(2)}`, detail: `${statsData.todayTransactions} transactions`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#00C8F9' },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            <LoadAnimations />
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="rise-in flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#006179]">Dashboard</h1>
                        <p className="text-[#246879] mt-2">Here's what's happening in your pharmacy today.</p>
                    </div>
                    <Link
                        to="/sales"
                        className="bg-[#009FC6] hover:bg-[#006179] active:scale-[0.97] text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        New sale
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-[#006179] font-bold">Loading Dashboard...</div>
                ) : (
                    <>
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div
                                    key={stat.title}
                                    style={{ animationDelay: `${index * 70}ms`, borderBottomColor: stat.color }}
                                    className="rise-in bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-b-[3px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-[#246879] mb-1">{stat.title}</p>
                                            <h3 className="text-3xl font-extrabold text-[#006179] tabular-nums">{stat.value}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{stat.detail}</p>
                                        </div>
                                        <div
                                            style={{ backgroundColor: `${stat.color}1A`, color: stat.color }}
                                            className="p-3 rounded-full shrink-0"
                                        >
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Actions Panel */}
                            <div className="rise-in lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6" style={{ animationDelay: '160ms' }}>
                                <h2 className="text-lg font-bold text-[#006179] mb-4 pb-3 border-b border-gray-100">Quick actions</h2>
                                <div className="space-y-2">
                                    {[
                                        { to: '/addmedicine', label: 'Add new medicine' },
                                        { to: '/medicines', label: 'Search inventory' },
                                        { to: '/suppliers', label: 'Manage suppliers' },
                                        { to: '/purchases', label: 'Record purchase' },
                                    ].map((action) => (
                                        <Link
                                            key={action.to}
                                            to={action.to}
                                            className="group w-full flex items-center justify-between p-3.5 rounded-xl transition-colors duration-150 hover:bg-[#4DDCFF]/10"
                                        >
                                            <span className="font-semibold text-[#246879] group-hover:text-[#009FC6] transition-colors">{action.label}</span>
                                            <svg className="w-5 h-5 text-[#00C8F9] transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Attention Box */}
                            <div className="rise-in lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6" style={{ animationDelay: '220ms' }}>
                                <h2 className="text-lg font-bold text-[#006179] mb-4 pb-3 border-b border-gray-100">Inventory Status Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                                        <p className="text-sm font-bold text-orange-800">Low Stock Medicines</p>
                                        <p className="text-2xl font-black text-orange-600 mt-2">{statsData.lowStockAlerts}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                                        <p className="text-sm font-bold text-red-800">Expired Batches</p>
                                        <p className="text-2xl font-black text-red-600 mt-2">{statsData.expiredBatches}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-sm font-bold text-emerald-800">Eligible Inventory Units</p>
                                        <p className="text-2xl font-black text-emerald-600 mt-2">{statsData.eligibleInventory}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
