import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingDown, TrendingUp, DollarSign, Calendar, X } from 'lucide-react';

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
        setNewExpense({ amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0], description: '' });
    };

    const categories = ['Rent', 'Utilities', 'Maintenance', 'Equipment', 'Salary', 'Marketing', 'Other'];

    const statsBg = activeTab === 'Income'
        ? 'from-emerald-900/60 to-green-900/40 border-emerald-500/30'
        : activeTab === 'Expenses'
            ? 'from-red-900/60 to-rose-900/40 border-red-500/30'
            : 'from-purple-900/60 to-indigo-900/40 border-purple-500/30';

    const statsColor = activeTab === 'Income' ? 'text-emerald-400' : activeTab === 'Expenses' ? 'text-red-400' : 'text-purple-400';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Financials</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-gold-500 to-amber-600 text-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all font-bold font-tech tracking-wider hover:opacity-90"
                >
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            {/* Tab Switcher */}
            <div className="bg-[#0a0d14]/80 border border-gold-400/20 p-1 rounded-xl flex gap-1">
                {['Expenses', 'Income', 'All'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`flex-1 py-2 rounded-lg text-sm font-tech tracking-wider transition-all ${activeTab === tab
                                ? 'bg-gold-500/20 border border-gold-400/40 text-gold-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Stats Banner */}
            <div className={`bg-gradient-to-br ${statsBg} border rounded-2xl p-6 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                    <p className="text-gray-400 font-tech text-sm tracking-wider uppercase">
                        Total {activeTab} {dateParam === 'today' ? '(Today)' : ''}
                    </p>
                    <h2 className={`text-4xl font-display font-bold mt-1 ${statsColor}`}>
                        ₹{Math.abs(totalAmount).toLocaleString()}
                    </h2>
                </div>
                {activeTab === 'Income'
                    ? <TrendingUp className="absolute right-4 bottom-4 text-emerald-500 opacity-10 w-24 h-24" />
                    : <TrendingDown className="absolute right-4 bottom-4 text-red-500 opacity-10 w-24 h-24" />
                }
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-600">
                        <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="font-tech tracking-wider">No transactions found.</p>
                    </div>
                ) : (
                    filteredTransactions.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0c1220]/70 border border-gold-400/10 hover:border-gold-400/30 p-4 rounded-xl flex justify-between items-center transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${t.type === 'Income' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20' : 'bg-red-900/40 text-red-400 border border-red-500/20'}`}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h3 className="font-tech font-bold text-white tracking-wider uppercase text-sm">{t.category}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Calendar size={11} /> {new Date(t.date).toLocaleDateString()}
                                        {t.description && <span className="text-gray-600">• {t.description}</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold font-display text-lg tracking-wider ${t.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {t.type === 'Income' ? '+' : '-'} ₹{t.amount}
                                </span>
                                {t.type === 'Expense' && (
                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="p-2 bg-white/5 rounded-lg text-gray-600 hover:bg-red-900/30 hover:text-red-400 transition-colors border border-white/5"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#02040a] z-50 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-[#0a0d14] border border-gold-400/30 rounded-3xl z-50 p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-display font-bold text-gold-400 tracking-widest uppercase">Add New Expense</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={22} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {[
                                    { label: 'Amount (₹)', key: 'amount', type: 'number' },
                                    { label: 'Date', key: 'date', type: 'date' },
                                    { label: 'Description (Optional)', key: 'description', type: 'text' }
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="text-xs font-tech text-gray-500 uppercase tracking-widest block mb-1">{field.label}</label>
                                        <input
                                            type={field.type}
                                            required={field.key !== 'description'}
                                            className="w-full p-3 bg-[#050816]/80 border border-gold-400/20 focus:border-gold-400 rounded-xl outline-none text-white font-tech transition-all"
                                            value={newExpense[field.key]}
                                            onChange={e => setNewExpense({ ...newExpense, [field.key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="text-xs font-tech text-gray-500 uppercase tracking-widest block mb-1">Category</label>
                                    <select
                                        className="w-full p-3 bg-[#050816]/80 border border-gold-400/20 rounded-xl outline-none text-white font-tech"
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c} className="bg-[#0a0d14]">{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold font-tech bg-white/5 text-gray-400 border border-white/5 tracking-wider">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl font-bold font-tech bg-gradient-to-r from-gold-500 to-amber-600 text-black shadow-lg shadow-gold-500/10 tracking-wider hover:opacity-90">
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
