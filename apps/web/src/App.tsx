import { Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';

const apiBase = import.meta.env.VITE_API_URL ?? '/api';

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: 480, margin: '0 auto' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ marginRight: '1rem', color: '#94a3b8' }}>Home</Link>
        <Link to="/register" style={{ marginRight: '1rem', color: '#94a3b8' }}>Register</Link>
        <Link to="/login" style={{ color: '#94a3b8' }}>Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register apiBase={apiBase} />} />
        <Route path="/login" element={<Login apiBase={apiBase} />} />
      </Routes>
    </div>
  );
}

export default App;
