import { Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function About() {
    const modules = [
        {
            title: "FEFO Inventory Engine",
            desc: "First-Expire, First-Out automatic batch routing on point-of-sale billing. Protects pharmacy margins and patient safety by dispensing nearest-expiry stock first.",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        },
        {
            title: "Demand-Based Smart Reorders",
            desc: "Automated replenishment calculation based on 30-day Average Daily Demand (ADD), safety stock reserves, and supplier lead times without relying on black-box ML.",
            icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        },
        {
            title: "Proactive Expiry Monitoring",
            desc: "Categorizes inventory batches into Expired, Critical (<7 days), High Risk (7-30 days), Upcoming, and Safe tiers, tracking estimated financial value at risk.",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        },
        {
            title: "Safe Stock Updates & Audit Trail",
            desc: "Every purchase and sale is fully validated before stock changes, so a failed bill never leaves stock half-updated. Every unit movement is recorded in the audit trail with the user who made it.",
            icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        }
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
                <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
                    
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#009FC6]/10 text-[#006179]">
                            College SDP Project
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#006179] tracking-tight">
                            About Pharma<span className="text-[#009FC6]">Sys</span>
                        </h1>
                        <p className="text-lg text-[#246879] leading-relaxed">
                            A full-stack MERN Pharmacy Management System engineered to eliminate expired medication waste, prevent stockouts, and streamline pharmacy operations.
                        </p>
                    </div>

                    {/* Architecture & Highlights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modules.map((m) => (
                            <div key={m.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-t-4 border-t-[#00C8F9] hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-[#4DDCFF]/20 flex items-center justify-center text-[#009FC6] mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-[#006179] mb-2">{m.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{m.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Technology Stack Callout */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-extrabold text-[#006179] mb-4">Technology Stack</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="font-bold text-[#006179]">Frontend</p>
                                <p className="text-xs text-slate-500 mt-1">React 19, Vite, Tailwind CSS</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="font-bold text-[#006179]">Backend</p>
                                <p className="text-xs text-slate-500 mt-1">Node.js, Express.js 5</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="font-bold text-[#006179]">Database</p>
                                <p className="text-xs text-slate-500 mt-1">MongoDB + Mongoose</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="font-bold text-[#006179]">Security</p>
                                <p className="text-xs text-slate-500 mt-1">JWT Auth, Bcrypt, RBAC</p>
                            </div>
                        </div>
                    </div>

                    {/* Call to action */}
                    <div className="text-center pt-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 bg-[#009FC6] hover:bg-[#006179] text-white px-8 py-3.5 rounded-full font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                        >
                            Staff Login →
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}

export default About;
