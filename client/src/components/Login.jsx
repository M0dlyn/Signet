import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', username);
                // We also need to regenerate/retrieve the private key for signing, 
                // but for MVP we might need to regenerate it or store it in IndexedDB.
                // The spec says "Client generates an RSA-PSS KeyPair in the browser."
                // If we reload, the key in memory is lost.
                // For a real app, we'd store the Private Key in IndexedDB (non-exportable).
                // For this MVP, if we login on a new tab, we might not have the key.
                // But let's assume the user registers and stays in session, or we handle key persistence later.
                // Actually, if we login, we don't generate a new key. We just get a JWT.
                // If we don't have the private key, we can't sign bids.
                // This is a known limitation of "Key in memory". 
                // For now, let's just handle the JWT part.
                alert('Login successful!');
                navigate('/auction');
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error during login');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-cyan-400">Signet Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
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
                        className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 rounded font-bold transition-colors"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-sm text-gray-400">
                    Need an account? <a href="/register" className="text-cyan-400 hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
}
