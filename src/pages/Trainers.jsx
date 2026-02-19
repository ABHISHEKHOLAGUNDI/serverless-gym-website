import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { Plus, Trash2, Edit2, Dumbbell, Phone, ChevronDown, ChevronUp, X } from 'lucide-react';

const INPUT_CLASS = "w-full p-3 bg-[#050816]/80 border border-gold-400/20 focus:border-gold-400 rounded-xl outline-none text-white font-tech transition-all";
const LABEL_CLASS = "text-xs font-tech text-gray-500 uppercase tracking-widest block mb-1";

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
                <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Trainers</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-gold-500 to-amber-600 text-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all font-bold font-tech tracking-wider hover:opacity-90"
                >
                    <Plus size={18} /> Add Trainer
                </button>
            </div>

            {/* Trainer Cards */}
            <div className="space-y-4">
                {trainers.length === 0 ? (
                    <div className="text-center py-10 text-gray-600">
                        <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="font-tech tracking-wider">No trainers added yet.</p>
                    </div>
                ) : (
                    trainers.map(trainer => {
                        const assignedMembers = getAssignedMembers(trainer.id);
                        return (
                            <motion.div
                                key={trainer.id}
                                className="bg-[#0c1220]/70 rounded-xl border border-gold-400/10 hover:border-gold-400/25 overflow-hidden transition-all"
                            >
                                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(trainer.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gold-500/10 border border-gold-400/20 text-gold-400 rounded-full flex items-center justify-center font-bold text-lg font-display">
                                            {trainer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-tech font-bold text-white text-base tracking-wider">{trainer.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                <span className="bg-gold-500/10 border border-gold-400/15 px-2 py-0.5 rounded text-gold-500 flex items-center gap-1">
                                                    <Dumbbell size={10} /> {trainer.specialty}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-600"><Phone size={10} /> {trainer.phone}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-tech text-gray-600 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">
                                            {assignedMembers.length} Members
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(trainer); }}
                                            className="p-2 text-gray-600 hover:text-gold-400 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {assignedMembers.length === 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteTrainer(trainer.id); }}
                                                className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
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
                                            {assignedMembers.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {assignedMembers.map(m => (
                                                        <li key={m.id} className="text-sm text-gray-400 flex items-center gap-2 bg-[#0a0d14]/80 p-2 rounded-lg border border-gold-400/10">
                                                            <div className="w-6 h-6 bg-gold-500/10 text-gold-400 rounded-full flex items-center justify-center text-xs font-bold font-display border border-gold-400/20">
                                                                {m.name.charAt(0)}
                                                            </div>
                                                            <span className="font-tech tracking-wider">{m.name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-600 py-2 italic font-tech">No members assigned.</p>
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
                            className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[420px] bg-[#0a0d14] border border-gold-400/30 rounded-3xl z-50 p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-display font-bold text-gold-400 tracking-widest uppercase">{editingTrainer ? 'Edit Trainer' : 'Add Trainer'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={22} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className={LABEL_CLASS}>Name</label>
                                    <input type="text" required className={INPUT_CLASS} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>Specialty</label>
                                    <input type="text" placeholder="e.g. Yoga, CrossFit" className={INPUT_CLASS} value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>Phone</label>
                                    <input type="tel" className={INPUT_CLASS} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold font-tech bg-white/5 text-gray-400 border border-white/5 tracking-wider">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl font-bold font-tech bg-gradient-to-r from-gold-500 to-amber-600 text-black shadow-lg shadow-gold-500/10 tracking-wider hover:opacity-90">Save Trainer</button>
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
