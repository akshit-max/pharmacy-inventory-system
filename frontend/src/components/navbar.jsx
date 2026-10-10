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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-16 items-center justify-between py-3">
                    
                    {/* Logo Section */}
                    <div className="shrink-0 flex items-center gap-2">
                        {/* A simple SVG pill/cross icon for the pharmacy theme */}
                        <svg className="w-8 h-8 text-[#00C8F9]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                        </svg>
                        <Link to="/" className="text-2xl font-extrabold tracking-wide">
                            Pharma<span className="text-[#4DDCFF]">Sys</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden items-center gap-7 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors duration-200 ${
                                    isActive(link.path) 
                                    ? 'text-[#4DDCFF] border-b-2 border-[#4DDCFF] pb-1' 
                                    : 'text-gray-100 hover:text-[#00C8F9]'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        
                        {/* Profile / Logout Button */}
                        <div className="flex items-center gap-4 border-l border-[#009FC6] pl-4 ml-2">
                            <span className="text-sm font-semibold text-gray-200">
                                {user.name ? `Hi, ${user.name}` : ''}
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="bg-[#009FC6] hover:bg-[#00C8F9] text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[#4DDCFF] hover:text-white focus:outline-none"
                        >
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-[#246879] border-t border-[#009FC6]">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium ${
                                    isActive(link.path)
                                    ? 'bg-[#006179] text-[#4DDCFF]'
                                    : 'text-gray-100 hover:bg-[#009FC6] hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-red-300 hover:bg-red-500 hover:text-white mt-4 border border-red-400/30"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;