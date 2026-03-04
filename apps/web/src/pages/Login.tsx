import { useState } from 'react';

type Props = { apiBase: string };

export default function Login({ apiBase }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'granted' | 'denied'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.access === 'granted') {
        setMessage({ type: 'granted', text: 'Access Granted' });
      } else {
        setMessage({ type: 'denied', text: 'Access Denied' });
      }
    } catch {
      setMessage({ type: 'denied', text: 'Access Denied' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: 4 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: 4 }}
        />
        {message && (
          <p style={{ color: message.type === 'granted' ? '#4ade80' : '#f87171', fontWeight: 600 }}>
            {message.text}
          </p>
        )}
        <button type="submit" disabled={loading} style={{ padding: '0.5rem', cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
