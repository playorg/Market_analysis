import { useState, useEffect } from 'react';
import { fetchWatchlist, deleteFromWatchlist, fetchAnalysis } from '../api';
import { Eye, TrendingUp, TrendingDown, Trash2, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WatchlistPage = ({ currency, rate }) => {
    const [watchlist, setWatchlist] = useState({});
    const [loading, setLoading] = useState(true);
    const [marketData, setMarketData] = useState({}); // Cache for prices
    const navigate = useNavigate();

    useEffect(() => {
        loadWatchlist();
    }, []);

    const loadWatchlist = async () => {
        const data = await fetchWatchlist();
        setWatchlist(data);
        fetchMarketData(data);
        setLoading(false);
    };

    const fetchMarketData = async (data) => {
        const symbols = new Set();
        Object.values(data).forEach(list => list.forEach(sym => symbols.add(sym)));

        const tempData = {};
        // Ideally we'd have a batch endpoint, but we'll fetch individually for now or use analyze logic
        // For simplicity in this view, we might not need full analysis, just price.
        // But let's use the analyze endpoint to get at least the price and % change.

        // Parallel fetching limited to avoid blocking?
        for (const sym of symbols) {
            try {
                const res = await fetchAnalysis(sym);
                tempData[sym] = {
                    price: res.price_history[Object.keys(res.price_history).pop()], // Latest price
                    // We need percent change, checking how to get it from current API
                    // Current API returns price history. We can calc change.
                };
            } catch (e) {
                console.error("Failed to load data for", sym);
            }
        }
        setMarketData(tempData);
    };

    const handleDelete = async (symbol, category) => {
        if (window.confirm(`Remove ${symbol} from ${category}?`)) {
            await deleteFromWatchlist(symbol, category);
            loadWatchlist();
        }
    };

    const handleNavigate = (symbol) => {
        navigate(`/dashboard?search=${symbol}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    My Watchlists
                </h1>
            </div>

            {Object.keys(watchlist).length === 0 ? (
                <div className="text-center p-20 glass-panel">
                    <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">Your watchlist is empty</h3>
                    <p className="text-slate-500 mt-2">Go to the Dashboard or Asset views to add stocks here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(watchlist).map(([category, symbols]) => (
                        <div key={category} className="glass-panel p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <span className="w-2 h-8 bg-primary rounded-full block"></span>
                                {category}
                            </h2>
                            <div className="space-y-3">
                                {symbols.length === 0 && <p className="text-slate-500 text-sm italic">No items yet.</p>}
                                {symbols.map(symbol => (
                                    <div key={symbol} className="bg-surface/50 p-4 rounded-xl flex justify-between items-center hover:bg-white/5 transition-colors group">
                                        <div onClick={() => handleNavigate(symbol)} className="cursor-pointer">
                                            <div className="font-bold text-lg text-white">{symbol}</div>
                                            {/* Price placeholder */}
                                            <div className="text-xs text-slate-400">Click to view details</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleNavigate(symbol)}
                                                className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(symbol, category)}
                                                className="p-2 text-slate-500 hover:text-danger hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;
