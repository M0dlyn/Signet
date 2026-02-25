import { useNavigate, NavLink } from 'react-router-dom';
import { setPrivateKey } from '../utils/authState';

export default function Navbar() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Account';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setPrivateKey(null);
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `px-3 py-1 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'text-cyan-300 bg-cyan-900/40'
            : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700/60'
        }`;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6
                        bg-gray-900/80 backdrop-blur-md border-b border-gray-700/60 shadow-lg">
            {/* Brand */}
            <NavLink to="/auctions" className="flex items-center gap-2 group">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    🔏 Signet
                </span>
            </NavLink>

            {/* Nav links */}
            <div className="flex items-center gap-2">
                <NavLink to="/auctions" className={linkClass}>Auctions</NavLink>
                <NavLink to="/account" className={linkClass}>
                    👤 {username}
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="ml-3 px-4 py-1.5 text-sm font-semibold rounded-md
                               bg-red-600/20 text-red-400 border border-red-600/40
                               hover:bg-red-600/40 hover:text-red-300 transition-all"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
