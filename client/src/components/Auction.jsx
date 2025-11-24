import { useState, useEffect } from 'react';
import { getPrivateKey } from '../utils/authState';
import { signData, arrayBufferToBase64, importPrivateKey } from '../utils/crypto';

export default function Auction() {
    const [amount, setAmount] = useState('');
    const [logs, setLogs] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [highestBidder, setHighestBidder] = useState('');
    const auctionId = "item-1"; // Hardcoded for MVP

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    // Fetch initial state
    useEffect(() => {
        const fetchState = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:8080/api/auctions/${auctionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentPrice(data.currentPrice);
                    setHighestBidder(data.highestBidderId);
                    addLog(`Loaded Auction: ${data.item} at $${data.currentPrice}`);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchState();
    }, []);

    const handleBid = async (e) => {
        e.preventDefault();
        const privateKey = getPrivateKey();

        if (!privateKey) {
            alert("No Private Key found! Please register or login again.");
            return;
        }

        try {
            const timestamp = Date.now();
            const bidAmount = parseFloat(amount);

            // Import the private key from PEM
            const importedKey = await importPrivateKey(privateKey);

            // 1. Construct Payload: auctionId:amount:timestamp
            const payload = `${auctionId}:${bidAmount}:${timestamp}`;
            addLog(`Signing Payload: ${payload}`);

            // 2. Sign Payload
            const signatureBuffer = await signData(importedKey, payload);
            const signatureBase64 = arrayBufferToBase64(signatureBuffer);
            addLog(`Signature generated.`);

            // 3. Send to Sentinel
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    auctionId,
                    amount: bidAmount,
                    timestamp,
                    signature: signatureBase64
                }),
            });

            if (response.ok) {
                const text = await response.text();
                addLog(`Success: ${text}`);
                // Parse price from message or re-fetch. 
                // Message format: "Bid accepted. Current price: 150.0"
                const match = text.match(/Current price: (\d+\.\d+)/);
                if (match) {
                    setCurrentPrice(parseFloat(match[1]));
                    setHighestBidder("You"); // Optimistic update
                }
            } else {
                const text = await response.text();
                addLog(`Error: ${text || response.statusText}`);
            }

        } catch (error) {
            console.error(error);
            addLog(`Exception: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-cyan-400 mb-4">Live Auction: Antique Vase</h2>
                    <div className="mb-6 text-gray-300">
                        <p>Item ID: <span className="font-mono text-cyan-200">{auctionId}</span></p>
                        <p className="text-2xl mt-2">Current Price: <span className="text-green-400 font-bold">${currentPrice || '...'}</span></p>
                        {highestBidder && <p className="text-sm text-gray-400">Highest Bidder: {highestBidder}</p>}
                    </div>

                    <form onSubmit={handleBid} className="flex gap-4">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter Bid Amount"
                            className="flex-1 px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
                            required
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded font-bold transition-colors"
                        >
                            Place Signed Bid
                        </button>
                    </form>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-300 mb-4">Activity Log</h3>
                    <div className="space-y-2 font-mono text-sm h-64 overflow-y-auto bg-gray-900 p-4 rounded">
                        {logs.length === 0 && <span className="text-gray-600">No activity yet...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className="border-b border-gray-800 pb-1 mb-1 last:border-0">
                                <span className="text-cyan-500">[{new Date().toLocaleTimeString()}]</span> {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
