import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

// Emoji map for visual flair per auction
const AUCTION_ICONS = {
    'item-1': '🏺',
    'item-2': '⌚',
    'item-3': '📖',
    'item-4': '🎨',
    'item-5': '🎸',
};

const GRADIENT_MAP = [
    'from-cyan-900/40 to-blue-900/30',
    'from-purple-900/40 to-indigo-900/30',
    'from-amber-900/40 to-orange-900/30',
    'from-emerald-900/40 to-teal-900/30',
    'from-pink-900/40 to-rose-900/30',
];

export default function AuctionList() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/auctions', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAuctions(data);
                } else if (res.status === 401 || res.status === 403) {
                    navigate('/login');
                } else {
                    setError('Failed to load auctions.');
                }
            } catch (e) {
                setError('Network error: ' + e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12 px-6">
            <Navbar />
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">
                        Live Auctions
                    </h1>
                    <p className="mt-1 text-gray-400 text-sm">
                        All bids are cryptographically signed with your private key.
                    </p>
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/30 border border-red-600/50 rounded-xl p-4 text-red-300">
                        {error}
                    </div>
                )}

                {!loading && !error && auctions.length === 0 && (
                    <p className="text-gray-500 text-center mt-20">No auctions found.</p>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auctions.map((auction, idx) => {
                            const icon = AUCTION_ICONS[auction.id] || '🔨';
                            const gradient = GRADIENT_MAP[idx % GRADIENT_MAP.length];
                            const username = localStorage.getItem('username');
                            const isWinning = auction.highestBidderId === username;

                            return (
                                <div
                                    key={auction.id}
                                    className={`relative rounded-2xl border border-gray-700/60 bg-gradient-to-br ${gradient}
                                                p-6 flex flex-col gap-4 shadow-xl
                                                hover:border-cyan-500/50 hover:shadow-cyan-900/20
                                                transition-all duration-300 hover:-translate-y-0.5 group`}
                                >
                                    {/* Icon + Item name */}
                                    <div className="flex items-start gap-3">
                                        <span className="text-4xl select-none">{icon}</span>
                                        <div>
                                            <h2 className="text-lg font-bold text-white leading-tight">
                                                {auction.item}
                                            </h2>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                {auction.id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">
                                            Current Bid
                                        </p>
                                        <p className="text-3xl font-black text-green-400">
                                            ${auction.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {/* Highest bidder badge */}
                                    <div className="flex items-center gap-2">
                                        {auction.highestBidderId ? (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isWinning
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                                    : 'bg-gray-700/60 text-gray-400 border border-gray-600/40'
                                                }`}>
                                                {isWinning ? '🏆 You\'re winning!' : `Highest: ${auction.highestBidderId}`}
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-700/40">
                                                No bids yet — be first!
                                            </span>
                                        )}
                                    </div>

                                    {/* Bid button */}
                                    <button
                                        onClick={() => navigate(`/auction/${auction.id}`)}
                                        className="mt-auto w-full py-2.5 rounded-lg font-bold text-sm
                                                   bg-cyan-600 hover:bg-cyan-500 active:scale-95
                                                   transition-all duration-150 shadow-md shadow-cyan-900/30"
                                    >
                                        Bid Now →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
