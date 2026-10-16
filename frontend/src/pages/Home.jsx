import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { getUser, homePathFor, isLoggedIn } from '../utils/auth';

const HomePage = () => {
    const loggedIn = isLoggedIn();

    return (
        <>
        <Navbar/>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            
            {/* Hero Section */}
            <main className="grow flex items-center justify-center px-6 py-20 md:py-32">
                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#006179] tracking-tight">
                        Smarter Pharmacy <br className="hidden md:block" />
                        <span className="text-[#009FC6]">Inventory Management</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-[#246879] max-w-3xl mx-auto font-medium leading-relaxed">
                        A centralized platform to manage medicine stock, track expiration dates in real-time, and streamline your billing process.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                        <Link
                            to={loggedIn ? homePathFor(getUser()) : "/login"}
                            className="bg-[#006179] hover:bg-[#009FC6] text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:-translate-y-1"
                        >
                            {loggedIn ? "Open PharmaSys" : "Staff Login"}
                        </Link>
                        <Link 
                            to="/about" 
                            className="bg-white text-[#006179] border-2 border-[#4DDCFF] hover:border-[#00C8F9] hover:bg-[#4DDCFF]/10 text-lg font-bold py-4 px-10 rounded-full shadow-sm transition-all"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="bg-white py-20 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#006179]">System Features</h2>
                        <p className="text-[#246879] mt-4 font-medium text-lg">Designed for safety, efficiency, and accuracy.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="bg-gray-50 rounded-2xl p-8 border-t-4 border-[#00C8F9] hover:shadow-xl transition-shadow">
                            <div className="w-14 h-14 bg-[#4DDCFF]/20 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-[#009FC6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#006179] mb-3">Real-Time Inventory</h3>
                            <p className="text-[#246879] leading-relaxed">
                                Seamlessly add, update, and monitor medicine stock levels. Never run out of essential generic or branded drugs.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gray-50 rounded-2xl p-8 border-t-4 border-[#00C8F9] hover:shadow-xl transition-shadow">
                            <div className="w-14 h-14 bg-[#4DDCFF]/20 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-[#009FC6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#006179] mb-3">Expiry Alerts</h3>
                            <p className="text-[#246879] leading-relaxed">
                                Automated tracking prevents the dispensing of expired medicines. Get instant alerts for items nearing their expiration date.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gray-50 rounded-2xl p-8 border-t-4 border-[#00C8F9] hover:shadow-xl transition-shadow">
                            <div className="w-14 h-14 bg-[#4DDCFF]/20 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-[#009FC6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#006179] mb-3">Quick Billing</h3>
                            <p className="text-[#246879] leading-relaxed">
                                Generate fast and accurate invoices. Easily process transactions to reduce customer waiting time and improve accessibility.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer/>
        </div>
        </>
    );
};

export default HomePage;