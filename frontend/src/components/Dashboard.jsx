import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchMarketSummary, fetchAnalysis, fetchDashboardNews } from '../api';
import AssetView from './AssetView';
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const Dashboard = ({ currency = 'USD', rate = 1 }) => {
    const [marketData, setMarketData] = useState({ indices: [] });
    const [dashboardNews, setDashboardNews] = useState({ rising: [], falling: [] });
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchParams] = useSearchParams();
    const urlSearch = searchParams.get('search');

    useEffect(() => {
        loadMarketData();
        if (urlSearch) {
            setSearchQuery(urlSearch);
            analyzeAsset(urlSearch);
        }
    }, [urlSearch]);

    const loadMarketData = async () => {
        const data = await fetchMarketSummary();
        setMarketData(data);
        const news = await fetchDashboardNews();
        setDashboardNews(news);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        analyzeAsset(searchQuery.toUpperCase());
    };

    const analyzeAsset = async (symbol) => {
        setLoading(true);
        setError(null);
        setSelectedSymbol(symbol);
        try {
            const data = await fetchAnalysis(symbol);
            setAnalysisData(data);
        } catch (err) {
            setError("Could not fetch data. Invalid symbol or API error.");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (value) => {
        const converted = currency === 'EUR' ? value * rate : value;
        const symbol = currency === 'EUR' ? '€' : '$';
        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-8">
            {/* Header / Search Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Market Overview
                    </h1>
                    <p className="text-slate-400 mt-1">Real-time analysis and insights</p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search Symbol (e.g. AAPL, BTC-USD)..."
                        className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                    <button type="submit" className="absolute right-2 top-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold py-1.5 px-3 rounded-lg transition-colors">
                        ANALYZE
                    </button>
                </form>
            </div>

            {/* Market Indices Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {marketData.indices.map((idx) => (
                    <div key={idx.symbol} onClick={() => analyzeAsset(idx.symbol)} className="glass-panel p-4 hover:border-primary/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-slate-400">{idx.symbol}</span>
                            {idx.change_percent >= 0 ?
                                <TrendingUp className="w-4 h-4 text-success" /> :
                                <TrendingDown className="w-4 h-4 text-danger" />
                            }
                        </div>
                        <div className="font-bold text-lg truncate" title={idx.name}>{idx.name}</div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-mono">{formatPrice(idx.price)}</span>
                            <span className={`text-sm font-medium ${idx.change_percent >= 0 ? 'text-success' : 'text-danger'}`}>
                                {idx.change_percent >= 0 ? '+' : ''}{idx.change_percent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Real-time News Section */}
            {(dashboardNews.rising.length > 0 || dashboardNews.falling.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Rising Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-success w-5 h-5" />
                            <h2 className="text-xl font-bold text-white">Market Movers: Rising</h2>
                        </div>
                        <div className="space-y-4">
                            {dashboardNews.rising.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block glass-panel p-4 hover:border-success/50 transition-all border-l-4 border-l-success group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <h3 className="font-bold text-sm mb-1 line-clamp-2 relative z-10 group-hover:text-success transition-colors">{item.title}</h3>
                                    <div className="flex justify-between items-center text-xs text-slate-400 relative z-10">
                                        <span className="font-medium text-slate-300">{item.publisher}</span>
                                        <div className="flex gap-2">
                                            <span>{item.ticker}</span>
                                            <span className="text-success font-mono">+{item.change_percent.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Falling Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingDown className="text-danger w-5 h-5" />
                            <h2 className="text-xl font-bold text-white">Market Fallers & Risks</h2>
                        </div>
                        <div className="space-y-4">
                            {dashboardNews.falling.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block glass-panel p-4 hover:border-danger/50 transition-all border-l-4 border-l-danger group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-danger/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <h3 className="font-bold text-sm mb-1 line-clamp-2 relative z-10 group-hover:text-danger transition-colors">{item.title}</h3>
                                    <div className="flex justify-between items-center text-xs text-slate-400 relative z-10">
                                        <span className="font-medium text-slate-300">{item.publisher}</span>
                                        <div className="flex gap-2">
                                            <span>{item.ticker}</span>
                                            <span className="text-danger font-mono">{item.change_percent.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Activity className="w-10 h-10 animate-pulse text-primary mb-4" />
                        <p>Analyzing Market Data...</p>
                    </div>
                ) : error ? (
                    <div className="glass-panel p-8 text-center border-danger/30">
                        <p className="text-danger text-lg mb-2">Analysis Failed</p>
                        <p className="text-slate-400">{error}</p>
                    </div>
                ) : analysisData ? (
                    <AssetView data={analysisData} currency={currency} rate={rate} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                        <Search className="w-12 h-12 mb-4 opacity-50" />
                        <p>Search for a stock or crypto to view detailed analysis</p>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => analyzeAsset('BTC-USD')} className="px-3 py-1 bg-surface rounded-full text-xs hover:bg-surface/80 transition-colors">BTC-USD</button>
                            <button onClick={() => analyzeAsset('NVDA')} className="px-3 py-1 bg-surface rounded-full text-xs hover:bg-surface/80 transition-colors">NVDA</button>
                            <button onClick={() => analyzeAsset('AAPL')} className="px-3 py-1 bg-surface rounded-full text-xs hover:bg-surface/80 transition-colors">AAPL</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
