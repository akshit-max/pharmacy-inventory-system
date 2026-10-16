import { Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getUser, homePathFor, isLoggedIn } from "../utils/auth";

function NotFound({ message = "The page you are looking for does not exist." }) {
    const backPath = isLoggedIn() ? homePathFor(getUser()) : "/";

    return (
        <>
            <Navbar />
            <main className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-6 py-20 font-sans">
                <div className="text-center max-w-md">
                    <p className="text-6xl font-black text-[#009FC6]">Oops</p>
                    <h1 className="mt-4 text-2xl font-extrabold text-[#006179]">Page not available</h1>
                    <p className="mt-2 text-slate-500">{message}</p>
                    <Link
                        to={backPath}
                        className="mt-8 inline-block rounded-full bg-[#009FC6] px-8 py-3 font-bold text-white hover:bg-[#006179]"
                    >
                        Go back
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default NotFound;
