import { useState } from 'react'; // Added useState
import { useLocation, useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const Expenses = () => {
    const { transactions, addTransaction, deleteTransaction } = useGymContext();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get('filter') || 'expenses';
    const dateParam = queryParams.get('date');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: 'Rent',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const activeTab = filterParam === 'income' ? 'Income' : filterParam === 'all' ? 'All' : 'Expenses';

    const filteredTransactions = transactions.filter(t => {
        if (activeTab === 'Expenses' && t.type !== 'Expense') return false;
        if (activeTab === 'Income' && t.type !== 'Income') return false;
        if (dateParam === 'today' && t.date !== new Date().toISOString().split('T')[0]) return false;
        return true;
    });

    const totalAmount = filteredTransactions.reduce((acc, curr) => {
        if (activeTab === 'All') {
            return curr.type === 'Income' ? acc + curr.amount : acc - curr.amount;
        }
        return acc + curr.amount;
    }, 0);

    const handleTabChange = (tab) => {
        const newFilter = tab.toLowerCase();
        navigate(`/expenses?filter=${newFilter}${dateParam ? `&date=${dateParam}` : ''}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addTransaction({
            id: Date.now(),
            type: 'Expense',
            amount: parseFloat(newExpense.amount),
            date: newExpense.date,
            category: newExpense.category,
            description: newExpense.description
        });
        setIsModalOpen(false);
        setNewExpense({
            amount: '',
            category: 'Rent',
            date: new Date().toISOString().split('T')[0],
            description: ''
        });
    };

    const categories = ['Rent', 'Utilities', 'Maintenance', 'Equipment', 'Salary', 'Marketing', 'Other'];

    const themeColor = activeTab === 'Income' ? 'green' : activeTab === 'Expenses' ? 'red' : 'purple';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financials</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-red-200 transition-all font-semibold"
                >
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-gray-100 p-1 rounded-xl flex">
                {['Expenses', 'Income', 'All'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className={`bg-gradient-to-br ${activeTab === 'Income' ? 'from-green-500 to-emerald-600 shadow-green-200' : activeTab === 'Expenses' ? 'from-red-500 to-rose-600 shadow-red-200' : 'from-purple-500 to-indigo-600 shadow-purple-200'} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-colors duration-500`}>
                <div className="relative z-10">
                    <p className="text-white/80 font-medium text-sm">
                        Total {activeTab} {dateParam === 'today' ? '(Today)' : ''}
                    </p>
                    <h2 className="text-3xl font-bold mt-1">
                        ₹{totalAmount.toLocaleString()}
                    </h2>
                </div>
                <TrendingDown className="absolute right-4 bottom-4 text-white opacity-20 w-24 h-24" />
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    filteredTransactions.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${t.type === 'Income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{t.category}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(t.date).toLocaleDateString()}
                                        {t.description && <span className="text-gray-400">• {t.description}</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold px-3 py-1 rounded-lg ${t.type === 'Income' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                    {t.type === 'Income' ? '+' : '-'} ₹{t.amount}
                                </span>
                                {t.type === 'Expense' && (
                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white rounded-3xl z-50 p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500"
                                        value={newExpense.amount}
                                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"
                                        value={newExpense.date}
                                        onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Description (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 items-center justify-center rounded-xl font-bold bg-gray-100 text-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 items-center justify-center rounded-xl font-bold bg-red-500 text-white shadow-lg shadow-red-200"
                                    >
                                        Save Expense
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Expenses;
