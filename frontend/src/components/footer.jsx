import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
    { to: '/inventory', label: 'Inventory' },
    { to: '/sales', label: 'Billing' },
    { to: '/medicines', label: 'Medicines' },
    { to: '/expiry-risks', label: 'Expiry Risks' },
];

const projectLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About the project' },
    { to: '/login', label: 'Login' },
    { to: '/signup', label: 'Create account' },
];

const Footer = () => {
    const [showTop, setShowTop] = useState(false);

    // Show the "back to top" button after scrolling down a little
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 320);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="bg-[#006179] text-white relative">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-[#00C8F9] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#006179]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                                </svg>
                            </div>
                            <span className="text-lg font-extrabold">PharmaSys</span>
                        </div>
                        <p className="text-sm text-[#a8d3de] leading-relaxed">
                            Inventory, billing, supplier and expiry tracking for pharmacies.
                            Built with React, Node.js, Express and MongoDB.
                        </p>
                    </div>

                    {/* Product links */}
                    <div>
                        <h3 className="text-sm font-bold text-[#4DDCFF] mb-4">Modules</h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-sm text-[#d6ecf1] hover:text-white hover:underline">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Project links */}
                    <div>
                        <h3 className="text-sm font-bold text-[#4DDCFF] mb-4">Project</h3>
                        <ul className="space-y-3">
                            {projectLinks.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-sm text-[#d6ecf1] hover:text-white hover:underline">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 text-center">
                    <p className="text-xs text-[#a8d3de]">&copy; {new Date().getFullYear()} PharmaSys — Pharmacy Management System (student project)</p>
                </div>
            </div>

            {/* Back to top */}
            {showTop && (
                <button
                    onClick={scrollToTop}
                    aria-label="Back to top"
                    className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#00C8F9] hover:bg-[#4DDCFF] text-[#006179] shadow-lg flex items-center justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            )}
        </footer>
    );
};

export default Footer;
