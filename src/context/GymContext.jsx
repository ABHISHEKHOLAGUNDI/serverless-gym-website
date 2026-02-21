import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GymContext = createContext();

// Initial Mock Data - Cleared for production feel
const INITIAL_MEMBERS = [];
const INITIAL_TRAINERS = [];
const INITIAL_MACHINES = [];

export const GymProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [members, setMembers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(null);

    // Fetch Initial Data
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true); // Reset loading state when starting fetch
            try {
                const endpoints = [
                    { key: 'members', url: '/api/members' },
                    { key: 'finances', url: '/api/finances' },
                    { key: 'trainers', url: '/api/trainers' },
                    { key: 'machines', url: '/api/machines' }
                ];

                const responses = await Promise.all(
                    endpoints.map(ep => fetch(`${ep.url}?v=${Date.now()}`))
                );

                // Check for errors
                const failed = responses.find(r => !r.ok);
                if (failed) {
                    const errText = await failed.text();
                    let errMsg = `Server Error (${failed.status})`;
                    try {
                        const json = JSON.parse(errText);
                        if (json.error) errMsg = json.error;
                    } catch (e) { /* ignore */ }

                    console.error("API Error:", errMsg);
                    setDbError(errMsg);
                    setLoading(false);
                    return;
                }

                // If all OK, parse and set state
                const data = await Promise.all(responses.map(r => r.json()));

                setMembers(data[0]);
                setTransactions(data[1]);
                setTrainers(data[2]);
                setMachines(data[3]);
                setDbError(null); // Clear error if successful

            } catch (error) {
                console.error("Failed to fetch data:", error);
                setDbError("Network Error: Could not connect to server.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated]);

    // Derived Stats
    const stats = {
        liveMembers: members.filter(m => m.status?.toLowerCase() === 'active').length,
        totalUsers: members.length,
        birthdaysToday: members.filter(m => {
            if (!m.dob) return false;
            const [y, mth, d] = m.dob.split('-').map(Number);
            const today = new Date();
            return mth === today.getMonth() + 1 && d === today.getDate();
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
        dueAmount: 0, // Implement if needed
        todaysCash: transactions
            .filter(t => t.type === 'Income' && t.date && t.date.split('T')[0] === new Date().toISOString().split('T')[0])
            .reduce((acc, curr) => acc + (curr.amount || 0), 0),
        totalIncome: transactions
            .filter(t => t.type === 'Income')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0),
        expenses: transactions
            .filter(t => t.type === 'Expense')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0),
    };
    stats.balance = stats.totalIncome - stats.expenses;

    // Actions
    const addMember = async (member) => {
        // Optimistic Update
        const tempId = Date.now();
        setMembers(prev => [{ ...member, id: tempId }, ...prev]);

        try {
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member)
            });
            const data = await res.json();
            if (res.ok) {
                // Update with real ID
                setMembers(prev => prev.map(m => m.id === tempId ? { ...member, id: data.id } : m));

                // Add Income Transaction automatically
                if (member.amount) {
                    addTransaction({
                        type: 'Income',
                        amount: parseFloat(member.amount),
                        date: new Date().toISOString().split('T')[0],
                        category: 'New Membership',
                        description: `Membership for ${member.name}`
                    });
                }
            }
        } catch (err) {
            console.error("Add member failed", err);
            setMembers(prev => prev.filter(m => m.id !== tempId)); // Revert
        }
    };

    const updateMember = async (updatedMember) => {
        const originalMembers = [...members];
        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
        try {
            const res = await fetch('/api/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMember)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Update failed");
            }
        } catch (err) {
            console.error("Update member failed", err);
            setMembers(originalMembers); // Revert
            alert("Failed to update member: " + err.message);
        }
    };

    const deleteMember = async (id) => {
        const oldMembers = [...members];
        setMembers(prev => prev.filter(m => m.id !== id));
        try {
            const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Delete failed');
            }
        } catch (err) {
            console.error("Delete member failed", err);
            setMembers(oldMembers); // Revert
            alert("Failed to delete member: " + err.message);
        }
    };

    const renewMember = async (id, newExpiry, amount, planType) => {
        const originalMembers = [...members];
        setMembers(prev => prev.map(m => m.id === id ? { ...m, expiry: newExpiry, status: 'Active', planType } : m));
        try {
            const res = await fetch('/api/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, expiry: newExpiry, status: 'Active', planType, amount })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Renewal failed');
            }

            if (amount) {
                addTransaction({
                    type: 'Income',
                    amount: parseFloat(amount),
                    date: new Date().toISOString().split('T')[0],
                    category: 'Renewal',
                    description: `Renewal for Member ID ${id}`
                });
            }
        } catch (err) {
            console.error("Renew member failed", err);
            setMembers(originalMembers); // Revert
            alert("Failed to renew membership: " + err.message);
        }
    };

    const addTransaction = async (transaction) => {
        const tempId = Date.now();
        setTransactions(prev => [{ ...transaction, id: tempId }, ...prev]);
        try {
            const res = await fetch('/api/finances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });
            const data = await res.json();
            if (res.ok) {
                setTransactions(prev => prev.map(t => t.id === tempId ? { ...transaction, id: data.id } : t));
            }
        } catch (err) {
            console.error("Add transaction failed", err);
            setTransactions(prev => prev.filter(t => t.id !== tempId));
        }
    };

    const deleteTransaction = async (id) => {
        const oldVals = [...transactions];
        setTransactions(prev => prev.filter(t => t.id !== id));
        try {
            const res = await fetch(`/api/finances?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Delete failed');
            }
        } catch (err) {
            console.error("Delete transaction failed", err);
            setTransactions(oldVals); // Revert
            alert("Failed to delete transaction: " + err.message);
        }
    };

    // Trainer Actions
    const addTrainer = async (trainer) => {
        const tempId = Date.now();
        setTrainers(prev => [...prev, { ...trainer, id: tempId }]);
        try {
            const res = await fetch('/api/trainers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trainer)
            });
            const data = await res.json();
            if (res.ok) {
                setTrainers(prev => prev.map(t => t.id === tempId ? { ...trainer, id: data.id } : t));
            } else {
                throw new Error(data.error || 'Add trainer failed');
            }
        } catch (err) {
            console.error("Add trainer failed", err);
            setTrainers(prev => prev.filter(t => t.id !== tempId)); // Revert
            alert("Failed to add trainer: " + err.message);
        }
    };

    const updateTrainer = async (updatedTrainer) => {
        const originalTrainers = [...trainers];
        setTrainers(prev => prev.map(t => t.id === updatedTrainer.id ? updatedTrainer : t));
        try {
            const res = await fetch('/api/trainers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTrainer)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Update failed');
            }
        } catch (err) {
            console.error("Update trainer failed", err);
            setTrainers(originalTrainers); // Revert
            alert("Failed to update trainer: " + err.message);
        }
    };

    const deleteTrainer = async (id) => {
        const oldTrainers = [...trainers];
        setTrainers(prev => prev.filter(t => t.id !== id));
        try {
            const res = await fetch(`/api/trainers?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Delete failed');
            }
        } catch (err) {
            console.error("Delete trainer failed", err);
            setTrainers(oldTrainers); // Revert
            alert("Failed to delete trainer: " + err.message);
        }
    };

    // Machine Actions
    const addMachine = async (machine) => {
        const tempId = Date.now();
        setMachines(prev => [...prev, { ...machine, id: tempId }]);
        try {
            const res = await fetch('/api/machines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(machine)
            });
            const data = await res.json();
            if (res.ok) {
                setMachines(prev => prev.map(m => m.id === tempId ? { ...machine, id: data.id } : m));
            } else {
                throw new Error(data.error || 'Add machine failed');
            }
        } catch (err) {
            console.error("Add machine failed", err);
            setMachines(prev => prev.filter(m => m.id !== tempId)); // Revert
            alert("Failed to add machine: " + err.message);
        }
    };

    const updateMachine = async (updatedMachine) => {
        const originalMachines = [...machines];
        setMachines(prev => prev.map(m => m.id === updatedMachine.id ? updatedMachine : m));
        try {
            const res = await fetch('/api/machines', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMachine)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Update failed');
            }
        } catch (err) {
            console.error("Update machine failed", err);
            setMachines(originalMachines); // Revert
            alert("Failed to update machine: " + err.message);
        }
    };

    const deleteMachine = async (id) => {
        const oldMachines = [...machines];
        setMachines(prev => prev.filter(m => m.id !== id));
        try {
            const res = await fetch(`/api/machines?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Delete failed');
            }
        } catch (err) {
            console.error("Delete machine failed", err);
            setMachines(oldMachines); // Revert
            alert("Failed to delete machine: " + err.message);
        }
    };

    // Hard Reset: Delete ALL data from the database
    const resetAllData = async () => {
        try {
            const res = await fetch('/api/reset', { method: 'POST' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Reset failed');
            }
            // Clear all local state
            setMembers([]);
            setTransactions([]);
            setTrainers([]);
            setMachines([]);
            return true;
        } catch (err) {
            console.error("Reset failed", err);
            alert("Failed to reset data: " + err.message);
            return false;
        }
    };

    return (
        <GymContext.Provider value={{
            members, transactions, trainers, machines, stats, loading, dbError,
            addMember, updateMember, deleteMember, renewMember,
            addTransaction, deleteTransaction,
            addTrainer, updateTrainer, deleteTrainer,
            addMachine, updateMachine, deleteMachine,
            resetAllData
        }}>
            {children}
        </GymContext.Provider>
    );
};

export const useGymContext = () => useContext(GymContext);
