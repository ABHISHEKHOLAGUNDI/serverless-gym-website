import React, { createContext, useContext, useState, useEffect } from 'react';

const GymContext = createContext();

// Initial Mock Data - Cleared for production feel
// Initial Mock Data - Cleared for production feel
const INITIAL_MEMBERS = [];

// Mock Data for Trainers and Machines
const INITIAL_TRAINERS = [];

const INITIAL_MACHINES = [];

export const GymProvider = ({ children }) => {
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [transactions, setTransactions] = useState([]);
    const [trainers, setTrainers] = useState(INITIAL_TRAINERS);
    const [machines, setMachines] = useState(INITIAL_MACHINES);

    // Auto-Prune: Delete members expired > 90 days ago
    useEffect(() => {
        // ... (keep existing pruning logic)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        setMembers(prev => prev.filter(m => {
            if (m.status === 'Active') return true;
            const expiryDate = new Date(m.expiry);
            return expiryDate >= ninetyDaysAgo;
        }));
    }, []);

    // Derived Stats
    // ... (keep existing stats calculation)
    const stats = {
        liveMembers: members.filter(m => m.status === 'Active').length,
        totalUsers: members.length,
        birthdaysToday: members.filter(m => {
            if (!m.dob) return false;
            const [y, mth, d] = m.dob.split('-').map(Number);
            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDate = today.getDate();
            return mth === todayMonth && d === todayDate;
        }).length,
        expired: members.filter(m => new Date(m.expiry) < new Date()).length,
        expiringSoon: members.filter(m => {
            const diff = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
            return diff > 0 && diff <= 3;
        }).length,
        in4to7Days: members.filter(m => {
            const diff = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
            return diff > 3 && diff <= 7;
        }).length,
        in8to15Days: members.filter(m => {
            const diff = (new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24);
            return diff > 7 && diff <= 15;
        }).length,
        dueAmount: 0,
        todaysCash: transactions
            .filter(t => t.type === 'Income' && t.date === new Date().toISOString().split('T')[0])
            .reduce((acc, curr) => acc + curr.amount, 0),
        totalIncome: transactions
            .filter(t => t.type === 'Income')
            .reduce((acc, curr) => acc + curr.amount, 0),
        expenses: transactions
            .filter(t => t.type === 'Expense')
            .reduce((acc, curr) => acc + curr.amount, 0),
    };
    stats.balance = stats.totalIncome - stats.expenses;

    // Actions
    const addMember = (member) => {
        setMembers(prev => [member, ...prev]);
        if (member.amount) {
            setTransactions(prev => [{
                id: Date.now(),
                type: 'Income',
                amount: parseFloat(member.amount),
                date: new Date().toISOString().split('T')[0],
                category: 'New Membership'
            }, ...prev]);
        }
    };

    const updateMember = (updatedMember) => {
        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    };

    const deleteMember = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const renewMember = (id, newExpiry, amount, planType) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, expiry: newExpiry, status: 'Active', planType } : m));
        if (amount) {
            setTransactions(prev => [{
                id: Date.now(),
                type: 'Income',
                amount: parseFloat(amount),
                date: new Date().toISOString().split('T')[0],
                category: 'Renewal'
            }, ...prev]);
        }
    };

    const addTransaction = (transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    // Trainer Actions
    const addTrainer = (trainer) => setTrainers(prev => [...prev, trainer]);
    const updateTrainer = (updatedTrainer) => setTrainers(prev => prev.map(t => t.id === updatedTrainer.id ? updatedTrainer : t));
    const deleteTrainer = (id) => setTrainers(prev => prev.filter(t => t.id !== id));

    // Machine Actions
    const addMachine = (machine) => setMachines(prev => [...prev, machine]);
    const updateMachine = (updatedMachine) => setMachines(prev => prev.map(m => m.id === updatedMachine.id ? updatedMachine : m));
    const deleteMachine = (id) => setMachines(prev => prev.filter(m => m.id !== id));

    return (
        <GymContext.Provider value={{
            members,
            transactions,
            trainers,
            machines,
            stats,
            addMember,
            updateMember,
            deleteMember,
            renewMember,
            addTransaction,
            deleteTransaction,
            addTrainer,
            updateTrainer,
            deleteTrainer,
            addMachine,
            updateMachine,
            deleteMachine
        }}>
            {children}
        </GymContext.Provider>
    );
};

export const useGymContext = () => useContext(GymContext);
