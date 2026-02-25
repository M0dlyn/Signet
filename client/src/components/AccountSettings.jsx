import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { generateKeyPair, exportPublicKey, exportPrivateKey } from '../utils/crypto';
import { setPrivateKey, getPrivateKey } from '../utils/authState';

export default function AccountSettings() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Unknown';
    const [keyFingerprint, setKeyFingerprint] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success' | 'error'

    useEffect(() => {
        const pk = getPrivateKey();
        if (pk) {
            // Show a truncated version as a "fingerprint"
            const lines = pk.split('\n').filter(l => !l.startsWith('---') && l.trim());
            const raw = lines.join('');
            setKeyFingerprint(raw.slice(0, 24) + '...' + raw.slice(-24));
        } else {
            setKeyFingerprint('No key in session (log out and re-register)');
        }
    }, []);

    const handleRegenerateKeys = async () => {
        setRegenerating(true);
        setStatusMsg('');
        try {
            const keyPair = await generateKeyPair();
            const privateKeyPem = await exportPrivateKey(keyPair.privateKey);
            const publicKeyPem = await exportPublicKey(keyPair.publicKey);

            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8080/auth/update-key', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ publicKey: publicKeyPem }),
            });

            if (res.ok) {
                setPrivateKey(privateKeyPem);
                const lines = privateKeyPem.split('\n').filter(l => !l.startsWith('---') && l.trim());
                const raw = lines.join('');
                setKeyFingerprint(raw.slice(0, 24) + '...' + raw.slice(-24));
                setStatusMsg('Keys regenerated and updated successfully.');
                setStatusType('success');
            } else {
                const text = await res.text();
                setStatusMsg('Server rejected key update: ' + text);
                setStatusType('error');
            }
        } catch (e) {
            setStatusMsg('Error: ' + e.message);
            setStatusType('error');
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12 px-6">
            <Navbar />
            <div className="max-w-2xl mx-auto mt-6">
                <h1 className="text-3xl font-extrabold mb-8 tracking-tight">Account Settings</h1>

                {/* Profile card */}
                <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-6 mb-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-cyan-700 flex items-center justify-center text-2xl font-black text-white select-none">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xl font-bold">{username}</p>
                            <p className="text-xs text-gray-400">Registered user</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                            <span className="text-gray-400">Username</span>
                            <span className="font-mono text-cyan-300">{username}</span>
                        </div>
                        <div className="flex justify-between items-start py-2 border-b border-gray-700/50 gap-4">
                            <span className="text-gray-400 shrink-0">Key Fingerprint</span>
                            <span className="font-mono text-xs text-gray-300 text-right break-all">{keyFingerprint}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                            <span className="text-gray-400">Algorithm</span>
                            <span className="font-mono text-gray-300">RSA-PSS / SHA-256</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400">Session Storage</span>
                            <span className="font-mono text-gray-300">localStorage (encrypted PEM)</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <div className="bg-gray-800/60 border border-amber-700/40 rounded-2xl p-5 shadow-lg">
                        <h3 className="font-bold text-amber-300 mb-1">🔄 Regenerate Signing Keys</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Generates a fresh RSA-PSS key pair and updates your public key on the server.
                            Previous bids remain valid. You will need to use the new key for future bids.
                        </p>
                        <button
                            onClick={handleRegenerateKeys}
                            disabled={regenerating}
                            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-semibold text-sm
                                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {regenerating ? 'Regenerating...' : 'Regenerate Keys'}
                        </button>

                        {statusMsg && (
                            <p className={`mt-3 text-sm font-medium ${statusType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {statusMsg}
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5">
                        <h3 className="font-bold text-gray-300 mb-1">📋 My Bids</h3>
                        <p className="text-sm text-gray-500">
                            View auctions you are currently winning in the{' '}
                            <button
                                onClick={() => navigate('/auctions')}
                                className="text-cyan-400 hover:underline"
                            >
                                Auctions page
                            </button>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
