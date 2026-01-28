import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Clock, HelpCircle, Briefcase, Heart, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addToWatchlist, fetchWatchlist } from '../api';

const AssetView = ({ data, currency = 'USD', rate = 1 }) => {
    if (!data) return null;

    const {
        symbol = "Unknown",
        fundamentals = {},
        technical_analysis = {},
        price_history = {},
        news = []
    } = data;

    // Watchlist State
    const [showWatchlistModal, setShowWatchlistModal] = useState(false);
    const [watchlistCategory, setWatchlistCategory] = useState("Favorites");
    const [newCategory, setNewCategory] = useState("");
    const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
    const [watchlist, setWatchlist] = useState({});

    useEffect(() => {
        if (showWatchlistModal) {
            fetchWatchlist().then(res => setWatchlist(res || {}));
        }
    }, [showWatchlistModal]);

    const handleAddToWatchlist = async () => {
        setIsAddingWatchlist(true);
        const category = newCategory.trim() || watchlistCategory;
        const success = await addToWatchlist(symbol, category);
        if (success) {
            setShowWatchlistModal(false);
            setNewCategory("");
            alert(`Added ${symbol} to ${category}!`);
        }
        setIsAddingWatchlist(false);
    };

    // Currency helper
    const formatPrice = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return '-';
        const converted = currency === 'EUR' ? value * rate : value;
        const symbol = currency === 'EUR' ? '€' : '$';
        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatLargeNumber = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return '-';
        const converted = currency === 'EUR' ? value * rate : value;
        const symbol = currency === 'EUR' ? '€' : '$';
        return `${symbol}${(converted / 1e9).toFixed(2)}B`;
    };

    // Format chart data safely
    const chartData = Object.entries(price_history || {}).map(([date, price]) => ({
        date: new Date(date).toLocaleDateString(),
        price: currency === 'EUR' ? price * rate : price
    }));

    const action = technical_analysis.action || "HOLD";
    const explanation = technical_analysis.explanation || "No clear signal.";
    const nextCheck = technical_analysis.next_check || "24 Hours";
    const suggestedInvestment = technical_analysis.suggested_investment || "-";

    const signalColor =
        action.includes('BUY') ? 'bg-success text-white' :
            action.includes('SELL') ? 'bg-danger text-white' :
                'bg-yellow-500 text-black';

    const signalBorder =
        action.includes('BUY') ? 'border-success/50 bg-success/5' :
            action.includes('SELL') ? 'border-danger/50 bg-danger/5' :
                'border-yellow-500/50 bg-yellow-500/5';

    // Calculate current price safely
    let currentPrice = 0;
    const historyDates = Object.keys(price_history || {});
    if (historyDates.length > 0) {
        currentPrice = price_history[historyDates[historyDates.length - 1]];
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Title Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-4xl font-bold text-white">{symbol}</h2>
                        <span className="px-3 py-1 rounded-full bg-surface border border-white/10 text-xs font-mono text-slate-300">
                            {formatLargeNumber(fundamentals.market_cap)}
                        </span>
                        <button
                            onClick={() => setShowWatchlistModal(true)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-pink-500 transition-all border border-pink-500/30"
                            title="Add to Watchlist"
                        >
                            <Heart className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                    <p className="text-lg text-slate-400">{fundamentals.name || "Unknown Company"}</p>
                    <div className="flex gap-4 text-sm text-slate-500 mt-2">
                        <span>Sector: <span className="text-slate-300">{fundamentals.sector || "N/A"}</span></span>
                        <span>•</span>
                        <span>Industry: <span className="text-slate-300">{fundamentals.industry || "N/A"}</span></span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-3xl font-mono font-bold text-primary">
                        {formatPrice(currentPrice)}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Action Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-6 rounded-xl border ${signalBorder} flex flex-col justify-between`}>
                    <div className="flex items-center gap-2 mb-2 text-sm font-bold opacity-70 uppercase tracking-widest">
                        <AlertTriangle className="w-4 h-4" /> Recommendation
                    </div>
                    <div className={`text-3xl font-black ${action.includes('HOLD') ? 'text-yellow-500' : action.includes('BUY') ? 'text-success' : 'text-danger'}`}>
                        {action}
                    </div>
                </div>

                <div className="p-6 rounded-xl glass-panel flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <Briefcase className="w-4 h-4" /> Suggested Move
                    </div>
                    <div className="text-xl font-bold text-primary">{suggestedInvestment}</div>
                    <div className="text-xs text-slate-500 mt-1">Safe allocation</div>
                </div>

                <div className="p-6 rounded-xl glass-panel md:col-span-1 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <HelpCircle className="w-4 h-4" /> Why?
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{explanation}</p>
                </div>

                <div className="p-6 rounded-xl glass-panel flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-4 h-4" /> Next Check
                    </div>
                    <div className="text-2xl font-mono text-white">{nextCheck}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 glass-panel p-6 h-[400px]">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Price Trend ({currency})
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={chartData}>
                            <XAxis
                                dataKey="date"
                                stroke="#475569"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#475569"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => currency === 'EUR' ? `€${val.toLocaleString()}` : `$${val.toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(val) => [formatPrice(val), 'Price']}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Fundamentals Cards */}
                <div className="space-y-4">
                    <div className="glass-panel p-5">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Financial Health
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">P/E Ratio</span>
                                <span className="font-mono">{fundamentals.pe_ratio !== undefined && fundamentals.pe_ratio !== 'N/A' ? fundamentals.pe_ratio : '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Profit Margin</span>
                                <span className="font-mono text-success">
                                    {fundamentals.profit_margins !== undefined && fundamentals.profit_margins !== 'N/A'
                                        ? `${(fundamentals.profit_margins * 100).toFixed(2)}%`
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Revenue</span>
                                <span className="font-mono">
                                    {formatLargeNumber(fundamentals.revenue)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Debt/Equity</span>
                                <span className="font-mono text-danger">{fundamentals.debt_to_equity !== undefined && fundamentals.debt_to_equity !== 'N/A' ? fundamentals.debt_to_equity : '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-5 flex-1">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                            Range (52 Week)
                        </h3>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>L: {formatPrice(fundamentals['52_week_low'])}</span>
                                <span>H: {formatPrice(fundamentals['52_week_high'])}</span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-accent w-1/2 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* News Section */}
            <div className="glass-panel p-6">
                <h3 className="text-xl font-bold mb-4">Latest News</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(news || []).map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-surface/30 rounded-lg hover:bg-surface/50 transition-colors border border-white/5">
                            <div className="text-xs text-primary mb-2 font-bold uppercase">{item.publisher}</div>
                            <div className="font-medium line-clamp-2 mb-2">{item.title}</div>
                        </a>
                    ))}
                    {(!news || news.length === 0) && <p className="text-slate-500 italic">No recent news found.</p>}
                </div>
            </div>

            {/* Modal for Watchlist */}
            {showWatchlistModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-background border border-white/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl glass-panel animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowWatchlistModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Heart className="text-pink-500 fill-current" /> Add to Watchlist
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Select Category</label>
                                <select
                                    className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50"
                                    value={watchlistCategory}
                                    onChange={(e) => setWatchlistCategory(e.target.value)}
                                >
                                    {Object.keys(watchlist).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="Favorites">Favorites</option>
                                </select>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-slate-500">Or create new</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">New Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AI Stocks, Moonshots"
                                    className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleAddToWatchlist}
                                disabled={isAddingWatchlist}
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-pink-900/20"
                            >
                                {isAddingWatchlist ? "Adding..." : "Save to Watchlist"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetView;
