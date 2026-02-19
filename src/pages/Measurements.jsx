import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Ruler, History, Save, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useGymContext } from '../context/GymContext';

const Measurements = () => {
    const { members, updateMember } = useGymContext();
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Fetch measurements when member is selected
    React.useEffect(() => {
        if (selectedMember) {
            fetch(`/api/measurements?member_id=${selectedMember.id}&v=${Date.now()}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSelectedMember(prev => ({ ...prev, measurements: data }));
                    }
                })
                .catch(err => console.error("Failed to fetch measurements", err));
        }
    }, [selectedMember?.id]);

    const [newEntry, setNewEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        chest: '',
        bicepsL: '',
        bicepsR: '',
        waist: '',
        thigh: '',
        calves: ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedMember) return;

        try {
            const payload = {
                member_id: selectedMember.id,
                ...newEntry
            };

            const res = await fetch('/api/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Optimistically update local state or re-fetch
                const updatedMeasurements = [payload, ...(selectedMember.measurements || [])];
                const updatedMember = { ...selectedMember, measurements: updatedMeasurements };

                // We'll just update local context for immediate feedback, 
                // but real persistence happens via API now.
                // updateMember(updatedMember); // This might be redundant if we want to rely on fetch, but good for UI.

                // Better: Just append to local view
                setSelectedMember(prev => ({
                    ...prev,
                    measurements: [newEntry, ...(prev.measurements || [])]
                }));

                setIsFormOpen(false);
                setNewEntry({
                    date: new Date().toISOString().split('T')[0],
                    weight: '', chest: '', bicepsL: '', bicepsR: '', waist: '', thigh: '', calves: ''
                });
                alert("Measurements saved successfully!");
            } else {
                throw new Error("Failed to save");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save measurements. Please try again.");
        }
    };

    const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Measurements</h1>

            {/* Member Selector (if not selected) */}
            {!selectedMember ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search member to view/add..."
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredMembers.map(member => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className="p-4 bg-white rounded-xl border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-800">{member.name}</span>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">ID: {member.id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Selected Member View
                <div className="space-y-6">
                    {/* Header with Back */}
                    <div className="flex justify-between items-center bg-blue-600 p-4 rounded-xl text-white shadow-lg shadow-blue-200">
                        <div>
                            <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                            <p className="text-blue-100 text-sm">Height: {selectedMember.height || 'N/A'} cm</p>
                        </div>
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg text-xs"
                        >Change</button>
                    </div>

                    {/* Add New Button */}
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isFormOpen ? <ChevronUp size={20} /> : <Plus size={20} />}
                        {isFormOpen ? 'Cancel Entry' : 'Add New Measurements'}
                    </button>

                    {/* Entry Form */}
                    <AnimatePresence>
                        {isFormOpen && (
                            <motion.form
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleSave}
                                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newEntry.date}
                                            onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                            className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"
                                        />
                                    </div>

                                    {/* Compulsory Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase">Weight (kg) *</label>
                                            <input type="number" required placeholder="0.0" className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl outline-none"
                                                value={newEntry.weight} onChange={e => setNewEntry({ ...newEntry, weight: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase">Chest (in) *</label>
                                            <input type="number" required placeholder="0.0" className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl outline-none"
                                                value={newEntry.chest} onChange={e => setNewEntry({ ...newEntry, chest: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase">L. Biceps (in) *</label>
                                            <input type="number" required placeholder="0.0" className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl outline-none"
                                                value={newEntry.bicepsL} onChange={e => setNewEntry({ ...newEntry, bicepsL: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase">R. Biceps (in) *</label>
                                            <input type="number" required placeholder="0.0" className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl outline-none"
                                                value={newEntry.bicepsR} onChange={e => setNewEntry({ ...newEntry, bicepsR: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 my-2"></div>

                                    {/* Optional Fields */}
                                    <p className="text-xs font-bold text-gray-400 uppercase">Optional</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <input type="number" placeholder="Waist" className="p-2 bg-gray-50 rounded-lg text-sm outline-none"
                                            value={newEntry.waist} onChange={e => setNewEntry({ ...newEntry, waist: e.target.value })} />
                                        <input type="number" placeholder="Thigh" className="p-2 bg-gray-50 rounded-lg text-sm outline-none"
                                            value={newEntry.thigh} onChange={e => setNewEntry({ ...newEntry, thigh: e.target.value })} />
                                        <input type="number" placeholder="Calves" className="p-2 bg-gray-50 rounded-lg text-sm outline-none"
                                            value={newEntry.calves} onChange={e => setNewEntry({ ...newEntry, calves: e.target.value })} />
                                    </div>

                                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95">
                                        Save Measurements
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* History List */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><History size={18} /> History</h3>
                        {!selectedMember.measurements || selectedMember.measurements.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No measurements recorded yet.</p>
                        ) : (
                            selectedMember.measurements.map((entry, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-end mb-2 border-b border-gray-50 pb-2">
                                        <span className="text-sm text-gray-500 font-medium">{new Date(entry.date).toLocaleDateString('en-GB')}</span>
                                        <span className="text-lg font-bold text-gray-900">{entry.weight} <span className="text-xs font-medium text-gray-400">kg</span></span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="bg-gray-50 rounded-lg p-1">
                                            <div className="text-[10px] text-gray-400 uppercase">Chest</div>
                                            <div className="font-semibold text-sm">{entry.chest}"</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-1">
                                            <div className="text-[10px] text-gray-400 uppercase">Arms</div>
                                            <div className="font-semibold text-sm">{entry.bicepsL}" / {entry.bicepsR}"</div>
                                        </div>
                                        {entry.waist && (
                                            <div className="bg-gray-50 rounded-lg p-1">
                                                <div className="text-[10px] text-gray-400 uppercase">Waist</div>
                                                <div className="font-semibold text-sm">{entry.waist}"</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Measurements;
