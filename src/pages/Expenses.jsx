import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingDown, TrendingUp, DollarSign, Calendar, X, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
        ? 'from-emerald-900/40 to-emerald-950/60 border-emerald-500/25'
        : activeTab === 'Expenses'
            ? 'from-red-900/40 to-red-950/60 border-red-500/25'
            : 'from-purple-900/40 to-purple-950/60 border-purple-500/25';

    const statsColor = activeTab === 'Income' ? 'text-emerald-400' : activeTab === 'Expenses' ? 'text-red-400' : 'text-purple-400';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase" style={{ textShadow: '0 0 15px rgba(251, 191, 36, 0.25)' }}>Financials</h1>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-gold-400 to-transparent rounded-full mt-1" style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.3)' }}></div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="cosmic-btn text-sm"
                    style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)' }}>
                    <Plus size={16} /> Add Expense
                </button>
            </div>

            {/* Modern Tab Switcher with Sliding Indicator */}
            <div className="relative p-1 rounded-2xl" style={{
                background: 'linear-gradient(180deg, rgba(8, 13, 26, 0.9) 0%, rgba(10, 15, 28, 0.85) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.15)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)'
            }}>
                {/* Sliding indicator */}
                <div className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out"
                    style={{
                        width: 'calc((100% - 8px) / 3)',
                        left: `calc(4px + ${['Expenses', 'Income', 'All'].indexOf(activeTab)} * (100% - 8px) / 3)`,
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))',
                        border: '1px solid rgba(251, 191, 36, 0.35)',
                        boxShadow: '0 0 15px rgba(251, 191, 36, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
                />
                <div className="relative flex gap-0.5">
                    {['Expenses', 'Income', 'All'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-tech font-semibold tracking-[0.15em] uppercase transition-all duration-200 relative z-10 ${activeTab === tab
                                ? 'text-gold-400'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                            style={activeTab === tab ? { textShadow: '0 0 10px rgba(251, 191, 36, 0.3)' } : {}}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Banner */}
            <div className={`bg-gradient-to-br ${statsBg} border rounded-2xl p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold-400/30 to-transparent"></div>
                <div className="relative z-10">
                    <p className="text-gray-400 font-tech text-sm tracking-wider uppercase flex items-center gap-2">
                        <Wallet size={14} />
                        Total {activeTab} {dateParam === 'today' ? '(Today)' : ''}
                    </p>
                    <h2 className={`text-4xl font-display font-bold mt-1 ${statsColor}`}>
                        ₹{Math.abs(totalAmount).toLocaleString()}
                    </h2>
                    <p className="text-xs text-gray-600 font-tech mt-1">{filteredTransactions.length} transactions</p>
                </div>
                {activeTab === 'Income'
                    ? <TrendingUp className="absolute right-4 bottom-4 text-emerald-500 opacity-[0.07] w-28 h-28" />
                    : <TrendingDown className="absolute right-4 bottom-4 text-red-500 opacity-[0.07] w-28 h-28" />
                }
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                            <Wallet className="w-14 h-14 mx-auto mb-3 text-gold-500/40" />
                        </motion.div>
                        <p className="font-tech tracking-wider text-gray-500">No transactions found</p>
                        <p className="text-xs text-gray-700 font-tech mt-1">Add an expense to get started</p>
                    </div>
                ) : (
                    filteredTransactions.map((t, index) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`glass-card p-4 flex justify-between items-center transition-all ${t.type === 'Income' ? 'border-l-2 border-l-emerald-500/50' : 'border-l-2 border-l-red-500/40'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${t.type === 'Income'
                                    ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.08)]'
                                    : 'bg-red-900/30 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.08)]'
                                    }`}>
                                    {t.type === 'Income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                </div>
                                <div>
                                    <h3 className="font-tech font-bold text-white tracking-wider uppercase text-sm">{t.category}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
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
                                        className="p-2 bg-white/5 rounded-lg text-gray-600 hover:bg-red-900/30 hover:text-red-400 transition-all border border-white/5"
                                    >
                                        <Trash2 size={15} />
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
                            className="fixed inset-0 bg-[#02040a] z-50"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-modal"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h2 className="text-xl font-display font-bold text-gold-400 tracking-widest uppercase">Add Expense</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={22} /></button>
                            </div>
                            <div className="h-0.5 w-full bg-gradient-to-r from-gold-400/40 via-gold-400/10 to-transparent rounded-full mb-5"></div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {[
                                    { label: 'Amount (₹)', key: 'amount', type: 'number' },
                                    { label: 'Date', key: 'date', type: 'date' },
                                    { label: 'Description (Optional)', key: 'description', type: 'text' }
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="cosmic-label">{field.label}</label>
                                        <input
                                            type={field.type}
                                            required={field.key !== 'description'}
                                            className="cosmic-input"
                                            value={newExpense[field.key]}
                                            onChange={e => setNewExpense({ ...newExpense, [field.key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="cosmic-label">Category</label>
                                    <select
                                        className="cosmic-input"
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c} className="bg-[#0a0d14]">{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="cosmic-btn-ghost flex-1">Cancel</button>
                                    <button type="submit" className="cosmic-btn flex-1 justify-center">Save Expense</button>
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
