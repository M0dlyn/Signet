import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const EMOJI_OPTIONS = ['🏺', '⌚', '📖', '🎨', '🎸', '💎', '🗿', '🏆', '🎭', '🖼️', '🎻', '🪙'];

export default function CreateAuction() {
    const navigate = useNavigate();
    const [item, setItem] = useState('');
    const [startingPrice, setStartingPrice] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🏺');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Combine emoji into item name for display, but keep form fields separate
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8080/api/auctions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    item: item.trim(),
                    startingPrice: parseFloat(startingPrice),
                }),
            });

            if (res.ok) {
                const created = await res.json();
                // Navigate straight to the new auction's bid page
                navigate(`/auction/${created.id}`);
            } else {
                const text = await res.text();
                setError(text || 'Failed to create auction.');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12 px-6">
            <Navbar />
            <div className="max-w-xl mx-auto mt-6">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/auctions')}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors mb-4"
                    >
                        ← Back to Auctions
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-tight">Create Auction</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        List a new item for bidding. Anyone can place digitally-signed bids.
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-gray-800/70 border border-gray-700/60 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Emoji picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Item Icon
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {EMOJI_OPTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setSelectedEmoji(emoji)}
                                        className={`text-2xl w-11 h-11 rounded-lg flex items-center justify-center transition-all
                                                    ${selectedEmoji === emoji
                                                ? 'bg-cyan-600/40 border-2 border-cyan-400 scale-110'
                                                : 'bg-gray-700/60 border border-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Item name */}
                        <div>
                            <label htmlFor="item-name" className="block text-sm font-medium text-gray-300 mb-2">
                                Item Name <span className="text-red-400">*</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl select-none">{selectedEmoji}</span>
                                <input
                                    id="item-name"
                                    type="text"
                                    value={item}
                                    onChange={e => setItem(e.target.value)}
                                    placeholder="e.g. Vintage Rolex Submariner"
                                    className="flex-1 px-4 py-3 bg-gray-700 rounded-lg border border-gray-600
                                               focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30
                                               text-white placeholder-gray-500"
                                    required
                                    maxLength={80}
                                />
                            </div>
                        </div>

                        {/* Starting price */}
                        <div>
                            <label htmlFor="starting-price" className="block text-sm font-medium text-gray-300 mb-2">
                                Starting Price <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-bold text-lg">$</span>
                                <input
                                    id="starting-price"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={startingPrice}
                                    onChange={e => setStartingPrice(e.target.value)}
                                    placeholder="100.00"
                                    className="w-full pl-9 pr-4 py-3 bg-gray-700 rounded-lg border border-gray-600
                                               focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30
                                               text-white placeholder-gray-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        {item && startingPrice && (
                            <div className="rounded-xl bg-gray-900/60 border border-gray-700/50 p-4 flex items-center gap-4">
                                <span className="text-4xl">{selectedEmoji}</span>
                                <div>
                                    <p className="font-bold text-white">{item}</p>
                                    <p className="text-green-400 font-black text-xl">
                                        ${parseFloat(startingPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">No bids yet — be first!</p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-2">
                                ⚠ {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-lg
                                       disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]
                                       shadow-lg shadow-cyan-900/30"
                        >
                            {loading ? 'Creating...' : '🔨 Create Auction'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
