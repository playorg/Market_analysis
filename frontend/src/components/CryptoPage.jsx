import { useState } from 'react';
import { fetchAnalysis } from '../api';
import AssetView from './AssetView';
import { Bitcoin, Activity, Search } from 'lucide-react';

const CRYPTO_ASSETS = [
    { symbol: "BTC-USD", name: "Bitcoin" },
    { symbol: "ETH-USD", name: "Ethereum" },
    { symbol: "SOL-USD", name: "Solana" },
    { symbol: "XRP-USD", name: "Ripple" },
    { symbol: "DOGE-USD", name: "Dogecoin" },
    { symbol: "ADA-USD", name: "Cardano" },
    { symbol: "AVAX-USD", name: "Avalanche" },
    { symbol: "DOT-USD", name: "Polkadot" }
];

const CryptoPage = ({ currency, rate }) => {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);

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
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-400">
                Crypto Market
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List Side */}
                <div className="space-y-4">
                    <div className="grid gap-3">
                        {CRYPTO_ASSETS.map((coin) => (
                            <div
                                key={coin.symbol}
                                onClick={() => handleAssetClick(coin.symbol)}
                                className={`glass-panel p-4 cursor-pointer transition-all border ${selectedAsset === coin.symbol ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-orange-500/20 text-orange-400">
                                            <Bitcoin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{coin.symbol.replace('-USD', '')}</div>
                                            <div className="text-sm text-slate-400">{coin.name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analysis View Side */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center glass-panel">
                            <Activity className="w-10 h-10 animate-pulse text-orange-500" />
                        </div>
                    ) : analysisData ? (
                        <AssetView data={analysisData} currency={currency} rate={rate} />
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center glass-panel text-slate-500 border-dashed">
                            <Search className="w-16 h-16 opacity-20 mb-4" />
                            <p>Select a coin to view analysis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CryptoPage;
