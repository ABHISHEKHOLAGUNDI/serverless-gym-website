import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { Plus, Trash2, Edit2, User, Phone, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';

const Trainers = () => {
    const { trainers, members, addTrainer, updateTrainer, deleteTrainer } = useGymContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [expandedTrainerId, setExpandedTrainerId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        phone: ''
    });

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

    const toggleExpand = (id) => {
        setExpandedTrainerId(expandedTrainerId === id ? null : id);
    };

    const getAssignedMembers = (trainerId) => {
        return members.filter(m => m.trainerId === trainerId);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trainers</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold"
                >
                    <Plus size={18} /> Add Trainer
                </button>
            </div>

            <div className="space-y-4">
                {trainers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No trainers added yet.</p>
                    </div>
                ) : (
                    trainers.map(trainer => {
                        const assignedMembers = getAssignedMembers(trainer.id);
                        return (
                            <motion.div
                                key={trainer.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(trainer.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                            {trainer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{trainer.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"><Dumbbell size={10} /> {trainer.specialty}</span>
                                                <span className="flex items-center gap-1"><Phone size={10} /> {trainer.phone}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                            {assignedMembers.length} Members
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(trainer); }}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {assignedMembers.length === 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteTrainer(trainer.id); }}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {expandedTrainerId === trainer.id ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedTrainerId === trainer.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-gray-50 border-t border-gray-100 px-4 py-2"
                                        >
                                            {assignedMembers.length > 0 ? (
                                                <ul className="space-y-2 py-2">
                                                    {assignedMembers.map(m => (
                                                        <li key={m.id} className="text-sm text-gray-600 flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100">
                                                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                                {m.name.charAt(0)}
                                                            </div>
                                                            {m.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-400 py-2 italic">No members assigned.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>

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
                            className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-white rounded-3xl z-50 p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold mb-4">{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Specialty</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Yoga, Pilates, CrossFit"
                                        value={formData.specialty}
                                        onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                                        className="flex-1 py-3 items-center justify-center rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    >
                                        Save Trainer
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

export default Trainers;
