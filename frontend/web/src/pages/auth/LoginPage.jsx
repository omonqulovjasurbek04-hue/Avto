import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      if (onNavigate) onNavigate('practice');
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
      <div className="meta-card" style={{ maxWidth: 440, width: '100%', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="brand-icon" style={{ width: 52, height: 52, margin: '0 auto 16px auto', fontSize: 26 }}>
            🚗
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Tizimga Kirish</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>
            AVTO Platformasida shaxsiy natijalaringizni kuzatib boring
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Email yoki Telefon</label>
            <input
              type="text"
              className="form-input"
              placeholder="+998901234567 yoki user@domain.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Parol</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Kirilmoqda...' : '🔑 Kirish'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#94a3b8' }}>
          Hali hisobingiz yo'qmi?{' '}
          <button
            onClick={() => onNavigate && onNavigate('register')}
            style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer' }}
          >
            Ro'yxatdan o'ting
          </button>
        </div>
      </div>
    </div>
  );
}
