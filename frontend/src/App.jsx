import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StocksPage from './components/StocksPage';
import CryptoPage from './components/CryptoPage';
import PortfolioPage from './components/PortfolioPage';
import WatchlistPage from './components/WatchlistPage';
import { fetchCurrencyRate } from './api';
import { LayoutDashboard, TrendingUp, Bitcoin, Globe, Eye } from 'lucide-react';

function App() {
  const [currency, setCurrency] = useState('USD'); // USD or EUR
  const [rate, setRate] = useState(1); // Exchange rate USD -> EUR
  const location = useLocation();

  useEffect(() => {
    // Initial fetch of rate
    getRate();
    // Poll rate every 5 mins
    const interval = setInterval(getRate, 300000);
    return () => clearInterval(interval);
  }, []);

  const getRate = async () => {
    const r = await fetchCurrencyRate('EUR');
    setRate(r);
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'EUR' : 'USD');
  };

  return (
    <div className="min-h-screen bg-background text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl">
              M
            </div>
            <span className="text-xl font-bold tracking-tight">Market<span className="text-primary">Mind</span></span>
          </NavLink>

          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white font-bold' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/stocks"
              className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white font-bold' : ''}`}
            >
              Stocks
            </NavLink>
            <NavLink
              to="/crypto"
              className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white font-bold' : ''}`}
            >
              Crypto
            </NavLink>
            <NavLink
              to="/portfolio"
              className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white font-bold' : ''}`}
            >
              Portfolio
            </NavLink>
            <NavLink
              to="/watchlist"
              className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white font-bold' : ''}`}
            >
              Watchlist
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleCurrency}
              className="flex items-center justify-center w-12 h-8 rounded-md bg-surface border border-white/10 hover:border-primary/50 transition-all font-mono text-xs"
            >
              {currency}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard currency={currency} rate={rate} />} />
            <Route path="/stocks" element={<StocksPage currency={currency} rate={rate} />} />
            <Route path="/crypto" element={<CryptoPage currency={currency} rate={rate} />} />
            <Route path="/portfolio" element={<PortfolioPage currency={currency} rate={rate} />} />
            <Route path="/watchlist" element={<WatchlistPage currency={currency} rate={rate} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
