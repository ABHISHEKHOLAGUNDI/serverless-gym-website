import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { Plus, Trash2, Edit2, Wrench, Settings, Calendar, CheckCircle, X } from 'lucide-react';

const INPUT_CLASS = "w-full p-3 bg-[#050816]/80 border border-gold-400/20 focus:border-gold-400 rounded-xl outline-none text-white font-tech transition-all";
const LABEL_CLASS = "text-xs font-tech text-gray-500 uppercase tracking-widest block mb-1";

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
            case 'Operational': return { dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/20', icon: 'text-emerald-400' };
            case 'Under Maintenance': return { dot: 'bg-amber-400', badge: 'text-amber-400 bg-amber-900/30 border-amber-500/20', icon: 'text-amber-400' };
            case 'Broken': return { dot: 'bg-red-400', badge: 'text-red-400 bg-red-900/30 border-red-500/20', icon: 'text-red-400' };
            default: return { dot: 'bg-gray-400', badge: 'text-gray-400 bg-gray-900/30 border-gray-500/20', icon: 'text-gray-400' };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Maintenance</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-gold-500 to-amber-600 text-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all font-bold font-tech tracking-wider hover:opacity-90"
                >
                    <Plus size={18} /> Add Machine
                </button>
            </div>

            {/* Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {machines.length === 0 ? (
                    <div className="text-center py-10 text-gray-600 col-span-2">
                        <Settings className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="font-tech tracking-wider">No machines added yet.</p>
                    </div>
                ) : (
                    machines.map(machine => {
                        const s = getStatusStyle(machine.status);
                        return (
                            <motion.div
                                key={machine.id}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-[#0c1220]/70 border border-gold-400/10 hover:border-gold-400/25 p-5 rounded-xl flex flex-col justify-between transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#050816]/60 border border-gold-400/10 ${s.icon}`}>
                                            <Wrench size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-tech font-bold text-white text-base tracking-wider">{machine.name}</h3>
                                            <span className={`text-xs font-tech font-bold px-2 py-0.5 rounded border ${s.badge} flex items-center gap-1.5 mt-1 w-fit`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                                                {machine.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(machine)} className="p-2 text-gray-600 hover:text-gold-400 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteMachine(machine.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-[#050816]/60 border border-white/5 p-3 rounded-xl">
                                        <label className="text-xs text-gray-600 block mb-1 font-tech">Last Maintenance</label>
                                        <div className="flex items-center gap-2 font-tech text-gray-300">
                                            <CheckCircle size={13} className="text-emerald-500" />
                                            {machine.lastMaintenance ? new Date(machine.lastMaintenance).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-[#050816]/60 border border-white/5 p-3 rounded-xl">
                                        <label className="text-xs text-gray-600 block mb-1 font-tech">Next Due</label>
                                        <div className="flex items-center gap-2 font-tech text-gray-300">
                                            <Calendar size={13} className="text-gold-500" />
                                            {machine.nextMaintenance ? new Date(machine.nextMaintenance).toLocaleDateString() : 'Not Scheduled'}
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
                            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0d14] border border-gold-400/30 rounded-3xl z-50 p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto mx-4"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-display font-bold text-gold-400 tracking-widest uppercase">{editingMachine ? 'Edit Machine' : 'Add Machine'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={22} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className={LABEL_CLASS}>Machine Name</label>
                                    <input type="text" required className={INPUT_CLASS} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>Status</label>
                                    <select className={INPUT_CLASS} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Operational" className="bg-[#0a0d14]">Operational</option>
                                        <option value="Under Maintenance" className="bg-[#0a0d14]">Under Maintenance</option>
                                        <option value="Broken" className="bg-[#0a0d14]">Broken</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={LABEL_CLASS}>Last Maint.</label>
                                        <input type="date" className={INPUT_CLASS} value={formData.lastMaintenance} onChange={e => setFormData({ ...formData, lastMaintenance: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Next Due</label>
                                        <input type="date" className={INPUT_CLASS} value={formData.nextMaintenance} onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold font-tech bg-white/5 text-gray-400 border border-white/5 tracking-wider">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl font-bold font-tech bg-gradient-to-r from-gold-500 to-amber-600 text-black shadow-lg shadow-gold-500/10 tracking-wider hover:opacity-90">Save Machine</button>
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
