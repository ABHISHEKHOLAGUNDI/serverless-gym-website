import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, History, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useGymContext } from '../context/GymContext';

const INPUT_CLASS = "w-full p-3 bg-[#050816]/80 border border-gold-400/20 focus:border-gold-400 rounded-xl outline-none text-white font-tech transition-all placeholder-gray-700";
const LABEL_CLASS = "text-xs font-tech text-gray-500 uppercase tracking-widest block mb-1";

const Measurements = () => {
    const { members } = useGymContext();
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

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
        weight: '', chest: '', bicepsL: '', bicepsR: '', waist: '', thigh: '', calves: ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedMember) return;

        try {
            const payload = { member_id: selectedMember.id, ...newEntry };
            const res = await fetch('/api/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSelectedMember(prev => ({
                    ...prev,
                    measurements: [newEntry, ...(prev.measurements || [])]
                }));
                setIsFormOpen(false);
                setNewEntry({ date: new Date().toISOString().split('T')[0], weight: '', chest: '', bicepsL: '', bicepsR: '', waist: '', thigh: '', calves: '' });
                alert("Measurements saved successfully!");
            } else {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save");
            }
        } catch (err) {
            console.error(err);
            alert(`Failed to save measurements: ${err.message}`);
        }
    };

    const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Measurements</h1>

            {!selectedMember ? (
                // Member Selector
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-600" size={20} />
                        <input
                            type="text"
                            placeholder="Search member to view/add..."
                            className="w-full pl-10 pr-4 py-3 bg-[#0c1220]/70 border border-gold-400/20 focus:border-gold-400 rounded-xl text-white outline-none font-tech placeholder-gray-700 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredMembers.map(member => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className="p-4 bg-[#0c1220]/70 border border-gold-400/10 hover:border-gold-400/40 rounded-xl flex justify-between items-center cursor-pointer transition-all group"
                            >
                                <span className="font-tech font-semibold text-gray-300 group-hover:text-gold-400 transition-colors tracking-wider">{member.name}</span>
                                <span className="text-xs bg-gold-500/10 text-gold-500 px-2 py-1 rounded font-tech border border-gold-500/20">ID: {member.id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Selected Member View
                <div className="space-y-6">
                    {/* Member Header */}
                    <div className="flex justify-between items-center bg-gradient-to-r from-gold-900/30 to-transparent border border-gold-400/30 p-4 rounded-xl text-white shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                        <div>
                            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider">{selectedMember.name}</h2>
                            <p className="text-gray-500 text-sm font-tech">Height: {selectedMember.height || 'N/A'} cm</p>
                        </div>
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-tech text-gray-400 hover:text-white transition-all"
                        >
                            <ArrowLeft size={14} /> Change
                        </button>
                    </div>

                    {/* Add New Button */}
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="w-full py-3 bg-[#0c1220]/80 border border-gold-400/20 hover:border-gold-400/50 text-gold-400 rounded-xl font-tech font-semibold flex items-center justify-center gap-2 shadow-lg transition-all tracking-wider"
                    >
                        {isFormOpen ? <ChevronUp size={20} /> : <Plus size={20} />}
                        {isFormOpen ? 'Cancel Entry' : '+ Add New Measurements'}
                    </button>

                    {/* Entry Form */}
                    <AnimatePresence>
                        {isFormOpen && (
                            <motion.form
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleSave}
                                className="bg-[#0a0d14]/90 border border-gold-400/20 p-5 rounded-2xl overflow-hidden"
                            >
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className={LABEL_CLASS}>Date</label>
                                        <input type="date" required value={newEntry.date}
                                            onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                            className={INPUT_CLASS} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Weight (kg) *', key: 'weight' },
                                            { label: 'Chest (in) *', key: 'chest' },
                                            { label: 'L. Biceps (in) *', key: 'bicepsL' },
                                            { label: 'R. Biceps (in) *', key: 'bicepsR' },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label className="text-xs font-tech text-gold-600 uppercase tracking-widest block mb-1">{f.label}</label>
                                                <input type="number" required placeholder="0.0"
                                                    className="w-full p-3 bg-[#050816]/80 border border-gold-400/20 focus:border-gold-400 rounded-xl outline-none text-white font-tech transition-all"
                                                    value={newEntry[f.key]}
                                                    onChange={e => setNewEntry({ ...newEntry, [f.key]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gold-400/10 my-2"></div>
                                    <p className="text-xs font-tech text-gray-600 uppercase tracking-widest">Optional</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { p: 'Waist', k: 'waist' },
                                            { p: 'Thigh', k: 'thigh' },
                                            { p: 'Calves', k: 'calves' },
                                        ].map(f => (
                                            <input key={f.k} type="number" placeholder={f.p}
                                                className="p-2 bg-[#050816]/80 border border-white/10 rounded-lg text-sm outline-none text-white font-tech focus:border-gold-400/50 transition-all"
                                                value={newEntry[f.k]}
                                                onChange={e => setNewEntry({ ...newEntry, [f.k]: e.target.value })} />
                                        ))}
                                    </div>

                                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-gold-500 to-amber-600 hover:opacity-90 text-black rounded-xl font-bold font-display tracking-widest shadow-lg transition-transform active:scale-95">
                                        Save Measurements
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* History */}
                    <div className="space-y-3">
                        <h3 className="font-display font-bold text-gold-400 tracking-widest uppercase flex items-center gap-2 text-sm">
                            <History size={16} /> History
                        </h3>
                        {!selectedMember.measurements || selectedMember.measurements.length === 0 ? (
                            <p className="text-gray-600 text-center py-4 font-tech tracking-wider">No measurements recorded yet.</p>
                        ) : (
                            selectedMember.measurements.map((entry, idx) => (
                                <div key={idx} className="bg-[#0c1220]/70 border border-gold-400/10 hover:border-gold-400/25 p-4 rounded-xl transition-all">
                                    <div className="flex justify-between items-end mb-3 border-b border-gold-400/10 pb-2">
                                        <span className="text-sm text-gray-500 font-tech">{new Date(entry.date).toLocaleDateString('en-GB')}</span>
                                        <span className="text-xl font-display font-bold text-gold-400">
                                            {entry.weight} <span className="text-xs font-tech text-gray-500">kg</span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="bg-[#050816]/60 border border-white/5 rounded-lg p-2">
                                            <div className="text-[10px] text-gray-600 uppercase font-tech">Chest</div>
                                            <div className="font-semibold text-sm text-gray-300">{entry.chest}"</div>
                                        </div>
                                        <div className="bg-[#050816]/60 border border-white/5 rounded-lg p-2">
                                            <div className="text-[10px] text-gray-600 uppercase font-tech">Arms</div>
                                            <div className="font-semibold text-sm text-gray-300">{entry.bicepsL}" / {entry.bicepsR}"</div>
                                        </div>
                                        {entry.waist && (
                                            <div className="bg-[#050816]/60 border border-white/5 rounded-lg p-2">
                                                <div className="text-[10px] text-gray-600 uppercase font-tech">Waist</div>
                                                <div className="font-semibold text-sm text-gray-300">{entry.waist}"</div>
                                            </div>
                                        )}
                                        {entry.thigh && (
                                            <div className="bg-[#050816]/60 border border-white/5 rounded-lg p-2">
                                                <div className="text-[10px] text-gray-600 uppercase font-tech">Thigh</div>
                                                <div className="font-semibold text-sm text-gray-300">{entry.thigh}"</div>
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
