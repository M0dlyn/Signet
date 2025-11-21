import { useState } from 'react';
import { generateKeyPair, exportPublicKey } from '../utils/crypto';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Generate Key Pair
            const keyPair = await generateKeyPair();

            // 2. Export Public Key
            const publicKeyPem = await exportPublicKey(keyPair.publicKey);

            // 3. Send to Server
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, publicKey: publicKeyPem }),
            });

            if (response.ok) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                const text = await response.text();
                alert('Registration failed: ' + text);
            }
        } catch (error) {
            console.error(error);
            alert('Error during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-cyan-400">Signet Register</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 rounded font-bold transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Generating Keys...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-400">
                    Already have an account? <a href="/login" className="text-cyan-400 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
}
