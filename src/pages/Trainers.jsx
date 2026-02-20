import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { Plus, Trash2, Edit2, Dumbbell, Phone, ChevronDown, ChevronUp, X, Users, Award } from 'lucide-react';

const Trainers = () => {
    const { trainers, members, addTrainer, updateTrainer, deleteTrainer } = useGymContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [expandedTrainerId, setExpandedTrainerId] = useState(null);
    const [formData, setFormData] = useState({ name: '', specialty: '', phone: '' });

    const handleOpenModal = (trainer = null) => {
        if (trainer) {
            setEditingTrainer(trainer);
            setFormData(trainer);
        } else {
            setEditingTrainer(null);
            setFormData({ name: '', specialty: '', phone: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTrainer) {
            updateTrainer({ ...editingTrainer, ...formData });
        } else {
            addTrainer({ id: Date.now(), ...formData });
        }
        setIsModalOpen(false);
    };

    const toggleExpand = (id) => setExpandedTrainerId(expandedTrainerId === id ? null : id);
    const getAssignedMembers = (trainerId) => members.filter(m => m.trainerId === trainerId);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Trainers</h1>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-gold-400 to-transparent rounded-full mt-1"></div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="cosmic-btn text-sm"
                >
                    <Plus size={16} /> Add Trainer
                </button>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 text-center">
                    <p className="text-xs font-tech text-gray-600 uppercase tracking-widest">Total</p>
                    <p className="text-xl font-display font-black text-gold-400">{trainers.length}</p>
                </div>
                <div className="glass-card p-3 text-center">
                    <p className="text-xs font-tech text-gray-600 uppercase tracking-widest">Active</p>
                    <p className="text-xl font-display font-black text-emerald-400">{trainers.length}</p>
                </div>
                <div className="glass-card p-3 text-center">
                    <p className="text-xs font-tech text-gray-600 uppercase tracking-widest">Assigned</p>
                    <p className="text-xl font-display font-black text-purple-400">{members.filter(m => m.trainerId).length}</p>
                </div>
            </div>

            {/* Trainer Cards */}
            <div className="space-y-4">
                {trainers.length === 0 ? (
                    <div className="empty-state">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                            <Dumbbell className="w-14 h-14 mx-auto mb-3 text-gold-500/30" />
                        </motion.div>
                        <p className="font-tech tracking-wider text-gray-500">No trainers added yet</p>
                        <p className="text-xs text-gray-700 font-tech mt-1">Add your first trainer to get started</p>
                    </div>
                ) : (
                    trainers.map((trainer, index) => {
                        const assignedMembers = getAssignedMembers(trainer.id);
                        return (
                            <motion.div
                                key={trainer.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(trainer.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-gold-500/20 to-amber-600/10 border border-gold-400/25 text-gold-400 rounded-2xl flex items-center justify-center font-bold text-lg font-display shadow-[0_0_15px_rgba(184,151,42,0.1)]">
                                            {trainer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-tech font-bold text-white text-base tracking-wider">{trainer.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-gold-500/10 border border-gold-400/15 px-2 py-0.5 rounded-md text-gold-500 text-xs flex items-center gap-1 font-tech">
                                                    <Award size={10} /> {trainer.specialty || 'General'}
                                                </span>
                                                {trainer.phone && (
                                                    <span className="flex items-center gap-1 text-gray-600 text-xs font-tech">
                                                        <Phone size={10} /> {trainer.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-tech text-gray-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                            <Users size={11} /> {assignedMembers.length}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(trainer); }}
                                            className="p-2 text-gray-600 hover:text-gold-400 hover:bg-gold-500/10 rounded-lg transition-all"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        {assignedMembers.length === 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteTrainer(trainer.id); }}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                        {expandedTrainerId === trainer.id
                                            ? <ChevronUp size={18} className="text-gold-500" />
                                            : <ChevronDown size={18} className="text-gray-600" />
                                        }
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedTrainerId === trainer.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-[#050816]/50 border-t border-gold-400/10 px-4 py-3"
                                        >
                                            <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest mb-2">Assigned Members</p>
                                            {assignedMembers.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {assignedMembers.map(m => (
                                                        <li key={m.id} className="text-sm text-gray-400 flex items-center gap-3 bg-[#0a0d14]/80 p-2.5 rounded-xl border border-gold-400/10">
                                                            <div className="w-7 h-7 bg-gradient-to-br from-gold-500/15 to-transparent text-gold-400 rounded-lg flex items-center justify-center text-xs font-bold font-display border border-gold-400/20">
                                                                {m.name.charAt(0)}
                                                            </div>
                                                            <span className="font-tech tracking-wider text-gray-300">{m.name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-600 py-2 italic font-tech">No members assigned</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                <h2 className="text-xl font-display font-bold text-gold-400 tracking-widest uppercase">{editingTrainer ? 'Edit Trainer' : 'Add Trainer'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={22} /></button>
                            </div>
                            <div className="h-0.5 w-full bg-gradient-to-r from-gold-400/40 via-gold-400/10 to-transparent rounded-full mb-5"></div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="cosmic-label">Name</label>
                                    <input type="text" required className="cosmic-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="cosmic-label">Specialty</label>
                                    <input type="text" placeholder="e.g. Yoga, CrossFit" className="cosmic-input" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} />
                                </div>
                                <div>
                                    <label className="cosmic-label">Phone</label>
                                    <input type="tel" className="cosmic-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="cosmic-btn-ghost flex-1">Cancel</button>
                                    <button type="submit" className="cosmic-btn flex-1 justify-center">Save Trainer</button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Trainers;
