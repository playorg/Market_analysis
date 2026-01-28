import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchMarketSummary = async () => {
    try {
        const response = await api.get('/market-summary');
        return response.data;
    } catch (error) {
        console.error("Error fetching market summary:", error);
        return { indices: [] };
    }
};

export const fetchAnalysis = async (symbol) => {
    try {
        const response = await api.get(`/analyze/${symbol}`);
        return response.data;
    } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error);
        throw error;
    }
};

export const fetchCurrencyRate = async (to = 'EUR') => {
    try {
        const response = await api.get(`/currency-rate?to=${to}`);
        return response.data.rate;
    } catch (error) {
        console.error("Error fetching currency rate:", error);
        return 0.92; // Fallback
    }
};

export const fetchCategories = async () => {
    try {
        const response = await api.get('/market-categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return {};
    }
};

export const fetchPortfolio = async () => {
    try {
        const response = await api.get('/portfolio');
        return response.data;
    } catch (error) {
        console.error("Error fetching portfolio:", error);
        return null;
    }
};

export const addPortfolioItem = async (item) => {
    try {
        await api.post('/portfolio/add', item);
        return true;
    } catch (error) {
        console.error("Error adding item:", error);
        return false;
    }
};

export const deletePortfolioItem = async (symbol) => {
    try {
        await api.delete(`/portfolio/${symbol}`);
        return true;
    } catch (error) {
        console.error("Error deleting item:", error);
        return false;
    }
};

export const fetchWatchlist = async () => {
    try {
        const response = await api.get('/watchlist');
        return response.data;
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        return {};
    }
};

export const addToWatchlist = async (symbol, category) => {
    try {
        await api.post('/watchlist/add', { symbol, category });
        return true;
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        return false;
    }
};

export const deleteFromWatchlist = async (symbol, category) => {
    try {
        await api.post('/watchlist/delete', { symbol, category });
        return true;
    } catch (error) {
        console.error("Error deleting from watchlist:", error);
        return false;
    }
};

export const fetchNews = async (symbol = null) => {
    try {
        const url = symbol ? `/news?symbol=${symbol}` : '/news';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
};

export const fetchDashboardNews = async () => {
    try {
        const response = await api.get('/dashboard-news');
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard news:", error);
        return { rising: [], falling: [] };
    }
};
