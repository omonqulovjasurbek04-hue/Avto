import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children, onNavigate }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>⚡ Autentifikatsiya tekshirilmoqda...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="meta-card" style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Tizimga kirish talab etiladi</h2>
        <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
          Ushbu sahifadan foydalanish uchun iltimos shaxsiy hisobingizga kiring yoki ro'yxatdan o'ting.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => onNavigate && onNavigate('login')}>
            🔑 Kirish
          </button>
          <button className="btn-secondary" onClick={() => onNavigate && onNavigate('register')}>
            📝 Ro'yxatdan o'tish
          </button>
        </div>
      </div>
    );
  }

  return children;
}
