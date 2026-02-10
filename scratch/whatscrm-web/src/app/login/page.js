'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erro ao fazer login');

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            router.push('/inbox');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1e293b, #0f172a);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 8px;
          display: block;
        }
        .subtitle {
          color: var(--text-muted);
          margin-bottom: 32px;
          display: block;
        }
        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-muted);
          font-size: 14px;
        }
        input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: white;
          font-size: 16px;
        }
        input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .btn {
          width: 100%;
          padding: 14px;
          background: var(--primary);
          color: white;
          font-weight: 600;
          border-radius: 12px;
          margin-top: 24px;
        }
        .btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(31, 147, 255, 0.3);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          color: var(--error);
          font-size: 14px;
          margin-top: 16px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
        }
      `}</style>

            <div className="login-card glass animate-fade-in">
                <span className="logo">WhatsCRM</span>
                <span className="subtitle">Entre na sua conta para atender</span>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@demo.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
