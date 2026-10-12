import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Helper function to check if the link is active
    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Medicines', path: '/medicines' },
        { name: 'Sales', path: '/sales' },
        { name: 'Purchases', path: '/purchases' },
        { name: 'Suppliers', path: '/suppliers' },
        { name: 'Audit Trail', path: '/audit-trail' },
        { name: 'Smart Reorder', path: '/recommendations' },
        { name: 'Expiry Risks', path: '/expiry-risks' },
    ];

    return (
        <nav className="bg-[#006179] text-white shadow-md font-sans sticky top-0 z-50">
            {/* Wider container so 9 links + brand + user section fit without crowding */}
            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* ── Brand / Logo ── */}
                    <div className="shrink-0 flex items-center gap-2 mr-6">
                        {/* Pharmacy cross icon */}
                        <svg className="w-8 h-8 text-[#00C8F9]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                        </svg>
                        <Link to="/" className="text-2xl font-extrabold tracking-wide whitespace-nowrap">
                            Pharma<span className="text-[#4DDCFF]">Sys</span>
                        </Link>
                    </div>

                    {/* ── Desktop Nav (xl and above) ── */}
                    {/* Switch to hamburger below xl (1280 px) so 9 links never crowd */}
                    <div className="hidden xl:flex flex-1 items-center justify-between min-w-0">
                        {/* Nav links row */}
                        <div className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`whitespace-nowrap px-2 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                                        isActive(link.path)
                                            ? 'text-[#4DDCFF] border-b-2 border-[#4DDCFF]'
                                            : 'text-gray-100 hover:text-[#00C8F9]'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* User / Logout section */}
                        <div className="flex items-center gap-3 border-l border-[#009FC6] pl-4 ml-4 shrink-0">
                            {user.name && (
                                <span
                                    className="text-sm font-semibold text-gray-200 whitespace-nowrap max-w-[140px] truncate"
                                    title={`Hi, ${user.name}`}
                                >
                                    Hi, {user.name}
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="shrink-0 bg-[#009FC6] hover:bg-[#00C8F9] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* ── Hamburger toggle (below xl) ── */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isOpen}
                        className="xl:hidden text-[#4DDCFF] hover:text-white focus:outline-none ml-auto"
                    >
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Mobile / Tablet Dropdown ── */}
            {isOpen && (
                <div className="xl:hidden bg-[#005265] border-t border-[#009FC6]">
                    <div className="px-4 pt-3 pb-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                                    isActive(link.path)
                                        ? 'bg-[#006179] text-[#4DDCFF]'
                                        : 'text-gray-100 hover:bg-[#009FC6] hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Divider */}
                        <div className="border-t border-[#009FC6]/50 mt-3 pt-3 flex items-center justify-between gap-3">
                            {user.name && (
                                <span className="text-sm font-semibold text-gray-300 truncate">
                                    Hi, {user.name}
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-[#009FC6] hover:bg-[#00C8F9] text-white transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;