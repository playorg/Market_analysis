import { useState, useEffect } from 'react';
import { fetchCategories, fetchAnalysis } from '../api';
import AssetView from './AssetView';
import { Layers, Zap, Cpu, Globe, FlaskConical, Search, Activity } from 'lucide-react';

const CATEGORY_ICONS = {
    "AI & Machine Learning": <Zap className="w-5 h-5 text-yellow-400" />,
    "Semiconductors": <Cpu className="w-5 h-5 text-blue-400" />,
    "Quantum Computing": <Layers className="w-5 h-5 text-purple-400" />,
    "Robotics & Automation": <Activity className="w-5 h-5 text-green-400" />,
    "Research & Development": <FlaskConical className="w-5 h-5 text-pink-400" />,
    "Chinese Tech": <Globe className="w-5 h-5 text-red-400" />,
    "European Giants": <Globe className="w-5 h-5 text-blue-600" />
};

const StocksPage = ({ currency, rate }) => {
    const [categories, setCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState("AI & Machine Learning");
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const data = await fetchCategories();
        setCategories(data);
    };

    const handleAssetClick = async (symbol) => {
        setLoading(true);
        setSelectedAsset(symbol);
        try {
            const data = await fetchAnalysis(symbol);
            setAnalysisData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                Global Stocks Explorer
            </h1>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                {Object.keys(categories).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setSelectedAsset(null); setAnalysisData(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-surface text-slate-400 hover:text-white hover:bg-surface/80'
                            }`}
                    >
                        {CATEGORY_ICONS[cat]}
                        <span className="text-sm font-medium">{cat}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock List Side */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">{activeCategory}</h2>
                    <div className="grid gap-3">
                        {categories[activeCategory]?.map((stock) => (
                            <div
                                key={stock.symbol}
                                onClick={() => handleAssetClick(stock.symbol)}
                                className={`glass-panel p-4 cursor-pointer transition-all border ${selectedAsset === stock.symbol ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">{stock.symbol}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-surface/50 text-slate-400">Stock</span>
                                </div>
                                <div className="text-sm text-slate-400 truncate">{stock.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analysis View Side */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center glass-panel">
                            <Activity className="w-10 h-10 animate-pulse text-primary" />
                        </div>
                    ) : analysisData ? (
                        <AssetView data={analysisData} currency={currency} rate={rate} />
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center glass-panel text-slate-500 border-dashed">
                            <Search className="w-16 h-16 opacity-20 mb-4" />
                            <p>Select a stock to view deep analysis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StocksPage;
