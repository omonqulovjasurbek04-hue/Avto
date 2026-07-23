import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError('Parollar bir-biriga mos kelmadi');
    }

    if (password.length < 6) {
      return setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
    }

    setLoading(true);

    try {
      await register(name, identifier, password);
      if (onNavigate) onNavigate('practice');
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="meta-card" style={{ maxWidth: 460, width: '100%', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="brand-icon" style={{ width: 52, height: 52, margin: '0 auto 16px auto', fontSize: 26 }}>
            🚗
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Ro'yxatdan O'tish</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>
            YHQ platformasida yangi akkaunt yarating
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Ismingiz</label>
            <input
              type="text"
              className="form-input"
              placeholder="Jasurbek Omonqulov"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Kamida 6 ta belgi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Parolni Tasdiqlang</label>
            <input
              type="password"
              className="form-input"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 10 }}
          >
            {loading ? 'Yaratilmoqda...' : '🚀 Akkaunt Yaratish'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#94a3b8' }}>
          Akkauntingiz bormi?{' '}
          <button
            onClick={() => onNavigate && onNavigate('login')}
            style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer' }}
          >
            Tizimga kiring
          </button>
        </div>
      </div>
    </div>
  );
}
