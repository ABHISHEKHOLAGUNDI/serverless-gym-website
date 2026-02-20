import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { Plus, Trash2, Edit2, Wrench, Settings, Calendar, CheckCircle, X, AlertTriangle, Activity } from 'lucide-react';

const Maintenance = () => {
    const { machines, addMachine, updateMachine, deleteMachine } = useGymContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState(null);
    const [formData, setFormData] = useState({ name: '', status: 'Operational', lastMaintenance: '', nextMaintenance: '' });

    const handleOpenModal = (machine = null) => {
        if (machine) {
            setEditingMachine(machine);
            setFormData(machine);
        } else {
            setEditingMachine(null);
            setFormData({ name: '', status: 'Operational', lastMaintenance: new Date().toISOString().split('T')[0], nextMaintenance: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMachine) {
            updateMachine({ ...editingMachine, ...formData });
        } else {
            addMachine({ id: Date.now(), ...formData });
        }
        setIsModalOpen(false);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Operational': return { dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/20', icon: 'text-emerald-400', border: 'border-l-emerald-500/50', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.08)]' };
            case 'Under Maintenance': return { dot: 'bg-amber-400', badge: 'text-amber-400 bg-amber-900/30 border-amber-500/20', icon: 'text-amber-400', border: 'border-l-amber-500/50', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.08)]' };
            case 'Broken': return { dot: 'bg-red-400', badge: 'text-red-400 bg-red-900/30 border-red-500/20', icon: 'text-red-400', border: 'border-l-red-500/50', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.08)]' };
            default: return { dot: 'bg-gray-400', badge: 'text-gray-400 bg-gray-900/30 border-gray-500/20', icon: 'text-gray-400', border: 'border-l-gray-500/50', glow: '' };
        }
    };

    const operational = machines.filter(m => m.status === 'Operational').length;
    const underMaint = machines.filter(m => m.status === 'Under Maintenance').length;
    const broken = machines.filter(m => m.status === 'Broken').length;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Maintenance</h1>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-gold-400 to-transparent rounded-full mt-1"></div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="cosmic-btn text-sm"
                >
                    <Plus size={16} /> Add Machine
                </button>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 text-center border-l-2 border-l-emerald-500/50">
                    <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest">Working</p>
                    <p className="text-xl font-display font-black text-emerald-400">{operational}</p>
                </div>
                <div className="glass-card p-3 text-center border-l-2 border-l-amber-500/50">
                    <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest">Servicing</p>
                    <p className="text-xl font-display font-black text-amber-400">{underMaint}</p>
                </div>
                <div className="glass-card p-3 text-center border-l-2 border-l-red-500/50">
                    <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest">Broken</p>
                    <p className="text-xl font-display font-black text-red-400">{broken}</p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {machines.length === 0 ? (
                    <div className="empty-state col-span-2">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                            <Settings className="w-14 h-14 mx-auto mb-3 text-gold-500/30" />
                        </motion.div>
                        <p className="font-tech tracking-wider text-gray-500">No machines added yet</p>
                        <p className="text-xs text-gray-700 font-tech mt-1">Add your first machine to track</p>
                    </div>
                ) : (
                    machines.map((machine, index) => {
                        const s = getStatusStyle(machine.status);
                        return (
                            <motion.div
                                key={machine.id}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-card p-5 flex flex-col justify-between border-l-2 ${s.border} ${s.glow}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-[#050816]/60 border border-gold-400/10 ${s.icon}`}>
                                            <Wrench size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-tech font-bold text-white text-base tracking-wider">{machine.name}</h3>
                                            <span className={`text-xs font-tech font-bold px-2 py-0.5 rounded-md border ${s.badge} flex items-center gap-1.5 mt-1 w-fit`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`}></span>
                                                {machine.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => handleOpenModal(machine)} className="p-2 text-gray-600 hover:text-gold-400 hover:bg-gold-500/10 rounded-lg transition-all">
                                            <Edit2 size={15} />
                                        </button>
                                        <button onClick={() => deleteMachine(machine.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-[#050816]/60 border border-white/5 p-3 rounded-xl">
                                        <label className="text-[10px] text-gray-600 block mb-1 font-tech uppercase tracking-widest">Last Service</label>
                                        <div className="flex items-center gap-2 font-tech text-gray-300">
                                            <CheckCircle size={13} className="text-emerald-500" />
                                            {machine.lastMaintenance ? new Date(machine.lastMaintenance).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-[#050816]/60 border border-white/5 p-3 rounded-xl">
                                        <label className="text-[10px] text-gray-600 block mb-1 font-tech uppercase tracking-widest">Next Due</label>
                                        <div className="flex items-center gap-2 font-tech text-gray-300">
                                            <Calendar size={13} className="text-gold-500" />
                                            {machine.nextMaintenance ? new Date(machine.nextMaintenance).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
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
                                <h2 className="text-xl font-display font-bold text-gold-400 tracking-widest uppercase">{editingMachine ? 'Edit Machine' : 'Add Machine'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={22} /></button>
                            </div>
                            <div className="h-0.5 w-full bg-gradient-to-r from-gold-400/40 via-gold-400/10 to-transparent rounded-full mb-5"></div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="cosmic-label">Machine Name</label>
                                    <input type="text" required className="cosmic-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="cosmic-label">Status</label>
                                    <select className="cosmic-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Operational" className="bg-[#0a0d14]">Operational</option>
                                        <option value="Under Maintenance" className="bg-[#0a0d14]">Under Maintenance</option>
                                        <option value="Broken" className="bg-[#0a0d14]">Broken</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="cosmic-label">Last Maint.</label>
                                        <input type="date" className="cosmic-input" value={formData.lastMaintenance} onChange={e => setFormData({ ...formData, lastMaintenance: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="cosmic-label">Next Due</label>
                                        <input type="date" className="cosmic-input" value={formData.nextMaintenance} onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="cosmic-btn-ghost flex-1">Cancel</button>
                                    <button type="submit" className="cosmic-btn flex-1 justify-center">Save Machine</button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Maintenance;
