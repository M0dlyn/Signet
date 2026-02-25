import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPrivateKey } from '../utils/authState';
import { signData, arrayBufferToBase64, importPrivateKey } from '../utils/crypto';
import Navbar from './Navbar';

export default function Auction() {
    const { id: auctionId } = useParams();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [logs, setLogs] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [highestBidder, setHighestBidder] = useState('');
    const [itemName, setItemName] = useState('');
    const [loading, setLoading] = useState(true);

    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { time, msg }]);
    };

    useEffect(() => {
        if (!auctionId) return;
        const fetchState = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:8080/api/auctions/${auctionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentPrice(data.currentPrice);
                    setHighestBidder(data.highestBidderId);
                    setItemName(data.item);
                    addLog(`Loaded "${data.item}" at $${data.currentPrice}`);
                } else if (res.status === 401 || res.status === 403) {
                    navigate('/login');
                } else {
                    addLog('Error: Auction not found.');
                }
            } catch (e) {
                addLog(`Network error: ${e.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchState();
    }, [auctionId, navigate]);

    const handleBid = async (e) => {
        e.preventDefault();
        const privateKey = getPrivateKey();

        if (!privateKey) {
            addLog('⚠ No Private Key found. Please register or login again.');
            return;
        }

        try {
            const timestamp = Date.now();
            const bidAmount = parseFloat(amount);

            const importedKey = await importPrivateKey(privateKey);
            const payload = `${auctionId}:${bidAmount}:${timestamp}`;
            addLog(`Signing payload: ${payload}`);

            const signatureBuffer = await signData(importedKey, payload);
            const signatureBase64 = arrayBufferToBase64(signatureBuffer);
            addLog('Signature generated.');

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ auctionId, amount: bidAmount, timestamp, signature: signatureBase64 }),
            });

            if (response.ok) {
                const text = await response.text();
                addLog(`✓ ${text}`);
                const match = text.match(/Current price: ([\d.]+)/);
                if (match) {
                    setCurrentPrice(parseFloat(match[1]));
                    setHighestBidder('You');
                }
            } else {
                const text = await response.text();
                addLog(`✗ ${text || response.statusText}`);
            }
        } catch (error) {
            addLog(`Exception: ${error.message}`);
        }
    };

    const username = localStorage.getItem('username');
    const isWinning = highestBidder && (highestBidder === username || highestBidder === 'You');

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12 px-6">
            <Navbar />
            <div className="max-w-2xl mx-auto space-y-6 mt-4">

                {/* Back link */}
                <button
                    onClick={() => navigate('/auctions')}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                >
                    ← Back to Auctions
                </button>

                {/* Auction card */}
                <div className="bg-gray-800/70 border border-gray-700/60 p-7 rounded-2xl shadow-2xl">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-3xl font-extrabold text-cyan-300">{itemName || auctionId}</h2>
                                <p className="text-xs font-mono text-gray-500 mt-0.5">ID: {auctionId}</p>
                            </div>

                            <div className="mb-6 flex items-end gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Current Price</p>
                                    <p className="text-4xl font-black text-green-400">
                                        ${currentPrice != null ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'}
                                    </p>
                                </div>
                                {highestBidder && (
                                    <span className={`mb-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${isWinning
                                            ? 'bg-green-500/20 text-green-400 border-green-500/40'
                                            : 'bg-gray-700 text-gray-400 border-gray-600'
                                        }`}>
                                        {isWinning ? '🏆 You\'re winning!' : `Highest: ${highestBidder}`}
                                    </span>
                                )}
                            </div>

                            <form onSubmit={handleBid} className="flex gap-3">
                                <input
                                    type="number"
                                    min={currentPrice ? currentPrice + 0.01 : 0}
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={`Enter bid above $${currentPrice || '...'}`}
                                    className="flex-1 px-4 py-2.5 bg-gray-700 rounded-lg border border-gray-600
                                               focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30
                                               text-white placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold
                                               transition-all active:scale-95 shadow-md shadow-cyan-900/30 whitespace-nowrap"
                                >
                                    Place Signed Bid
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Activity log */}
                <div className="bg-gray-800/70 border border-gray-700/60 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Activity Log</h3>
                    <div className="space-y-1.5 font-mono text-xs h-48 overflow-y-auto bg-gray-950/70 p-4 rounded-lg">
                        {logs.length === 0 && (
                            <span className="text-gray-600">No activity yet...</span>
                        )}
                        {logs.map((entry, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-cyan-600 shrink-0">[{entry.time}]</span>
                                <span className="text-gray-300">{entry.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
