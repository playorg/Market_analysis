import { useState, useEffect } from 'react';
import { fetchPortfolio, addPortfolioItem, deletePortfolioItem } from '../api';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, AlertCircle, Target, Trophy, Plus, Trash2, X } from 'lucide-react';

const PortfolioPage = ({ currency, rate }) => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newSymbol, setNewSymbol] = useState('');
    const [newQty, setNewQty] = useState('');
    const [newCost, setNewCost] = useState('');
    const [costCurrency, setCostCurrency] = useState('EUR'); // EUR or USD
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadPortfolio();
        const interval = setInterval(loadPortfolio, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const loadPortfolio = async () => {
        const data = await fetchPortfolio();
        setPortfolio(data);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);

        let finalCostEur = parseFloat(newCost);
        // If user selected USD, convert to EUR
        if (costCurrency === 'USD') {
            finalCostEur = finalCostEur / rate;
        }

        const item = {
            symbol: newSymbol.toUpperCase(),
            quantity: parseFloat(newQty),
            total_investment_eur: finalCostEur,
            buy_date: new Date().toISOString().split('T')[0]
        };

        const success = await addPortfolioItem(item);
        if (success) {
            setIsModalOpen(false);
            setNewSymbol('');
            setNewQty('');
            setNewCost('');
            setCostCurrency('EUR');
            loadPortfolio();
        }
        setAdding(false);
    };

    const handleDelete = async (symbol) => {
        if (window.confirm(`Are you sure you want to remove ${symbol}?`)) {
            await deletePortfolioItem(symbol);
            loadPortfolio();
        }
    };

    const formatCurrency = (valInEur) => {
        let value = valInEur;
        let symbol = '€';

        if (currency === 'USD') {
            value = valInEur / rate;
            symbol = '$';
        }

        return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!portfolio) {
        return (
            <div className="text-center p-10 glass-panel">
                <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
                <p>Failed to load portfolio data.</p>
            </div>
        );
    }

    const isProfitable = portfolio.total_pl_eur >= 0;
    const goalProgress = portfolio.goal_progress_percent || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-primary">
                    My Holdings
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg shadow-primary/25"
                >
                    <Plus className="w-5 h-5" /> Add Investment
                </button>
            </div>

            {/* Goal Progress Section */}
            <div className="glass-panel p-6 border-success/30 bg-success/5">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        Road to €10,000 Profit
                    </h2>
                    <span className="font-mono text-lg font-bold text-success">
                        {formatCurrency(portfolio.total_pl_eur)} / €10,000.00
                    </span>
                </div>
                <div className="h-4 bg-surface rounded-full overflow-hidden border border-white/5 relative">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-success transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(goalProgress, 0)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Start</span>
                    <span className="text-white font-bold">{goalProgress.toFixed(2)}% Achieved</span>
                    <span>Goal</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 italic text-center">
                    "Slow and steady wins the race. Hare Krishna! 🙏"
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-24 h-24 text-white" />
                    </div>
                    <div className="text-sm text-slate-400 font-medium mb-1">Total Balance</div>
                    <div className="text-4xl font-bold tracking-tight text-white mb-2">
                        {formatCurrency(portfolio.total_value_eur)}
                    </div>
                    <div className="text-xs text-slate-500">Real-time valuation</div>
                </div>

                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        {isProfitable ? <TrendingUp className="w-24 h-24 text-success" /> : <TrendingDown className="w-24 h-24 text-danger" />}
                    </div>
                    <div className="text-sm text-slate-400 font-medium mb-1">Total Profit / Loss</div>
                    <div className={`text-4xl font-bold tracking-tight ${isProfitable ? 'text-success' : 'text-danger'} mb-2`}>
                        {isProfitable ? '+' : ''}{formatCurrency(portfolio.total_pl_eur)}
                    </div>
                    <div className="text-xs text-slate-500">Since inception</div>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-center items-center text-center">
                    <div className="text-sm text-slate-400 font-medium mb-2">Next Update In</div>
                    <div className="text-2xl font-mono text-primary">Live</div>
                    <button onClick={loadPortfolio} className="mt-4 text-xs flex items-center gap-1 hover:text-white transition-colors text-slate-400">
                        <RefreshCw className="w-3 h-3" /> Refresh Now
                    </button>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold">Investments</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface/50 text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Asset</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Current Price</th>
                                <th className="p-4">Total Value</th>
                                <th className="p-4">Profit/Loss</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {portfolio.holdings.map((item) => {
                                const itemProfitable = item.pl_eur >= 0;
                                return (
                                    <tr key={item.full_symbol} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold">{item.symbol}</div>
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">
                                            {item.quantity.toLocaleString()}
                                        </td>
                                        <td className="p-4 font-mono">
                                            {formatCurrency(item.current_price_eur)}
                                        </td>
                                        <td className="p-4 font-bold font-mono">
                                            {formatCurrency(item.current_value_eur)}
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex flex-col ${itemProfitable ? 'text-success' : 'text-danger'}`}>
                                                <span className="font-bold flex items-center gap-1">
                                                    {itemProfitable ? '+' : ''}{formatCurrency(item.pl_eur)}
                                                </span>
                                                <span className="text-xs opacity-75">
                                                    {itemProfitable ? '+' : ''}{item.pl_percent.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(item.full_symbol)}
                                                className="text-slate-500 hover:text-danger p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove Asset"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Investment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-background border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl glass-panel animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6">Add New Investment</h2>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Asset Symbol</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. AAPL, BTC-EUR"
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white"
                                    value={newSymbol}
                                    onChange={(e) => setNewSymbol(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">For Crypto use ticker-EUR (e.g. BTC-EUR) or ticker-USD</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white"
                                        value={newQty}
                                        onChange={(e) => setNewQty(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Total Cost</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="any"
                                            required
                                            placeholder="0.00"
                                            className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white"
                                            value={newCost}
                                            onChange={(e) => setNewCost(e.target.value)}
                                        />
                                        <select
                                            value={costCurrency}
                                            onChange={(e) => setCostCurrency(e.target.value)}
                                            className="bg-surface border border-white/10 rounded-xl px-2 focus:outline-none focus:border-primary/50 text-white font-mono text-sm"
                                        >
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all mt-4 flex justify-center items-center gap-2"
                            >
                                {adding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Add to Portfolio
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;
