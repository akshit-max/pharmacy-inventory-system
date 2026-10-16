import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, isLoggedIn, logout } from '../utils/auth';

// Each link lists the roles that are allowed to see it
const navLinks = [
    { name: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Pharmacist'] },
    { name: 'Inventory', path: '/inventory', roles: ['Admin', 'Pharmacist', 'Cashier'] },
    { name: 'Medicines', path: '/medicines', roles: ['Admin', 'Pharmacist', 'Cashier'] },
    { name: 'Sales', path: '/sales', roles: ['Admin', 'Pharmacist', 'Cashier'] },
    { name: 'Purchases', path: '/purchases', roles: ['Admin', 'Pharmacist'] },
    { name: 'Suppliers', path: '/suppliers', roles: ['Admin', 'Pharmacist'] },
    { name: 'Audit Trail', path: '/audit-trail', roles: ['Admin', 'Pharmacist'] },
    { name: 'Smart Reorder', path: '/recommendations', roles: ['Admin', 'Pharmacist'] },
    { name: 'Expiry Risks', path: '/expiry-risks', roles: ['Admin', 'Pharmacist'] },
    { name: 'Users', path: '/users', roles: ['Admin'] },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const loggedIn = isLoggedIn();
    const user = getUser();
    const visibleLinks = loggedIn ? navLinks.filter((link) => link.roles.includes(user?.role)) : [];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-[#006179] text-white shadow-md font-sans sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-16 items-center justify-between py-3">

                    {/* Logo */}
                    <div className="shrink-0 flex items-center gap-2 mr-6">
                        <svg className="w-8 h-8 text-[#00C8F9]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                        </svg>
                        <Link to="/" className="text-2xl font-extrabold tracking-wide">
                            Pharma<span className="text-[#4DDCFF]">Sys</span>
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden items-center gap-4 xl:flex">
                        {visibleLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                                    isActive(link.path)
                                    ? 'text-[#4DDCFF] border-b-2 border-[#4DDCFF] pb-1'
                                    : 'text-gray-100 hover:text-[#00C8F9]'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="flex items-center gap-3 border-l border-[#009FC6] pl-4 ml-1">
                            {loggedIn ? (
                                <>
                                    <span className="hidden 2xl:inline whitespace-nowrap text-sm font-semibold text-gray-200">
                                        Hi, {user?.name} <span className="text-xs text-[#4DDCFF]">({user?.role})</span>
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#009FC6] hover:bg-[#00C8F9] text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-semibold hover:text-[#00C8F9]">Login</Link>
                                    <Link to="/signup" className="bg-[#009FC6] hover:bg-[#00C8F9] text-white px-5 py-2 rounded-full text-sm font-semibold">
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="xl:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
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

            {/* Mobile menu */}
            {isOpen && (
                <div className="xl:hidden bg-[#246879] border-t border-[#009FC6]">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {loggedIn && (
                            <p className="px-3 py-2 text-sm text-gray-200">
                                Signed in as <b>{user?.name}</b> ({user?.role})
                            </p>
                        )}
                        {visibleLinks.map((link) => (
                            <Link
                                key={link.path}
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
                        {loggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-red-300 hover:bg-red-500 hover:text-white mt-4 border border-red-400/30"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-[#009FC6]">Login</Link>
                                <Link to="/signup" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-[#009FC6]">Sign up</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
