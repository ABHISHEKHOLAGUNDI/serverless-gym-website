import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { Plus, Trash2, Edit2, Wrench, Settings, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

const Maintenance = () => {
    const { machines, addMachine, updateMachine, deleteMachine } = useGymContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'Operational',
        lastMaintenance: '',
        nextMaintenance: ''
    });

    const handleOpenModal = (machine = null) => {
        if (machine) {
            setEditingMachine(machine);
            setFormData(machine);
        } else {
            setEditingMachine(null);
            setFormData({
                name: '',
                status: 'Operational',
                lastMaintenance: new Date().toISOString().split('T')[0],
                nextMaintenance: ''
            });
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Operational': return 'text-green-600 bg-green-50';
            case 'Under Maintenance': return 'text-orange-600 bg-orange-50';
            case 'Broken': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Machine Maintenance</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold"
                >
                    <Plus size={18} /> Add Machine
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {machines.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 col-span-2">
                        <Settings className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No machines added yet.</p>
                    </div>
                ) : (
                    machines.map(machine => (
                        <motion.div
                            key={machine.id}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(machine.status)}`}>
                                        <Wrench size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{machine.name}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(machine.status)}`}>
                                            {machine.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(machine)}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteMachine(machine.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <label className="text-xs text-gray-400 block mb-1">Last Maintenance</label>
                                    <div className="flex items-center gap-2 font-medium text-gray-700">
                                        <CheckCircle size={14} className="text-green-500" />
                                        {new Date(machine.lastMaintenance).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <label className="text-xs text-gray-400 block mb-1">Next Due</label>
                                    <div className="flex items-center gap-2 font-medium text-gray-700">
                                        <Calendar size={14} className="text-blue-500" />
                                        {machine.nextMaintenance ? new Date(machine.nextMaintenance).toLocaleDateString() : 'Not Scheduled'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
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
                            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl z-50 p-6 shadow-2xl max-h-[90vh] overflow-y-auto m-4"
                        >
                            <h2 className="text-xl font-bold mb-4">{editingMachine ? 'Edit Machine' : 'Add New Machine'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Machine Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Operational">Operational</option>
                                        <option value="Under Maintenance">Under Maintenance</option>
                                        <option value="Broken">Broken</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Last Maint.</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.lastMaintenance}
                                            onChange={e => setFormData({ ...formData, lastMaintenance: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Next Due</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.nextMaintenance}
                                            onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })}
                                        />
                                    </div>
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
                                        Save Machine
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

export default Maintenance;
